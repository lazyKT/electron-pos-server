/**
electron app
**/

const path = require("path");
const { fork, spawn } = require("child_process");
const {
  app,
  BrowserWindow,
  ipcMain
} = require("electron");


const Logger = require("./logger.js");

// const server = require("./server");


let win, server


function createMainWindow () {
  if (!win) {
    win = new BrowserWindow ({
      width: 800,
      height: 600,
      show: false,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        preload: path.join(__dirname, "./electron_app/preload.js")
      }
    });
  }

  win.loadFile(path.join(__dirname, "./electron_app/index.html"));
  // win.openDevTools();

  win.on("ready-to-show", () => win.show());

  win.on("close", () => {
    if(win) {
      removeEventListeners(ipcMain, ["stop-server"]);
      removeEventListeners(win.webContents, ["did-finish-load"]);
      win = null;
    }
  });

  win.webContents.on("did-finish-load", () => {
    /**
    # IPC Messages
    # Get Logs From Express Server
    **/

    server.on("message", m => {
      console.log(m);
      if (m === "server-ready") {
        win.webContents.send("server-status", "connected");
      }
      else if (m.includes("server-port:")) {
        // console.log(`Server is running at PORT:${m.split(':')[1]}`)
        // win.loadURL(`http:127.0.0.1:${m.split(':')[1]}/`);
        /**
        # Send Server Socket Info to renderer
        **/
        win.webContents.send("server-socket-info", m.split(':')[1]);
      }
      else {

        try {
          const messageObject = JSON.parse(m);
          const { name } = messageObject;

          if (name === "dbstatus") {

            win.webContents.send("database-status", messageObject.status);
          }
          else if (name === "request") {

            win.webContents.send("requests-logs", messageObject.message);
          }
        }
        catch (err) {
          console.error(err);
        }
      }
    });


    /** child process receives 'exit' signal **/
    server.on("exit", (code, signal) => {
      const logger = new Logger("info", `Server Terminated with signal : ${signal}`);
      win.webContents.send("server-stop", logger.toString());

      // console.log("Sever stopped gracefully")
    });

    // stop server from electron process (main process)
    ipcMain.on("stop-server", (event, args) => {
      // console.log("stop-server ipc received.")
      if (server) {
        if (process.platform === 'win32') {
          // kill node process on windows
          spawn ("taskkill", ["/pid", server.pid, "/f", "/t"]);
        }
        else {
          server.kill('SIGINT'); // kill server process once the app is closed
        }
        server = null;
      }
    });

  });
}



app.whenReady().then(() => {

  createMainWindow();

  server = fork(
    path.join(__dirname, ("./server.js")),
    [],
    // { silent: true }
  );

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0)
      createMainWindow();
  });

});


app.on("window-all-closed", () => {

  app.quit();
  if (server) {
    if (process.platform === 'win32') {
      // kill node process on windows
      spawn ("taskkill", ["/pid", server.pid, "/f", "/t"]);
    }
    else {
      server.kill('SIGINT'); // kill server process once the app is closed
    }
    server = null;
  }

});


/** Remove Event Listeners on window close **/
function removeEventListeners (listener, events) {
  try {
    events.forEach(
      event => {
        const func = listener.listeners(event)[0];
        if (func) {
          listener.removeListener(event, func);
        }
      }
    );
  }
  catch (error) {
    console.error("Error Removing Event Listeners from Electron Main.js", error);
  }
}
