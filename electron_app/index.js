// DOM Nodes
const serverStatus = document.getElementById("server-status");
const dbStatus = document.getElementById("db-status");
const logs = document.getElementById("logs");


window.api.receive("server-status", status => {
  console.log('server-status', status);
  updateStatus(serverStatus, status);
  if (status === "connected")
    dbStatus.innerHTML = "starting...";
});


window.api.receive("database-status", status => {
  console.log("database-status", status);
  updateStatus(dbStatus, status);
});



function updateStatus (dom, status) {
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
