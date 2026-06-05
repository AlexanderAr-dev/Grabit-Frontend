import { ConversationResp, MessageResp } from '../types/chat';
import { API_URL, api } from './instance';

interface ConversationsParams {
  page?: number;
  page_size?: number;
  listing_id?: string;
}

interface MessagesParams {
  limit?: number;
  before?: string;
  after?: string;
}

export class chatService {
  static async getConversations(params?: ConversationsParams): Promise<{ items: ConversationResp[]; has_more: boolean }> {
    const response = await api.get<{ ok: boolean; data: { items: ConversationResp[]; has_more: boolean } }>(
      '/chat/conversations',
      { params },
    );
    return response.data.data;
  }

  static async createOrGetConversation(listingId: string): Promise<ConversationResp> {
    const response = await api.post<{ ok: boolean; data: ConversationResp }>(
      '/chat/conversations',
      { listing_id: listingId },
    );
    return response.data.data;
  }

  static async getMessages(conversationId: string, params?: MessagesParams): Promise<{ items: MessageResp[]; has_more: boolean }> {
    const response = await api.get<{ ok: boolean; data: { items: MessageResp[]; has_more: boolean } }>(
      `/chat/conversations/${conversationId}/messages`,
      { params },
    );
    return response.data.data;
  }

  static async sendMessage(conversationId: string, content: string): Promise<MessageResp> {
    const response = await api.post<{ ok: boolean; data: MessageResp }>(
      `/chat/conversations/${conversationId}/messages`,
      { content },
    );
    return response.data.data;
  }

  static async markAsRead(conversationId: string, lastMessageId: string): Promise<{ new_unread_count: number }> {
    const response = await api.post<{ ok: boolean; data: { new_unread_count: number } }>(
      `/chat/conversations/${conversationId}/read`,
      { last_message_id: lastMessageId },
    );
    return response.data.data;
  }

  static async deleteMessage(conversationId: string, messageId: string): Promise<void> {
    await api.delete(`/chat/conversations/${conversationId}/messages/${messageId}`);
  }

  static async editMessage(conversationId: string, messageId: string, content: string): Promise<MessageResp> {
    const response = await api.patch<{ ok: boolean; data: MessageResp }>(
      `/chat/conversations/${conversationId}/messages/${messageId}`,
      { content },
    );
    return response.data.data;
  }

  static async getUnreadCount(): Promise<number> {
    const response = await api.get<{ ok: boolean; data: { count: number } }>('/chat/unread-count');
    return response.data.data.count;
  }

  static async getBlockedUsers(): Promise<string[]> {
    const response = await api.get<{ ok: boolean; data: { user_ids: string[] } }>('/chat/users/blocked');
    return response.data.data.user_ids ?? [];
  }

  static async muteConversation(conversationId: string): Promise<void> {
    await api.post(`/chat/conversations/${conversationId}/mute`);
  }

  static async unmuteConversation(conversationId: string): Promise<void> {
    await api.delete(`/chat/conversations/${conversationId}/mute`);
  }

  static async blockUser(userId: string): Promise<void> {
    await api.post(`/chat/users/${userId}/block`);
  }

  static async unblockUser(userId: string): Promise<void> {
    await api.delete(`/chat/users/${userId}/block`);
  }

  static getChatWsUrl(conversationId: string): string {
    const wsBase = API_URL.replace(/^https/, 'wss').replace(/^http(?!s)/, 'ws');
    return `${wsBase}/chat/conversations/${conversationId}/ws`;
  }
}
