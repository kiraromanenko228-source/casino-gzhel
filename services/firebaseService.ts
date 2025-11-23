
import { initializeApp } from 'firebase/app';
import { 
  getDatabase, 
  ref, 
  set, 
  push, 
  onValue, 
  update, 
  off,
  DataSnapshot
} from 'firebase/database';
import { FIREBASE_CONFIG } from '../constants';
import { ChatMessage, PvpRoom, Player, CoinSide } from '../types';

class FirebaseService {
  private db: any = null;
  private isInitialized = false;

  constructor() {
    // Only initialize if config is present and valid
    if (FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.databaseURL) {
      try {
        const app = initializeApp(FIREBASE_CONFIG);
        this.db = getDatabase(app);
        this.isInitialized = true;
        console.log("🔥 Firebase initialized successfully");
      } catch (e) {
        console.error("Firebase init error", e);
      }
    } else {
        console.log("⚠️ Firebase keys missing. Running in Offline Mode.");
    }
  }

  get isOnline() {
    return this.isInitialized;
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

  listenToChat(callback: (msg: ChatMessage) => void) {
    if (!this.db) return;
    const chatRef = ref(this.db, 'chat');
    // Listen for new messages
    onValue(chatRef, (snapshot) => {
       const data = snapshot.val();
       if (!data) return;
       // We usually get all messages, but for simplicity we assume the UI handles the list
       // Here we might just want the latest? 
       // Better approach: Get all and format them
       const messages: ChatMessage[] = Object.keys(data).map(key => ({
           id: key,
           sender: data[key].sender,
           text: data[key].text,
           avatar: data[key].avatar,
           timestamp: data[key].timestamp
       }));
       // We pass the full array to the callback? 
       // Actually let's just expose a way to get the array or just bind it in App
    });
  }
  
  // Retrieve the full list ref for binding in App.tsx
  getChatRef() {
      if(!this.db) return null;
      return ref(this.db, 'chat');
  }

  // --- PVP ROOMS ---
  
  // Create a room (Host)
  createRoom(host: Player, bet: number): string {
    if (!this.db) return '';
    // Generate a simple 4 digit code
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

  // Join a room (Guest)
  async joinRoom(roomId: string, guest: Player): Promise<boolean> {
    if (!this.db) return false;
    const roomRef = ref(this.db, `rooms/${roomId}`);
    
    return new Promise((resolve) => {
        // Read once to check if exists
        onValue(roomRef, (snapshot) => {
            const data = snapshot.val();
            if (data && data.status === 'WAITING') {
                // Update room
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

  // Listen to room updates
  subscribeToRoom(roomId: string, callback: (room: PvpRoom | null) => void) {
      if (!this.db) return () => {};
      const roomRef = ref(this.db, `rooms/${roomId}`);
      const unsub = onValue(roomRef, (snapshot) => {
          callback(snapshot.val());
      });
      return unsub; // Return unsubscribe function
  }

  // Host flips the coin
  performFlip(roomId: string, side: CoinSide) {
      if (!this.db) return;
      
      // Determine winner immediately on server-side logic (here simulated by Host)
      const isWin = Math.random() < 0.5;
      const result = isWin ? side : (side === CoinSide.HEADS ? CoinSide.TAILS : CoinSide.HEADS);
      
      // Winner ID?
      // We need to fetch current room state, but we know Host is flipping
      // Let's assume we update status to FLIPPING then RESULT
      
      const roomRef = ref(this.db, `rooms/${roomId}`);
      
      update(roomRef, {
          status: 'FLIPPING',
          selectedSide: side,
          result: result
      });
      
      // After animation delay, set to FINISHED
      setTimeout(() => {
          update(roomRef, {
              status: 'FINISHED'
          });
      }, 3000); // 3s animation
  }
}

export const firebaseService = new FirebaseService();
