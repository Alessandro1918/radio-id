import express from "express"
import { Shazam } from "node-shazam"
import * as fs from "fs"

const app = express()
const shazam = new Shazam()
const PORT = process.env.PORT || 4000

//Test
app.get("/", (req, res) => {return res.send("Hello, world!")})

//Recognise song based on audio file
app.get("/audio/:id", async (req, res) => {

  const srcPath = `./audio_samples/${req.params.id}.m4a` //path = "./audio_samples/003.m4a"
  const tmpDir = "temp"
  const filePath = `./${tmpDir}/${req.params.id}.m4a`

  fs.mkdirSync(tmpDir, { recursive: true })

  fs.copyFileSync(srcPath, filePath)

  shazam.recognise(filePath)
    .then(response => {
      fs.rmSync(tmpDir, { recursive: true, force: true })
      return res.json(response)
    })
})

app.listen(PORT, () => console.log(`App running on http://localhost:${PORT}`))
