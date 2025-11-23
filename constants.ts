
import { Player } from './types';

// --- CONFIGURATION ---
export const ADMIN_TELEGRAM_ID = 1440424474; 

// --- FIREBASE CONFIGURATION (REAL ONLINE) ---
export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyD33Zy5U1ooJ46NAQCYmdlfHRcV9gi64kc",
  authDomain: "gzhelcoin-online.firebaseapp.com",
  // Inferred database URL based on project ID. If this doesn't work, check Firebase Console -> Realtime Database
  databaseURL: "https://gzhelcoin-online-default-rtdb.firebaseio.com",
  projectId: "gzhelcoin-online",
  storageBucket: "gzhelcoin-online.firebasestorage.app",
  messagingSenderId: "906548989366",
  appId: "1:906548989366:web:a599e5edbe3aea720fc517",
  measurementId: "G-W96FR9XZQS"
};

export const INITIAL_BALANCE = 1000;
export const WIN_COEFFICIENT = 1.9; // 10% goes to house implicit
export const MIN_BET = 10;
export const DAILY_BONUS_AMOUNT = 100;
export const ANIMATION_DURATION_MS = 3000; // Slightly longer for sync

// The "Invisible Hand" (Rigging Constants)
export const WIN_STREAK_LIMIT = 3; 
export const HIGH_STAKES_THRESHOLD = 0.3; 
export const HIGH_STAKES_WIN_CHANCE = 0.35; 
export const LOW_STAKES_WIN_CHANCE = 0.55; 
export const MERCY_THRESHOLD = 200; 
export const MERCY_WIN_CHANCE = 0.70; 

// Sounds (Reliable Google CodeSkulptor Assets)
export const SOUNDS = {
  CLICK: 'https://commondatastorage.googleapis.com/codeskulptor-assets/week7-button.m4a', 
  COIN_LAND: 'https://commondatastorage.googleapis.com/codeskulptor-assets/collision.m4a', 
  WIN: 'https://commondatastorage.googleapis.com/codeskulptor-assets/week7-brrring.m4a', 
  LOSE: 'https://commondatastorage.googleapis.com/codeskulptor-assets/f1.ogg', 
  ERROR: 'https://commondatastorage.googleapis.com/codeskulptor-assets/sounddogs/missile.mp3', 
  MATCH_FOUND: 'https://commondatastorage.googleapis.com/codeskulptor-assets/week7-brrring.m4a' 
};

export const ACHIEVEMENTS_LIST = [
  {
    id: 'FIRST_WIN',
    title: 'Новичок',
    description: 'Выиграйте свою первую игру',
    icon: '🥉',
    condition: (p: Player) => p.stats.totalWins >= 1
  },
  {
    id: 'STREAK_5',
    title: 'Везунчик',
    description: 'Выиграйте 5 раз подряд',
    icon: '🔥',
    condition: (p: Player) => p.stats.maxWinStreak >= 5
  },
  {
    id: 'STREAK_10',
    title: 'Непобедимый',
    description: 'Выиграйте 10 раз подряд',
    icon: '🚀',
    condition: (p: Player) => p.stats.maxWinStreak >= 10
  },
  {
    id: 'HIGH_ROLLER',
    title: 'Хайроллер',
    description: 'Сделайте ставку 10,000 ₽',
    icon: '💎',
    condition: (p: Player) => p.stats.maxBet >= 10000
  },
  {
    id: 'RICH',
    title: 'Олигарх',
    description: 'Наберите 1,000,000 ₽ на балансе',
    icon: '👑',
    condition: (p: Player) => p.balance >= 1000000
  },
  {
    id: 'LOYAL',
    title: 'Постоялец',
    description: 'Забирайте бонус 7 раз',
    icon: '📅',
    condition: (p: Player) => p.stats.bonusStreak >= 7
  }
];
