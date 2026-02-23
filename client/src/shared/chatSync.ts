export interface ChatMessage {
    id: string;
    orderId: string;
    senderId: string; // The user ID sending the message
    senderRole: 'provider' | 'receiver';
    text: string;
    timestamp: number;
}

const CHAT_STORAGE_KEY = 'leftoverlink_chats';

export const chatSyncService = {
    getMessages: (orderId: string): ChatMessage[] => {
        try {
            const raw = localStorage.getItem(CHAT_STORAGE_KEY);
            if (!raw) return [];
            const allMessages: ChatMessage[] = JSON.parse(raw);
            return allMessages.filter(msg => msg.orderId === orderId).sort((a, b) => a.timestamp - b.timestamp);
        } catch (e) {
            console.error("Failed to parse chat messages", e);
            return [];
        }
    },

    sendMessage: (orderId: string, senderId: string, senderRole: 'provider' | 'receiver', text: string) => {
        try {
            const newMessage: ChatMessage = {
                id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                orderId,
                senderId,
                senderRole,
                text,
                timestamp: Date.now()
            };

            const raw = localStorage.getItem(CHAT_STORAGE_KEY);
            const allMessages: ChatMessage[] = raw ? JSON.parse(raw) : [];
            allMessages.push(newMessage);

            // Save to localStorage
            localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(allMessages));
            
            // To trigger effects in the same window (localStorage event only fires for OTHER windows)
            window.dispatchEvent(new CustomEvent('local-chat-update', { 
                detail: { orderId } 
            }));
            
            return newMessage;
        } catch (e) {
            console.error("Failed to save chat message", e);
            return null;
        }
    }
};
