import { useEffect, useRef, useState } from 'react'
import { Play } from 'lucide-react'

export function InstagramEmbed({ postUrl, darkMode = true }) {
  const containerRef = useRef(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (!document.querySelector('script[src*="instagram.com/embed.js"]')) {
      const script = document.createElement('script')
      script.src = 'https://www.instagram.com/embed.js'
      script.async = true
      document.body.appendChild(script)
    }
  }, [])

  useEffect(() => {
    setIsLoaded(false)
    const timer = setTimeout(() => {
      if (window.instgrm) {
        window.instgrm.Embeds.process()
      }
    }, 100)

    // Check for iframe load (Instagram embed creates an iframe)
    const checkLoaded = setInterval(() => {
      const iframe = containerRef.current?.querySelector('iframe')
      if (iframe) {
        setIsLoaded(true)
        clearInterval(checkLoaded)
      }
    }, 200)

    return () => {
      clearTimeout(timer)
      clearInterval(checkLoaded)
    }
  }, [postUrl])

  const bgColor = darkMode ? 'bg-[#272727]' : 'bg-[#f2f2f2]'
  const textColor = darkMode ? 'text-[#606060]' : 'text-[#909090]'

  return (
    <div
      ref={containerRef}
      className="flex justify-center items-start w-full relative"
      style={{ minHeight: '500px' }}
    >
      {/* Placeholder skeleton */}
      {!isLoaded && (
        <div
          className={`absolute inset-0 ${bgColor} rounded-lg flex flex-col items-center justify-center`}
          style={{ maxWidth: '400px', minWidth: '280px', width: '100%', height: '500px', margin: '0 auto' }}
        >
          <div className={`w-16 h-16 rounded-full ${darkMode ? 'bg-[#3a3a3a]' : 'bg-[#e5e5e5]'} flex items-center justify-center mb-4`}>
            <Play className={`w-8 h-8 ${textColor}`} />
          </div>
          <div className={`w-8 h-8 border-2 ${textColor} border-t-transparent rounded-full animate-spin`} />
        </div>
      )}
      <blockquote
        key={postUrl}
        className="instagram-media"
        data-instgrm-permalink={postUrl}
        data-instgrm-version="14"
        style={{
          background: 'transparent',
          border: '0',
          borderRadius: '8px',
          margin: '0',
          maxWidth: '400px',
          minWidth: '280px',
          padding: '0',
          width: '100%',
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }}
      />
    </div>
  )
}
