// DOM Nodes
const serverStatus = document.getElementById("server-status");
const dbStatus = document.getElementById("db-status");
const reconnectDB = document.getElementById("rc-db");
const disconnectDB = document.getElementById("dc-db");
const stopServer = document.getElementById("stop-server");
const socketInfo = document.getElementById("socket-info");
const logs = document.getElementById("logs");


// run as soon as the page load
(function () {
  addLogs("[info] server starting ...");
})()


window.api.receive("server-socket-info", socket => {

  socketInfo.innerHTML = `Server running at PORT: ${socket}`;
  addLogs(`[info] server running at PORT: ${socket}`);
});


window.api.receive("server-stop", message => {
  stopServer.innerHTML = "Terminate";
  addLogs(message);
  serverStatus.innerHTML = "disconnected";
  serverStatus.style.background = "gray";
});


window.api.receive("server-status", status => {

  updateStatus(serverStatus, status);
  if (status === "connected") {
    addLogs(`[${status}] server connected`);
    addLogs("[info] trying to connect database");
    dbStatus.innerHTML = "starting...";
    stopServer.removeAttribute("disabled");
  }
  else if (status === "error") {
    addLogs(`[${status}] failed to start server`);
  }
});


window.api.receive("database-status", status => {

  updateStatus(dbStatus, status);
  if (status === "connected") {
    addLogs(`[${status}] database connected`);
    reconnectDB.setAttribute("disabled", true);
    disconnectDB.removeAttribute("disabled");
  }
  else if (status === "error") {
    addLogs(`[${status}] failed to connect database`);
    reconnectDB.removeAttribute("disabled");
    disconnectDB.setAttribute("disabled", true);
  }
});


window.api.receive("requests-logs", message => {
  addLogs(`Api Request : ${message}`);
});


window.api.receive("logs", log => {
  console.log(log.toString());
  addLogs(log);
});


/** reconnect database **/
reconnectDB.addEventListener("click", async e => {
  try {
    addLogs("[info] reconnecting to server ...");

    reconnectDB.setAttribute("disabled", true);
    reconnectDB.innnerHTML = "Reconnecting ...";

    const url = "http://127.0.0.1:8080/db-reset";
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type" : "application/json",
        "Accept" : "application/json"
      }
    });

    console.log(response);

    if (response.ok) {
      addLogs("[info] successfully connected to database");
      reconnectDB.innerHTML = "Reconnect";
    }
    else {
      // error
      addLogs("[error] Failed to connect to database");
      reconnectDB.removeAttribute("disabled");
      reconnectDB.innerHTML = "Reconnect";
    }
  }
  catch (error) {
    alert(`Error Restarting Database: ${error}`);
  }
});


/** stop server **/
stopServer.addEventListener("click", e => {
  addLogs ("[info] terminating server ...");
  stopServer.setAttribute("disabled", true);
  stopServer.innerHTML = "Terminating ...";
  window.api.send("stop-server", "");
})


function updateStatus (dom, status, log) {
  switch (status) {
    case "connected":
      dom.style.background = "green";
      dom.innerHTML = status;
      break;
    case "disconnected":
      dom.style.background = "gray";
      dom.innerHTML = status;
      break;
    case "error":
      dom.style.background = "red";
      dom.innerHTML = status;
      break;
    default:
      throw new Error ("Unknown Server Status");
  }
}


function addLogs (log) {
  if (logs) {
    const logMessage = document.createElement("span");
    logMessage.setAttribute("class", "text-dark");
    logMessage.style.display = "block";
    const date = (new Date()).toLocaleDateString();
    const time = (new Date()).toLocaleTimeString();
    logMessage.innerHTML = `${date} ${time}: ${log}`;
    logs.appendChild(logMessage);
    logs.scrollTop = logs.scrollHeight; // scroll to bottom
  }
}


/**
 * Clean Up Event Listeners 
 **/

window.onUnload = () => window.api.removeEventListeners();
