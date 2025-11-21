import { useEffect, useRef } from 'react'

export function InstagramEmbed({ postUrl }) {
  const containerRef = useRef(null)

  useEffect(() => {
    // Load Instagram embed script if not already loaded
    if (!document.querySelector('script[src*="instagram.com/embed.js"]')) {
      const script = document.createElement('script')
      script.src = 'https://www.instagram.com/embed.js'
      script.async = true
      document.body.appendChild(script)
    }
  }, [])

  useEffect(() => {
    // Process embed when postUrl changes
    const timer = setTimeout(() => {
      if (window.instgrm) {
        window.instgrm.Embeds.process()
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [postUrl])

  return (
    <div ref={containerRef} className="flex justify-center w-full">
      <blockquote
        key={postUrl}
        className="instagram-media"
        data-instgrm-permalink={postUrl}
        data-instgrm-version="14"
        data-instgrm-captioned
        style={{
          background: 'transparent',
          border: '0',
          borderRadius: '12px',
          margin: '0 auto',
          maxWidth: '540px',
          minWidth: '326px',
          padding: '0',
          width: '100%'
        }}
      />
    </div>
  )
}
