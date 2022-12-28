const http = require("http");
const express = require("express");
const app = express();
const jwtAuth = require("socketio-jwt-auth");

const port = process.env.PORT || "3000";
app.set("port", port);

const errorHandler = (error) => {
  if (error.syscall !== "listen") {
    throw error;
  }
  const address = server.address();
  const bind =
    typeof address === "string" ? "pipe " + address : "port: " + port;
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges.");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use.");
      process.exit(1);
      break;
    default:
      throw error;
  }
};

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

const server = http.createServer(app);

server.on("error", errorHandler);
server.on("listening", () => {
  const address = server.address();
  const bind = typeof address === "string" ? "pipe " + address : "port " + port;
  console.log("Listening on " + bind);
});

// Web sockets
const io = require("socket.io")(server, {
  path: "/socket.io",
  pingTimeout: 3000,
  pingInterval: 5000,
});

// JWT Authentication
io.use(
  jwtAuth.authenticate(
    {
      secret: "12345", // required, used to verify the token's signature
      algorithm: "HS256", // optional, default to be HS256
    },
    function (payload, done) {
      done(null, true);
    }
  )
);

// Listen to events on our socket
io.sockets.on("connection", (socket) => {
  console.log(
    `Client connected: ${socket.id}; Service: ${socket.handshake.query.service}`
  );

  socket.on("socket_status", async (data) => {
    socket.broadcast.emit("socket_status", data);
  });  

  socket.on("socket_server_status", async (data) => {
    socket.broadcast.emit("socket_server_status", data);
  });  
});

setInterval(() => {
  io.emit("socket_server_status", "test")
}, 500)

server.listen(port);
