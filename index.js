const express = require("express");
const path = require("path");
const { createServer } = require("http");

const playersRouter = require("./server/routes/players.router");
const gameRouter = require("./server/routes/game.router");
const { initSocketInstance } = require("./server/services/socket.service");
const playersDb = require("./server/db/players.db");

const PORT = 5050;

const app = express();
const httpServer = createServer(app);

// Middlewares
app.use(express.json());
app.use("/game", express.static(path.join(__dirname, "game")));
app.use("/results", express.static(path.join(__dirname, "results-screen")));

// Routes
app.use("/api", playersRouter);
app.use("/api/game", gameRouter);

const io = initSocketInstance(httpServer);

io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);

  socket.on('getInitialData', () => {
    const playersWithScores = playersDb.getAllPlayersWithScores();
    socket.emit('initialData', { players: playersWithScores });
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });
});

httpServer.listen(PORT, () =>{
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
   console.log(`   ➤ http://localhost:${PORT}/game`);
   console.log(`   ➤ http://localhost:${PORT}/results`);

});