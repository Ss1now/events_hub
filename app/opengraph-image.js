import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
 
export const alt = 'Rice Parties - Find Campus Events'
export const size = {
  width: 1200,
  height: 630,
}
 
export const contentType = 'image/png'
 
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0A0A0F 0%, #1A1A24 50%, #2D1B3D 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Neon glow effects */}
        <div
          style={{
            position: 'absolute',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(176,38,255,0.3) 0%, transparent 70%)',
            top: '-200px',
            left: '-100px',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(255,0,128,0.3) 0%, transparent 70%)',
            bottom: '-150px',
            right: '-100px',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          {/* Title */}
          <div
            style={{
              fontSize: 120,
              fontWeight: 900,
              background: 'linear-gradient(90deg, #FF6B35 0%, #FF0080 50%, #B026FF 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              marginBottom: 20,
              textAlign: 'center',
              letterSpacing: '-0.05em',
            }}
          >
            Rice Parties
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 42,
              color: '#D1D5DB',
              fontWeight: 500,
              textAlign: 'center',
              marginBottom: 40,
            }}
          >
            Find parties & events on campus 🎉
          </div>

          {/* URL */}
          <div
            style={{
              fontSize: 36,
              color: '#FF6B35',
              fontWeight: 600,
              padding: '16px 40px',
              border: '3px solid rgba(176,38,255,0.4)',
              borderRadius: 16,
              background: 'rgba(26,26,36,0.6)',
              boxShadow: '0 0 40px rgba(255,0,128,0.3)',
            }}
          >
            riceparties.com
          </div>
        </div>

        {/* Bottom accent */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #FF6B35 0%, #FF0080 50%, #B026FF 100%)',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  )
}
