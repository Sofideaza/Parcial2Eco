import { navigateTo, makeRequest } from "../app.js";

export default function renderScreen2(data) {
  const { winner, players } = data;
  
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="final-container">
      <h1 class="monitor-title"> ¡TENEMOS UN GANADOR! </h1>
      
      <div class="winner-info">
        <h2>GANADOR</h2>
        <h3 class="winner-name">${winner.nickname}</h3>
        <p>con <strong>${winner.score} puntos</strong></p>
      </div>
      
      <div class="players-section">
        <h2>Ranking Final</h2>
        <div id="ranking-list"></div>
      </div>
      
      <div class="controls-panel">
        <button id="sort-score-btn" class="control-btn">Ordenar por Puntuación</button>
        <button id="sort-name-btn" class="control-btn">Ordenar Alfabéticamente</button>
        <button id="restart-game-btn" class="control-btn">🔄 Reiniciar Juego</button>
        <button id="back-btn" class="control-btn">← Volver al Tablero</button>
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

  updateRanking(currentPlayers, true);

  sortScoreBtn.addEventListener("click", () => {
    sortByScore = true;
    updateRanking(currentPlayers, true);
  });

  sortNameBtn.addEventListener("click", () => {
    sortByScore = false;
    updateRanking(currentPlayers, false);
  });

  restartBtn.addEventListener("click", async () => {
    await makeRequest("/api/game/reset-scores", "POST");
    navigateTo("/");
  });

  backBtn.addEventListener("click", () => {
    navigateTo("/");
  });

  function updateRanking(playersList, byScore) {
    const sortedPlayers = byScore 
      ? [...playersList].sort((a, b) => (b.score || 0) - (a.score || 0))
      : [...playersList].sort((a, b) => a.nickname.localeCompare(b.nickname));

    rankingList.innerHTML = `
      <div style="overflow-x: auto;">
        <table class="players-table">
          <thead>
            <tr>
              <th>POSICIÓN</th>
              <th>JUGADOR</th>
              <th>PUNTUACIÓN</th>
            </tr>
          </thead>
          <tbody>
            ${sortedPlayers.map((player, index) => `
              <tr ${player.id === winner.id ? 'class="winner-row"' : ''}>
                <td class="position-cell">
                  ${byScore ? index + 1 : '-'}
                </td>
                <td class="player-name">
                  ${player.nickname} ${player.id === winner.id ? '<span class="winner-crown">👑</span>' : ''}
                </td>
                <td class="score-cell ${getScoreClass(player.score)}">
                  ${player.score || 0}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function getScoreClass(score) {
    if (score >= 100) return "score-positive-high";
    if (score >= 50) return "score-positive-medium";
    if (score >= 20) return "score-positive-low";
    if (score < 0) return "score-negative";
    return "score-neutral";
  }
}