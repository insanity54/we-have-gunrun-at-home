#!/usr/bin/env node


import 'dotenv/config';

const TWITCH_STREAM_KEY = process.env.TWITCH_STREAM_KEY;
const RTSP_PORT = process.env.RTSP_PORT;

if (typeof TWITCH_STREAM_KEY === 'undefined') throw new Error('TWITCH_STREAM_KEY must be defined in environment, but it was undefined.');
if (typeof RTSP_PORT === 'undefined') throw new Error('RTSP_PORT must be defined in environment, but it was undefined.');


import 'dotenv/config';
import { execa } from 'execa';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import serve from './src/server.js';

const stream = (args) => {
  serve(args.channel);
  console.log(`teh stream begins with args:${JSON.stringify(args)}`);
  execa('/home/chris/Documents/rtsp-simple-server/rtsp-simple-server', ['./rtsp-simple-server.yml']).stdout.pipe(process.stdout);
};

const streamCommandBuilder = (yargs) => {
  return yargs
    .option('channel', {
      required: true,
      alias: 'c',
      describe: 'the twitch channel',
      nargs: 1
    })
};





yargs(hideBin(process.argv))
  .usage('Usage: $0 <command> [options]')
  .command('stream', 'Begin streaming to a Twitch channel', streamCommandBuilder, stream)
  // .command('serve', 'Serve a webpage', serveCommandBuilder, serve)
  .demandCommand()
  .argv

