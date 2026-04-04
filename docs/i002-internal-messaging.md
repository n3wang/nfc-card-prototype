# Internal Messaging System Plan (i002)

## Objective
Build an internal messaging feature so authenticated users can exchange messages inside the platform without exposing personal email.

## Scope (Phase 1)
- Direct 1:1 messaging between registered users.
- Thread list with unread counts.
- Message read status.
- Basic moderation and reporting hooks.
- Real-time delivery via WebSocket or polling fallback.

## Non-Goals (Phase 1)
- Group chats.
- Attachments and media uploads.
- End-to-end encryption.
- External integrations (Slack/Teams/Email sync).

## Core User Stories
- As a user, I can start a conversation from another user profile.
- As a user, I can send and receive messages in a thread.
- As a user, I can see unread message counts.
- As a user, I can mark a thread as read.
- As a user, I can report abusive content.

## Data Model

### conversations
- id (uuid, pk)
- created_at (timestamp)
- updated_at (timestamp)
- last_message_at (timestamp)
- status (varchar: active, archived, blocked)

### conversation_participants
- conversation_id (uuid, fk conversations)
- user_slug (varchar, fk users.username)
- joined_at (timestamp)
- last_read_message_id (uuid, nullable)
- role (varchar: member)
- PRIMARY KEY (conversation_id, user_slug)

### messages
- id (uuid, pk)
- conversation_id (uuid, fk conversations)
- sender_slug (varchar, fk users.username)
- body (text)
- created_at (timestamp)
- edited_at (timestamp, nullable)
- deleted_at (timestamp, nullable)
- metadata (jsonb default '{}')

### message_reports
- id (uuid, pk)
- message_id (uuid, fk messages)
- reporter_slug (varchar, fk users.username)
- reason (varchar)
- notes (text, nullable)
- created_at (timestamp)

## API Draft

### Start Conversation
- POST /api/messages/conversations
- Request: { participant_slug: "sarahchen" }
- Response: { conversation: {...} }

### List Conversations
- GET /api/messages/conversations
- Response: { conversations: [...], unread_total: number }

### Get Messages In Conversation
- GET /api/messages/conversations/:id/messages?cursor=<id>&limit=30
- Response: { messages: [...], next_cursor: "..." }

### Send Message
- POST /api/messages/conversations/:id/messages
- Request: { body: "hello" }
- Response: { message: {...} }

### Mark Conversation Read
- POST /api/messages/conversations/:id/read
- Response: { ok: true }

### Report Message
- POST /api/messages/messages/:id/report
- Request: { reason: "abuse", notes: "..." }
- Response: { report_id: "uuid" }

## Authorization Rules
- Only participants can view/send in a conversation.
- A user cannot start a conversation with themselves.
- Blocked users cannot send new messages.
- Soft-deleted messages are hidden from standard fetches.

## Delivery Strategy
- Preferred: WebSocket channel per authenticated user for new-message and read-receipt events.
- Fallback: short-polling every 10-15 seconds for unread counters and latest messages.

## Indexing
- conversations(last_message_at desc)
- conversation_participants(user_slug, conversation_id)
- messages(conversation_id, created_at desc)
- messages(sender_slug, created_at desc)
- message_reports(message_id)

## Validation Rules
- body length: 1..2000 chars.
- rate limit send endpoint (for example 20/min per user).
- reject messages containing only whitespace.

## Implementation Phases
1. Schema + migrations + repository layer.
2. REST endpoints + auth checks.
3. Frontend thread list and chat view.
4. Read receipts + unread counters.
5. Reporting and moderation endpoints.
6. WebSocket real-time updates.

## Testing Plan
- Unit tests for permission checks and validation.
- Integration tests for conversation lifecycle.
- E2E tests for send/read flow and unread badge behavior.

## Open Questions
- Should users be able to disable incoming messages?
- Should messaging be available to all users or only connected users?
- Retention policy for deleted conversations/messages?
