import { navigateTo, socket, makeRequest } from "../app.js";

export default function renderScreen1() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="monitor-container">
      <h1 class="monitor-title">🏆 MONITOR MARCO POLO 🏆</h1>
      <div class="players-section">
        <h2>👥 Jugadores Conectados</h2>
        <div id="players-list" class="players-list">
          <p style="color: #888;">Cargando jugadores...</p>
        </div>
      </div>
      <button id="reset-scores-btn" class="reset-btn">
        🔄 Reiniciar Todas las Puntuaciones
      </button>
      <div class="status-panel">
        <p><strong>Estado del Monitor:</strong> <span id="status">Conectando...</span></p>
        <p><strong>Eventos Recibidos:</strong> <span id="event-count">0</span></p>
      </div>
    </div>
  `;

  const playersList = document.getElementById("players-list");
  const resetBtn = document.getElementById("reset-scores-btn");
  const statusEl = document.getElementById("status");
  const eventCountEl = document.getElementById("event-count");

  let eventCount = 0;

  function updateEventCount() {
    eventCount++;
    eventCountEl.textContent = eventCount;
  }

  // Mostrar estado de conexión
  socket.on('connect', () => {
    statusEl.textContent = '✅ Conectado al servidor';
    statusEl.className = 'status-connected';
    console.log('✅ Monitor conectado al servidor');
    
    // Solicitar datos iniciales
    socket.emit('getInitialData');
  });

  socket.on('disconnect', () => {
    statusEl.textContent = '❌ Desconectado del servidor';
    statusEl.className = 'status-disconnected';
  });

  // Evento para recibir datos iniciales
  socket.on('initialData', (data) => {
    console.log('📊 Datos iniciales recibidos:', data);
    updatePlayersList(data.players);
    statusEl.textContent = `✅ Conectado - ${data.players.length} jugadores cargados`;
    updateEventCount();
  });

  // Evento cuando un jugador se conecta
  socket.on('playerConnected', (data) => {
    console.log('🟢 Jugador conectado:', data);
    updatePlayersList(data.players);
    showNotification(`👤 ${data.players[data.players.length - 1]?.nickname} se conectó`);
    updateEventCount();
  });

  // Evento cuando las puntuaciones se actualizan
  socket.on('scoresUpdated', (data) => {
    console.log('🔄 Puntuaciones actualizadas:', data);
    updatePlayersList(data.players);
    showNotification('📈 Puntuaciones actualizadas!');
    updateEventCount();
  });

  // Evento cuando se reinician las puntuaciones
  socket.on('scoresReset', (data) => {
    console.log('🔄 Puntuaciones reiniciadas:', data);
    updatePlayersList(data.players);
    showNotification('🔄 Todas las puntuaciones reiniciadas!');
    updateEventCount();
  });

  // Evento cuando alguien gana el juego
  socket.on('gameWon', (data) => {
    console.log('🎉 Juego ganado:', data);
    showNotification(`🏆 ${data.winner.nickname} GANÓ con ${data.winner.score} puntos!`, 5000);
    
    setTimeout(() => {
      navigateTo("/final", { 
        winner: data.winner, 
        players: data.players 
      });
    }, 3000);
    updateEventCount();
  });

  // Botón para reiniciar puntuaciones
  resetBtn.addEventListener("click", async () => {
    try {
      const result = await makeRequest("/api/game/reset-scores", "POST");
      if (result.success) {
        showNotification('✅ Puntuaciones reiniciadas');
      }
    } catch (error) {
      showNotification('❌ Error reiniciando puntuaciones');
      console.error('Error:', error);
    }
  });

  // Cargar jugadores inicialmente por si falla socket
  setTimeout(() => {
    loadInitialPlayers();
  }, 1000);

  async function loadInitialPlayers() {
    try {
      const result = await makeRequest("/api/game/scores", "GET");
      if (result.players) {
        updatePlayersList(result.players);
        statusEl.textContent = `✅ Conectado - ${result.players.length} jugadores`;
      }
    } catch (error) {
      playersList.innerHTML = `
        <div class="empty-state">
          <p>❌ Error cargando jugadores</p>
          <p>Verifica que el servidor esté ejecutándose en http://localhost:5050</p>
        </div>
      `;
    }
  }

  function updatePlayersList(players) {
    if (!players || players.length === 0) {
      playersList.innerHTML = `
        <div class="empty-state">
          <p>👥 No hay jugadores conectados</p>
          <p>Abre http://localhost:5050/game en otra pestaña para empezar</p>
        </div>
      `;
      return;
    }

    const sortedPlayers = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));
    
    playersList.innerHTML = `
      <div style="overflow-x: auto;">
        <table class="players-table">
          <thead>
            <tr>
              <th>POS</th>
              <th>JUGADOR</th>
              <th>PUNTUACIÓN</th>
              <th>ESTADO</th>
            </tr>
          </thead>
          <tbody>
            ${sortedPlayers.map((player, index) => `
              <tr>
                <td class="position-cell">${index + 1}</td>
                <td class="player-name">${player.nickname}</td>
                <td class="score-cell ${getScoreClass(player.score)}">
                  ${player.score || 0}
                </td>
                <td class="status-cell">
                  <span class="status-indicator">●</span> Conectado
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div style="margin-top: 15px; text-align: left; font-size: 14px; color: #ccc;">
        <strong>Total de jugadores:</strong> ${players.length} | 
        <strong>Puntuación máxima:</strong> ${Math.max(...players.map(p => p.score || 0))}
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

  function showNotification(message, duration = 3000) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('notification-fade-out');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, duration);
  }
}