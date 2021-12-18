# electron-pos-server

### Express Local Server with Electron App
#### Run/listen express server in child process and logging out the server logs inside electron browser window.

### How to run
```
npm init -y
npm install 
```

#### Run Full Server Application
```
npm run watch
```
#### The express server will autoatically start once the electron app is ready.

#### Run Express API Scripts only
```
nodemon server.js
```
The above command will omit the GUI (electron process) and will run the normal express devlopement server only.
