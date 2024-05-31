//Step 4 — Processing Media With ffmpeg.wasm
//https://www.digitalocean.com/community/tutorials/how-to-build-a-media-processing-api-in-node-js-with-express-and-ffmpeg-wasm

//Temp dir notation:
// "./tmp/records": localhost
//  "/tmp/records": vercel
//   "tmp/records": localhost

//Requires:
// require("dotenv").config()
// const express = require("express")
//node-shazam   //doesn"t have a "require" option
// var fs = require("fs")
// var path = require("path")
// const ffmpeg = require("fluent-ffmpeg")
// const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg")
// ffmpeg.setFfmpegPath(ffmpegInstaller.path)

//Imports (package.json: "type": "module"):
// import 'dotenv/config'
import express from "express"
import { Shazam } from "node-shazam"
// import * as fs from "fs"
// import * as path from "path"
import ffmpeg from "fluent-ffmpeg"       //V1 - https://www.npmjs.com/package/fluent-ffmpeg
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg"
ffmpeg.setFfmpegPath(ffmpegInstaller.path)

// console.log(ffmpegInstaller.path)
// console.log(ffmpegInstaller.url)
// console.log(ffmpegInstaller.version)

const app = express()
const shazam = new Shazam()
const PORT = process.env.PORT || 4000

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

//Record audio file from stream's URL, and try to recognise the music playing on it
app.get("/recognise/:stream", (req, res) => {

  const pathRecord = "./tmp/record.m4a"

  ffmpeg()
    .input(req.params.stream)         //stream = "https://cloud2.cdnseguro.com:20000/;" (Kiss FM)
    // .input("./tmp/records/2024-05-25/audio/2024-05-25-16-55-51.avi")
    
    .duration(5)

    .save(pathRecord)

    // .output("test.mp3")
    // .run()

    // .outputOptions("-t 5")
    // .save("test.m4a")

    .on("start", function(command) {console.log("Spawned Ffmpeg with command: " + command)})
    // .on("progress", function (progress) {console.log("Processing: " + progress.percent + "% done")})
    .on("error", function (err) {
      console.log("An error occurred: " + err.message)
      return res.status(500).send("An error has occurred during recognition; please try again")
    })
    .on("end", async function () {
      console.log("Processing finished!")

      const data = await recognise(pathRecord)
      if (Object.keys(data).length == 0) {
        console.log("Data not found :(")
        return res.status(400).send("Data not found")
      } else {
        console.log("Data found!")
        return res.status(200).json(data)
      }
    })
})

app.listen(PORT, () => console.log(`App running on http://localhost:${PORT}`))
