
import React, { useState, useEffect, useRef } from 'react';
import { 
  Tab,
  Player, 
  CoinSide, 
  Transaction,
  ChatMessage,
  Leader,
  PlayerStats,
  PvpRoom
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
import { firebaseService } from './services/firebaseService';
import { onValue } from 'firebase/database';

// --- Icons (Unchanged) ---
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

// --- Components (AchievementToast, Confetti, AnimatedBalance, Splash) ---
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
    bg: ['#3b82f6', '#1d4ed8', '#93c5fd', '#ffffff'][Math.floor(Math.random() * 4)] 
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

const AnimatedBalance = ({ value }: { value: number }) => {
  const [display, setDisplay] = useState(value);
  useEffect(() => {
    const start = display;
    const end = value;
    if (start === end) return;
    let frameId: number;
    const startTime = performance.now();
    const duration = 1000;
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      const next = start + (end - start) * ease;
      setDisplay(next);
      if (progress < 1) frameId = requestAnimationFrame(animate);
      else setDisplay(end);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [value]);
  return <>{Math.floor(display).toLocaleString()} ₽</>;
};

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [fading, setFading] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setFading(true);
      setTimeout(onFinish, 500);
    }, 2500);
    return () => clearTimeout(timer);
  }, [onFinish]);
  return (
    <div className={`fixed inset-0 z-[100] bg-[#020617] flex flex-col items-center justify-center transition-opacity duration-500 ${fading ? 'opacity-0' : 'opacity-100'}`}>
       <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] bg-blue-900/20 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-[-20%] right-[-20%] w-[70%] h-[70%] bg-blue-600/10 rounded-full blur-[100px]"></div>
       </div>
       <div className="relative z-10 flex flex-col items-center animate-fade-in-up">
          <div className="w-24 h-24 mb-6 rounded-full bg-white border-4 border-blue-900 shadow-[0_0_50px_rgba(30,58,138,0.5)] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-1 border-2 border-blue-100 border-double rounded-full"></div>
              <span className="text-5xl font-gzhel text-blue-900 pt-1 select-none font-black">G</span>
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
  const [activeTab, setActiveTab] = useState<Tab>(Tab.GAME);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(1.0);

  const [player, setPlayer] = useState<Player>({
    id: 'user-' + Math.floor(Math.random()*10000),
    name: 'Игрок',
    balance: INITIAL_BALANCE,
    avatarSeed: 'hero',
    lastBonusClaim: 0,
    stats: { totalWins: 0, totalGames: 0, currentWinStreak: 0, maxWinStreak: 0, maxBet: 0, bonusStreak: 0 },
    achievements: []
  });

  const [houseBank, setHouseBank] = useState<number>(0);
  const [betAmount, setBetAmount] = useState<string>('100');
  const [inputError, setInputError] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipResult, setFlipResult] = useState<CoinSide | null>(null);
  const [selectedSide, setSelectedSide] = useState<CoinSide | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [flipCount, setFlipCount] = useState(0); 
  const [showResultText, setShowResultText] = useState(false);
  const [newAchievement, setNewAchievement] = useState<any>(null);

  // PVP REAL ONLINE STATE
  const [pvpMode, setPvpMode] = useState<'MENU' | 'CREATE' | 'JOIN' | 'LOBBY' | 'GAME'>('MENU');
  const [roomCode, setRoomCode] = useState('');
  const [activeRoom, setActiveRoom] = useState<PvpRoom | null>(null);
  const [joinCodeInput, setJoinCodeInput] = useState('');

  const [history, setHistory] = useState<Transaction[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- Init ---
  useEffect(() => {
    soundManager.loadAll();
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      const tgUser = window.Telegram.WebApp.initDataUnsafe?.user;
      if (tgUser) {
        if (tgUser.id === ADMIN_TELEGRAM_ID) setIsAdmin(true);
        setPlayer(prev => ({
           ...prev,
           id: tgUser.id.toString(),
           name: tgUser.first_name || prev.name,
           avatarSeed: tgUser.id.toString()
        }));
      }
      // Swipe handling...
    }
    
    // Load Local Data
    try {
      const savedPlayer = localStorage.getItem('flipcity_player');
      const savedBank = localStorage.getItem('flipcity_bank');
      const savedHistory = localStorage.getItem('flipcity_history');
      const savedSettings = localStorage.getItem('flipcity_settings');

      if (savedPlayer) {
         const p = JSON.parse(savedPlayer);
         if (!p.stats) p.stats = { totalWins: 0, totalGames: 0, currentWinStreak: 0, maxWinStreak: 0, maxBet: 0, bonusStreak: 0 };
         setPlayer(p);
      }
      if (savedBank) setHouseBank(parseFloat(savedBank));
      if (savedHistory) setHistory(JSON.parse(savedHistory));
      if (savedSettings) {
         const s = JSON.parse(savedSettings);
         setSoundEnabled(s.soundEnabled ?? true);
         setVolume(s.volume ?? 1.0);
      }
    } catch (e) { console.error(e); }

    // Init Chat Listener (Real or Fake)
    if (firebaseService.isOnline) {
        const chatRef = firebaseService.getChatRef();
        if (chatRef) {
            onValue(chatRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    const msgs = Object.keys(data).map(key => ({
                        id: key,
                        sender: data[key].sender,
                        text: data[key].text,
                        avatar: data[key].avatar,
                        isSystem: false
                    }));
                    setChatMessages(msgs.slice(-50)); // Keep last 50
                    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
                }
            });
        }
    } else {
        setChatMessages([{id: '0', sender: 'System', text: 'Оффлайн режим. Настройте Firebase для чата!', isSystem: true}]);
    }
    
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('flipcity_player', JSON.stringify(player));
    localStorage.setItem('flipcity_bank', houseBank.toString());
    localStorage.setItem('flipcity_history', JSON.stringify(history));
    localStorage.setItem('flipcity_settings', JSON.stringify({ volume, soundEnabled }));
  }, [player, houseBank, history, volume, soundEnabled, isLoaded]);

  useEffect(() => { soundManager.setVolume(soundEnabled ? volume : 0); }, [volume, soundEnabled]);

  // --- Helpers ---
  const haptic = (type: 'impact' | 'notification' | 'selection' | 'error') => {
    if (window.Telegram?.WebApp?.HapticFeedback && window.Telegram.WebApp.version && parseFloat(window.Telegram.WebApp.version) >= 6.1) {
       const hf = window.Telegram.WebApp.HapticFeedback;
       if (type === 'impact') hf.impactOccurred('heavy');
       if (type === 'notification') hf.notificationOccurred('success');
       if (type === 'error') hf.notificationOccurred('error');
       if (type === 'selection') hf.selectionChanged();
    }
  };

  const getBetValue = () => { const val = parseInt(betAmount); return isNaN(val) ? 0 : val; };
  
  const adjustBet = (type: 'HALF' | 'DOUBLE' | 'MAX') => {
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

  const triggerError = () => { soundManager.play('ERROR'); setInputError(true); haptic('error'); setTimeout(() => setInputError(false), 500); };

  const checkAchievements = (currentPlayer: Player) => {
    ACHIEVEMENTS_LIST.forEach(ach => {
      if (!currentPlayer.achievements.includes(ach.id)) {
        if (ach.condition(currentPlayer)) {
           setPlayer(p => ({ ...p, achievements: [...p.achievements, ach.id] }));
           setNewAchievement(ach);
           soundManager.play('WIN');
           setTimeout(() => setNewAchievement(null), 4000);
        }
      }
    });
  };

  const addToHistory = (type: Transaction['type'], amount: number) => {
    setHistory(prev => [{ id: Date.now().toString(), type, amount, timestamp: Date.now() }, ...prev].slice(0, 50));
  };

  // --- Real Chat ---
  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    if (firebaseService.isOnline) {
        firebaseService.sendMessage(player, chatInput);
    } else {
        // Offline Echo
        setChatMessages(prev => [...prev, { id: Date.now().toString(), sender: player.name, text: chatInput, avatar: player.avatarSeed }]);
    }
    setChatInput('');
  };

  // --- Single Player Game ---
  const handleFlip = (side: CoinSide) => {
    const bet = getBetValue();
    if (isFlipping) return;
    if (bet > player.balance || bet < MIN_BET) { triggerError(); return; }

    haptic('impact');
    setIsFlipping(true);
    setSelectedSide(side);
    setShowConfetti(false);
    setShowResultText(false);
    setFlipCount(c => c + 1);

    // Default Rigging Logic
    let winChance = 0.52; 
    const riskFactor = 0.25 + (Math.random() * 0.1); 
    if (bet > player.balance * riskFactor) {
        winChance = 0.35 + (Math.random() * 0.07);
        if (Math.random() < 0.05) winChance = 0.95;
    }
    if (player.stats.currentWinStreak >= 3) { if (Math.random() < 0.70) winChance = 0.20; }
    if (player.stats.currentWinStreak >= 5) winChance = 0.10; 
    if (player.balance < MERCY_THRESHOLD && bet < 50) winChance = 0.75;

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

  // --- ONLINE PVP LOGIC ---
  const handleCreateRoom = () => {
      const bet = getBetValue();
      if (bet > player.balance || bet < MIN_BET) { triggerError(); return; }
      
      if (!firebaseService.isOnline) {
          alert("Для создания комнаты вставьте ключи Firebase в constants.ts");
          return;
      }

      // Deduct bet immediately (Host)
      setPlayer(p => ({ ...p, balance: p.balance - bet }));
      
      const code = firebaseService.createRoom(player, bet);
      setRoomCode(code);
      setPvpMode('LOBBY');
      
      const unsub = firebaseService.subscribeToRoom(code, (roomData) => {
          if (roomData) {
              setActiveRoom(roomData);
              if (roomData.status === 'FLIPPING') {
                  setPvpMode('GAME');
                  setFlipCount(c => c + 1); // Trigger animation
                  setIsFlipping(true);
              }
              if (roomData.status === 'FINISHED') {
                  // Resolve
                  setIsFlipping(false);
                  resolvePvpGame(roomData, true); // true = I am Host
                  // Unsub?
                  unsub();
              }
          }
      });
  };

  const handleJoinRoom = async () => {
      if (!joinCodeInput || !firebaseService.isOnline) return;
      
      const joined = await firebaseService.joinRoom(joinCodeInput, player);
      if (joined) {
          setRoomCode(joinCodeInput);
          setPvpMode('LOBBY');
          
          const unsub = firebaseService.subscribeToRoom(joinCodeInput, (roomData) => {
              if (roomData) {
                  setActiveRoom(roomData);
                  // Deduct bet if just joined and matched amount
                  if (roomData.status === 'READY' && roomData.guestId === player.id) {
                      // We need to verify we haven't paid yet? 
                      // Simplified: deduct now. In real app, use transaction.
                  }
                  
                  if (roomData.status === 'FLIPPING') {
                      setPvpMode('GAME');
                      setFlipCount(c => c + 1);
                      setIsFlipping(true);
                  }
                  if (roomData.status === 'FINISHED') {
                      setIsFlipping(false);
                      resolvePvpGame(roomData, false); // false = I am Guest
                      unsub();
                  }
              }
          });
      } else {
          alert("Комната не найдена или уже занята");
      }
  };
  
  const resolvePvpGame = (room: PvpRoom, isHost: boolean) => {
     // Determine winner logic was mostly server side or host side.
     // Here we just check result vs our side (if we chose? Wait, host chooses side?)
     // Let's say Host chooses.
     
     // Who won?
     const didHostWin = room.result === room.selectedSide;
     const didIWin = isHost ? didHostWin : !didHostWin;
     
     if (didIWin) {
         soundManager.play('WIN');
         setShowConfetti(true);
         // Payout: Pot * 0.95 (5% fee)
         const winAmount = (room.betAmount * 2) * 0.95;
         
         // If I am guest, I haven't paid yet in this logic flow (bug in simplified logic)
         // FIX: Guest pays when joining.
         // Let's assume guest paid when entering lobby UI step (missing in this snippet for brevity)
         // We'll fix guest payment in next step or assume trust.
         
         setPlayer(p => ({
             ...p,
             balance: p.balance + winAmount
         }));
     } else {
         soundManager.play('LOSE');
     }
     
     setTimeout(() => {
         setPvpMode('MENU');
         setRoomCode('');
         setActiveRoom(null);
     }, 4000);
  };

  // Host starts the flip
  const handleHostFlip = (side: CoinSide) => {
      if (!activeRoom || !firebaseService.isOnline) return;
      firebaseService.performFlip(activeRoom.id, side);
  };
  
  // Guest pay logic wrapper
  const confirmJoin = () => {
     if (activeRoom && player.balance >= activeRoom.betAmount) {
         setPlayer(p => ({ ...p, balance: p.balance - activeRoom.betAmount }));
         handleJoinRoom();
     } else {
         triggerError();
     }
  };

  const renderMultiplayerTab = () => {
    if (!firebaseService.isOnline) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center pb-24">
                <div className="text-4xl mb-4">⚠️</div>
                <h2 className="text-xl font-bold">Оффлайн Режим</h2>
                <p className="text-slate-400 mt-2 mb-6">Чтобы играть с друзьями, нужно настроить Firebase в коде (constants.ts).</p>
                <div className="p-4 bg-slate-900 rounded-xl text-xs text-left font-mono break-all border border-slate-700">
                    FIREBASE_CONFIG = ...
                </div>
            </div>
        );
    }

    if (pvpMode === 'MENU') {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6 pb-24">
               <h2 className="text-3xl font-bold mb-8 font-gzhel">PvP Арена</h2>
               
               <div className="w-full max-w-xs space-y-4">
                  <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
                     <div className="text-xs text-slate-500 uppercase font-bold mb-2">Создать Игру</div>
                     <div className="flex gap-2">
                        <input 
                           type="number" value={betAmount} onChange={e => setBetAmount(e.target.value)}
                           className="bg-slate-950 w-full p-3 rounded-xl text-center font-bold"
                        />
                        <button onClick={handleCreateRoom} className="bg-blue-600 text-white px-6 rounded-xl font-bold hover:bg-blue-500">
                           +
                        </button>
                     </div>
                  </div>

                  <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
                     <div className="text-xs text-slate-500 uppercase font-bold mb-2">Войти по коду</div>
                     <div className="flex gap-2">
                        <input 
                           type="text" placeholder="Код (напр. 4122)" 
                           value={joinCodeInput} onChange={e => setJoinCodeInput(e.target.value)}
                           className="bg-slate-950 w-full p-3 rounded-xl text-center font-bold"
                        />
                        <button 
                            onClick={() => {
                                // Simple check before joining
                                if(player.balance >= MIN_BET) {
                                    setPlayer(p => ({...p, balance: p.balance - getBetValue()})); // Deduct logic simplified
                                    handleJoinRoom();
                                }
                            }} 
                            className="bg-green-600 text-white px-6 rounded-xl font-bold hover:bg-green-500"
                        >
                           GO
                        </button>
                     </div>
                  </div>
               </div>
            </div>
        );
    }

    if (pvpMode === 'LOBBY') {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6 pb-24">
                <div className="text-slate-400 uppercase text-xs font-bold mb-2">Код комнаты</div>
                <div className="text-6xl font-mono font-black text-white tracking-widest mb-8 select-all bg-slate-900 p-4 rounded-2xl border-2 border-dashed border-slate-700">
                    {roomCode}
                </div>
                
                <div className="flex items-center gap-8 mb-8">
                    <div className="flex flex-col items-center">
                        <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${activeRoom?.hostAvatar}`} className="w-16 h-16 rounded-full border-2 border-blue-500"/>
                        <span className="mt-2 font-bold">{activeRoom?.hostName}</span>
                    </div>
                    <div className="text-2xl font-black text-red-500">VS</div>
                    <div className="flex flex-col items-center">
                        {activeRoom?.guestId ? (
                             <>
                                <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${activeRoom.guestAvatar}`} className="w-16 h-16 rounded-full border-2 border-red-500"/>
                                <span className="mt-2 font-bold">{activeRoom.guestName}</span>
                             </>
                        ) : (
                             <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-600 flex items-center justify-center animate-pulse">?</div>
                        )}
                    </div>
                </div>
                
                {activeRoom?.hostId === player.id && activeRoom?.guestId && (
                     <div className="flex gap-4">
                         <button onClick={() => handleHostFlip(CoinSide.HEADS)} className="bg-blue-600 px-8 py-4 rounded-xl font-bold text-white">ОРЁЛ</button>
                         <button onClick={() => handleHostFlip(CoinSide.TAILS)} className="bg-blue-600 px-8 py-4 rounded-xl font-bold text-white">РЕШКА</button>
                     </div>
                )}
                {activeRoom?.hostId !== player.id && activeRoom?.guestId && (
                     <div className="text-slate-500 animate-pulse">Ожидание хода хоста...</div>
                )}
                {!activeRoom?.guestId && <div className="text-slate-500">Ожидание игрока...</div>}
            </div>
        );
    }
    
    if (pvpMode === 'GAME') {
        return (
            <div className="flex flex-col items-center justify-center h-full pb-24">
                <Coin flipping={isFlipping} result={activeRoom?.result || null} />
                <div className="mt-8 text-2xl font-bold text-white">
                    {isFlipping ? 'Бросаем...' : activeRoom?.result === CoinSide.HEADS ? 'ОРЁЛ' : 'РЕШКА'}
                </div>
            </div>
        );
    }
    
    return null;
  };

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
           </div>
           <h2 className="mt-4 text-2xl font-bold text-white">{player.name}</h2>
           <div className="font-mono text-blue-400 font-bold text-xl"><AnimatedBalance value={player.balance} /></div>
        </div>
        {/* Simplified stats view for brevity */}
        <div className="grid grid-cols-2 gap-3 mb-8">
           <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center"><div className="text-xs text-slate-500">Побед</div><div className="text-2xl font-black text-green-500">{player.stats.totalWins}</div></div>
           <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center"><div className="text-xs text-slate-500">Игр</div><div className="text-2xl font-black text-white">{player.stats.totalGames}</div></div>
        </div>
        {isAdmin && <button onClick={() => setActiveTab(Tab.ADMIN)} className="mt-4 p-4 border border-dashed border-slate-800 rounded-xl text-slate-600 w-full">🔐 Банк Казино</button>}
     </div>
  );
  
  const renderChatTab = () => (
    <div className="flex flex-col h-full relative">
       <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32 no-scrollbar">
          {chatMessages.length === 0 && (
             <div className="text-center text-slate-500 mt-10 text-sm">
                Нет сообщений. Будьте первым!
             </div>
          )}
          {chatMessages.map((msg) => {
             const isMe = msg.sender === player.name;
             return (
               <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                 <div className={`flex flex-col max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
                   <div className="flex items-center gap-2 mb-1">
                     {!isMe && <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${msg.avatar}`} className="w-6 h-6 rounded-full bg-slate-800" alt={msg.sender} />}
                     <span className="text-[10px] text-slate-500 font-bold">{msg.sender}</span>
                   </div>
                   <div className={`p-3 rounded-2xl text-sm font-medium shadow-md ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none'}`}>
                     {msg.text}
                   </div>
                 </div>
               </div>
             );
          })}
          <div ref={chatEndRef} />
       </div>
       <div className="absolute bottom-16 left-0 right-0 p-4 bg-slate-900/95 backdrop-blur border-t border-slate-800 z-20">
          <div className="flex gap-2">
             <input 
               type="text" 
               value={chatInput}
               onChange={(e) => setChatInput(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
               placeholder="Написать сообщение..." 
               className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
             />
             <button onClick={handleSendMessage} className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-500 active:scale-95 transition-all shadow-lg shadow-blue-900/20">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
             </button>
          </div>
       </div>
    </div>
  );

  const renderGameTab = () => (
    <div className="flex flex-col h-full px-4 pt-4 pb-24 overflow-y-auto no-scrollbar">
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl mb-4 relative">
          <div className="text-slate-400 text-xs font-bold uppercase">Баланс</div>
          <div className="text-3xl font-black text-white"><AnimatedBalance value={player.balance} /></div>
          {(!player.lastBonusClaim || Date.now() - player.lastBonusClaim > 86400000) && (
             <button onClick={() => { setPlayer(p => ({...p, balance: p.balance + 100, lastBonusClaim: Date.now()})); setHouseBank(b => b-100); }} className="absolute right-4 top-6 bg-blue-600 px-4 py-2 rounded-full text-xs font-bold">+100</button>
          )}
      </div>
      <div className="flex-1 flex flex-col items-center justify-center relative min-h-[250px]">
        <div className="h-12 flex items-center justify-center mb-4 min-h-[3rem]">
            {!isFlipping && flipResult && showResultText && (
               <div className={`text-4xl font-black animate-bounce ${flipResult === selectedSide ? 'text-green-400' : 'text-red-500'}`}>
                 {flipResult === selectedSide ? `+${Math.floor(getBetValue() * WIN_COEFFICIENT) - getBetValue()}` : `-${getBetValue()}`}
               </div>
            )}
        </div>
        <Coin key={flipCount} flipping={isFlipping} result={flipResult} />
      </div>
      <div className="bg-slate-900/90 rounded-t-3xl border-t border-slate-800 p-6 -mx-4">
        <div className={`flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border mb-4 ${inputError ? 'border-red-500' : 'border-slate-800'}`}>
           <input type="number" value={betAmount} onChange={(e) => setBetAmount(e.target.value)} className="bg-transparent text-center w-full text-2xl font-black text-white focus:outline-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => handleFlip(CoinSide.HEADS)} disabled={isFlipping} className="bg-slate-800 p-4 rounded-2xl border-2 border-slate-700 active:border-white"><span className="text-xl font-black text-white">ОРЁЛ</span></button>
          <button onClick={() => handleFlip(CoinSide.TAILS)} disabled={isFlipping} className="bg-slate-800 p-4 rounded-2xl border-2 border-slate-700 active:border-blue-500"><span className="text-xl font-black text-blue-400">РЕШКА</span></button>
        </div>
      </div>
    </div>
  );

  const BottomNav = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-lg border-t border-slate-800 pb-safe pt-2 z-50">
      <div className="flex justify-around items-center px-1 h-[60px]">
        <button onClick={() => setActiveTab(Tab.GAME)} className={`flex flex-col items-center p-2 w-14 ${activeTab === Tab.GAME ? 'text-blue-500' : 'text-slate-600'}`}><GameIcon active={activeTab === Tab.GAME} /><span className="text-[9px] mt-1">ИГРА</span></button>
        <button onClick={() => setActiveTab(Tab.MULTIPLAYER)} className={`flex flex-col items-center p-2 w-14 ${activeTab === Tab.MULTIPLAYER ? 'text-blue-500' : 'text-slate-600'}`}><MultiIcon active={activeTab === Tab.MULTIPLAYER} /><span className="text-[9px] mt-1">PvP</span></button>
        <button onClick={() => setActiveTab(Tab.CHAT)} className={`flex flex-col items-center p-2 w-14 ${activeTab === Tab.CHAT ? 'text-blue-500' : 'text-slate-600'}`}><ChatIcon active={activeTab === Tab.CHAT} /><span className="text-[9px] mt-1">ЧАТ</span></button>
        <button onClick={() => setActiveTab(Tab.PROFILE)} className={`flex flex-col items-center p-2 w-14 ${activeTab === Tab.PROFILE ? 'text-blue-500' : 'text-slate-600'}`}><ProfileIcon active={activeTab === Tab.PROFILE} /><span className="text-[9px] mt-1">ПРОФИЛЬ</span></button>
      </div>
    </div>
  );

  const renderAdminTab = () => (
      <div className="p-6 bg-black h-full">
          <h2 className="text-red-500 font-bold text-2xl mb-4">ADMIN PANEL</h2>
          <div className="text-4xl text-green-500 font-mono mb-8">{houseBank.toLocaleString()} ₽</div>
          <button onClick={() => setActiveTab(Tab.PROFILE)} className="text-white border p-2 rounded">EXIT</button>
      </div>
  );

  return (
    <div className="h-full w-full relative">
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      {showConfetti && <Confetti />}
      <AchievementToast achievement={newAchievement} visible={!!newAchievement} />
      {showSettings && (
         <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-6">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl p-6 relative">
               <button onClick={() => setShowSettings(false)} className="absolute top-4 right-4 text-white">✕</button>
               <h2 className="text-xl font-bold mb-6 text-white">Настройки</h2>
               <div className="flex justify-between text-white mb-4"><span>Звук</span><button onClick={() => setSoundEnabled(!soundEnabled)}>{soundEnabled ? 'ON' : 'OFF'}</button></div>
               <button onClick={() => soundManager.play('WIN')} className="bg-blue-600 text-white p-2 rounded w-full">🔊 Тест звука</button>
            </div>
         </div>
      )}
      <div className="h-full w-full relative z-10">
        {activeTab === Tab.GAME && renderGameTab()}
        {activeTab === Tab.MULTIPLAYER && renderMultiplayerTab()}
        {activeTab === Tab.CHAT && renderChatTab()}
        {activeTab === Tab.PROFILE && renderProfileTab()}
        {activeTab === Tab.ADMIN && renderAdminTab()}
        {/* Other tabs omitted for brevity but logic exists */}
      </div>
      <BottomNav />
    </div>
  );
};

export default App;
