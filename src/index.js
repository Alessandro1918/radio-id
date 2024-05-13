import express from "express"
import { Shazam } from "node-shazam"
// import * as fs from "fs"
import * as path from "path"
import Recorder from "node-rtsp-recorder"
import Ffmpeg from "fluent-ffmpeg"

const app = express()
const shazam = new Shazam()
const PORT = process.env.PORT || 4000

//OBS:
//NODE_ENV = DEV: temp folder is "./tmp"
//NODE_ENV = PROD: temp folder is "/tmp"
//(4 changes from "./" to "/" thru all the code)

//Test
app.get("/", (req, res) => {return res.send("Hello, world!")})

//Recognise song based on audio file inside "temp" dir
app.get("/audio/:filename", async (req, res) => {

  // fs.mkdirSync(tmpDir, { recursive: true })    //no need to init "/tmp" dir

  // const srcPath = path.join(process.cwd(), "audio_samples", `${req.params.filename}`)  //path = "./audio_samples/003.avi"
  const filePath = path.join("/tmp", `${req.params.filename}`)
  // fs.copyFileSync(srcPath, filePath)           //This was here just to make sure I could read from the "/tmp" (or "./tmp") dir

  shazam.recognise(filePath)
    .then(response => {
      // fs.rmSync(tmpDir, { recursive: true, force: true })    //no need to remove "/tmp" dir
      return res.json(response)
    })
})

//Record audio file from stream's URL
app.get("/record/:streamUrl", (req, res) => {

  //Setup recorder:
  var rec = new Recorder.Recorder({
    url: req.params.streamUrl,  //stream = "https://cloud2.cdnseguro.com:20000/;" (Kiss FM)
    timeLimit: 5, // time in seconds for each segmented audio file
    folder: "/tmp/records",
    directoryPathFormat: "YYYY-MM-DD",
    fileNameFormat: "YYYY-MM-DD-HH-mm-ss",
    type: "audio",
  })
  
  rec.startRecording()

  setTimeout(() => {
      console.log("Stopping Recording")
      rec.stopRecording()

      //Convert ".avi" to ".m4a":
      const pathFromRecord = path.join("/", rec.writeStream.spawnargs[rec.writeStream.spawnargs.length -1])  //path = tmp/records/2024-05-13/audio/2024-05-13-02-04-59.avi'
      // const pathAudioToId = pathFromRecord.replace("avi", "m4a")     //save file to the same dir
      const pathAudioToId = path.join(                                  //save file to "/tmp" dir
        "/tmp", 
        pathFromRecord.split("/audio")[1].replace("avi", "m4a")
      )
      Ffmpeg(pathFromRecord)
        .on("progress", function (progress) {console.log("Processing: " + progress.percent + "% done")})
        .on("error", function (err) {console.log("An error occurred: " + err.message)})
        .on("end", function () {console.log("Processing finished !")})
        .save(pathAudioToId)

      rec = null

  }, 5*1000)  //ms
})

app.listen(PORT, () => console.log(`App running on http://localhost:${PORT}`))
