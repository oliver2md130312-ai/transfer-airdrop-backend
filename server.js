
const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer();
const io = new Server(server, { cors: { origin: "*" } });

let devices = {};

io.on("connection", socket => {
  socket.on("join", data => {
    devices[socket.id] = { id: socket.id, name: data.name, type: data.type };
    io.emit("devices", Object.values(devices));
  });

  socket.on("connect-request", data => {
    io.to(data.to).emit("incoming-connect", {
      from: socket.id,
      name: devices[socket.id]?.name || "Dispositivo"
    });
  });

  socket.on("connect-accept", data => {
    io.to(data.to).emit("connect-accepted", { from: socket.id });
  });

  socket.on("signal", data => {
    io.to(data.to).emit("signal", data);
  });

  socket.on("disconnect", () => {
    delete devices[socket.id];
    io.emit("devices", Object.values(devices));
  });
});

server.listen(process.env.PORT || 3000);
