import React, { useEffect, useState } from 'react';

const Home = ({ pid }) => {
  const [player, setPlayer] = useState('');
  const [loading, setLoading] = useState(false);
  const [ws, setWs] = useState(null);
  const [matchStatus, setMatchStatus] = useState('');

  const checkName = () => {
    if (player.trim() === '') {
      alert("Player name can't be empty");
      return false;
    }
    return true;
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

      console.log('📨 Message from server:', data);

      if (data.type === 'found') {
        setMatchStatus(`✅ Matched with ${data.opponent}!`);
        setLoading(false);
        // TODO: navigate to game or store match data
      } else if (data.type === 'not_found') {
        setMatchStatus(`❌ No match found. Try again later.`);
        setLoading(false);
      }
    };

    socket.onerror = (err) => {
      console.error('WebSocket error:', err);
      alert('Failed to connect to matchmaking server.');
      setLoading(false);
    };

    setWs(socket);

    return () => {
      socket.close();
      console.log('🔌 WebSocket connection closed');
    };
  }, []);

  return (
    <div>
      <div className='text-xl color-blue'>name: </div>
      <input
        type='text'
        value={player}
        onChange={e => setPlayer(e.target.value)}
      />
      <br />
      <button>create match</button>
      <p>or</p>
      <input type='number' name='roomId' id='roomId' placeholder='enter room id' />
      <br />
      <button>join match</button>
      <p>or</p>
      <button onClick={handleOnlineMatchmaking}>online matchmaking</button>

      {loading && <h1>L O A D I N G . . .</h1>}

      {matchStatus && <p>{matchStatus}</p>}
    </div>
  );
};

export default Home;