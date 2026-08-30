export type Category = 'Technical' | 'Creative' | 'Language' | 'Sports' | 'Academic' | 'Other'
export type TrustBadge = 'Expert' | 'Rising' | 'Trusted' | 'Streak'

export interface Skill {
  id: string
  name: string
  category: Category
  icon: string
}

export interface User {
  id: number
  name: string
  college: string
  initials: string
  gradient: [string, string]
  bio: string
  offers: string[]
  wants: string[]
  trustScore: number
  completedExchanges: number
  hoursTaught: number
  streak: number
  badge: TrustBadge
  availability: string[]
  online: boolean
}

export interface Match {
  user: User
  matchScore: number
  reason: string
}

export interface ChatMessage {
  id: number
  sender: 'me' | 'them'
  text: string
  time: string
  kind?: 'text' | 'file' | 'reminder'
}

export const CATEGORIES: { key: Category; icon: string }[] = [
  { key: 'Technical', icon: '💻' },
  { key: 'Creative', icon: '🎨' },
  { key: 'Language', icon: '🗣️' },
  { key: 'Sports', icon: '🏸' },
  { key: 'Academic', icon: '📚' },
  { key: 'Other', icon: '✨' },
]

export const SKILLS: Skill[] = [
  { id: 's1', name: 'Python', category: 'Technical', icon: '🐍' },
  { id: 's2', name: 'Web Development', category: 'Technical', icon: '🌐' },
  { id: 's3', name: 'DSA & Algorithms', category: 'Technical', icon: '🧮' },
  { id: 's4', name: 'AI / ML', category: 'Technical', icon: '🤖' },
  { id: 's5', name: 'App Development', category: 'Technical', icon: '📱' },
  { id: 's6', name: 'Cybersecurity', category: 'Technical', icon: '🛡️' },
  { id: 's7', name: 'Guitar', category: 'Creative', icon: '🎸' },
  { id: 's8', name: 'Sketching', category: 'Creative', icon: '🖌️' },
  { id: 's9', name: 'Video Editing', category: 'Creative', icon: '🎬' },
  { id: 's10', name: 'UI / UX Design', category: 'Creative', icon: '🎯' },
  { id: 's11', name: 'Photography', category: 'Creative', icon: '📷' },
  { id: 's12', name: 'Spanish', category: 'Language', icon: '🇪🇸' },
  { id: 's13', name: 'French', category: 'Language', icon: '🇫🇷' },
  { id: 's14', name: 'Japanese', category: 'Language', icon: '🇯🇵' },
  { id: 's15', name: 'Hindi', category: 'Language', icon: '🇮🇳' },
  { id: 's16', name: 'Badminton', category: 'Sports', icon: '🏸' },
  { id: 's17', name: 'Chess', category: 'Sports', icon: '♟️' },
  { id: 's18', name: 'Swimming', category: 'Sports', icon: '🏊' },
  { id: 's19', name: 'Football', category: 'Sports', icon: '⚽' },
  { id: 's20', name: 'Mathematics', category: 'Academic', icon: '📐' },
  { id: 's21', name: 'Physics', category: 'Academic', icon: '⚛️' },
  { id: 's22', name: 'Academic Writing', category: 'Academic', icon: '✍️' },
  { id: 's23', name: 'Public Speaking', category: 'Other', icon: '🎤' },
  { id: 's24', name: 'Personal Finance', category: 'Other', icon: '💰' },
  { id: 's25', name: 'Cooking', category: 'Other', icon: '🍳' },
]

const user = (u: Partial<User> & Pick<User, 'id' | 'name' | 'initials' | 'gradient'>): User => ({
  college: 'MIT-WPU Pune',
  bio: '',
  offers: [],
  wants: [],
  trustScore: 4.2,
  completedExchanges: 0,
  hoursTaught: 0,
  streak: 0,
  badge: 'Rising',
  availability: [],
  online: false,
  ...u,
})

export const USERS: User[] = [
  user({
    id: 1, name: 'Aarav Mehta', initials: 'AM', gradient: ['#fb923c', '#f43f5e'],
    offers: ['Guitar', 'Spanish'], wants: ['Python', 'DSA & Algorithms'],
    trustScore: 4.9, completedExchanges: 24, hoursTaught: 86, streak: 12, badge: 'Expert', online: true,
    bio: 'Guitarist by night, engineering student by day. I want to crack the Python code — literally.',
    availability: ['Mon 10-11', 'Wed 14-15', 'Fri 18-19'],
  }),
  user({
    id: 2, name: 'Sanya Kapoor', initials: 'SK', gradient: ['#f43f5e', '#ef4444'],
    offers: ['Python', 'AI / ML'], wants: ['Guitar', 'Sketching'],
    trustScore: 4.7, completedExchanges: 18, hoursTaught: 54, streak: 8, badge: 'Trusted', online: true,
    bio: 'ML researcher wannabe. I teach Python so I can afford a guitar teacher. Fair trade.',
    availability: ['Tue 15-16', 'Thu 10-11', 'Sat 11-12'],
  }),
  user({
    id: 3, name: 'Rohan Iyer', initials: 'RI', gradient: ['#34d399', '#14b8a6'],
    offers: ['Chess', 'Mathematics'], wants: ['Video Editing', 'UI / UX Design'],
    trustScore: 4.5, completedExchanges: 15, hoursTaught: 40, streak: 5, badge: 'Trusted', online: false,
    bio: 'Chess club captain. Numbers and knights are my thing. Learning to make my reels prettier.',
    availability: ['Mon 18-19', 'Wed 10-11', 'Sat 14-15'],
  }),
  user({
    id: 4, name: 'Meera Nair', initials: 'MN', gradient: ['#ec4899', '#a855f7'],
    offers: ['Video Editing', 'Photography'], wants: ['Python', 'Spanish'],
    trustScore: 4.8, completedExchanges: 21, hoursTaught: 63, streak: 15, badge: 'Expert', online: true,
    bio: 'Film club producer. I cut video like butter. Please teach me Python so I can automate edits.',
    availability: ['Tue 18-19', 'Thu 14-15', 'Sun 10-11'],
  }),
  user({
    id: 5, name: 'Kavya Sharma', initials: 'KS', gradient: ['#fbbf24', '#f97316'],
    offers: ['Spanish', 'French'], wants: ['Swimming', 'Photography'],
    trustScore: 4.3, completedExchanges: 11, hoursTaught: 32, streak: 4, badge: 'Rising', online: false,
    bio: 'Polyglot in training. ¡Hola! Parlez-vous français? Teach me to swim without drowning.',
    availability: ['Mon 14-15', 'Fri 10-11', 'Sun 18-19'],
  }),
]

export const MY_PROFILE: User = user({
  id: 99, name: 'Arjun Desai', initials: 'AD', gradient: ['#71717a', '#3f3f46'],
  offers: ['Python', 'DSA & Algorithms', 'Web Development'], wants: ['Guitar', 'Spanish'],
  trustScore: 4.4, completedExchanges: 9, hoursTaught: 28, streak: 6, badge: 'Rising', online: true,
  bio: 'CS sophomore. I debug other people\'s code and want to learn guitar to debug my own soul.',
  availability: ['Tue 10-11', 'Thu 15-16', 'Sat 11-12'],
})

export const MATCHES: Match[] = [
  { user: USERS[1], matchScore: 96, reason: 'You offer Python & DSA → Sanya wants Python. Sanya offers Guitar & Sketching → you want Guitar.' },
  { user: USERS[0], matchScore: 92, reason: 'You want Guitar → Aarav teaches Guitar. Aarav wants Python → you teach Python. Perfect loop.' },
  { user: USERS[3], matchScore: 87, reason: 'You teach Web Dev → Meera needs Python-adjacent skills. Meera edits video → great for your reels.' },
  { user: USERS[4], matchScore: 81, reason: 'You want Spanish → Kavya is fluent. Kavya wants Photography → overlaps with your creative streak.' },
  { user: USERS[2], matchScore: 74, reason: 'Rohan wants Video Editing; you need sharper Math fundamentals for DSA. Mutual academic boost.' },
]

export const CHAT: ChatMessage[] = [
  { id: 1, sender: 'them', text: 'Hey! Sanya here — saw we matched 96% 🎉', time: '10:02' },
  { id: 2, sender: 'them', text: 'I teach Python & ML, and I really want to learn guitar 🎸', time: '10:02' },
  { id: 3, sender: 'me', text: 'No way — that\'s exactly my offer/want flipped! I teach Python + DSA and want Guitar.', time: '10:04' },
  { id: 4, sender: 'them', text: 'The AI engine is good, huh 😄', time: '10:05' },
  { id: 5, sender: 'me', text: 'It literally built this whole proposal. Sent you one for Thursday!', time: '10:06' },
  { id: 6, sender: 'them', text: 'Just accepted ✅ See you Thursday 5 PM, room 204.', time: '10:07' },
  { id: 7, sender: 'them', text: 'Python_cheat_sheet.pdf', time: '10:08', kind: 'file' },
  { id: 8, sender: 'me', text: '⏰ Exchange reminder — "Python ↔ Guitar" starts in 24 hours!', time: '10:09', kind: 'reminder' },
]

export const LEADERBOARD: { user: User; statLabel: string }[] = [
  { user: USERS[0], statLabel: 'Trust score' },
  { user: USERS[3], statLabel: 'Trust score' },
  { user: USERS[1], statLabel: 'Trust score' },
  { user: MY_PROFILE, statLabel: 'Trust score' },
  { user: USERS[4], statLabel: 'Trust score' },
  { user: USERS[2], statLabel: 'Trust score' },
]

export const TIME_SLOTS = [
  'Mon 10-11', 'Mon 14-15', 'Mon 18-19',
  'Tue 10-11', 'Tue 15-16', 'Tue 18-19',
  'Wed 10-11', 'Wed 14-15', 'Wed 18-19',
  'Thu 10-11', 'Thu 15-16', 'Thu 18-19',
  'Fri 10-11', 'Fri 14-15', 'Fri 18-19',
  'Sat 11-12', 'Sat 14-15', 'Sat 18-19',
]

export const BADGES = [
  { icon: '👑', label: 'Expert', earned: true },
  { icon: '⭐', label: 'Rising', earned: true },
  { icon: '🎯', label: 'Trusted', earned: false },
  { icon: '🔥', label: 'Streak ×6', earned: true },
  { icon: '🏆', label: '10+ Exchanges', earned: false },
  { icon: '💎', label: 'Skill Master', earned: false },
]

export const REVIEWS = [
  { from: 'Priya S.', stars: 5, text: 'Explained recursion in a way my prof couldn\'t in a semester. 10/10 would barter again.', when: '2 weeks ago' },
  { from: 'Kabir R.', stars: 5, text: 'Patience level: infinite. Made my first Django project with him.', when: '1 month ago' },
  { from: 'Ananya K.', stars: 4, text: 'Great at Python, slightly late to our session once. Still brilliant teacher.', when: '2 months ago' },
]