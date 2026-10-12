import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

export const users = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  clerkId: text("clerk_id").notNull().unique(),
  email: text().notNull(),
  name: text(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export const posts = pgTable(
  "posts",
  {
    id: uuid().primaryKey().defaultRandom(),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text().notNull(),
    content: text().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index("posts_author_id_idx").on(t.authorId)],
)

export type Post = typeof posts.$inferSelect
export type NewPost = typeof posts.$inferInsert

export const comments = pgTable(
  "comments",
  {
    id: uuid().primaryKey().defaultRandom(),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    content: text().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("comments_post_id_idx").on(t.postId),
    index("comments_author_id_idx").on(t.authorId),
  ],
)

export type PostComment = typeof comments.$inferSelect
export type NewPostComment = typeof comments.$inferInsert
