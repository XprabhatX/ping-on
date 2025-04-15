import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css'

const Home = ({ pid }) => {
  const [player, setPlayer] = useState('');
  const [matchCode, setMatchCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [ws, setWs] = useState(null);
  const navigate = useNavigate();

  const checkName = () => {
    if (player.trim() === '') {
      alert("Player name can't be empty");
      return false;
    }
    return true;
  };

  const handleCreateMatch = (e) => {
    e.preventDefault();
    if (!checkName()) return;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      alert("WebSocket is not connected yet.");
      return;
    }
    setLoading(true);
    ws.send(
      JSON.stringify({
        type: 'create',
        pid,
        playerName: player
      })
    );
  };

  const handleJoinMatch = (e) => {
    e.preventDefault();
    if (!checkName()) return;
    if (!matchCode.trim()) {
      alert("Please enter a match code to join.");
      return;
    }
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      alert("WebSocket is not connected yet.");
      return;
    }
    setLoading(true);
    ws.send(
      JSON.stringify({
        type: 'join',
        pid,
        playerName: player,
        matchId: matchCode.trim()
      })
    );
  };

  const handleOnlineMatchmaking = (e) => {
    e.preventDefault();
    if (!checkName()) return;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      alert("WebSocket is not connected yet.");
      return;
    }
    setLoading(true);
    ws.send(
      JSON.stringify({
        type: 'matchmaking',
        pid,
        playerName: player
      })
    );
  };

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8080');
    socket.onopen = () => {
      console.log('✅ Connected to matchmaking server');
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('📨 Message from matchmaking server:', data);

      if (data.type === 'created') {
        setLoading(false);
        alert(`Match created. Your match code is: ${data.matchId}`);
      } else if (data.type === 'found') {
        setLoading(false);
        navigate("/game", { state: { 
          opponent: data.opponent, 
          playerName: player,
          matchId: data.matchId,
          player: data.player
        }});
      } else if (data.type === 'not_found') {
        console.error('WebSocket error:', err);
        alert(data.message || "No match found. Try again later.");
        setLoading(false);
      }
    };

    socket.onerror = (err) => {
      console.error('WebSocket error:', err);
      // alert('Failed to connect to matchmaking server.');
      // setLoading(false);
    };

    setWs(socket);

    return () => {
      socket.close();
      console.log('🔌 WebSocket connection to matchmaking closed');
    };
  }, [navigate, player]);

  return (
    <div className='container'>
      <input
        className='nameBox'
        type='text'
        value={player}
        onChange={e => setPlayer(e.target.value)}
        placeholder='Name'
      />

      <hr />

      <button className='createBtn' onClick={handleCreateMatch}>
        Create Match
      </button>

      <p className='msg1'>OR</p>

      <input
        className='codeBox'
        type='text'
        value={matchCode}
        onChange={e => setMatchCode(e.target.value)}
        placeholder='Match Code'
      />

      <button className='joinBtn' onClick={handleJoinMatch}>
        Join Match
      </button>

      <p className='msg2'>OR</p>

      <button className='matchmakingBtn' onClick={handleOnlineMatchmaking}>
        Online Matchmaking
      </button>

      {loading && <h1>L O A D I N G . . .</h1>}
    </div>
  );
};

export default Home;