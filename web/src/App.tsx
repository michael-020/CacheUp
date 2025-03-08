
import { Route, Routes } from 'react-router-dom'
import './App.css'
import { Home } from './pages/Home'
import { Profile } from './pages/Profile'
import { Messages } from './pages/Messages'
import { Signup } from './pages/Signup'
import { Signin } from './pages/Signin'

function App() {


  return (
    <div className='bg-red-300 h-screen'>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/messages' element={<Messages />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/signin' element={<Signin />} />
      </Routes>
    </div>
  )
}

export default App
