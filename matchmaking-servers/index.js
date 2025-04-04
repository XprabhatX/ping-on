import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });
const waitingPlayers = [];

wss.on("connection", (ws) => {
  console.log("Player connected");

  ws.on("message", (message) => {
    const data = JSON.parse(message);
    
    if (data.type === "matchmaking") {
      const playerInfo = { pid: data.pid, name: data.playerName, ws };
      waitingPlayers.push(playerInfo);

      console.log(`Player ${data.playerName} added to matchmaking queue.`);

      if (waitingPlayers.length > 1) {
        const player1 = waitingPlayers.shift();
        const player2 = waitingPlayers.shift();

        player1.ws.send(JSON.stringify({ type: "found", opponent: player2.name }));
        player2.ws.send(JSON.stringify({ type: "found", opponent: player1.name }));

        console.log(`Matched: ${player1.name} vs ${player2.name}`);
      } else {
        setTimeout(() => {
          const index = waitingPlayers.findIndex(p => p.ws === ws);
          
          if (index !== -1) {
            // Still unmatched, remove from queue
            waitingPlayers.splice(index, 1);
            ws.send(JSON.stringify({ type: "not_found" }));
            console.log(`Player ${data.playerName} did not find a match.`);
          }
        }, 10000);
      }
    }
  });

  ws.on("close", () => {
    const index = waitingPlayers.findIndex(p => p.ws === ws);
    if (index !== -1) {
      console.log(`Player ${waitingPlayers[index].name} disconnected`);
      waitingPlayers.splice(index, 1); // Remove from queue
    }
  });
});

console.log("WebSocket Matchmaking Server running on ws://localhost:8080");