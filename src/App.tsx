
import React, { useState, useEffect, useRef } from 'react';
import { 
  Tab,
  Player, 
  CoinSide, 
  Transaction,
  ChatMessage,
  Leader,
  PlayerStats
} from './types';
import { 
  INITIAL_BALANCE, 
  WIN_COEFFICIENT,
  MIN_BET, 
  DAILY_BONUS_AMOUNT,
  ANIMATION_DURATION_MS,
  WIN_STREAK_LIMIT,
  HIGH_STAKES_THRESHOLD,
  MERCY_THRESHOLD,
  SOUNDS,
  ACHIEVEMENTS_LIST,
  ADMIN_TELEGRAM_ID
} from './constants';
import { Coin } from './components/Coin';
import { soundManager } from './services/soundService';

// --- Icons ---
const GameIcon = ({ active }: { active: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
);
const MultiIcon = ({ active }: { active: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);
const LeaderIcon = ({ active }: { active: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
);
const ChatIcon = ({ active }: { active: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2-2z"/></svg>
);
const HistoryIcon = ({ active }: { active: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/></svg>
);
const ProfileIcon = ({ active }: { active: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
);

// --- Components ---

const AchievementToast = ({ achievement, visible }: { achievement: any, visible: boolean }) => {
  if (!achievement) return null;
  return (
    <div className={`fixed top-4 left-4 right-4 z-[100] transition-all duration-500 transform ${visible ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'}`}>
       <div className="bg-slate-900 border border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.3)] rounded-2xl p-4 flex items-center gap-4">
          <div className="text-4xl animate-bounce">{achievement.icon}</div>
          <div>
             <div className="text-yellow-500 text-xs font-bold uppercase tracking-widest mb-1">Достижение разблокировано!</div>
             <div className="text-white font-bold">{achievement.title}</div>
             <div className="text-slate-400 text-xs">{achievement.description}</div>
          </div>
       </div>
    </div>
  );
};

const Confetti = () => {
  const [particles] = useState(() => Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 1 + Math.random() * 2,
    bg: ['#3b82f6', '#1d4ed8', '#93c5fd', '#ffffff'][Math.floor(Math.random() * 4)] // Blue/White Theme
  })));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map(p => (
        <div 
          key={p.id} 
          className="confetti" 
          style={{
            left: `${p.left}%`,
            top: '-20px',
            backgroundColor: p.bg,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`
          }}
        />
      ))}
    </div>
  );
};

// --- Animated Balance Component ---
const AnimatedBalance = ({ value }: { value: number }) => {
  const [display, setDisplay] = useState(value);
  
  useEffect(() => {
    const start = display;
    const end = value;
    if (start === end) return;
    
    let frameId: number;
    const startTime = performance.now();
    const duration = 1000; // 1s animation
    
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // EaseOutQuart: 1 - (1 - x)^4
      const ease = 1 - Math.pow(1 - progress, 4);
      
      const next = start + (end - start) * ease;
      setDisplay(next);
      
      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      } else {
        setDisplay(end);
      }
    };
    
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [value]); // Only restart if target value changes

  return <>{Math.floor(display).toLocaleString()} ₽</>;
};

// --- Splash Screen Component ---
const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Show splash for at least 2.5 seconds
    const timer = setTimeout(() => {
      setFading(true);
      // Allow fade out animation to complete
      setTimeout(onFinish, 500);
    }, 2500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className={`fixed inset-0 z-[100] bg-[#020617] flex flex-col items-center justify-center transition-opacity duration-500 ${fading ? 'opacity-0' : 'opacity-100'}`}>
       {/* Background Ambience */}
       <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] bg-blue-900/20 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-[-20%] right-[-20%] w-[70%] h-[70%] bg-blue-600/10 rounded-full blur-[100px]"></div>
       </div>
       
       <div className="relative z-10 flex flex-col items-center animate-fade-in-up">
          {/* Logo */}
          <div className="w-24 h-24 mb-6 rounded-full bg-white border-4 border-blue-900 shadow-[0_0_50px_rgba(30,58,138,0.5)] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-1 border-2 border-blue-100 border-double rounded-full"></div>
              <span className="text-5xl font-gzhel text-blue-900 pt-1 select-none font-black">G</span>
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent"></div>
          </div>
          
          <h1 className="text-4xl font-gzhel text-white tracking-wider mb-2 drop-shadow-lg">
            GZHEL<span className="text-blue-500">COIN</span>
          </h1>
          <p className="text-blue-200/60 text-xs tracking-[0.3em] uppercase font-bold">Casino Royale</p>
       </div>
       
       <div className="absolute bottom-12 flex flex-col items-center">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
          <span className="text-[10px] text-slate-600 uppercase tracking-widest font-mono">Loading assets...</span>
       </div>
    </div>
  );
};

const App: React.FC = () => {
  // --- Global State ---
  const [activeTab, setActiveTab] = useState<Tab>(Tab.GAME);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Settings State
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(1.0); // Default 100% volume

  // Player State with Stats
  const [player, setPlayer] = useState<Player>({
    id: 'user',
    name: 'Игрок',
    balance: INITIAL_BALANCE,
    avatarSeed: 'hero',
    lastBonusClaim: 0,
    stats: {
      totalWins: 0,
      totalGames: 0,
      currentWinStreak: 0,
      maxWinStreak: 0,
      maxBet: 0,
      bonusStreak: 0
    },
    achievements: []
  });

  // Casino "Shadow" Bank (Admin Only)
  const [houseBank, setHouseBank] = useState<number>(0);

  // Game Logic
  const [betAmount, setBetAmount] = useState<string>('100');
  const [inputError, setInputError] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipResult, setFlipResult] = useState<CoinSide | null>(null);
  const [selectedSide, setSelectedSide] = useState<CoinSide | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [flipCount, setFlipCount] = useState(0); 
  const [showResultText, setShowResultText] = useState(false);
  const [newAchievement, setNewAchievement] = useState<any>(null); // For Toast

  // PvP Logic
  const [pvpState, setPvpState] = useState<'IDLE' | 'SEARCHING' | 'MATCHED' | 'PLAYING' | 'RESULT'>('IDLE');
  const [pvpOpponent, setPvpOpponent] = useState<Leader | null>(null);
  const [pvpSide, setPvpSide] = useState<CoinSide | null>(null);

  // Data State
  const [history, setHistory] = useState<Transaction[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState(''); // Added Chat Input State
  const [leaders, setLeaders] = useState<Leader[]>([]);

  // Refs
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- Initialization & Persistence ---
  useEffect(() => {
    // 1. Telegram Init
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      
      // Admin Check
      const tgUser = window.Telegram.WebApp.initDataUnsafe?.user;
      if (tgUser && tgUser.id === ADMIN_TELEGRAM_ID) {
        setIsAdmin(true);
      }

      if (window.Telegram.WebApp.isVerticalSwipesEnabled && window.Telegram.WebApp.disableVerticalSwipes) {
          try {
             if (window.Telegram.WebApp.isVersionAtLeast('7.7')) {
                window.Telegram.WebApp.disableVerticalSwipes();
             }
          } catch(e) {}
      }
    }

    // 2. Load Data from LocalStorage
    try {
      const savedPlayer = localStorage.getItem('flipcity_player');
      const savedBank = localStorage.getItem('flipcity_bank');
      const savedHistory = localStorage.getItem('flipcity_history');
      const savedSettings = localStorage.getItem('flipcity_settings');

      if (savedPlayer) {
         const p = JSON.parse(savedPlayer);
         // Migration logic for old saves without stats
         if (!p.stats) {
            p.stats = { totalWins: 0, totalGames: 0, currentWinStreak: 0, maxWinStreak: 0, maxBet: 0, bonusStreak: 0 };
            p.achievements = [];
         }
         setPlayer(p);
      }
      if (savedBank) setHouseBank(parseFloat(savedBank));
      if (savedHistory) setHistory(JSON.parse(savedHistory));
      if (savedSettings) {
         const s = JSON.parse(savedSettings);
         setSoundEnabled(s.soundEnabled ?? true);
         setVolume(s.volume ?? 1.0);
      }
      
      if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
        const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
        setPlayer(prev => ({
          ...prev,
          id: tgUser.id.toString(),
          name: tgUser.first_name || prev.name,
          avatarSeed: tgUser.id.toString()
        }));
      }
    } catch (e) {
      console.error("Load error", e);
    }
    
    setChatMessages([{id: '0', sender: 'System', text: 'Добро пожаловать в чат!', isSystem: true}]);
    setIsLoaded(true);
  }, []);

  // Update Leaders
  useEffect(() => {
    setLeaders([{
        name: player.name,
        balance: player.balance,
        avatar: player.avatarSeed
    }]);
  }, [player]);

  // Save Data
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('flipcity_player', JSON.stringify(player));
    localStorage.setItem('flipcity_bank', houseBank.toString());
    localStorage.setItem('flipcity_history', JSON.stringify(history));
    localStorage.setItem('flipcity_settings', JSON.stringify({ volume, soundEnabled }));
  }, [player, houseBank, history, volume, soundEnabled, isLoaded]);

  // Apply Volume Settings
  useEffect(() => {
     soundManager.setVolume(soundEnabled ? volume : 0);
  }, [volume, soundEnabled]);

  // --- Logic Helpers ---
  const haptic = (type: 'impact' | 'notification' | 'selection' | 'error') => {
    // Only invoke HapticFeedback if supported (version >= 6.1)
    if (window.Telegram?.WebApp?.HapticFeedback && window.Telegram.WebApp.version) {
       // Simple version check float parsing
       const ver = parseFloat(window.Telegram.WebApp.version);
       if (ver < 6.1) return;

       const hf = window.Telegram.WebApp.HapticFeedback;
       if (type === 'impact') hf.impactOccurred('heavy');
       if (type === 'notification') hf.notificationOccurred('success');
       if (type === 'error') hf.notificationOccurred('error');
       if (type === 'selection') hf.selectionChanged();
    }
  };

  const getBetValue = () => {
    const val = parseInt(betAmount);
    return isNaN(val) ? 0 : val;
  };

  const adjustBet = (type: 'HALF' | 'DOUBLE' | 'MAX') => {
    // haptic('selection'); // Global listener handles this
    setInputError(false);
    const current = getBetValue();
    let newVal = current;
    if (type === 'HALF') newVal = Math.floor(current / 2);
    if (type === 'DOUBLE') newVal = current * 2;
    if (type === 'MAX') newVal = player.balance;
    if (newVal < MIN_BET) newVal = MIN_BET;
    if (newVal > player.balance) newVal = player.balance;
    setBetAmount(newVal.toString());
  };

  const triggerError = () => {
    soundManager.play('ERROR');
    setInputError(true);
    haptic('error');
    setTimeout(() => setInputError(false), 500);
  };

  const checkAchievements = (currentPlayer: Player) => {
    ACHIEVEMENTS_LIST.forEach(ach => {
      if (!currentPlayer.achievements.includes(ach.id)) {
        if (ach.condition(currentPlayer)) {
           // Unlock!
           setPlayer(p => ({
             ...p,
             achievements: [...p.achievements, ach.id]
           }));
           // Show Toast
           setNewAchievement(ach);
           soundManager.play('WIN');
           setTimeout(() => setNewAchievement(null), 4000);
        }
      }
    });
  };

  // --- Chat Logic ---
  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    
    setChatMessages(prev => [...prev, { 
      id: Date.now().toString(), 
      sender: player.name, 
      text: chatInput, 
      avatar: player.avatarSeed 
    }]);
    
    setChatInput(''); // Clear input
    
    // Scroll to bottom
    setTimeout(() => { 
      if(chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' }); 
    }, 100);
  };

  // --- Global Click Sound Listener ---
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      soundManager.unlockAudio(); // Attempt unlock on any click

      // Check if target is a button or inside a button
      const target = e.target as HTMLElement;
      const button = target.closest('button');
      if (button && !button.disabled) {
        soundManager.play('CLICK');
      }
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('touchstart', () => soundManager.unlockAudio(), { once: true });
    
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  // --- Game Core ---
  const handleFlip = (side: CoinSide) => {
    const bet = getBetValue();
    if (isFlipping) return;
    if (bet > player.balance || bet < MIN_BET) {
      triggerError();
      return;
    }

    haptic('impact');
    setIsFlipping(true);
    setSelectedSide(side);
    setShowConfetti(false);
    setShowResultText(false);
    setFlipCount(c => c + 1);

    // --- FUZZY RIGGING SYSTEM ("The Invisible Hand" v2) ---
    // Start with a slight player edge for hooking (52% instead of 50%)
    let winChance = 0.52; 

    // 1. High Stakes Trap (Fuzzy Threshold)
    // Dynamic threshold: between 25% and 35% of total balance.
    // If you bet more than this, you enter "High Risk" zone.
    const riskFactor = 0.25 + (Math.random() * 0.1); 
    if (bet > player.balance * riskFactor) {
        // Drop win chance, but keep it variable so it feels like luck.
        // Chance becomes between 35% and 42%
        winChance = 0.35 + (Math.random() * 0.07);
        
        // "Jackpot Bait": 5% chance to WIN anyway to keep them hooked on high stakes
        if (Math.random() < 0.05) winChance = 0.95;
    }

    // 2. Streak Breaker (Fuzzy Logic)
    // Don't kill EVERY streak of 3. Kill most, but let some survive to 4 or 5.
    if (player.stats.currentWinStreak >= 3) {
        // 70% chance to force a loss (reduce win chance to 20%)
        // 30% chance to let it play out (keep standard chance)
        if (Math.random() < 0.70) {
            winChance = 0.20;
        }
    }
    // Harder cap at 5 wins
    if (player.stats.currentWinStreak >= 5) {
        winChance = 0.10; 
    }

    // 3. Mercy System (Safety Net)
    // If they are broke, let them win small bets to stay in the app.
    if (player.balance < MERCY_THRESHOLD && bet < 50) {
        winChance = 0.75;
    }

    const isWin = Math.random() < winChance;
    const resultSide = isWin ? side : (side === CoinSide.HEADS ? CoinSide.TAILS : CoinSide.HEADS);

    setFlipResult(resultSide);

    setTimeout(() => {
      soundManager.play('COIN_LAND');
      resolveGame(isWin, bet);
      setIsFlipping(false);
    }, ANIMATION_DURATION_MS);
  };

  const resolveGame = (isWin: boolean, bet: number) => {
    setShowResultText(true);
    setTimeout(() => setShowResultText(false), 2500);

    setPlayer(prev => {
      const newStats = { ...prev.stats };
      newStats.totalGames += 1;
      if (bet > newStats.maxBet) newStats.maxBet = bet;

      let newBalance = prev.balance;
      if (isWin) {
        newStats.totalWins += 1;
        newStats.currentWinStreak += 1;
        if (newStats.currentWinStreak > newStats.maxWinStreak) newStats.maxWinStreak = newStats.currentWinStreak;
        
        const profit = Math.floor(bet * WIN_COEFFICIENT) - bet;
        newBalance += profit;
        setHouseBank(b => b - profit);
        addToHistory('WIN', profit);
      } else {
        newStats.currentWinStreak = 0;
        newBalance -= bet;
        setHouseBank(b => b + bet);
        addToHistory('LOSS', bet);
      }
      
      const updatedPlayer = { ...prev, balance: newBalance, stats: newStats };
      checkAchievements(updatedPlayer);
      return updatedPlayer;
    });

    if (isWin) {
      soundManager.play('WIN');
      haptic('notification'); 
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    } else {
      soundManager.play('LOSE');
      haptic('error');
    }
  };

  // --- PvP ---
  const startPvpSearch = () => {
    const bet = getBetValue();
    if (bet > player.balance || bet < MIN_BET) { triggerError(); return; }
    haptic('impact');
    setPvpState('SEARCHING');
    setTimeout(() => {
        const mockOpponent = { name: 'Неизвестный', balance: bet * 10, avatar: 'anon' + Date.now() };
        setPvpOpponent(mockOpponent);
        setPvpState('MATCHED');
        soundManager.play('MATCH_FOUND'); 
        haptic('notification');
    }, 2000);
  };

  const playPvp = (side: CoinSide) => {
    haptic('impact');
    setPvpSide(side);
    setPvpState('PLAYING');
    setFlipCount(c => c + 1);
    
    const isWin = Math.random() < 0.5; 
    const resultSide = isWin ? side : (side === CoinSide.HEADS ? CoinSide.TAILS : CoinSide.HEADS);
    setFlipResult(resultSide);

    setTimeout(() => {
      soundManager.play('COIN_LAND');
      const bet = getBetValue();
      const totalPot = bet * 2;
      const houseRake = totalPot * 0.05; // 5% rake (e.g., 20 Pot -> 1 Rake -> 19 Win)
      
      setPlayer(prev => {
         const newStats = { ...prev.stats };
         newStats.totalGames += 1;
         let newBalance = prev.balance;
         
         if (isWin) {
            const winAmount = totalPot - houseRake;
            const profit = winAmount - bet;
            newBalance += profit;
            newStats.totalWins += 1;
            setHouseBank(b => b + houseRake);
            addToHistory('PVP_WIN', profit);
         } else {
            newBalance -= bet;
            setHouseBank(b => b + houseRake);
            addToHistory('PVP_LOSS', bet);
         }
         
         const updated = { ...prev, balance: newBalance, stats: newStats };
         checkAchievements(updated);
         return updated;
      });

      if (isWin) {
        soundManager.play('WIN');
        haptic('notification');
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      } else {
        soundManager.play('LOSE');
        haptic('error');
      }
      setPvpState('RESULT');
    }, ANIMATION_DURATION_MS);
  };

  const addToHistory = (type: Transaction['type'], amount: number) => {
    setHistory(prev => [{
      id: Date.now().toString(),
      type,
      amount,
      timestamp: Date.now()
    }, ...prev].slice(0, 50));
  };

  const claimDailyBonus = () => {
    soundManager.play('WIN');
    const now = Date.now();
    if (!player.lastBonusClaim || now - player.lastBonusClaim > 86400000) {
      haptic('notification');
      setPlayer(p => {
         const updated = { 
            ...p, 
            balance: p.balance + DAILY_BONUS_AMOUNT, 
            lastBonusClaim: now,
            stats: { ...p.stats, bonusStreak: p.stats.bonusStreak + 1 } 
         };
         checkAchievements(updated);
         return updated;
      });
      setHouseBank(b => b - DAILY_BONUS_AMOUNT);
      addToHistory('BONUS', DAILY_BONUS_AMOUNT);
    }
  };

  // --- Renders ---
  
  const renderProfileTab = () => (
     <div className="flex flex-col h-full pt-6 px-4 pb-24 overflow-y-auto relative">
        <div className="absolute top-4 right-2">
           <button onClick={() => setShowSettings(true)} className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors">
              <SettingsIcon />
           </button>
        </div>
        <div className="flex flex-col items-center mb-8">
           <div className="relative">
              <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-blue-600 overflow-hidden shadow-xl">
                 <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${player.avatarSeed}`} alt="Avatar" />
              </div>
              <div className="absolute -bottom-2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full border border-slate-900">
                 PRO PLAYER
              </div>
           </div>
           <h2 className="mt-4 text-2xl font-bold text-white">{player.name}</h2>
           <div className="font-mono text-blue-400 font-bold text-xl"><AnimatedBalance value={player.balance} /></div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-8">
           <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
              <div className="text-xs text-slate-500 uppercase font-bold">Побед</div>
              <div className="text-2xl font-black text-green-500">{player.stats.totalWins}</div>
           </div>
           <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
              <div className="text-xs text-slate-500 uppercase font-bold">Серия побед</div>
              <div className="text-2xl font-black text-blue-500">{player.stats.maxWinStreak}</div>
           </div>
           <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
              <div className="text-xs text-slate-500 uppercase font-bold">Игр сыграно</div>
              <div className="text-2xl font-black text-white">{player.stats.totalGames}</div>
           </div>
           <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
              <div className="text-xs text-slate-500 uppercase font-bold">Макс. Ставка</div>
              <div className="text-xl font-black text-yellow-500">{player.stats.maxBet.toLocaleString()}</div>
           </div>
        </div>

        {/* Achievements */}
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
           <span className="text-yellow-500">🏆</span> Достижения
        </h3>
        <div className="space-y-3 mb-8">
           {ACHIEVEMENTS_LIST.map(ach => {
              const isUnlocked = player.achievements.includes(ach.id);
              return (
                 <div key={ach.id} className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${isUnlocked ? 'bg-gradient-to-r from-slate-900 to-slate-800 border-yellow-500/30' : 'bg-slate-950 border-slate-900 opacity-50 grayscale'}`}>
                    <div className="text-3xl">{ach.icon}</div>
                    <div>
                       <div className={`font-bold ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>{ach.title}</div>
                       <div className="text-xs text-slate-400">{ach.description}</div>
                    </div>
                    {isUnlocked && <div className="ml-auto text-green-500 text-xs font-bold">✓</div>}
                 </div>
              );
           })}
        </div>

        {/* Admin Link - ONLY VISIBLE TO ADMIN */}
        {isAdmin && (
           <button 
             onClick={() => setActiveTab(Tab.ADMIN)} 
             className="mt-4 p-4 border border-dashed border-slate-800 rounded-xl text-slate-600 text-xs uppercase tracking-widest hover:text-white hover:border-slate-600 transition-colors"
           >
             🔐 Банк Казино (Admin)
           </button>
        )}
     </div>
  );

  const renderAdminTab = () => (
    <div className="flex flex-col h-full p-6 pt-10 pb-24 bg-black">
      <div className="flex justify-between items-center mb-8">
         <h2 className="text-3xl font-mono text-red-500 font-bold">ADMIN PANEL</h2>
         <button onClick={() => setActiveTab(Tab.PROFILE)} className="text-slate-500 text-sm hover:text-white">CLOSE</button>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl mb-6">
         <div className="text-slate-400 text-xs uppercase font-bold mb-2">Общая прибыль казино</div>
         <div className={`text-4xl font-mono font-black ${houseBank >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {houseBank.toLocaleString()} ₽
         </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
         <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-500">Комиссия PvP</div>
            <div className="text-xl font-bold text-white">5%</div>
         </div>
         <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-500">Комиссия House</div>
            <div className="text-xl font-bold text-white">~5%</div>
         </div>
      </div>

      <div className="mt-auto">
         <button 
            onClick={() => {
              if (confirm('Сбросить банк казино до 0?')) {
                setHouseBank(0);
              }
            }}
            className="w-full bg-red-900/30 text-red-500 border border-red-900 p-4 rounded-xl font-mono text-xs hover:bg-red-900/50"
         >
            RESET CASINO BANK
         </button>
      </div>
    </div>
  );

  const renderGameTab = () => (
    <div className="flex flex-col h-full px-4 pt-4 pb-24 overflow-y-auto no-scrollbar">
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl relative overflow-hidden mb-4 shrink-0 transition-all active:scale-[0.99]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Баланс</div>
            <div className="text-3xl font-black text-white tracking-tight">
               <AnimatedBalance value={player.balance} />
            </div>
          </div>
          {(!player.lastBonusClaim || Date.now() - player.lastBonusClaim > 86400000) && (
             <button onClick={claimDailyBonus} className="bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs font-bold py-2 px-4 rounded-full shadow-lg animate-pulse hover:scale-105 transition-transform">
               + {DAILY_BONUS_AMOUNT} ₽
             </button>
          )}
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center relative min-h-[250px]">
        <div className="h-12 flex items-center justify-center mb-4 min-h-[3rem]">
            {!isFlipping && flipResult && showResultText && (
               <div className={`text-4xl font-black drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] animate-bounce ${flipResult === selectedSide ? 'text-green-400' : 'text-red-500'}`}>
                 {flipResult === selectedSide ? `+${Math.floor(getBetValue() * WIN_COEFFICIENT) - getBetValue()} ₽` : `-${getBetValue()} ₽`}
               </div>
            )}
        </div>
        <Coin key={flipCount} flipping={isFlipping} result={flipResult} />
      </div>
      <div className="bg-slate-900/90 backdrop-blur-md rounded-t-3xl border-t border-slate-800 p-6 -mx-4 shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
        <div className={`mb-6 transition-transform ${inputError ? 'animate-shake' : ''}`}>
           <div className="flex justify-between text-xs text-slate-500 mb-2 uppercase font-bold px-1">
              <span>Сумма Ставки</span>
              <span className="text-blue-500">Win: 1.9x</span>
           </div>
           <div className={`flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border transition-colors ${inputError ? 'border-red-500' : 'border-slate-800 focus-within:border-blue-500'}`}>
              <button onClick={() => adjustBet('HALF')} className="p-3.5 text-slate-400 hover:text-white font-bold text-xs bg-slate-900 rounded-xl active:bg-slate-800 transition-colors">1/2</button>
              <input 
                 type="number"
                 inputMode="numeric" 
                 pattern="[0-9]*"
                 value={betAmount}
                 onChange={(e) => { setBetAmount(e.target.value); setInputError(false); }}
                 className="bg-transparent text-center w-full text-2xl font-black text-white focus:outline-none select-text"
                 placeholder="0"
              />
              <button onClick={() => adjustBet('DOUBLE')} className="p-3.5 text-slate-400 hover:text-white font-bold text-xs bg-slate-900 rounded-xl active:bg-slate-800 transition-colors">x2</button>
              <button onClick={() => adjustBet('MAX')} className="p-3.5 text-blue-600 hover:text-blue-400 font-bold text-xs bg-slate-900 rounded-xl active:bg-slate-800 transition-colors">ALL</button>
           </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => handleFlip(CoinSide.HEADS)}
            disabled={isFlipping}
            className="group flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-slate-700 active:border-white active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-active:opacity-100 transition-opacity"></div>
            <span className="text-xl font-black text-white drop-shadow-sm font-gzhel">ОРЁЛ</span>
          </button>
          <button 
            onClick={() => handleFlip(CoinSide.TAILS)}
            disabled={isFlipping}
            className="group flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-slate-700 active:border-blue-500 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-active:opacity-100 transition-opacity"></div>
            <span className="text-xl font-black text-blue-400 drop-shadow-sm font-gzhel">РЕШКА</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderMultiplayerTab = () => {
    const bet = getBetValue();
    if (pvpState === 'IDLE') {
       return (
         <div className="flex flex-col items-center justify-center h-full p-6 text-center pb-24">
            <div className="w-32 h-32 bg-slate-800 rounded-full flex items-center justify-center mb-6 relative shadow-2xl">
               <MultiIcon active={true} />
               <div className="absolute inset-0 border-4 border-slate-700 rounded-full animate-ping opacity-20"></div>
            </div>
            <h2 className="text-2xl font-bold mb-2">PvP Арена</h2>
            <p className="text-slate-400 mb-8 max-w-xs text-sm leading-relaxed">Играйте против реальных игроков.<br/>Победитель забирает банк (1.8x).</p>
            <div className={`w-full max-w-xs mb-8 transition-transform ${inputError ? 'animate-shake' : ''}`}>
               <div className="text-left text-xs text-slate-500 mb-2 uppercase font-bold ml-1">Ваша ставка</div>
               <div className={`bg-slate-900 border rounded-2xl p-1 flex items-center ${inputError ? 'border-red-500' : 'border-slate-700'}`}>
                  <input 
                    type="number"
                    inputMode="numeric"
                    value={betAmount}
                    onChange={(e) => { setBetAmount(e.target.value); setInputError(false); }}
                    className="w-full bg-transparent text-center text-2xl font-bold text-white p-2 focus:outline-none select-text"
                  />
               </div>
               <div className="text-xs text-slate-500 mt-2 flex justify-between px-1">
                  <span>Банк игры:</span> <span className="text-green-400 font-bold">{bet * 2} ₽</span>
               </div>
            </div>
            <button onClick={startPvpSearch} className="w-full max-w-xs bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all active:scale-95 uppercase tracking-wide">ПОИСК ИГРЫ</button>
         </div>
       );
    }
    if (pvpState === 'SEARCHING') {
       return (
         <div className="flex flex-col items-center justify-center h-full p-6 pb-24">
            <div className="relative mb-12">
               <div className="w-24 h-24 border-4 border-t-blue-500 border-slate-800 rounded-full animate-spin"></div>
               <div className="absolute inset-0 flex items-center justify-center font-bold text-xs text-slate-500">VS</div>
            </div>
            <h2 className="text-xl font-bold animate-pulse text-blue-500">Поиск соперника...</h2>
            <p className="text-slate-500 mt-2 font-mono">Ставка: {bet} ₽</p>
         </div>
       );
    }
    if (pvpState === 'MATCHED' || pvpState === 'PLAYING' || pvpState === 'RESULT') {
       return (
         <div className="flex flex-col h-full p-4 pb-24">
            <div className="flex justify-between items-center bg-slate-900 p-4 rounded-2xl mb-8 border border-slate-800 shadow-lg">
               <div className="flex flex-col items-center w-20">
                  <div className="w-12 h-12 bg-slate-700 rounded-full mb-2 overflow-hidden border-2 border-green-500">
                    <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${player.avatarSeed}`} alt="Me" />
                  </div>
                  <span className="font-bold text-xs truncate w-full text-center">Вы</span>
               </div>
               <div className="text-center flex-1">
                  <div className="text-[10px] text-slate-500 mb-1 tracking-widest uppercase">На Кону</div>
                  <div className="text-3xl font-black text-green-400">{bet * 2} ₽</div>
               </div>
               <div className="flex flex-col items-center w-20">
                  <div className="w-12 h-12 bg-slate-700 rounded-full mb-2 overflow-hidden border-2 border-red-500">
                    <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${pvpOpponent?.avatar}`} alt="Opp" />
                  </div>
                  <span className="font-bold text-xs truncate w-full text-center">{pvpOpponent?.name}</span>
               </div>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center relative">
               {pvpState === 'MATCHED' && (
                 <div className="text-center w-full animate-fade-in">
                    <h3 className="text-xl font-bold mb-2">Соперник найден!</h3>
                    <p className="text-slate-400 mb-10 text-sm">Кто выберет сторону первым?</p>
                    <div className="flex gap-4 justify-center">
                       <button onClick={() => playPvp(CoinSide.HEADS)} className="bg-slate-800/80 p-6 rounded-2xl border-2 border-slate-600 active:border-white w-36 transition-all active:scale-95"><span className="block text-4xl font-black text-white mb-2 font-gzhel">О</span><span className="text-xs text-slate-400 font-bold uppercase">ОРЁЛ</span></button>
                       <button onClick={() => playPvp(CoinSide.TAILS)} className="bg-slate-800/80 p-6 rounded-2xl border-2 border-slate-600 active:border-blue-500 w-36 transition-all active:scale-95"><span className="block text-4xl font-black text-blue-400 mb-2 font-gzhel">Р</span><span className="text-xs text-slate-400 font-bold uppercase">РЕШКА</span></button>
                    </div>
                 </div>
               )}
               {(pvpState === 'PLAYING' || pvpState === 'RESULT') && (
                  <div className="w-full flex flex-col items-center">
                     <Coin key={flipCount} flipping={pvpState === 'PLAYING'} result={flipResult} />
                     {pvpState === 'RESULT' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm z-30 rounded-xl">
                           {flipResult === pvpSide ? (
                             <>
                               <div className="text-5xl font-black text-green-500 mb-2 drop-shadow-[0_0_20px_rgba(34,197,94,0.5)] animate-bounce">ПОБЕДА!</div>
                               <div className="text-xl text-white font-bold mb-8">+{Math.floor(bet * 2 * 0.95) - bet} ₽ <span className="text-xs text-slate-500 font-normal">(прибыль)</span></div>
                             </>
                           ) : (
                             <>
                               <div className="text-5xl font-black text-red-500 mb-2 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]">ПОРАЖЕНИЕ</div>
                               <div className="text-xl text-slate-400 font-bold mb-8">-{bet} ₽</div>
                             </>
                           )}
                           <button onClick={() => { setPvpState('IDLE'); }} className="bg-white text-black px-8 py-3 rounded-full text-sm font-bold shadow-lg hover:scale-105 transition-transform">В МЕНЮ</button>
                        </div>
                     )}
                  </div>
               )}
            </div>
         </div>
       );
    }
    return null;
  };

  const renderLeaderboardTab = () => (
    <div className="flex flex-col h-full pt-4 pb-24 overflow-hidden">
      <div className="px-4 mb-4">
         <h2 className="text-2xl font-bold">Лидеры</h2>
         <p className="text-xs text-slate-500">Топ игроков по балансу (Live)</p>
      </div>
      <div className="flex-1 overflow-y-auto px-4 space-y-2 no-scrollbar">
        <div className="bg-blue-600/10 border border-blue-600/30 p-4 rounded-2xl flex items-center gap-4 mb-4 sticky top-0 backdrop-blur-md z-10">
           <div className="text-blue-500 font-black text-lg">#1</div>
           <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden"><img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${player.avatarSeed}`} alt="me" /></div>
           <div className="flex-1"><div className="font-bold text-white">Вы</div><div className="text-xs text-slate-400">Сейчас онлайн</div></div>
           <div className="font-mono text-blue-400 font-bold"><AnimatedBalance value={player.balance} /></div>
        </div>
        {leaders.length <= 1 && <div className="text-center text-slate-600 py-10"><p>Нет других игроков онлайн</p><p className="text-xs mt-2">Список обновится автоматически</p></div>}
        {leaders.filter(l => l.name !== player.name).map((l, idx) => (
           <div key={idx} className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
             <div className="font-bold w-8 text-center text-slate-600">{idx + 2}</div>
             <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden border border-slate-700"><img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${l.avatar}`} alt={l.name} /></div>
             <div className="flex-1"><div className="font-bold text-slate-200">{l.name}</div></div>
             <div className="font-mono text-slate-400 text-sm font-bold">{l.balance.toLocaleString()} ₽</div>
           </div>
        ))}
      </div>
    </div>
  );

  const renderChatTab = () => (
    <div className="flex flex-col h-full pb-20 bg-slate-950">
      <div className="p-4 border-b border-slate-800 bg-slate-900 shadow-sm z-10">
        <h2 className="text-lg font-bold">Чат Игроков</h2>
        <div className="text-xs text-slate-500 flex items-center gap-2"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> 1 онлайн</div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.length === 1 && <div className="text-center text-slate-600 text-sm py-10 opacity-50">Здесь пока тихо...</div>}
        {chatMessages.map(msg => (
          <div key={msg.id} className={`flex gap-3 ${msg.sender === player.name ? 'flex-row-reverse' : ''}`}>
             {!msg.isSystem && <div className="w-8 h-8 rounded-full bg-slate-800 flex-none overflow-hidden border border-slate-700"><img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${msg.avatar}`} alt="av" /></div>}
             <div className={`flex flex-col max-w-[80%] ${msg.sender === player.name ? 'items-end' : 'items-start'}`}>
                {!msg.isSystem && <span className="text-[10px] text-slate-500 mb-1 ml-1">{msg.sender}</span>}
                <div className={`px-4 py-2 text-sm shadow-sm ${msg.isSystem ? 'bg-slate-800/50 text-slate-500 text-xs w-full text-center italic rounded-xl' : msg.sender === player.name ? 'bg-blue-600 text-white rounded-2xl rounded-tr-none' : 'bg-slate-800 text-slate-300 rounded-2xl rounded-tl-none'}`}>{msg.text}</div>
             </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <div className="p-3 pb-24 bg-slate-900 border-t border-slate-800 flex gap-2">
         <input 
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors select-text" 
            placeholder="Написать сообщение..." 
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
         />
         <button 
            onClick={handleSendMessage}
            disabled={!chatInput.trim()}
            className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-500 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
         >
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
         </button>
      </div>
    </div>
  );

  const renderHistoryTab = () => (
    <div className="p-4 pt-8 pb-24 h-full overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6">История</h2>
      <div className="space-y-3">
          {history.length === 0 && <div className="text-slate-600 text-center mt-10 p-10 border border-slate-800 border-dashed rounded-2xl">История пуста</div>}
          {history.map((tx) => (
            <div key={tx.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center animate-fade-in">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${tx.type.includes('WIN') ? 'bg-green-500/20 text-green-500' : tx.type === 'BONUS' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-red-500/20 text-red-500'}`}>{tx.type.includes('WIN') ? 'W' : tx.type === 'BONUS' ? '🎁' : 'L'}</div>
                <div><div className="font-bold text-white text-sm">{tx.type === 'PVP_WIN' ? 'Победа (PvP)' : tx.type === 'PVP_LOSS' ? 'Проигрыш (PvP)' : tx.type === 'WIN' ? 'Победа' : tx.type === 'BONUS' ? 'Бонус' : 'Проигрыш'}</div><div className="text-xs text-slate-500">{new Date(tx.timestamp).toLocaleTimeString()}</div></div>
              </div>
              <div className={`font-mono font-bold ${tx.type.includes('LOSS') ? 'text-red-500' : 'text-green-400'}`}>{tx.type.includes('LOSS') ? '-' : '+'}{tx.amount} ₽</div>
            </div>
          ))}
      </div>
    </div>
  );

  const BottomNav = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-lg border-t border-slate-800 pb-safe pt-2 z-50">
      <div className="flex justify-around items-center px-1 h-[60px]">
        <button onClick={() => {haptic('selection'); setActiveTab(Tab.GAME)}} className={`flex flex-col items-center p-2 rounded-xl w-14 transition-colors ${activeTab === Tab.GAME ? 'text-blue-500' : 'text-slate-600 hover:text-slate-400'}`}><GameIcon active={activeTab === Tab.GAME} /><span className="text-[9px] font-bold mt-1">ИГРА</span></button>
        <button onClick={() => {haptic('selection'); setActiveTab(Tab.MULTIPLAYER)}} className={`flex flex-col items-center p-2 rounded-xl w-14 transition-colors ${activeTab === Tab.MULTIPLAYER ? 'text-blue-500' : 'text-slate-600 hover:text-slate-400'}`}><MultiIcon active={activeTab === Tab.MULTIPLAYER} /><span className="text-[9px] font-bold mt-1">PvP</span></button>
        <button onClick={() => {haptic('selection'); setActiveTab(Tab.LEADERS)}} className={`flex flex-col items-center p-2 rounded-xl w-14 transition-colors ${activeTab === Tab.LEADERS ? 'text-blue-500' : 'text-slate-600 hover:text-slate-400'}`}><LeaderIcon active={activeTab === Tab.LEADERS} /><span className="text-[9px] font-bold mt-1">ТОП</span></button>
        <button onClick={() => {haptic('selection'); setActiveTab(Tab.CHAT)}} className={`flex flex-col items-center p-2 rounded-xl w-14 transition-colors ${activeTab === Tab.CHAT ? 'text-blue-500' : 'text-slate-600 hover:text-slate-400'}`}><ChatIcon active={activeTab === Tab.CHAT} /><span className="text-[9px] font-bold mt-1">ЧАТ</span></button>
        <button onClick={() => {haptic('selection'); setActiveTab(Tab.HISTORY)}} className={`flex flex-col items-center p-2 rounded-xl w-14 transition-colors ${activeTab === Tab.HISTORY ? 'text-blue-500' : 'text-slate-600 hover:text-slate-400'}`}><HistoryIcon active={activeTab === Tab.HISTORY} /><span className="text-[9px] font-bold mt-1">ИНФО</span></button>
        <button onClick={() => {haptic('selection'); setActiveTab(Tab.PROFILE)}} className={`flex flex-col items-center p-2 rounded-xl w-14 transition-colors ${activeTab === Tab.PROFILE ? 'text-blue-500' : 'text-slate-600 hover:text-slate-400'}`}><ProfileIcon active={activeTab === Tab.PROFILE} /><span className="text-[9px] font-bold mt-1">ПРОФИЛЬ</span></button>
      </div>
    </div>
  );

  return (
    <div className="h-full w-full relative">
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      {showConfetti && <Confetti />}
      <AchievementToast achievement={newAchievement} visible={!!newAchievement} />
      
      {/* Settings Modal */}
      {showSettings && (
         <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl p-6 shadow-2xl relative">
               <button onClick={() => setShowSettings(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white">✕</button>
               <h2 className="text-xl font-bold mb-6">Настройки</h2>
               
               <div className="space-y-6">
                  <div className="flex justify-between items-center">
                     <span className="text-slate-300">Звуковые эффекты</span>
                     <button 
                        onClick={() => setSoundEnabled(!soundEnabled)} 
                        className={`w-12 h-6 rounded-full transition-colors relative ${soundEnabled ? 'bg-green-500' : 'bg-slate-700'}`}
                     >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${soundEnabled ? 'left-7' : 'left-1'}`}></div>
                     </button>
                  </div>
                  
                  <div className={`${soundEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'} transition-opacity`}>
                     <div className="flex justify-between text-xs text-slate-500 mb-2">
                        <span>Громкость</span>
                        <span>{Math.round(volume * 100)}%</span>
                     </div>
                     <input 
                        type="range" 
                        min="0" max="1" step="0.1" 
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                     />
                  </div>
               </div>
               
               <button onClick={() => setShowSettings(false)} className="w-full mt-8 bg-slate-800 text-white py-3 rounded-xl font-bold">Готово</button>
            </div>
         </div>
      )}

      <div className="h-full w-full relative z-10">
        {activeTab === Tab.GAME && renderGameTab()}
        {activeTab === Tab.MULTIPLAYER && renderMultiplayerTab()}
        {activeTab === Tab.HISTORY && renderHistoryTab()}
        {activeTab === Tab.LEADERS && renderLeaderboardTab()}
        {activeTab === Tab.CHAT && renderChatTab()}
        {activeTab === Tab.PROFILE && renderProfileTab()}
        {activeTab === Tab.ADMIN && renderAdminTab()}
      </div>
      <BottomNav />
    </div>
  );
};

export default App;
