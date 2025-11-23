
export enum Tab {
  GAME = 'GAME',
  MULTIPLAYER = 'MULTIPLAYER',
  LEADERS = 'LEADERS',
  CHAT = 'CHAT',
  HISTORY = 'HISTORY',
  PROFILE = 'PROFILE',
  ADMIN = 'ADMIN' 
}

export enum CoinSide {
  HEADS = 'HEADS', 
  TAILS = 'TAILS'  
}

export interface PlayerStats {
  totalWins: number;
  totalGames: number;
  currentWinStreak: number;
  maxWinStreak: number;
  maxBet: number;
  bonusStreak: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; 
  condition: (player: Player) => boolean;
}

export interface Player {
  id: string;
  name: string;
  balance: number;
  avatarSeed: string;
  lastBonusClaim?: number; 
  personality?: string;
  isAi?: boolean;
  stats: PlayerStats;
  achievements: string[]; 
}

export interface Transaction {
  id: string;
  type: 'WIN' | 'LOSS' | 'BONUS' | 'PVP_WIN' | 'PVP_LOSS';
  amount: number;
  timestamp: number;
  details?: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  isSystem?: boolean;
  avatar?: string;
  timestamp?: number;
}

export interface Leader {
  name: string;
  balance: number;
  avatar: string;
}

// --- Online Room Types ---
export interface PvpRoom {
  id: string;
  hostId: string;
  hostName: string;
  hostAvatar: string;
  guestId?: string;
  guestName?: string;
  guestAvatar?: string;
  betAmount: number;
  status: 'WAITING' | 'READY' | 'FLIPPING' | 'FINISHED';
  selectedSide?: CoinSide; // Side selected by HOST
  result?: CoinSide;
  winnerId?: string;
  createdAt: number;
}

// Telegram WebApp Types
declare global {
  interface Window {
    Telegram: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        version: string;
        isVersionAtLeast: (ver: string) => boolean;
        isVerticalSwipesEnabled?: boolean;
        disableVerticalSwipes?: () => void;
        enableVerticalSwipes?: () => void;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            photo_url?: string;
          };
        };
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
      };
    };
  }
}