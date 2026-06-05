export interface MessageResp {
  message_id: string;
  conversation_id: string;
  sender_id: string;
  message_type: 0 | 1;
  event_type?: string;
  content: string;
  reference_id?: string;
  is_deleted: boolean;
  is_edited: boolean;
  sent_at: string;
  read_at: string | null;
  edited_at?: string;
}

export interface ConversationResp {
  conversation_id: string;
  listing_id: string;
  listing_title: string;
  listing_cover_url: string;
  listing_deleted: boolean;
  booking_id: string;
  renter_id: string;
  owner_id: string;
  other_username: string;
  other_avatar_url: string;
  unread_count: number;
  last_message: MessageResp | null;
  is_muted: boolean;
  blocked_by_me: boolean;
  blocked_by_them: boolean;
  created_at: string;
  last_message_at: string | null;
}

export type WsEvent =
  | { kind: 'message' | 'system'; message: MessageResp }
  | { kind: 'typing'; message: { sender_id: string } };
