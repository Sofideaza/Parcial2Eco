/**
 * Database service for player-related operations
 */

const { assignRoles } = require("../utils/helpers");

const players = [];
const scores = {}; // Nuevo: almacenar puntuaciones

/**
 * Get all players
 * @returns {Array} Array of player objects
 */
const getAllPlayers = () => {
  return players;
};

/**
 * Add a new player
 * @param {string} nickname - Player's nickname
 * @param {string} socketId - Player's socket ID
 * @returns {Object} The created player
 */
const addPlayer = (nickname, socketId) => {
  const newPlayer = { id: socketId, nickname };
  players.push(newPlayer);
  scores[socketId] = 0; // Inicializar puntuación en 0
  return newPlayer;
};

/**
 * Find a player by their socket ID
 * @param {string} socketId - Player's socket ID
 * @returns {Object|null} Player object or null if not found
 */
const findPlayerById = (socketId) => {
  return players.find((player) => player.id === socketId) || null;
};

/**
 * Assign roles to all players
 * @returns {Array} Array of players with assigned roles
 */
const assignPlayerRoles = () => {
  const playersWithRoles = assignRoles(players);
  // Update the players array with the new values
  players.splice(0, players.length, ...playersWithRoles);
  return players;
};

/**
 * Find players by role
 * @param {string|Array} role - Role or array of roles to find
 * @returns {Array} Array of players with the specified role(s)
 */
const findPlayersByRole = (role) => {
  if (Array.isArray(role)) {
    return players.filter((player) => role.includes(player.role));
  }
  return players.filter((player) => player.role === role);
};

/**
 * Get all game data (includes players)
 * @returns {Object} Object containing players array
 */
const getGameData = () => {
  return { players };
};

/**
 * Reset game data
 * @returns {void}
 */
const resetGame = () => {
  players.splice(0, players.length);
};

// NUEVAS FUNCIONES PARA PUNTUACIÓN

/**
 * Get player score
 * @param {string} socketId - Player's socket ID
 * @returns {number} Player's score
 */
const getPlayerScore = (socketId) => {
  return scores[socketId] || 0;
};

/**
 * Update player score
 * @param {string} socketId - Player's socket ID
 * @param {number} points - Points to add/subtract
 * @returns {number} New score
 */
const updatePlayerScore = (socketId, points) => {
  if (!scores[socketId]) scores[socketId] = 0;
  scores[socketId] += points;
  return scores[socketId];
};

/**
 * Get all players with scores
 * @returns {Array} Array of players with scores
 */
const getAllPlayersWithScores = () => {
  return players.map(player => ({
    ...player,
    score: scores[player.id] || 0
  }));
};

/**
 * Reset all scores
 * @returns {void}
 */
const resetAllScores = () => {
  Object.keys(scores).forEach(key => {
    scores[key] = 0;
  });
};

/**
 * Check if any player has reached 100 points
 * @returns {boolean} True if someone has >= 100 points
 */
const hasWinner = () => {
  return Object.values(scores).some(score => score >= 100);
};

/**
 * Get winner data
 * @returns {Object|null} Winner data or null
 */
const getWinner = () => {
  const winnerId = Object.keys(scores).find(key => scores[key] >= 100);
  if (!winnerId) return null;
  
  const winner = players.find(player => player.id === winnerId);
  return winner ? { ...winner, score: scores[winnerId] } : null;
};

module.exports = {
  getAllPlayers,
  addPlayer,
  findPlayerById,
  assignPlayerRoles,
  findPlayersByRole,
  getGameData,
  resetGame,
  // Nuevas exportaciones
  getPlayerScore,
  updatePlayerScore,
  getAllPlayersWithScores,
  resetAllScores,
  hasWinner,
  getWinner
};