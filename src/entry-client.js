
import { createApp } from './main.js';

const { app, router } = createApp();

console.log('HI')

router.isReady().then(() => {
  console.log('router is ready')
  app.mount('#app')
});

console.log('ack me senpai?')

import { io } from "socket.io-client";

// greets https://github.com/mdn/dom-examples/blob/master/web-speech-api/speak-easy-synthesis/script.js
const synth = window.speechSynthesis;

// console.log(synth.getVoices());
const voice = (() => {
  const voiceList = synth.getVoices();
  return voiceList.find((v) => {
    return v.name === 'English (America)';
  })
})();
console.log(voice)

function speak(inputText, pitch, rate) {
  if (synth.speaking) {
    console.error("speechSynthesis.speaking");
    return;
  }

  if (inputText !== "" && document.querySelector('#tts-on').checked == true) {
    const utterThis = new SpeechSynthesisUtterance(inputText);

    utterThis.onend = function (event) {
      console.log("SpeechSynthesisUtterance.onend");
    };

    utterThis.onerror = function (event) {
      console.error("SpeechSynthesisUtterance.onerror");
    };

    utterThis.voice = voice;
    utterThis.pitch = pitch;
    utterThis.rate = rate;
    synth.speak(utterThis);
  }
}


const socket = io();
const ttsDiv = document.querySelector('.tts');
socket.on("connect", () => {
  console.log(socket.id);
});

socket.on("tts", (payload) => {
  console.log(`got tts event with payload ${JSON.stringify(payload)}`);

  speak(payload.t, payload.p, payload.r);
})
