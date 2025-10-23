import { navigateTo, makeRequest } from "../app.js";

export default function renderScreen2(data) {
  const { winner, players } = data;
  
  const app = document.getElementById("app");
  app.innerHTML = `
    <div id="screen2">
      <h2>🎉 ¡Tenemos un Ganador! 🎉</h2>
      <div id="winner-info">
        <h3>🏆 ${winner.nickname} ha ganado con ${winner.score} puntos! 🏆</h3>
      </div>
      
      <div id="players-ranking">
        <h3>Ranking Final:</h3>
        <div id="ranking-list"></div>
      </div>
      
      <div id="controls">
        <button id="sort-score-btn">Ordenar por Puntuación</button>
        <button id="sort-name-btn">Ordenar Alfabéticamente</button>
        <button id="restart-game-btn">🔄 Reiniciar Juego</button>
        <button id="back-btn">← Volver al Tablero</button>
      </div>
    </div>
  `;

  const rankingList = document.getElementById("ranking-list");
  const sortScoreBtn = document.getElementById("sort-score-btn");
  const sortNameBtn = document.getElementById("sort-name-btn");
  const restartBtn = document.getElementById("restart-game-btn");
  const backBtn = document.getElementById("back-btn");

  let currentPlayers = [...players];
  let sortByScore = true;

  // Mostrar ranking inicial (ordenado por puntuación)
  updateRanking(currentPlayers, true);

  // Botón para ordenar por puntuación
  sortScoreBtn.addEventListener("click", () => {
    sortByScore = true;
    updateRanking(currentPlayers, true);
  });

  // Botón para ordenar alfabéticamente
  sortNameBtn.addEventListener("click", () => {
    sortByScore = false;
    updateRanking(currentPlayers, false);
  });

  // Botón para reiniciar juego
  restartBtn.addEventListener("click", async () => {
    await makeRequest("/api/game/reset-scores", "POST");
    navigateTo("/");
  });

  // Botón para volver al tablero
  backBtn.addEventListener("click", () => {
    navigateTo("/");
  });

  // Función para actualizar el ranking
  function updateRanking(playersList, byScore) {
    const sortedPlayers = byScore 
      ? [...playersList].sort((a, b) => (b.score || 0) - (a.score || 0))
      : [...playersList].sort((a, b) => a.nickname.localeCompare(b.nickname));

    rankingList.innerHTML = `
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background: rgba(102, 126, 234, 0.3);">
            <th style="padding: 10px; text-align: left;">Posición</th>
            <th style="padding: 10px; text-align: left;">Jugador</th>
            <th style="padding: 10px; text-align: center;">Puntuación</th>
          </tr>
        </thead>
        <tbody>
          ${sortedPlayers.map((player, index) => `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); ${player.id === winner.id ? 'background: rgba(0,255,0,0.1);' : ''}">
              <td style="padding: 10px;">${byScore ? index + 1 : '-'}</td>
              <td style="padding: 10px; ${player.id === winner.id ? 'font-weight: bold; color: #00ff00;' : ''}">
                ${player.nickname} ${player.id === winner.id ? '👑' : ''}
              </td>
              <td style="padding: 10px; text-align: center; font-weight: bold; color: ${getScoreColor(player.score)};">
                ${player.score || 0}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  // Función para obtener color según puntuación
  function getScoreColor(score) {
    if (score >= 100) return "#00ff00";
    if (score >= 50) return "#ffff00";
    if (score < 0) return "#ff4444";
    return "#ffffff";
  }
}