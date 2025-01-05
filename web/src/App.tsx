
import { Route, Routes } from 'react-router-dom'
import './App.css'
import { Home } from './pages/Home'
import { Profile } from './pages/Profile'
import { Messages } from './pages/Messages'

function App() {


  return (
    <div className='bg-red-300 h-screen'>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/messages' element={<Messages />} />
      </Routes>
    </div>
  )
}

export default App
