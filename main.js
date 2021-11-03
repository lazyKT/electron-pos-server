/**
electron app
**/

const path = require("path");
const { fork } = require("child_process");
const {
  app,
  BrowserWindow
} = require("electron");

// const server = require("./server");


let win, server


function createMainWindow () {
  if (!win) {
    win = new BrowserWindow ({
      width: 800,
      height: 500,
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

  server.on("exit", (code, signal) => {
    console.log("Server exited");
    console.log("code", code);
    console.log("signal", signal);
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
