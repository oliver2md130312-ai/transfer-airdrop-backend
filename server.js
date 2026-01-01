const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer();
const io = new Server(server, { cors: { origin: "*" } });

const users = {}; // guardamos los usuarios conectados

io.on("connection", socket => {

  // Usuario se une
  socket.on("join", data => {
    users[socket.id] = {
      id: socket.id,
      name: data.name,
      role: data.role
    };
    // Emitimos solo receptores a todos los emisores
    io.emit("receivers", Object.values(users).filter(u => u.role === "receive"));
  });

  // Emisor solicita enviar a receptor
  socket.on("request-send", data => {
    // data.to = receptorID
    io.to(data.to).emit("incoming-request", {
      from: socket.id, // emisorID
      name: users[socket.id]?.name
    });
  });

  // Receptor acepta solicitud
  socket.on("accept-request", data => {
    // data.to = emisorID
    io.to(data.to).emit("request-accepted", {
      from: socket.id // receptorID
    });
  });

  // Señales WebRTC
  socket.on("signal", data => {
    io.to(data.to).emit("signal", data);
  });

  // Usuario se desconecta
  socket.on("disconnect", () => {
    delete users[socket.id];
    io.emit("receivers", Object.values(users).filter(u => u.role === "receive"));
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log("Servidor escuchando en puerto", process.env.PORT || 3000);
});