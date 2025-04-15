import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8081 });

// Format: { clients: {1: ws, 2: ws}, gameState: { … } }
const games = {};

const createNewGameState = () => ({
  ball: { x: 300, y: 200, vx: 3, vy: 3, radius: 10 },
  paddle1: { y: 150 },
  paddle2: { y: 150 },
  canvasWidth: 600,
  canvasHeight: 400,
  paddleWidth: 10,
  paddleHeight: 100,
  score: { player1: 0, player2: 0 },
  matchWins: { player1: 0, player2: 0 },
});

setInterval(() => {
  for (const matchId in games) {
    const game = games[matchId];
    const state = game.gameState;
    
    state.ball.x += state.ball.vx;
    state.ball.y += state.ball.vy;

    // wall  logic
    if (
      state.ball.y - state.ball.radius < 0 ||
      state.ball.y + state.ball.radius > state.canvasHeight
    ) {
      state.ball.vy = -state.ball.vy;
    }

    // paddle 1 bounce
    if (
      state.ball.x - state.ball.radius < 20 + state.paddleWidth &&
      state.ball.y > state.paddle1.y &&
      state.ball.y < state.paddle1.y + state.paddleHeight
    ) {
      state.ball.vx = Math.abs(state.ball.vx);
    }

    // paddle 2 bounce check
    if (
      state.ball.x + state.ball.radius >
        state.canvasWidth - 20 - state.paddleWidth &&
      state.ball.y > state.paddle2.y &&
      state.ball.y < state.paddle2.y + state.paddleHeight
    ) {
      state.ball.vx = -Math.abs(state.ball.vx);
    }

    // scoring logic
    if (state.ball.x - state.ball.radius < 0) {
      state.score.player2 += 1;
      if (state.score.player2 >= 10) {
        state.matchWins.player2 += 1;
        state.score = { player1: 0, player2: 0 };
      }
      state.ball.x = state.canvasWidth / 2;
      state.ball.y = state.canvasHeight / 2;
      state.ball.vx = 3;
      state.ball.vy = 3;
    }

    if (state.ball.x + state.ball.radius > state.canvasWidth) {
      state.score.player1 += 1;
      if (state.score.player1 >= 10) {
        state.matchWins.player1 += 1;
        state.score = { player1: 0, player2: 0 };
      }
      state.ball.x = state.canvasWidth / 2;
      state.ball.y = state.canvasHeight / 2;
      state.ball.vx = -3;
      state.ball.vy = 3;
    }

    const stateMessage = JSON.stringify({ type: "state", state });
    for (const player in game.clients) {
      const client = game.clients[player];
      if (client.readyState === client.OPEN) {
        client.send(stateMessage);
      }
    }
  }
}, 30);

wss.on("connection", (ws) => {
  console.log("A client connected to gameplay server");

  ws.on("message", (message) => {
    const data = JSON.parse(message);
    
    if (data.type === "join") {
      const { matchId, player } = data;
      ws.matchId = matchId;
      ws.player = player;

      if (!games[matchId]) {
        games[matchId] = {
          clients: {},
          gameState: createNewGameState(),
        };
        console.log(`Created new game for match ${matchId}`);
      }
      
      games[matchId].clients[player] = ws;
      console.log(`Player ${player} joined match ${matchId}`);
    }
    
    // handle paddle movement
    if (data.type === "paddle") {
      if (!ws.matchId || !ws.player) return;
      const game = games[ws.matchId];
      if (ws.player === 1) {
        game.gameState.paddle1.y = data.y;
      } else if (ws.player === 2) {
        game.gameState.paddle2.y = data.y;
      }
    }
  });

  ws.on("close", () => {
    console.log("A client disconnected from gameplay server");
    if (ws.matchId && games[ws.matchId] && ws.player) {
      delete games[ws.matchId].clients[ws.player];
    }
  });
});

console.log("Gameplay WebSocket Server running on ws://localhost:8081");
