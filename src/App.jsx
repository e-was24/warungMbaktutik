import { useState, useEffect } from 'react'
import WelcomePopup from './components/WelcomePopup'
import HomePage from './components/HomePage'
import AdminDashboard from './components/AdminDashboard'
import './App.css'

function App() {
  const [isAdminView, setIsAdminView] = useState(false);

  return (
    <>
      <WelcomePopup />
      {isAdminView ? (
        <AdminDashboard onBack={() => setIsAdminView(false)} />
      ) : (
        <HomePage onAdminClick={() => setIsAdminView(true)} />
      )}
    </>
  )
}

export default App
