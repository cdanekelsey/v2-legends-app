
export interface Moment {
  id: number;
  type: 'image' | 'video' | 'stat' | 'note' | 'link' | 'quote';
  caption: string;
  note: string; // Used for content, roast text, or quote
  date: string;
  src?: string; // For images/videos
  url?: string; // For links
  rating?: number; // For stats
  isPinned?: boolean;
  description?: string;
  likes?: number;
  comments?: number;
}

export interface Legend {
  id: number;
  name: string;
  game: string;
  tags: string[];
  signature?: string;
  color: string;
  epitaph: string;
  visage: string | null;
  showEpitaph: boolean;
  showTags: boolean;
  gallery: string[];
  memories: Moment[];
  imagePosition?: string;
}

export interface Game {
  id: string;
  name: string;
  cover: string; // CSS Gradient class or fallback color
  image: string | null; // URL to cover art
  igdbId?: number; // Optional reference for API
}
