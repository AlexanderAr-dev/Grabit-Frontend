import { http, ws } from 'msw';

import { chatService } from '@shared/api';
import type {
  ConversationResp,
  MessageResp,
  WsEvent,
} from '@shared/types/chat';

import {
  AUTO_REPLIES,
  blockedUsers,
  conversations,
  DemoConversation,
  findListing,
  findUser,
  iso,
  ME,
  messages,
  nextId,
} from '../db';
import {
  authed,
  fail,
  notFound,
  num,
  ok,
  paginate,
  query,
  readJson,
  WEB,
} from './utils';

const otherId = (c: DemoConversation) =>
  c.renter_id === ME ? c.owner_id : c.renter_id;

const toConversation = (
  c: DemoConversation,
): ConversationResp => {
  const listing = findListing(c.listing_id);
  const other = findUser(otherId(c));
  const list = messages[c.conversation_id] ?? [];
  const last = list[list.length - 1] ?? null;
  return {
    conversation_id: c.conversation_id,
    listing_id: c.listing_id,
    listing_title: listing?.title ?? 'Объявление удалено',
    listing_cover_url: listing?.media[0]?.url ?? '',
    listing_deleted:
      !listing || listing.status === 'deleted',
    booking_id: c.booking_id,
    renter_id: c.renter_id,
    owner_id: c.owner_id,
    other_username: other
      ? `${other.first_name} ${other.last_name}`
      : 'Пользователь',
    other_avatar_url: other?.avatar_url ?? '',
    unread_count: c.unread,
    last_message: last,
    is_muted: c.is_muted,
    blocked_by_me: blockedUsers.has(otherId(c)),
    blocked_by_them: false,
    created_at: c.created_at,
    last_message_at: last?.sent_at ?? null,
  };
};

const findConversation = (id: string) =>
  conversations.find(c => c.conversation_id === id);

const totalUnread = () =>
  conversations.reduce((sum, c) => sum + c.unread, 0);

// ---- WebSocket: собеседник «печатает» и отвечает ----

const chatSocket = ws.link(chatService.getChatWsUrl('*'));
const sockets = new Map<
  string,
  Set<{ send: (data: string) => void }>
>();

const broadcast = (
  conversationId: string,
  event: WsEvent,
) => {
  sockets
    .get(conversationId)
    ?.forEach(client => client.send(JSON.stringify(event)));
};

const scheduleAutoReply = (c: DemoConversation) => {
  const sender = otherId(c);
  if (blockedUsers.has(sender)) return;
  setTimeout(
    () =>
      broadcast(c.conversation_id, {
        kind: 'typing',
        message: { sender_id: sender },
      }),
    900,
  );
  setTimeout(() => {
    const reply: MessageResp = {
      message_id: nextId('msg'),
      conversation_id: c.conversation_id,
      sender_id: sender,
      message_type: 0,
      content:
        AUTO_REPLIES[
          Math.floor(Math.random() * AUTO_REPLIES.length)
        ],
      is_deleted: false,
      is_edited: false,
      sent_at: iso(Date.now()),
      read_at: null,
    };
    messages[c.conversation_id].push(reply);
    c.unread += 1; // если чат открыт, фронт сразу отметит прочитанным
    broadcast(c.conversation_id, {
      kind: 'message',
      message: reply,
    });
  }, 2600);
};

export const chatHandlers = [
  chatSocket.addEventListener(
    'connection',
    ({ client }) => {
      // .../chat/conversations/:id/ws
      const segments = client.url.pathname.split('/');
      const conversationId =
        segments[segments.length - 2] ?? '';
      if (!sockets.has(conversationId))
        sockets.set(conversationId, new Set());
      sockets.get(conversationId)!.add(client);
      client.addEventListener('close', () =>
        sockets.get(conversationId)?.delete(client),
      );
    },
  ),

  http.get(
    `${WEB}/chat/conversations`,
    authed(({ request }) => {
      const q = query(request);
      const listingId = q.get('listing_id');
      const items = conversations
        .filter(
          c => !listingId || c.listing_id === listingId,
        )
        .map(toConversation)
        .sort((a, b) =>
          (b.last_message_at ?? b.created_at).localeCompare(
            a.last_message_at ?? a.created_at,
          ),
        );
      const page = paginate(
        items,
        num(q.get('page'), 1),
        num(q.get('page_size'), 20),
      );
      return ok({
        items: page.items,
        has_more: page.page * page.page_size < page.total,
      });
    }),
  ),

  http.post(
    `${WEB}/chat/conversations`,
    authed(async ({ request }) => {
      const { listing_id } = await readJson<{
        listing_id: string;
      }>(request);
      const listing = findListing(listing_id);
      if (!listing) return notFound();
      if (listing.owner_id === ME)
        return fail(
          400,
          'OWN_LISTING',
          'Нельзя написать самому себе',
        );
      let c = conversations.find(
        x =>
          x.listing_id === listing_id && x.renter_id === ME,
      );
      if (!c) {
        c = {
          conversation_id: nextId('c'),
          listing_id,
          booking_id: '',
          renter_id: ME,
          owner_id: listing.owner_id,
          is_muted: false,
          unread: 0,
          created_at: iso(Date.now()),
        };
        conversations.push(c);
        messages[c.conversation_id] = [];
      }
      return ok(toConversation(c));
    }),
  ),

  http.get(
    `${WEB}/chat/conversations/:id/messages`,
    authed(({ params, request }) => {
      const list = messages[params.id as string];
      if (!list) return notFound();
      const q = query(request);
      const limit = num(q.get('limit'), 50);
      const before = q.get('before');
      const after = q.get('after');
      let slice = list;
      if (before)
        slice = slice.slice(
          0,
          Math.max(
            0,
            slice.findIndex(m => m.message_id === before),
          ),
        );
      if (after) {
        const index = slice.findIndex(
          m => m.message_id === after,
        );
        slice = index === -1 ? [] : slice.slice(index + 1);
      }
      // Бэкенд отдаёт новые сверху — фронт сам разворачивает
      const items = slice.slice(-limit).reverse();
      return ok({ items, has_more: slice.length > limit });
    }),
  ),

  http.post(
    `${WEB}/chat/conversations/:id/messages`,
    authed(async ({ params, request }) => {
      const c = findConversation(params.id as string);
      if (!c) return notFound();
      if (blockedUsers.has(otherId(c)))
        return fail(
          403,
          'BLOCKED',
          'Пользователь заблокирован',
        );
      const { content } = await readJson<{
        content: string;
      }>(request);
      const message: MessageResp = {
        message_id: nextId('msg'),
        conversation_id: c.conversation_id,
        sender_id: ME,
        message_type: 0,
        content,
        is_deleted: false,
        is_edited: false,
        sent_at: iso(Date.now()),
        read_at: null,
      };
      messages[c.conversation_id].push(message);
      scheduleAutoReply(c);
      return ok(message, 201);
    }),
  ),

  http.patch(
    `${WEB}/chat/conversations/:id/messages/:messageId`,
    authed(async ({ params, request }) => {
      const m = messages[params.id as string]?.find(
        x =>
          x.message_id === params.messageId &&
          x.sender_id === ME,
      );
      if (!m) return notFound();
      const { content } = await readJson<{
        content: string;
      }>(request);
      Object.assign(m, {
        content,
        is_edited: true,
        edited_at: iso(Date.now()),
      });
      return ok(m);
    }),
  ),

  http.delete(
    `${WEB}/chat/conversations/:id/messages/:messageId`,
    authed(({ params }) => {
      const m = messages[params.id as string]?.find(
        x =>
          x.message_id === params.messageId &&
          x.sender_id === ME,
      );
      if (!m) return notFound();
      Object.assign(m, { content: '', is_deleted: true });
      return ok(null);
    }),
  ),

  http.post(
    `${WEB}/chat/conversations/:id/read`,
    authed(({ params }) => {
      const c = findConversation(params.id as string);
      if (!c) return notFound();
      c.unread = 0;
      const now = iso(Date.now());
      messages[c.conversation_id].forEach(m => {
        if (m.sender_id !== ME && !m.read_at)
          m.read_at = now;
      });
      return ok({ new_unread_count: totalUnread() });
    }),
  ),

  http.get(
    `${WEB}/chat/unread-count`,
    authed(() => ok({ count: totalUnread() })),
  ),

  http.post(
    `${WEB}/chat/conversations/:id/mute`,
    authed(({ params }) => {
      const c = findConversation(params.id as string);
      if (c) c.is_muted = true;
      return ok(null);
    }),
  ),

  http.delete(
    `${WEB}/chat/conversations/:id/mute`,
    authed(({ params }) => {
      const c = findConversation(params.id as string);
      if (c) c.is_muted = false;
      return ok(null);
    }),
  ),

  http.get(
    `${WEB}/chat/users/blocked`,
    authed(() => ok({ user_ids: [...blockedUsers] })),
  ),

  http.post(
    `${WEB}/chat/users/:userId/block`,
    authed(({ params }) => {
      blockedUsers.add(params.userId as string);
      return ok(null);
    }),
  ),

  http.delete(
    `${WEB}/chat/users/:userId/block`,
    authed(({ params }) => {
      blockedUsers.delete(params.userId as string);
      return ok(null);
    }),
  ),
];
