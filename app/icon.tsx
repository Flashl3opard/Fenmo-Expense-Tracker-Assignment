import { ImageResponse } from 'next/og'

export const size = {
  width: 64,
  height: 64,
}

export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 54%, #a855f7 100%)',
          borderRadius: 16,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '3px solid rgba(255,255,255,0.92)',
            borderRadius: 9,
            color: 'white',
            fontSize: 22,
            fontWeight: 800,
            lineHeight: 1,
          }}
        >
          ₹
        </div>
      </div>
    ),
    size
  )
}
