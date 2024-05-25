//Step 4 — Processing Media With ffmpeg.wasm
//https://www.digitalocean.com/community/tutorials/how-to-build-a-media-processing-api-in-node-js-with-express-and-ffmpeg-wasm

import express from "express"
import { Shazam } from "node-shazam"
import * as fs from "fs"
// import * as path from "path"
import Recorder from "node-rtsp-recorder"
import Ffmpeg from "fluent-ffmpeg"       //V1 - https://www.npmjs.com/package/fluent-ffmpeg

const app = express()
const shazam = new Shazam()
const PORT = process.env.PORT || 4000

//Returns the size of a file, in bytes
function getFilesize(filepath) {
  var stats = fs.statSync(filepath)
  var fileSizeInBytes = stats.size
  return fileSizeInBytes
}

//Uses "node-shazam" package to recognise data (artist, song title) from an audio file
async function recognise(filepath) {
  const response = await shazam.recognise(filepath)
  
  // return response
  var data = {}
  if (response != null) {
    data["timestamp"] = response["timestamp"]
    data["title"] = response["track"]["title"]
    data["artist"] = response["track"]["subtitle"]
    data["album"] = {}
    data["album"]["cover"] = response["track"]["images"]["coverart"]
    const metadtataAlbumTitle = response.track.sections[0].metadata.filter(e => e.title === "Album")
    data["album"]["title"] = metadtataAlbumTitle.length > 0 ? metadtataAlbumTitle[0].text : "-"
    const metadtataAlbumYear = response.track.sections[0].metadata.filter(e => e.title === "Released")
    data["album"]["year"] = metadtataAlbumYear.length > 0 ? metadtataAlbumYear[0].text : "-"
  }
  return data
}

//Test
app.get("/", (req, res) => {return res.send("Hello, world!")})

//Record audio file from stream's URL
app.get("/recognise/:stream", (req, res) => {

  //Setup recorder:
  var rec = new Recorder.Recorder({
    url: req.params.stream,  //stream = "https://cloud2.cdnseguro.com:20000/;" (Kiss FM)
    timeLimit: 6, // time in seconds for each segmented audio file
    folder: "/tmp/records",
    directoryPathFormat: "YYYY-MM-DD",
    fileNameFormat: "YYYY-MM-DD-HH-mm-ss",
    type: "audio",
  })

  console.log('') //new line
  rec.startRecording()

  setTimeout(async () => {
    console.log("Stopping recording")
    rec.stopRecording()

    //Setup ".avi" to ".m4a" conversion:
    // const pathAvi = "./tmp/records/2024-05-24/audio/2024-05-24-15-32-16.avi"
    const pathAvi = "/" + rec.writeStream.spawnargs[rec.writeStream.spawnargs.length -1]  //path = ./tmp/records/2024-05-13/audio/2024-05-13-02-04-59.avi
    const pathM4a = pathAvi.replace("avi", "m4a")
    // const pathLevels = pathAvi.split("/")
    // const filenameAvi = pathLevels[pathLevels.length -1]
    // const filenameM4a = filenameAvi.replace("avi", "m4a")
    rec = null

    const fileSize = getFilesize(pathAvi)
    console.log(`Record: ${fileSize/1024} kB`)
    if (fileSize == 0) {
      console.log("Recorder could not save audio file")
      return res.status(500).send("An error has occurred during recording; please try again")
    } else {
      //Start conversion. After finished, recognise file

      //V1 - fluent-ffmpeg
      Ffmpeg(pathAvi)
      .save(pathM4a)
      .on("progress", function (progress) {console.log("Processing: " + progress.percent + "% done")})
      .on("error", function (err) {
        console.log("An error occurred: " + err.message)
        return res.status(500).send("An error has occurred during recognition; please try again")
      })
      .on("end", async function () {
        console.log("Processing finished!")
        const data = await recognise(pathM4a)
        if (Object.keys(data).length == 0) {
          console.log("Track not found :(")
          return res.status(400).send("Track not found")
        } else {
          console.log("Track found!")
          return res.status(200).json(data)
        }
      })
    }
  }, 5*1000)  //setTimeout < Recorder.timeLimit. Else, it will record multiple files in the time period
})

app.listen(PORT, () => console.log(`App running on http://localhost:${PORT}`))
