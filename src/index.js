//Step 4 — Processing Media With ffmpeg.wasm
//https://www.digitalocean.com/community/tutorials/how-to-build-a-media-processing-api-in-node-js-with-express-and-ffmpeg-wasm

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
// import 'dotenv/config'
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

// Given a query for a radio ("name=kiss_fm" for "Kiss FM", for ex.), returns the radio info, like the stream URL ("https://cloud2.cdnseguro.com:20000/;", for ex.)
async function search(query) {
  try {
    // API: https://api.radio-browser.info
    // NPM wrapper: https://www.npmjs.com/package/radio-browser
    // Example of working servers: https://fi1.api.radio-browser.info, https://de2.api.radio-browser.info
    // Advanced search docs: https://de1.api.radio-browser.info/#Advanced_station_search 
    // Advanced search example: http://de1.api.radio-browser.info/json/stations/search?name=kiss_FM&countrycode=BR
    // query: "name=kiss_fm&countrycode=BR" => filters: { name: 'kiss_fm', countrycode: 'BR' }
    const filters = {}
    query.split("&").map(param => {
      filters[param.split("=")[0]] = param.split("=")[1]
    })
    const data = await RadioBrowser.searchStations(filters)
    const radio = {
      name: data[0].name,
      state: data[0].state,
      countrycode: data[0].countrycode,
      stream: data[0].url,
      site: data[0].homepage,
      icon: data[0].favicon
    }
    console.log(`Radio 1/${data.length}: ${radio.name} (${radio.state}-${radio.countrycode})`) // Radio 1/3: Rádio Kiss FM - 92.5 (São Paulo-BR)
    return radio
  } catch (err) {
    console.log("Search error: Could not find the radio")
    throw new Error("Error: Could not find the radio")
  }
}

// Given a URL stream, records a few seconds of it in a local audio file 
function record(streamURL) {

  //Temp dir notation:
  // "./tmp/records": localhost
  //  "/tmp/records": vercel
  //   "tmp/records": localhost
  const pathRecord = "./tmp/record.m4a"

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
        console.log("Ffmpeg error: " + err.message)
        reject(new Error(`Ffmpeg error: ${err.message}`))
        throw new Error(`Error: ${err.message}`)
      })
      .on("end", async function () {
        console.log("Processing finished!")
        resolve(pathRecord)
      })
  })
}

//Uses "node-shazam" package to recognise data (artist, song title) from an audio file
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
    const metadtataAlbumTitle = response.track.sections[0].metadata.filter(e => e.title === "Album")
    data["track"]["album"]["title"] = metadtataAlbumTitle.length > 0 ? metadtataAlbumTitle[0].text : "-"
    const metadtataAlbumYear = response.track.sections[0].metadata.filter(e => e.title === "Released")
    data["track"]["album"]["year"] = metadtataAlbumYear.length > 0 ? metadtataAlbumYear[0].text : "-"
    console.log("Music data found!")
    return data
  } catch (err) {
    console.log(`Shazam error: ${err}`)
    throw new Error("Error: Data not found :(")
  }
}

// Test
app.get("/", (req, res) => {return res.send("Hello, world!")})

// Record audio file from stream's URL, and try to recognise the music playing on it
// Usage: http://localhost:4000/api/v1/id/name=kiss_fm&countrycode=BR
app.get("/api/v1/id/:query", async (req, res) => {
  try {
    const query = req.params.query

    const radio = await search(query)

    const pathRecord = await record(radio.stream)

    const data = await recognize(pathRecord)

    data["radio"] = radio

    return res.status(200).json(data)
  } catch (err) {
    // return res.status(500).send(err.message)
    if (String(err.message).includes("radio")) { return res.status(404).json({"message": err.message}) } // search error
    if (String(err.message).includes("data")) { return res.status(400).json({"message": err.message}) }  // shazam error
    return res.status(500).json({"message": err.message})  // ffmpeg error
  }
})

app.listen(PORT, () => console.log(`App running on http://localhost:${PORT}`))
