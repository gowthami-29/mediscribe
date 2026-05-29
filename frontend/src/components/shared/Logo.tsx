import React from 'react'
import { Sparkles } from 'lucide-react'

interface LogoProps {
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const Logo: React.FC<LogoProps> = ({ 
  showText = true, 
  size = 'md', 
  className = ''
}) => {
  const sizes = {
    sm: { icon: 14, box: 30, text: 16, sub: 8 },
    md: { icon: 18, box: 36, text: 19, sub: 9 },
    lg: { icon: 24, box: 48, text: 26, sub: 11 },
  }

  const { icon, box, text, sub } = sizes[size]

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Icon Box */}
      <div 
        style={{
          width: box,
          height: box,
          borderRadius: size === 'lg' ? 14 : 10,
          background: 'var(--grad-teal)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-teal)',
          flexShrink: 0,
        }}
      >
        <Sparkles size={icon} color="#fff" />
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col">
          <span 
            style={{ 
              fontFamily: 'DM Serif Display, serif', 
              fontSize: text, 
              color: 'var(--text-1)', 
              lineHeight: 1.1 
            }}
          >
            ArogyaScribe
          </span>
          <span 
            style={{ 
              fontSize: sub, 
              color: 'var(--text-4)', 
              letterSpacing: '0.08em', 
              textTransform: 'uppercase', 
              marginTop: 2, 
              fontWeight: 700 
            }}
          >
            Healthcare v2.0
          </span>
        </div>
      )}
    </div>
  )
}

export default Logo
