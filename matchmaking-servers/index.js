import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

const pendingMatches = {};

const waitingPlayers = [];

wss.on("connection", (ws) => {
  console.log("Player connected to matchmaking");

  ws.on("message", (message) => {
    const data = JSON.parse(message);

    if (data.type === "create") {
      const matchId = Math.floor(Math.random() * 1000000).toString();
      pendingMatches[matchId] = { host: { pid: data.pid, name: data.playerName, ws } };
      
      ws.send(JSON.stringify({ type: "created", matchId }));
      console.log(`Player ${data.playerName} created match ${matchId}`);
      return;
    }

    if (data.type === "join") {
      const matchId = data.matchId;
      if (pendingMatches[matchId] && pendingMatches[matchId].host) {
        const hostInfo = pendingMatches[matchId].host;

        ws.send(JSON.stringify({ type: "found", opponent: hostInfo.name, matchId, player: 2 }));
        hostInfo.ws.send(JSON.stringify({ type: "found", opponent: data.playerName, matchId, player: 1 }));

        delete pendingMatches[matchId];
        console.log(`Match ${matchId} started: ${hostInfo.name} (Player 1) vs ${data.playerName} (Player 2)`);
      } else {
        ws.send(JSON.stringify({ type: "not_found", message: "Match ID not found or already taken." }));
        console.log(`Join failed: Match ${matchId} not found.`);
      }
      return;
    }

    if (data.type === "matchmaking") {
      const playerInfo = { pid: data.pid, name: data.playerName, ws };
      waitingPlayers.push(playerInfo);
      console.log(`Player ${data.playerName} added to matchmaking queue.`);

      if (waitingPlayers.length > 1) {
        const player1 = waitingPlayers.shift();
        const player2 = waitingPlayers.shift();
        const matchId = Math.floor(Math.random() * 1000000).toString();

        player1.ws.send(JSON.stringify({ type: "found", opponent: player2.name, matchId, player: 1 }));
        player2.ws.send(JSON.stringify({ type: "found", opponent: player1.name, matchId, player: 2 }));
        console.log(`Matched: ${player1.name} vs ${player2.name} in Match ${matchId}`);
      } else {
        setTimeout(() => {
          const index = waitingPlayers.findIndex(p => p.ws === ws);
          if (index !== -1) {
            waitingPlayers.splice(index, 1);
            ws.send(JSON.stringify({ type: "not_found", message: "No match found." }));
            console.log(`Player ${data.playerName} did not find a match.`);
          }
        }, 10000);
      }
    }
  });

  ws.on("close", () => {
    for (const matchId in pendingMatches) {
      if (pendingMatches[matchId].host.ws === ws) {
        console.log(`Host of match ${matchId} disconnected.`);
        delete pendingMatches[matchId];
      }
    }
    const index = waitingPlayers.findIndex(p => p.ws === ws);
    if (index !== -1) {
      console.log(`Player ${waitingPlayers[index].name} disconnected from matchmaking`);
      waitingPlayers.splice(index, 1);
    }
  });
});

console.log("WebSocket Matchmaking Server running on ws://localhost:8080");