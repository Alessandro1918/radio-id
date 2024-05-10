import express from "express"
import { Shazam } from "node-shazam"

const app = express()
const shazam = new Shazam()
const PORT = process.env.PORT || 4000

//Test
app.get("/", (req, res) => {return res.send("Hello, world!")})

//Recognise song based on audio file
app.get("/audio/:id", async (req, res) => {
  const path = `./audio_samples/${req.params.id}.m4a` //path = "./audio_samples/003.m4a"
  shazam.recognise(path)
    .then(response => {
      return res.json(response)
    })
})

app.listen(PORT, () => console.log(`App running on http://localhost:${PORT}`))
