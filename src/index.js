//Requires:
// require("dotenv").config()
// const express = require("express")
//node-shazam   //doesn"t have a "require" option
// var fs = require("fs")
// var path = require("path")
// const ffmpeg = require("fluent-ffmpeg")
// const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg")
// ffmpeg.setFfmpegPath(ffmpegInstaller.path)
// const RadioBrowser = require('radio-browser')

//Imports (package.json: "type": "module"):
import "dotenv/config"
import express from "express"
import { Shazam } from "node-shazam"
// import * as fs from "fs"
// import * as path from "path"
import ffmpeg from "fluent-ffmpeg"       //V1 - https://www.npmjs.com/package/fluent-ffmpeg
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg"
ffmpeg.setFfmpegPath(ffmpegInstaller.path)
import RadioBrowser from "radio-browser"

// console.log(ffmpegInstaller.path)
// console.log(ffmpegInstaller.url)
// console.log(ffmpegInstaller.version)

const app = express()
const shazam = new Shazam()
const PORT = process.env.PORT || 4000

// Given a query for a radio ({ name: 'kiss_fm', countrycode: 'BR' }, for ex.), returns a list of available radios
async function search(query) {
  try {
    // API: https://api.radio-browser.info
    // NPM wrapper: https://www.npmjs.com/package/radio-browser
    // Example of working servers: https://fi1.api.radio-browser.info, https://de2.api.radio-browser.info
    // Advanced search docs: https://de1.api.radio-browser.info/#Advanced_station_search 
    // Advanced search example: http://de1.api.radio-browser.info/json/stations/search?name=kiss_FM&countrycode=BR
    const data = await RadioBrowser.searchStations(query)
    const radios = []
    data.map((e, i) => {
      const radio = {
        id: e.stationuuid,
        name: e.name,
        state: e.state,
        countrycode: e.countrycode,
        stream: e.url,
        site: e.homepage,
        icon: e.favicon
      }
      // console.log(`Radio #${i+1}: `, e)
      radios.push(radio)
    })
    // console.log(`Radio 1/${data.length}: ${radio.name} (${radio.state}-${radio.countrycode})`) // Radio 1/3: Rádio Kiss FM - 92.5 (São Paulo-BR)
    if (radios.length == 0) throw new Error("400")
    return radios
  } catch (err) {
    console.log("Search error: Could not find the radio")
    throw new Error("400")  // Bad request
  }
}

// Given a URL stream, records a few seconds of it in a local audio file
// Step 4 — Processing Media With ffmpeg.wasm: https://www.digitalocean.com/community/tutorials/how-to-build-a-media-processing-api-in-node-js-with-express-and-ffmpeg-wasm
function record(streamURL) {

  // Temp dir notation:
  // "./tmp/records": localhost
  //  "/tmp/records": localhost & vercel
  //   "tmp/records": localhost
  const pathRecord = "/tmp/record.m4a"

  return new Promise((resolve, reject) => {

    ffmpeg()
      .input(streamURL)  
      // .input("https://cloud2.cdnseguro.com:20000/;") // Kiss FM
      // .input("./tmp/records/2024-05-25/audio/2024-05-25-16-55-51.avi") // Pretenders - Back on the Chain Gang
      
      .duration(5)

      .save(pathRecord)

      // .output("test.mp3")
      // .run()

      // .outputOptions("-t 5")
      // .save("test.m4a")

      .on("start", function(command) {console.log("Spawned Ffmpeg with command: " + command)})
      .on("progress", function (progress) {console.log(`Processing: ${progress.timemark.split(":")[2].split(".")[0]}.${String(progress.timemark.split(":")[2].split(".")[1]).padEnd(3, "0")}s`)}) //00:00:04.50 -> 4.500s
      .on("error", function (err) {
        console.log(`Ffmpeg error: ${err.message}`)
        reject(new Error(`Ffmpeg error: ${err.message}`))
        throw new Error(err.message)
      })
      .on("end", async function () {
        console.log("Processing finished!")
        resolve(pathRecord)
      })
  })
}

// Uses "node-shazam" package to recognise data (artist, song title) from an audio file
async function recognize(filepath) {
  const response = await shazam.recognise(filepath)
  try {
    const data = {}
    data["timestamp"] = response["timestamp"]
    data["track"] = {}
    data["track"]["title"] = response["track"]["title"]
    data["track"]["artist"] = response["track"]["subtitle"]
    data["track"]["album"] = {}
    data["track"]["album"]["cover"] = response["track"]["images"]["coverart"]
    const metadataAlbumTitle = response.track.sections[0].metadata.filter(e => e.title === "Album")
    data["track"]["album"]["title"] = metadataAlbumTitle.length > 0 ? metadataAlbumTitle[0].text : "-"
    const metadataAlbumYear = response.track.sections[0].metadata.filter(e => e.title === "Released")
    data["track"]["album"]["year"] = metadataAlbumYear.length > 0 ? metadataAlbumYear[0].text : "-"
    console.log(`Music found! ${data["track"]["artist"]} - ${data["track"]["title"]}`)
    return data
  } catch (err) {
    console.log(`Shazam error: ${err}`)
    throw new Error("404")  // Not found
  }
}

// Health check
app.get("/", (_, res) => {return res.send("Hello, world!")})

// Search for a radio by a query, record an audio file from the stream's URL, and try to recognise the music playing on it
app.get("/api/v1/id?:query", async (req, res) => {
  try {
    const query = req.query // { name: 'kiss_fm', countrycode: 'BR' }

    const radios = await search(query)
    const radio = radios[0]

    const pathRecord = await record(radio.stream)

    const data = await recognize(pathRecord)

    data["radio"] = radio

    return res.status(200).json(data)
  } catch (err) {
    switch (err.message) {
      case "400": return res.status(400).json({"message": "Error: Could not find the radio!"}) // search error
      case "404": return res.status(404).json({"message": "Error: Music not recognized :("}) // shazam error
      default:    return res.status(500).json({"message": `Error: ${err.message}`})        // ffmpeg error
    }
  }
})

// Search for a radio by an id, record an audio file from the stream's URL, and try to recognise the music playing on it
app.get("/api/v2/id/:radioId", async (req, res) => {
  try {
    const radioId = req.params.radioId

    const response = await fetch(`https://online-radio-id.vercel.app/api/radio/${radioId}`)
    if (response.status == 400) {
      throw new Error("400")  // Bad request
    }
    const result = await response.json()
    const radio = result

    const pathRecord = await record(radio.stream)

    const data = await recognize(pathRecord)

    data["radio"] = radio

    return res.status(200).json(data)
  } catch (err) {
    switch (err.message) {
      case "400": return res.status(400).json({"message": "Error: Could not find the radio!"}) // search error
      case "404": return res.status(404).json({"message": "Error: Music not recognized :("}) // shazam error
      default:    return res.status(500).json({"message": `Error: ${err.message}`})        // ffmpeg error
    }
  }
})

app.listen(PORT, () => console.log(`App running on http://localhost:${PORT}`))
