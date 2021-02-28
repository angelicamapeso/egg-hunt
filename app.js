// Server setup
const express = require("express");
const app = express();
const server = require("http").createServer(app);
// Websocket
const io = require("socket.io")(server);
const ioEvents = require("./socket.js")(io);

// Set port (process.env.PORT if deploying)
const PORT = process.env.PORT || 8080;

// Set static files
app.use(express.static(__dirname + "/public"));

// Server index.html at root route
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// Start server
server.listen(PORT, function () {
  console.log(`App listening on: localhost:${PORT}`);
});
