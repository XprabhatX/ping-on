import React, { useRef, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './Game.css';

const Game = () => {
  const canvasRef = useRef(null);
  const location = useLocation();
  const { opponent, playerName, matchId, player } = location.state || {};

  const [gameState, setGameState] = useState(null);
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8081');
    socket.onopen = () => {
      console.log("Connected to gameplay server");
      socket.send(JSON.stringify({ type: "join", matchId, player }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "state") {
        setGameState(data.state);
      }
    };

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    setWs(socket);
    return () => socket.close();
  }, [matchId, player]);

  useEffect(() => {
    if (!gameState) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, gameState.canvasWidth, gameState.canvasHeight);

    // ball
    ctx.beginPath();
    ctx.arc(gameState.ball.x, gameState.ball.y, gameState.ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();

    // paddle 1
    ctx.fillStyle = "#0095DD";
    ctx.fillRect(20, gameState.paddle1.y, gameState.paddleWidth, gameState.paddleHeight);

    // paddle 2
    ctx.fillStyle = "#0095DD";
    ctx.fillRect(
      gameState.canvasWidth - 20 - gameState.paddleWidth,
      gameState.paddle2.y,
      gameState.paddleWidth,
      gameState.paddleHeight
    );

    // score board
    ctx.fillStyle = "#fff";
    ctx.font = "16px Arial";
    ctx.fillText(`Score P1: ${gameState.score.player1}  P2: ${gameState.score.player2}`, 50, 20);
    ctx.fillText(`Wins P1: ${gameState.matchWins.player1}  P2: ${gameState.matchWins.player2}`, 50, 40);
  }, [gameState]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!ws || ws.readyState !== WebSocket.OPEN || !gameState) return;
      let newY;
      if (e.key === 'ArrowUp') {
        if (player === 1) {
          newY = Math.max(gameState.paddle1.y - 20, 0);
        } else if (player === 2) {
          newY = Math.max(gameState.paddle2.y - 20, 0);
        }
        ws.send(JSON.stringify({ type: "paddle", y: newY }));
      } else if (e.key === 'ArrowDown') {
        if (player === 1) {
          newY = Math.min(gameState.paddle1.y + 20, gameState.canvasHeight - gameState.paddleHeight);
        } else if (player === 2) {
          newY = Math.min(gameState.paddle2.y + 20, gameState.canvasHeight - gameState.paddleHeight);
        }
        ws.send(JSON.stringify({ type: "paddle", y: newY }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [ws, gameState, player]);

  return (
    <div className="game-container">
      <h2>{playerName} (Player {player}) vs {opponent}</h2>
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
      />
    </div>
  );
};

export default Game;
