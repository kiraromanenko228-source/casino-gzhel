
import { initializeApp } from 'firebase/app';
import { 
  getDatabase, 
  ref, 
  set, 
  push, 
  onValue, 
  update, 
  query,
  orderByChild,
  limitToLast,
  remove
} from 'firebase/database';
import { FIREBASE_CONFIG } from '../constants';
import { ChatMessage, PvpRoom, Player, CoinSide, Leader } from '../types';

class FirebaseService {
  private db: any = null;
  private isInitialized = false;

  constructor() {
    if (FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.databaseURL) {
      try {
        const app = initializeApp(FIREBASE_CONFIG);
        this.db = getDatabase(app);
        this.isInitialized = true;
      } catch (e) {
        console.error("Firebase init error", e);
      }
    }
  }

  get isOnline() {
    return this.isInitialized;
  }

  // --- USER SYNC & LEADERS ---
  updateUser(player: Player) {
    if (!this.db) return;
    const userRef = ref(this.db, `users/${player.id}`);
    update(userRef, {
      name: player.name,
      balance: player.balance,
      avatar: player.avatarSeed
    });
  }

  subscribeToLeaders(callback: (leaders: Leader[]) => void) {
    if (!this.db) {
        callback([]);
        return () => {};
    }

    const usersRef = ref(this.db, 'users');
    const topUsersQuery = query(usersRef, orderByChild('balance'), limitToLast(50));

    return onValue(topUsersQuery, (snapshot) => {
        const data = snapshot.val();
        if (!data) {
            callback([]);
            return;
        }
        
        const leaders: Leader[] = Object.values(data).map((u: any) => ({
            name: u.name || 'Unknown',
            balance: u.balance || 0,
            avatar: u.avatar || 'default'
        }));

        // FILTER OUT DEFAULT NAMES AND BOTS
        const filteredLeaders = leaders.filter(l => 
            l.name !== 'Игрок' && 
            !l.name.toLowerCase().includes('player') && 
            l.name !== 'Unknown' &&
            l.balance > 0
        );

        // Sort descending
        filteredLeaders.sort((a, b) => b.balance - a.balance);
        callback(filteredLeaders);
    });
  }

  // --- CHAT ---
  sendMessage(player: Player, text: string) {
    if (!this.db) return;
    const chatRef = ref(this.db, 'chat');
    const newMsgRef = push(chatRef);
    set(newMsgRef, {
      sender: player.name,
      avatar: player.avatarSeed,
      text: text,
      timestamp: Date.now()
    });
  }

  getChatRef() {
      if(!this.db) return null;
      return ref(this.db, 'chat');
  }

  // --- PVP ROOMS ---
  createRoom(host: Player, bet: number): string {
    if (!this.db) return '';
    const roomId = Math.floor(1000 + Math.random() * 9000).toString();
    const roomRef = ref(this.db, `rooms/${roomId}`);
    set(roomRef, {
        id: roomId,
        hostId: host.id,
        hostName: host.name,
        hostAvatar: host.avatarSeed,
        betAmount: bet,
        status: 'WAITING',
        createdAt: Date.now()
    });
    return roomId;
  }

  // Cancel room if waiting
  cancelRoom(roomId: string) {
    if (!this.db) return;
    const roomRef = ref(this.db, `rooms/${roomId}`);
    remove(roomRef);
  }

  async joinRoom(roomId: string, guest: Player): Promise<boolean> {
    if (!this.db) return false;
    const roomRef = ref(this.db, `rooms/${roomId}`);
    return new Promise((resolve) => {
        onValue(roomRef, (snapshot) => {
            const data = snapshot.val();
            if (data && data.status === 'WAITING') {
                update(roomRef, {
                    guestId: guest.id,
                    guestName: guest.name,
                    guestAvatar: guest.avatarSeed,
                    status: 'READY'
                });
                resolve(true);
            } else {
                resolve(false);
            }
        }, { onlyOnce: true });
    });
  }

  subscribeToRoom(roomId: string, callback: (room: PvpRoom | null) => void) {
      if (!this.db) return () => {};
      const roomRef = ref(this.db, `rooms/${roomId}`);
      return onValue(roomRef, (snapshot) => callback(snapshot.val()));
  }

  subscribeToLobby(callback: (rooms: PvpRoom[]) => void) {
      if (!this.db) return () => {};
      const roomsRef = ref(this.db, 'rooms');
      
      // Listen to all rooms and filter client side (simple for MVP)
      return onValue(roomsRef, (snapshot) => {
          const data = snapshot.val();
          if (!data) {
              callback([]);
              return;
          }
          const activeRooms: PvpRoom[] = Object.values(data);
          // Only show Waiting rooms
          const waiting = activeRooms.filter((r: any) => r.status === 'WAITING');
          // Sort by newest
          waiting.sort((a, b) => b.createdAt - a.createdAt);
          callback(waiting);
      });
  }

  performFlip(roomId: string, side: CoinSide) {
      if (!this.db) return;
      const isWin = Math.random() < 0.5;
      const result = isWin ? side : (side === CoinSide.HEADS ? CoinSide.TAILS : CoinSide.HEADS);
      const roomRef = ref(this.db, `rooms/${roomId}`);
      
      update(roomRef, {
          status: 'FLIPPING',
          selectedSide: side,
          result: result
      });
      
      setTimeout(() => {
          update(roomRef, { status: 'FINISHED' });
      }, 3000);
  }
}

export const firebaseService = new FirebaseService();
