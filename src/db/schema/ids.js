import { pgTable, timestamp, text  } from "drizzle-orm/pg-core"

export const ids = pgTable("ids", {
  timestamp: timestamp().notNull().defaultNow(),
  radio: text(),
  music_artist: text(),
  music_title: text(),
})
