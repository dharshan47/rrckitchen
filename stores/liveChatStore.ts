import { create } from 'zustand';
import { getActiveLiveChat, startLiveChatSession, sendChatMessage, getLiveChatMessages } from "@/actions/chat";

export interface LiveChatMessage {
  id: string;
  senderId: string | null;
  message: string;
  mediaUrls?: string[] | null;
  createdAt: string | Date;
}

export interface LiveChatSession {
  id: string;
  userId?: string | null;
  guestId?: string | null;
}

export interface LiveChatState {
  isOpen: boolean;
  activeTicketId: string | null;
  messages: LiveChatMessage[];
  sessionData: LiveChatSession | null;
  isLoading: boolean;
  isSending: boolean;
  openChat: () => void;
  closeChat: () => void;
  setActiveTicket: (id: string | null) => void;
  fetchSession: () => Promise<void>;
  startSession: () => Promise<void>;
  fetchMessages: (ticketId: string) => Promise<void>;
  sendMessage: (ticketId: string, text: string, mediaUrls?: string[]) => Promise<void>;
  receiveMessage: (msg: LiveChatMessage) => void;
}

export const useLiveChatStore = create<LiveChatState>((set) => ({
  isOpen: false,
  activeTicketId: null,
  messages: [],
  sessionData: null,
  isLoading: false,
  isSending: false,
  openChat: () => set({ isOpen: true }),
  closeChat: () => set({ isOpen: false }),
  setActiveTicket: (id) => set({ activeTicketId: id }),

  fetchSession: async () => {
    set({ isLoading: true });
    try {
      const res = await getActiveLiveChat();
      if (res.success && res.data) {
        set({ sessionData: res.data as LiveChatSession, activeTicketId: (res.data as { publicCode: string }).publicCode });
      } else {
        set({ sessionData: null, activeTicketId: null });
      }
    } catch (e) {
      console.error(e);
    } finally {
      set({ isLoading: false });
    }
  },

  startSession: async () => {
    set({ isLoading: true });
    try {
      const res = await startLiveChatSession();
      if (res.success && res.data) {
        set({ sessionData: res.data as LiveChatSession, activeTicketId: (res.data as { publicCode: string }).publicCode });
      }
    } catch (e) {
      console.error(e);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMessages: async (ticketId: string) => {
    try {
      const res = await getLiveChatMessages(ticketId);
      if (res.success) {
        set({ messages: (res.data || []) as LiveChatMessage[] });
      }
    } catch (e) {
      console.error(e);
    }
  },

  sendMessage: async (ticketId: string, text: string, mediaUrls?: string[]) => {
    const optimisticMsg = {
      id: `optimistic-${Date.now()}`,
      ticketId,
      senderId: "currentUser",
      message: text,
      mediaUrls: mediaUrls || [],
      createdAt: new Date().toISOString(),
    };

    // Optimistic Update
    set((state) => ({ 
      messages: [...state.messages, optimisticMsg],
      isSending: true
    }));

    try {
      const res = await sendChatMessage(ticketId, text, mediaUrls);
      if (res.success && res.data) {
        // Replace optimistic with real message if needed, or rely on Ably to fetch it
        // We'll replace it to be safe
        set((state) => ({
          messages: state.messages.map((m) => m.id === optimisticMsg.id ? (res.data as LiveChatMessage) : m),
          isSending: false
        }));
      } else {
        throw new Error("Send failed");
      }
    } catch (e) {
      console.error(e);
      // Revert optimistic update
      set((state) => ({
        messages: state.messages.filter((m) => m.id !== optimisticMsg.id),
        isSending: false
      }));
    }
  },

  receiveMessage: (msg: LiveChatMessage) => {
    set((state) => {
      if (state.messages.some((m) => m.id === msg.id)) return state;
      return { messages: [...state.messages, msg] };
    });
  }
}));
