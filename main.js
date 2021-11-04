/**
electron app
**/

const path = require("path");
const { fork } = require("child_process");
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
  win.openDevTools();

  win.on("ready-to-show", () => win.show());

  win.on("close", () => { if(win) win = null; });

  win.webContents.on("did-finish-load", () => {
    /**
    # IPC Messages
    # Get Logs From Express Server
    **/

    server.on("message", m => {
      console.log("[server]", m);
      if (m === "server-ready") {
        win.webContents.send("server-status", "connected");
      }
      else if (m.includes("server-port:")) {
        console.log(`Server is running at PORT:${m.split(':')[1]}`)
        // win.loadURL(`http:127.0.0.1:${m.split(':')[1]}/`);
        /**
        # Send Server Socket Info to renderer
        **/
        win.webContents.send("server-socket-info", m.split(':')[1]);
      }
      else {
        console.log(m);
        try {
          const messageObject = JSON.parse(m);
          const { name } = messageObject;
          console.log('status name', name);
          if (name === "dbstatus") {
            console.log('inside if. status name', name);
            win.webContents.send("database-status", messageObject.status);
          }
        }
        catch (err) {
          console.error(err);
        }
      }
    });


    server.stderr.on("data", m => {
      try {
        const errObj = JSON.parse(m.toString());
        const logger = new Logger(errObj.status, errObj.message);
        win.webContents.send("logs", logger.toString());
      }
      catch (err) {
        console.error(err);
      }
    });

    server.on("exit", (code, signal) => {

      const logger = new Logger("info", `Server Terminated with signal : ${signal}`);
      win.webContents.send("server-stop", logger.toString());

      // console.log("Sever stopped gracefully")
    });

    // stop server
    ipcMain.on("stop-server", (event, args) => {
      // console.log("stop-server ipc received.")
      if (server)
        server.kill('SIGTERM'); // stop server process
    });

  });
}



app.whenReady().then(() => {

  createMainWindow();

  server = fork(
    path.join(__dirname, ("./server.js")),
    [],
    { silent: true }
  );

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0)
      createMainWindow();
  });

});


app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    console.log("all window close")
    if (server) {
      server.kill('SIGINT'); // kill server process once the app is closed
    }
  }
});
