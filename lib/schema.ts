import { defineRelations } from "drizzle-orm"
import {
  index,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core"
import { createInsertSchema } from "drizzle-orm/zod"
import { nanoid } from "nanoid"

export const bots = pgTable(
  "bots",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => nanoid()),
    // Clerk user id of the bot's owner.
    userId: text("user_id").notNull(),
    name: text().notNull(),
    // Seed for the bot's generated face.
    avatar: text()
      .notNull()
      .$defaultFn(() => nanoid()),
    job: text().notNull(),
    instructions: text(),
    // Created lazily by the sandbox provider.
    sandboxId: text("sandbox_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("bots_user_id_idx").on(t.userId)]
)

export type Bot = typeof bots.$inferSelect
export type NewBot = typeof bots.$inferInsert

// What a user fills in when creating a bot. Ownership, ids, and the sandbox
// are set on the server.
export const insertBotSchema = createInsertSchema(bots, {
  name: (s) => s.trim().min(1, "Give your bot a name.").max(50),
  avatar: (s) => s.min(1),
  job: (s) => s.trim().min(1, "Give your bot a job.").max(80),
  instructions: (s) => s.trim().max(2000),
}).omit({ id: true, userId: true, sandboxId: true, createdAt: true })

export const chatKind = pgEnum("chat_kind", ["direct", "group"])

export const chats = pgTable(
  "chats",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => nanoid()),
    // Clerk user id of the chat's owner.
    userId: text("user_id").notNull(),
    kind: chatKind().notNull().default("direct"),
    // Null for direct chats, which show the bot's name.
    name: text(),
    lastMessagePreview: text("last_message_preview"),
    lastMessageAt: timestamp("last_message_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("chats_user_id_idx").on(t.userId)]
)

export type Chat = typeof chats.$inferSelect
export type NewChat = typeof chats.$inferInsert

// Which bots are in which chats.
export const chatMembers = pgTable(
  "chat_members",
  {
    chatId: text("chat_id")
      .notNull()
      .references(() => chats.id, { onDelete: "cascade" }),
    botId: text("bot_id")
      .notNull()
      .references(() => bots.id, { onDelete: "cascade" }),
  },
  (t) => [
    primaryKey({ columns: [t.chatId, t.botId] }),
    index("chat_members_bot_id_idx").on(t.botId),
  ]
)

export type ChatMember = typeof chatMembers.$inferSelect
export type NewChatMember = typeof chatMembers.$inferInsert

export const relations = defineRelations(
  { bots, chats, chatMembers },
  (r) => ({
    bots: {
      chats: r.many.chats({
        from: r.bots.id.through(r.chatMembers.botId),
        to: r.chats.id.through(r.chatMembers.chatId),
      }),
    },
    chats: {
      bots: r.many.bots({
        from: r.chats.id.through(r.chatMembers.chatId),
        to: r.bots.id.through(r.chatMembers.botId),
      }),
      members: r.many.chatMembers({
        from: r.chats.id,
        to: r.chatMembers.chatId,
      }),
    },
    chatMembers: {
      chat: r.one.chats({
        from: r.chatMembers.chatId,
        to: r.chats.id,
        optional: false,
      }),
      bot: r.one.bots({
        from: r.chatMembers.botId,
        to: r.bots.id,
        optional: false,
      }),
    },
  })
)
