// DOM Nodes
const serverStatus = document.getElementById("server-status");
const dbStatus = document.getElementById("db-status");
const socketInfo = document.getElementById("socket-info");
const logs = document.getElementById("logs");


// run as soon as the page load
(function () {
  addLogs("[info] server starting ...");
})()


window.api.receive("server-socket-info", socket => {
  console.log("server-socket-info", socket);
  socketInfo.innerHTML = `Server running at PORT: ${socket}`;
  addLogs(`[info] server running at PORT: ${socket}`);
});


window.api.receive("server-status", status => {
  console.log('server-status', status);
  updateStatus(serverStatus, status);
  if (status === "connected") {
    addLogs(`[${status}] server connected`);
    addLogs("[info] trying to connect database");
    dbStatus.innerHTML = "starting...";
  }
  else if (status === "error")
    addLogs(`[${status}] failed to start server`);
});


window.api.receive("database-status", status => {
  console.log("database-status", status);
  updateStatus(dbStatus, status);
  if (status === "connected") {
    addLogs(`[${status}] database connected`);
  }
  else if (status === "error")
    addLogs(`[${status}] failed to connect database`);
});


window.api.receive("logs", log => {
  console.log(log.toString());
  addLogs(log);
});


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
  }
}
