const { Server } = require("socket.io");

let io;

const initSocketInstance = (httpServer) => {
  io = new Server(httpServer, {
    path: "/real-time",
    cors: {
      origin: "*",
    },
  });
  return io;
};

const emitToSpecificClient = (socketId, eventName, data) => {
  if (!io) {
    console.error("Socket.io instance is not initialized");
    return;
  }
  io.to(socketId).emit(eventName, data);
};

const emitEvent = (eventName, data) => {
  if (!io) {
    console.error("Socket.io instance is not initialized");
    return;
  }
  io.emit(eventName, data);
};

module.exports = {
  emitEvent,
  initSocketInstance,
  emitToSpecificClient
};