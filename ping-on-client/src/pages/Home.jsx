import { React, useState } from 'react'

const Home = ({pid}) => {
  const [player, setPlayer] = useState('');
  const [loading, setLoading] = useState(false);
  const [ws, setWs] = useState(null);

  const checkName = () => {
    if (player == '') {
      alert("Player name can't be empty");
      return false;
    }
    return true;
  }

  const handleOnlineMatchmaking = (e) => {
    setLoading(true);
    e.preventDefault();

    if (!checkName()) return;

    try {
      const matchRequest = {
        player,
        pid
      }

      const socket = new WebSocket('ws://localhost:8080');

      socket.onopen = () => {
        console.log('connected to ping-on ws server');
        socket.send(JSON.stringify(matchRequest));
      }

      socket.onmessage = (res) => {
        const data = JSON.parse(res.data);
        console.log(data);
      }
      setLoading(false);
    }    
    catch (err) {
      alert('Failed to connect. \nError: ' + err);
      setLoading(false);
    }
  }

  return (
    <div>
        <div className='text-xl color-blue'>name: </div>
        <input type='text' value={player} onChange={e => setPlayer(e.target.value)} />
        <br />
        <button>create match</button>
        <p>or</p>
        <input type='number' name='roomId' id='roomId'  placeholder='enter room id' />
        <br />
        <button>join match</button>
        <p>or</p>
        <button onClick={(e) => handleOnlineMatchmaking(e)}>online matchmaking</button>

        {
          (loading) ? (
            <h1>L O A D I N G . . .</h1>
          ) : ''
        }
    </div>
  )
}

export default Home