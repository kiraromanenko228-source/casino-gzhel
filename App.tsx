
import React, { useState, useEffect, useRef } from 'react';
import { 
  Tab,
  Player, 
  CoinSide, 
  Transaction,
  ChatMessage,
  Leader,
  PvpRoom
} from './types';
import { 
  INITIAL_BALANCE, 
  WIN_COEFFICIENT,
  MIN_BET, 
  ANIMATION_DURATION_MS,
  SOUNDS,
  ACHIEVEMENTS_LIST,
  ADMIN_TELEGRAM_ID
} from './constants';
import { Coin } from './components/Coin';
import { soundManager } from './services/soundService';
import { firebaseService } from './services/firebaseService';
import { onValue } from 'firebase/database';

// --- ICONS ---
const GameIcon = ({ active }: { active: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
);
const MultiIcon = ({ active }: { active: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);
const ChatIcon = ({ active }: { active: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2-2z"/></svg>
);
const ProfileIcon = ({ active }: { active: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
const LeaderIcon = ({ active }: { active: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
);
const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
);

// --- HELPER COMPONENTS ---
const AchievementToast = ({ achievement, visible }: { achievement: any, visible: boolean }) => {
  if (!achievement) return null;
  return (
    <div className={`fixed top-4 left-4 right-4 z-[100] transition-all duration-500 transform ${visible ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'}`}>
       <div className="bg-slate-900 border border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.3)] rounded-2xl p-4 flex items-center gap-4">
          <div className="text-4xl animate-bounce">{achievement.icon}</div>
          <div>
             <div className="text-yellow-500 text-xs font-bold uppercase tracking-widest mb-1">Достижение!</div>
             <div className="text-white font-bold">{achievement.title}</div>
          </div>
       </div>
    </div>
  );
};

const AnimatedBalance = ({ value }: { value: number }) => {
  const [display, setDisplay] = useState(value);
  useEffect(() => { setDisplay(value); }, [value]);
  return <>{Math.floor(display).toLocaleString()} ₽</>;
};

const Confetti = () => {
  const pieces = Array.from({ length: 50 }).map((_, i) => {
    const style = {
      left: `${Math.random() * 100}%`,
      animationDuration: `${2 + Math.random() * 2}s`,
      animationDelay: `${Math.random() * 1}s`,
      backgroundColor: ['#fbbf24', '#3b82f6', '#ef4444', '#ffffff'][Math.floor(Math.random() * 4)]
    } as React.CSSProperties;
    return <div key={i} className="confetti" style={style} />;
  });
  return <div className="fixed inset-0 pointer-events-none overflow-hidden z-[60]">{pieces}</div>;
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.GAME);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [player, setPlayer] = useState<Player>({
    id: 'user-' + Math.floor(Math.random()*10000),
    name: 'Игрок',
    balance: INITIAL_BALANCE,
    avatarSeed: 'hero',
    stats: { totalWins: 0, totalGames: 0, currentWinStreak: 0, maxWinStreak: 0, maxBet: 0, bonusStreak: 0 },
    achievements: []
  });

  const [houseBank, setHouseBank] = useState<number>(0);
  const [betAmount, setBetAmount] = useState<string>('100');
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipResult, setFlipResult] = useState<CoinSide | null>(null);
  const [selectedSide, setSelectedSide] = useState<CoinSide | null>(null);
  const [flipCount, setFlipCount] = useState(0); 
  const [newAchievement, setNewAchievement] = useState<any>(null);

  // Online State
  const [pvpMode, setPvpMode] = useState<'MENU' | 'CREATE' | 'JOIN' | 'LOBBY' | 'GAME'>('MENU');
  const [roomCode, setRoomCode] = useState('');
  const [activeRoom, setActiveRoom] = useState<PvpRoom | null>(null);
  const [pvpResult, setPvpResult] = useState<'WIN' | 'LOSS' | null>(null);
  const [lobbyRooms, setLobbyRooms] = useState<PvpRoom[]>([]);
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleGlobalClick = () => {
    soundManager.unlockAudio();
  };

  useEffect(() => {
    // 1. INIT SOUNDS
    soundManager.loadAll();
    
    // 2. INIT TELEGRAM
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      const tgUser = window.Telegram.WebApp.initDataUnsafe?.user;
      if (tgUser) {
        // String conversion is crucial for reliable ID checking
        if (String(tgUser.id) === String(ADMIN_TELEGRAM_ID)) setIsAdmin(true);
        setPlayer(prev => ({
           ...prev,
           id: tgUser.id.toString(),
           name: tgUser.first_name || prev.name,
           avatarSeed: tgUser.id.toString()
        }));
      }
    }
    
    // 3. LOAD LOCAL DATA
    const savedPlayer = localStorage.getItem('gzhel_player');
    const savedBank = localStorage.getItem('gzhel_bank');
    if (savedPlayer) setPlayer(JSON.parse(savedPlayer));
    if (savedBank) setHouseBank(parseFloat(savedBank));
    
    // 4. CHAT SYNC
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
                        avatar: data[key].avatar
                    }));
                    setChatMessages(msgs.slice(-50));
                    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
                }
            });
        }
    }

    // 5. LEADERS SYNC
    firebaseService.subscribeToLeaders(setLeaders);
    
    // 6. LOBBY SYNC
    firebaseService.subscribeToLobby(setLobbyRooms);

    setIsLoaded(true);
  }, []);

  // Save State
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('gzhel_player', JSON.stringify(player));
    localStorage.setItem('gzhel_bank', houseBank.toString());
    // Sync balance to Firebase for leaderboard
    if (firebaseService.isOnline) {
        firebaseService.updateUser(player);
    }
  }, [player, houseBank, isLoaded]);

  const haptic = (type: 'impact' | 'notification' | 'error') => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
       if (type === 'impact') window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
       if (type === 'notification') window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
       if (type === 'error') window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
    }
  };

  const getBetValue = () => parseInt(betAmount) || 0;

  const handleFlip = (side: CoinSide) => {
    const bet = getBetValue();
    if (isFlipping) return;
    if (bet > player.balance || bet < MIN_BET) { soundManager.play('ERROR'); return; }

    haptic('impact');
    setIsFlipping(true);
    setSelectedSide(side);
    setFlipCount(c => c + 1);

    // Simple Logic for demo
    const isWin = Math.random() < 0.48; // Slight House Edge
    const resultSide = isWin ? side : (side === CoinSide.HEADS ? CoinSide.TAILS : CoinSide.HEADS);
    setFlipResult(resultSide);

    setTimeout(() => {
      soundManager.play('COIN_LAND');
      if (isWin) {
          const profit = Math.floor(bet * WIN_COEFFICIENT) - bet;
          setPlayer(p => ({ ...p, balance: p.balance + profit, stats: {...p.stats, totalWins: p.stats.totalWins + 1} }));
          setHouseBank(b => b - profit);
          soundManager.play('WIN');
          haptic('notification');
      } else {
          setPlayer(p => ({ ...p, balance: p.balance - bet }));
          setHouseBank(b => b + bet);
          soundManager.play('LOSE');
          haptic('error');
      }
      setIsFlipping(false);
    }, ANIMATION_DURATION_MS);
  };
  
  // PVP Handlers
  const handleCreateRoom = () => {
      const bet = getBetValue();
      if (bet > player.balance || bet < MIN_BET) return;
      setPlayer(p => ({ ...p, balance: p.balance - bet }));
      const code = firebaseService.createRoom(player, bet);
      setRoomCode(code);
      setPvpMode('LOBBY');
      subscribeToRoomUpdates(code);
  };

  const handleJoinRoom = async (room: PvpRoom) => {
      if (player.balance < room.betAmount) { soundManager.play('ERROR'); return; }
      const success = await firebaseService.joinRoom(room.id, player);
      if (success) {
          setPlayer(p => ({ ...p, balance: p.balance - room.betAmount }));
          setRoomCode(room.id);
          setPvpMode('LOBBY');
          subscribeToRoomUpdates(room.id);
      }
  };

  const subscribeToRoomUpdates = (code: string) => {
      const unsub = firebaseService.subscribeToRoom(code, (roomData) => {
          if (roomData) {
              setActiveRoom(roomData);
              if (roomData.status === 'FLIPPING') { setPvpMode('GAME'); setFlipCount(c => c+1); setIsFlipping(true); }
              if (roomData.status === 'FINISHED') { setIsFlipping(false); resolvePvpGame(roomData, roomData.hostId === player.id); unsub(); }
          } else {
              // Room deleted or invalid
              setPvpMode('MENU');
              unsub();
          }
      });
  };

  const handleCancelRoom = () => {
      if (activeRoom && activeRoom.hostId === player.id) {
          firebaseService.cancelRoom(activeRoom.id);
          // Return money
          setPlayer(p => ({ ...p, balance: p.balance + activeRoom.betAmount }));
          setPvpMode('MENU');
          setActiveRoom(null);
      }
  };
  
  const resolvePvpGame = (room: PvpRoom, isHost: boolean) => {
      const didHostWin = room.result === room.selectedSide;
      const didIWin = isHost ? didHostWin : !didHostWin;
      if (didIWin) {
          const winAmount = (room.betAmount * 2) * 0.95;
          setPlayer(p => ({...p, balance: p.balance + winAmount}));
          soundManager.play('WIN');
          setPvpResult('WIN');
      } else {
          soundManager.play('LOSE');
          setPvpResult('LOSS');
      }
      setTimeout(() => { 
          setPvpMode('MENU'); 
          setActiveRoom(null); 
          setPvpResult(null);
      }, 5000); // 5 seconds to enjoy the victory screen
  };

  const renderGameTab = () => (
    <div className="flex flex-col h-full p-2 overflow-y-auto no-scrollbar pb-[80px]">
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 flex justify-between items-center mb-4 shrink-0">
          <div>
            <div className="text-slate-500 text-[10px] uppercase font-bold">Баланс</div>
            <div className="text-3xl font-black text-white"><AnimatedBalance value={player.balance} /></div>
          </div>
          <button onClick={() => setPlayer(p => ({...p, balance: p.balance + 100}))} className="bg-blue-900/50 text-blue-300 px-3 py-1 rounded-full text-xs font-bold">+100</button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center relative min-h-[250px]">
        <Coin key={flipCount} flipping={isFlipping} result={flipResult} />
      </div>
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 mt-auto shrink-0">
        <div className="flex items-center bg-slate-950 rounded-xl border border-slate-800 mb-3 px-3">
           <span className="text-slate-500 font-bold">₽</span>
           <input type="number" value={betAmount} onChange={(e) => setBetAmount(e.target.value)} className="bg-transparent text-center w-full text-xl font-black text-white p-3 focus:outline-none" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => handleFlip(CoinSide.HEADS)} disabled={isFlipping} className="bg-slate-800 p-4 rounded-xl border-2 border-slate-700 active:border-white font-black text-white">ОРЁЛ</button>
          <button onClick={() => handleFlip(CoinSide.TAILS)} disabled={isFlipping} className="bg-slate-800 p-4 rounded-xl border-2 border-slate-700 active:border-blue-500 font-black text-blue-400">РЕШКА</button>
        </div>
      </div>
    </div>
  );

  const renderLeadersTab = () => (
    <div className="flex flex-col h-full p-4 overflow-y-auto pb-[80px]">
       <h2 className="text-2xl font-gzhel text-white mb-6">Топ Игроков</h2>
       <div className="space-y-3">
          {leaders.map((leader, idx) => (
             <div key={idx} className="flex items-center bg-slate-900 p-3 rounded-xl border border-slate-800">
                <div className={`w-8 h-8 flex items-center justify-center font-black rounded-full mr-3 ${idx === 0 ? 'bg-yellow-500 text-black' : idx === 1 ? 'bg-slate-400 text-black' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-500'}`}>{idx + 1}</div>
                <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${leader.avatar}`} className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 mr-3" />
                <div className="flex-1 font-bold text-white">{leader.name}</div>
                <div className="font-mono text-blue-400">{leader.balance.toLocaleString()} ₽</div>
             </div>
          ))}
       </div>
    </div>
  );

  const renderChatTab = () => (
    <div className="flex flex-col h-full pb-[60px]">
       <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {chatMessages.map((msg) => (
               <div key={msg.id} className={`flex ${msg.sender === player.name ? 'justify-end' : 'justify-start'}`}>
                 <div className={`p-3 rounded-2xl max-w-[80%] text-sm ${msg.sender === player.name ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-200'}`}>
                   <div className="font-bold text-[10px] opacity-70 mb-1">{msg.sender}</div>
                   {msg.text}
                 </div>
               </div>
          ))}
          <div ref={chatEndRef} />
       </div>
       <div className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
           <input value={chatInput} onChange={e => setChatInput(e.target.value)} className="flex-1 bg-slate-950 p-3 rounded-xl text-white" placeholder="Сообщение..." />
           <button onClick={() => { if(chatInput) { firebaseService.sendMessage(player, chatInput); setChatInput(''); } }} className="bg-blue-600 text-white p-3 rounded-xl">→</button>
       </div>
    </div>
  );
  
  const renderMultiplayerTab = () => {
    // Helper to calculate win amounts for display
    const potentialWin = Math.floor((activeRoom?.betAmount || 0) * 1.9);
    const lossAmount = activeRoom?.betAmount || 0;
    
    // Determine opponent info for Result Screen
    const isHost = activeRoom?.hostId === player.id;
    const opponentName = isHost ? activeRoom?.guestName : activeRoom?.hostName;
    const opponentAvatar = isHost ? activeRoom?.guestAvatar : activeRoom?.hostAvatar;

    return (
      <div className="flex flex-col h-full items-center justify-start p-4 pb-[80px] relative w-full overflow-hidden">
        {pvpMode === 'MENU' && (
            <div className="w-full flex flex-col h-full">
               <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 mb-4 shrink-0">
                  <h3 className="text-lg font-bold text-white mb-2 text-center">Создать Игру</h3>
                  <div className="flex gap-2">
                     <input type="number" value={betAmount} onChange={e => setBetAmount(e.target.value)} className="bg-slate-950 w-full p-3 rounded-xl text-center font-bold text-white" placeholder="Ставка" />
                     <button onClick={handleCreateRoom} className="bg-blue-600 text-white px-6 rounded-xl font-bold whitespace-nowrap">СОЗДАТЬ</button>
                  </div>
               </div>
               
               <div className="flex-1 overflow-y-auto no-scrollbar">
                   <h3 className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">Активные Столы</h3>
                   {lobbyRooms.length === 0 ? (
                       <div className="text-center text-slate-600 mt-10 p-10 border-2 border-dashed border-slate-800 rounded-2xl">
                           Нет активных игр. <br/> Создай свою!
                       </div>
                   ) : (
                       <div className="space-y-3">
                           {lobbyRooms.map(room => (
                               <div key={room.id} className="bg-slate-800/50 p-3 rounded-2xl border border-slate-700 flex items-center justify-between">
                                   <div className="flex items-center gap-3">
                                       <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${room.hostAvatar}`} className="w-10 h-10 rounded-full bg-slate-900" />
                                       <div>
                                           <div className="font-bold text-white text-sm">{room.hostName}</div>
                                           <div className="text-blue-400 font-mono text-xs">{room.betAmount} ₽</div>
                                       </div>
                                   </div>
                                   {room.hostId !== player.id && (
                                       <button onClick={() => handleJoinRoom(room)} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm">ИГРАТЬ</button>
                                   )}
                                   {room.hostId === player.id && (
                                        <div className="text-xs text-yellow-500 font-bold px-3 py-1 bg-yellow-500/10 rounded-lg">Ваша игра</div>
                                   )}
                               </div>
                           ))}
                       </div>
                   )}
               </div>
            </div>
        )}
        {pvpMode === 'LOBBY' && (
            <div className="flex flex-col items-center justify-center h-full w-full">
                <div className="text-slate-400 mb-2 uppercase tracking-widest text-xs">Ожидание соперника...</div>
                
                <div className="flex items-center justify-center gap-6 mb-12 scale-90 sm:scale-100">
                    <div className="flex flex-col items-center relative">
                        <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${activeRoom?.hostAvatar}`} className="w-20 h-20 rounded-full border-4 border-blue-500 bg-slate-900 shadow-[0_0_30px_rgba(59,130,246,0.5)]"/>
                        <div className="mt-3 font-bold text-white">{activeRoom?.hostName}</div>
                        {activeRoom?.hostId === player.id && <div className="absolute -top-2 -right-2 bg-blue-600 text-[10px] px-2 py-1 rounded text-white font-bold">ВЫ</div>}
                    </div>
                    <div className="text-4xl font-black text-slate-700 italic">VS</div>
                    <div className="flex flex-col items-center relative">
                        {activeRoom?.guestId ? (
                            <>
                             <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${activeRoom.guestAvatar}`} className="w-20 h-20 rounded-full border-4 border-red-500 bg-slate-900 shadow-[0_0_30px_rgba(239,68,68,0.5)] animate-pop-in"/>
                             <div className="mt-3 font-bold text-white">{activeRoom.guestName}</div>
                             {activeRoom?.guestId === player.id && <div className="absolute -top-2 -right-2 bg-blue-600 text-[10px] px-2 py-1 rounded text-white font-bold">ВЫ</div>}
                            </>
                        ) : (
                            <div className="w-20 h-20 rounded-full border-4 border-dashed border-slate-700 flex items-center justify-center animate-pulse bg-slate-900">
                                <span className="text-slate-500 font-bold text-2xl">?</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* GAME CONTROLS FOR HOST */}
                {activeRoom?.hostId === player.id && activeRoom?.guestId && (
                    <div className="animate-fade-in-up w-full max-w-xs">
                        <div className="text-center text-slate-400 text-xs mb-4">Выберите сторону, чтобы начать</div>
                        <div className="flex gap-3">
                            <button onClick={() => firebaseService.performFlip(activeRoom.id, CoinSide.HEADS)} className="flex-1 bg-slate-800 border-2 border-slate-600 hover:border-blue-500 active:bg-blue-600 py-4 rounded-xl font-black text-white transition-all">ОРЁЛ</button>
                            <button onClick={() => firebaseService.performFlip(activeRoom.id, CoinSide.TAILS)} className="flex-1 bg-slate-800 border-2 border-slate-600 hover:border-blue-500 active:bg-blue-600 py-4 rounded-xl font-black text-white transition-all">РЕШКА</button>
                        </div>
                    </div>
                )}

                {/* CANCEL BUTTON FOR HOST IF WAITING */}
                {activeRoom?.hostId === player.id && !activeRoom?.guestId && (
                     <button onClick={handleCancelRoom} className="mt-8 text-red-500 text-sm border border-red-900/50 px-4 py-2 rounded-lg hover:bg-red-900/20">Отменить игру</button>
                )}
            </div>
        )}
        {pvpMode === 'GAME' && (
             <div className="flex flex-col items-center justify-center relative w-full h-full">
                 <Coin flipping={isFlipping} result={activeRoom?.result || null} />
                 {!isFlipping && !pvpResult && <div className="text-3xl font-black text-white mt-8">{activeRoom?.result === CoinSide.HEADS ? 'ОРЁЛ' : 'РЕШКА'}</div>}
                 
                 {/* SPECTACULAR RESULT OVERLAY */}
                 {pvpResult && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 animate-fade-in backdrop-blur-md">
                       {/* Background Burst */}
                       <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black pointer-events-none"></div>
                       {pvpResult === 'WIN' && <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-500/20 via-transparent to-transparent animate-pulse-glow pointer-events-none"></div>}
                       {pvpResult === 'WIN' && <Confetti />}

                       {/* Content */}
                       <div className="z-10 flex flex-col items-center animate-pop-in">
                           <div className={`text-6xl md:text-8xl font-black mb-6 tracking-tighter ${pvpResult === 'WIN' ? 'text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-[0_0_25px_rgba(234,179,8,0.8)]' : 'text-slate-500'}`}>
                               {pvpResult === 'WIN' ? 'ПОБЕДА!' : 'ПОРАЖЕНИЕ'}
                           </div>

                           <div className="flex items-center gap-8 mb-8">
                               {/* My Avatar */}
                               <div className="flex flex-col items-center">
                                   <div className={`relative p-1 rounded-full ${pvpResult === 'WIN' ? 'bg-gradient-to-tr from-yellow-400 to-yellow-600 animate-pulse-glow shadow-[0_0_30px_rgba(234,179,8,0.6)]' : 'bg-slate-700 grayscale opacity-70'}`}>
                                       <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${player.avatarSeed}`} className="w-20 h-20 rounded-full bg-slate-900" />
                                       {pvpResult === 'WIN' && <div className="absolute -bottom-2 -right-2 text-3xl">👑</div>}
                                   </div>
                                   <div className="mt-2 font-bold text-white">Вы</div>
                               </div>

                               <div className="text-2xl font-black text-slate-600">VS</div>

                               {/* Opponent Avatar */}
                               <div className="flex flex-col items-center">
                                   <div className={`relative p-1 rounded-full ${pvpResult === 'LOSS' ? 'bg-gradient-to-tr from-yellow-400 to-yellow-600 shadow-[0_0_30px_rgba(234,179,8,0.6)]' : 'bg-slate-700 grayscale opacity-70'}`}>
                                       <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${opponentAvatar}`} className="w-20 h-20 rounded-full bg-slate-900" />
                                       {pvpResult === 'LOSS' && <div className="absolute -bottom-2 -right-2 text-3xl">👑</div>}
                                   </div>
                                   <div className="mt-2 font-bold text-slate-400">{opponentName || 'Соперник'}</div>
                               </div>
                           </div>
                           
                           <div className={`text-5xl md:text-7xl font-mono font-black ${pvpResult === 'WIN' ? 'text-green-400 drop-shadow-lg' : 'text-red-500'}`}>
                               {pvpResult === 'WIN' ? `+ ${potentialWin.toLocaleString()} ₽` : `- ${lossAmount.toLocaleString()} ₽`}
                           </div>
                       </div>
                    </div>
                 )}
             </div>
        )}
      </div>
  )};

  const renderProfileTab = () => (
    <div className="flex flex-col h-full p-4 overflow-y-auto pb-[80px]">
       <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col items-center mb-4 relative">
          <button onClick={() => setShowSettings(true)} className="absolute top-4 right-4 text-slate-400"><SettingsIcon/></button>
          <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${player.avatarSeed}`} className="w-24 h-24 rounded-full bg-slate-800 border-4 border-blue-900 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-1">{player.name}</h2>
          <div className="text-blue-400 font-mono text-xl">{player.balance.toLocaleString()} ₽</div>
       </div>
       
       {/* CASINO BANK (ADMIN ONLY) */}
       {isAdmin && (
           <div className="bg-slate-950 p-4 rounded-2xl border border-red-900/50 mb-4">
              <div className="text-red-500 text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                 <span>🔒 АДМИН ПАНЕЛЬ</span>
              </div>
              <div className="flex justify-between items-end">
                 <div>
                    <div className="text-slate-400 text-xs">Банк Казино</div>
                    <div className="text-2xl font-black text-white">{houseBank.toLocaleString()} ₽</div>
                 </div>
                 <button onClick={() => setHouseBank(0)} className="text-xs text-red-500 border border-red-900 px-2 py-1 rounded">Сброс</button>
              </div>
           </div>
       )}

       {/* Achievements */}
       <div className="space-y-2">
          {ACHIEVEMENTS_LIST.map(ach => {
              const unlocked = player.achievements.includes(ach.id);
              return (
                  <div key={ach.id} className={`p-3 rounded-xl border flex gap-3 ${unlocked ? 'bg-slate-900 border-yellow-500/30' : 'bg-slate-900/50 border-slate-800 opacity-50 grayscale'}`}>
                      <div className="text-2xl">{ach.icon}</div>
                      <div>
                          <div className="text-white font-bold text-sm">{ach.title}</div>
                          <div className="text-slate-500 text-xs">{ach.description}</div>
                      </div>
                  </div>
              )
          })}
       </div>
    </div>
  );

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-[#020617]" onClick={handleGlobalClick}>
      {showSettings && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-700 w-full max-w-xs rounded-2xl p-6">
                  <h2 className="text-white font-bold text-xl mb-4">Настройки</h2>
                  <div className="flex justify-between text-white mb-6">
                      <span>Звук</span>
                      <button onClick={() => setSoundEnabled(!soundEnabled)} className="font-bold text-blue-400">{soundEnabled ? 'ВКЛ' : 'ВЫКЛ'}</button>
                  </div>
                  <div className="mb-6">
                     <button onClick={() => soundManager.play('WIN')} className="text-xs bg-slate-800 text-blue-400 px-3 py-2 rounded-lg border border-slate-700 hover:border-blue-500 w-full">🔊 Тест звука</button>
                  </div>
                  <button onClick={() => setShowSettings(false)} className="w-full bg-slate-800 text-white p-3 rounded-xl">Закрыть</button>
              </div>
          </div>
      )}
      <div className="flex-1 relative overflow-hidden">
        {activeTab === Tab.GAME && renderGameTab()}
        {activeTab === Tab.MULTIPLAYER && renderMultiplayerTab()}
        {activeTab === Tab.LEADERS && renderLeadersTab()}
        {activeTab === Tab.CHAT && renderChatTab()}
        {activeTab === Tab.PROFILE && renderProfileTab()}
      </div>
      <div className="h-[70px] bg-slate-900 border-t border-slate-800 flex justify-around items-center shrink-0">
          <button onClick={() => setActiveTab(Tab.GAME)} className={`flex flex-col items-center w-14 ${activeTab===Tab.GAME ? 'text-blue-500':'text-slate-600'}`}><GameIcon active={activeTab===Tab.GAME}/><span className="text-[9px] font-bold mt-1">ИГРА</span></button>
          <button onClick={() => setActiveTab(Tab.MULTIPLAYER)} className={`flex flex-col items-center w-14 ${activeTab===Tab.MULTIPLAYER ? 'text-blue-500':'text-slate-600'}`}><MultiIcon active={activeTab===Tab.MULTIPLAYER}/><span className="text-[9px] font-bold mt-1">PvP</span></button>
          <button onClick={() => setActiveTab(Tab.LEADERS)} className={`flex flex-col items-center w-14 ${activeTab===Tab.LEADERS ? 'text-blue-500':'text-slate-600'}`}><LeaderIcon active={activeTab===Tab.LEADERS}/><span className="text-[9px] font-bold mt-1">ТОП</span></button>
          <button onClick={() => setActiveTab(Tab.CHAT)} className={`flex flex-col items-center w-14 ${activeTab===Tab.CHAT ? 'text-blue-500':'text-slate-600'}`}><ChatIcon active={activeTab===Tab.CHAT}/><span className="text-[9px] font-bold mt-1">ЧАТ</span></button>
          <button onClick={() => setActiveTab(Tab.PROFILE)} className={`flex flex-col items-center w-14 ${activeTab===Tab.PROFILE ? 'text-blue-500':'text-slate-600'}`}><ProfileIcon active={activeTab===Tab.PROFILE}/><span className="text-[9px] font-bold mt-1">Я</span></button>
      </div>
    </div>
  );
};

export default App;
