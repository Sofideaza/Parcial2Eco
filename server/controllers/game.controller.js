const playersDb = require("../db/players.db");
const {
  emitEvent,
  emitToSpecificClient
} = require("../services/socket.service");

const joinGame = async (req, res) => {
  try {
    const { nickname, socketId } = req.body;
    playersDb.addPlayer(nickname, socketId);

    const gameData = playersDb.getGameData();
    emitEvent("userJoined", gameData);
    
    // Notificar a results-screen sobre nuevo jugador
    const playersWithScores = playersDb.getAllPlayersWithScores();
    emitEvent("playerConnected", {
      players: playersWithScores
    });

    console.log(`Jugador ${nickname} conectado. Total: ${playersWithScores.length}`);

    res.status(200).json({ success: true, players: gameData.players });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const startGame = async (req, res) => {
  try {
    const playersWithRoles = playersDb.assignPlayerRoles();

    playersWithRoles.forEach((player) => {
      emitToSpecificClient(player.id, "startGame", player.role);
    });

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const notifyMarco = async (req, res) => {
  try {
    const { socketId } = req.body;

    const rolesToNotify = playersDb.findPlayersByRole([
      "polo",
      "polo-especial",
    ]);

    rolesToNotify.forEach((player) => {
      emitToSpecificClient(player.id, "notification", {
        message: "Marco!!!",
        userId: socketId,
      });
    });

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const notifyPolo = async (req, res) => {
  try {
    const { socketId } = req.body;

    const rolesToNotify = playersDb.findPlayersByRole("marco");

    rolesToNotify.forEach((player) => {
      emitToSpecificClient(player.id, "notification", {
        message: "Polo!!",
        userId: socketId,
      });
    });

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const selectPolo = async (req, res) => {
  try {
    const { socketId, poloId } = req.body;

    const myUser = playersDb.findPlayerById(socketId);
    const poloSelected = playersDb.findPlayerById(poloId);
    const allPlayers = playersDb.getAllPlayers();

    let message = "";
    
    // SISTEMA DE PUNTUACIÓN
    if (poloSelected.role === "polo-especial") {
      // Marco atrapa polo especial: +50 puntos para Marco
      playersDb.updatePlayerScore(socketId, 50);
      // Polo especial es atrapado: -10 puntos
      playersDb.updatePlayerScore(poloId, -10);
      
      message = `El marco ${myUser.nickname} ha ganado, ${poloSelected.nickname} ha sido capturado (+50 puntos para ${myUser.nickname})`;
    } else {
      // Marco no atrapa polo especial: -10 puntos para Marco
      playersDb.updatePlayerScore(socketId, -10);
      // Polo normal no es atrapado: +10 puntos
      playersDb.updatePlayerScore(poloId, 10);
      
      message = `El marco ${myUser.nickname} ha perdido (-10 puntos)`;
    }

    // Notificar a todos los jugadores
    allPlayers.forEach((player) => {
      emitToSpecificClient(player.id, "notifyGameOver", {
        message: message,
        nickname: myUser.nickname
      });
      
      // Enviar puntuación actualizada a cada jugador
      const currentScore = playersDb.getPlayerScore(player.id);
      emitToSpecificClient(player.id, "updateScore", {
        score: currentScore
      });
    });

    // Notificar a results-screen sobre actualización de puntuaciones
    const playersWithScores = playersDb.getAllPlayersWithScores();
    emitEvent("scoresUpdated", {
      players: playersWithScores
    });

    console.log(`Puntuaciones actualizadas:`, playersWithScores);

    // Verificar si hay ganador
    if (playersDb.hasWinner()) {
      const winner = playersDb.getWinner();
      emitEvent("gameWon", {
        winner: winner,
        players: playersWithScores
      });
      console.log(`🎉 ${winner.nickname} ha ganado con ${winner.score} puntos!`);
    }

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// NUEVO: Endpoint para reiniciar puntuaciones
const resetScores = async (req, res) => {
  try {
    playersDb.resetAllScores();
    
    // Notificar a todos los clientes
    const playersWithScores = playersDb.getAllPlayersWithScores();
    emitEvent("scoresReset", {
      players: playersWithScores
    });

    console.log("Puntuaciones reiniciadas");

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// NUEVO: Endpoint para obtener puntuaciones
const getScores = async (req, res) => {
  try {
    const playersWithScores = playersDb.getAllPlayersWithScores();
    res.status(200).json({ players: playersWithScores });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  joinGame,
  startGame,
  notifyMarco,
  notifyPolo,
  selectPolo,
  resetScores,
  getScores
};