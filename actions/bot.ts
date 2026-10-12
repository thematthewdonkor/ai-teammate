"use server"

import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import type { z } from "zod"

import { db } from "@/lib/db"
import { bots, insertBotSchema, type Bot } from "@/lib/schema"

type CreateBotResult =
  { success: true; bot: Bot } | { success: false; error: string }

export async function createBot(
  values: z.input<typeof insertBotSchema>
): Promise<CreateBotResult> {
  const { userId } = await auth.protect()

  // Server Actions are reachable by direct POST, so never trust the client's
  // validation.
  const parsed = insertBotSchema.safeParse(values)
  if (!parsed.success) {
    return { success: false, error: "Check the form and try again." }
  }

  const [bot] = await db
    .insert(bots)
    .values({
      ...parsed.data,
      instructions: parsed.data.instructions || null,
      userId,
    })
    .returning()

  revalidatePath("/")

  return { success: true, bot }
}
