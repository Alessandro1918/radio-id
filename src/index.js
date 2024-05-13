import express from "express"
import { Shazam } from "node-shazam"
import * as fs from "fs"
import * as path from "path"
import Recorder from "node-rtsp-recorder"

const app = express()
const shazam = new Shazam()
const PORT = process.env.PORT || 4000

//Test
app.get("/", (req, res) => {return res.send("Hello, world!")})

//Recognise song based on audio file
app.get("/audio/:filename", async (req, res) => {

  const srcPath = path.join(process.cwd(), "audio_samples", `${req.params.filename}`) //path = "./audio_samples/003.avi"
  const filePath = path.join("/tmp", `${req.params.filename}`)

  // fs.mkdirSync(tmpDir, { recursive: true })  //no need to init "/tmp" dir

  fs.copyFileSync(srcPath, filePath)

  shazam.recognise(filePath)
    .then(response => {
      // fs.rmSync(tmpDir, { recursive: true, force: true })  //no need to remove "/tmp" dir
      return res.json(response)
    })
})

//Record audio file from stream's URL
app.get("/record/:streamUrl", (req, res) => {
  var rec = new Recorder.Recorder({
    url: req.params.streamUrl,  //stream = "https://cloud2.cdnseguro.com:20000/;" (Kiss FM)
    timeLimit: 5, // time in seconds for each segmented audio file
    folder: "/tmp/records",
    type: "audio",
  })
  
  rec.startRecording()

  setTimeout(() => {
      console.log("Stopping Recording")
      rec.stopRecording()
      rec = null
  }, 5*1000)  //ms
})

app.listen(PORT, () => console.log(`App running on http://localhost:${PORT}`))
