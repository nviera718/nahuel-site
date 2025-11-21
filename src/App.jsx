import { useState, useEffect } from 'react'
import './App.css'
import VideoClassifier from './VideoClassifier'

function App() {
  const [showClassifier, setShowClassifier] = useState(false)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const page = urlParams.get('page')
    if (page === 'classifier') {
      setShowClassifier(true)
    }
  }, [])

  if (showClassifier) {
    return <VideoClassifier />
  }

  return (
    <>
      <h1>Nahuel Viera</h1>
      <div className="card">
        <p>
          Welcome to my site. It's neat ain't it?
        </p>
      </div>
    </>
  )
}

export default App
