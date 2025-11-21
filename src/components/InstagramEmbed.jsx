import { useEffect, useRef } from 'react'

export function InstagramEmbed({ postUrl }) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!document.querySelector('script[src*="instagram.com/embed.js"]')) {
      const script = document.createElement('script')
      script.src = 'https://www.instagram.com/embed.js'
      script.async = true
      document.body.appendChild(script)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (window.instgrm) {
        window.instgrm.Embeds.process()
      }
    }, 100)
    return () => clearTimeout(timer)
  }, [postUrl])

  return (
    <div
      ref={containerRef}
      className="flex justify-center items-center w-full h-full max-h-full overflow-hidden"
    >
      <div className="max-h-full overflow-hidden" style={{ maxHeight: 'calc(100vh - 80px)' }}>
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
            width: '100%'
          }}
        />
      </div>
    </div>
  )
}
