export const colors = {
  bg: '#000000',
  bgSoft: '#0a0a0f',
  card: '#131319',
  cardBorder: 'rgba(255,255,255,0.10)',
  orange: '#ff7a1a',
  coral: '#ff4d5a',
  gold: '#ffc93c',
  white: '#ffffff',
  white70: 'rgba(255,255,255,0.70)',
  white50: 'rgba(255,255,255,0.50)',
  white40: 'rgba(255,255,255,0.40)',
  white30: 'rgba(255,255,255,0.30)',
  white15: 'rgba(255,255,255,0.15)',
  white10: 'rgba(255,255,255,0.10)',
  white05: 'rgba(255,255,255,0.05)',
  emerald: '#34d399',
  sky: '#38bdf8',
  accent: '#ff7a1a',
}

export type Colors = typeof colors & { accent: string }

export const fonts = {
  black: '900',
  extrabold: '800',
  bold: '700',
  semibold: '600',
  medium: '500',
  regular: '400',
} as const

export const radius = { sm: 8, md: 12, lg: 16, xl: 20, '2xl': 24 } as const