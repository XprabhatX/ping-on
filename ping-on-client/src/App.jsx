import { useState } from 'react'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import Home from './pages/Home'
import Game from './pages/Game'

import {nanoid} from 'nanoid'

function App() {
  const uniquePlayerId = nanoid();

  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<Home pid = {uniquePlayerId} />} />
          <Route path='/game' element={<Game pid = {uniquePlayerId} />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
