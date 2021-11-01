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
      width: 1000,
      height: 800,
      show: false,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false
      }
    });
  }


  server.on("message", m => {
    console.log("[server]", m);
    if (m == "server-ready") {
      win.loadURL("http:127.0.0.1:8080/");

      win.on("ready-to-show", () => win.show());
    }
  });


  win.on("close", () => { if(win) win = null; });
}



app.whenReady().then(() => {

  server = fork(path.join(__dirname, ("./server.js")));
  createMainWindow();

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
