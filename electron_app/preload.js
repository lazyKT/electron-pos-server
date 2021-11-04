/**
Preload Scripts for main window
**/

const {
  ipcRenderer,
  contextBridge
} = require("electron");


const ALLOWED_RECEIVED_CHANNELS = [
  "server-status",
  "server-socket-info",
  "database-status",
  "logs",
  "server-stop"
];


const ALLOWED_SEND_CHANNELS = [
  "stop-server",
];



contextBridge.exposeInMainWorld ("api", {
  send: (channel, data) => {
    if (ALLOWED_SEND_CHANNELS.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel, callback) => {
    if (ALLOWED_RECEIVED_CHANNELS.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => callback(...args));
    }
  }
})
