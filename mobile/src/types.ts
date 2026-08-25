export interface UserSkill {
  id: string;
  skill_id: number;
  name: string;
  category: string;
  direction: "offered" | "wanted";
  proficiency_level?: "beginner" | "intermediate" | "advanced";
}

export interface User {
  id: string;
  email: string | null;
  first_name: string;
  last_name: string;
  full_name: string;
  initials: string;
  avatar_color: string;
  bio: string;
  availability: string;
  avg_rating: number;
  rating_count: number;
  match_score: number | null;
  offers: { id: string; skill_id: number; name: string; level: string }[];
  wants: { id: string; skill_id: number; name: string }[];
  recent_ratings?: Rating[];
  created_at: string;
}

export interface Skill {
  id: number;
  name: string;
  category: string;
  description: string;
}

export interface Rating {
  id: string;
  exchange_id: string;
  rater: string;
  rater_name: string;
  stars: number;
  feedback: string;
  created_at: string;
}

export interface Exchange {
  id: string;
  proposer: User;
  recipient: User;
  other_user: User;
  skill_offered_name: string;
  skill_wanted_name: string;
  proposed_duration: number;
  proposed_date: string | null;
  message: string;
  status: "pending" | "accepted" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
  my_rating: Rating | null;
  last_message: {
    content: string;
    sender_name: string;
    sender_id: string;
    created_at: string;
  } | null;
}

export interface Message {
  id: string;
  exchange_id: string;
  sender: string;
  sender_name: string;
  recipient: string;
  content: string;
  read: boolean;
  created_at: string;
}

export interface LeaderboardEntry {
  rank: number;
  user: User;
  avg_rating: number;
  rating_count: number;
  completed_exchanges: number;
}

export interface Notifications {
  unread_messages: number;
  pending_exchanges: number;
}