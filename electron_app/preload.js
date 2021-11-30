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
  "server-stop",
  "requests-logs"
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
    console.log(channel);
    if (ALLOWED_RECEIVED_CHANNELS.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => callback(...args));
    }
  },
  removeEventListeners: () => {
    try {
      ALLOWED_RECEIVED_CHANNELS.forEach(
        channel => {
          const func = ipcRenderer.listeners(channel)[0];
          if (func) {
            ipcRenderer.removeListener(channel, func);
            console.log(`${channel} is removed from ipcRenderer!`);
          }
        }
      );
    }
    catch (error) {
      console.error("Error Removing Listeners From IPCRenderer", error);
    }
  }
})
