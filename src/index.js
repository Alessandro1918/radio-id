console.log("Hello!")

import {Shazam} from "node-shazam"
const shazam = new Shazam()

shazam.recognise("./audio_samples/003.m4a")
  .then(response => {
    console.log(response)
  })