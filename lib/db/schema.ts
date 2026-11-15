import { relations, sql } from "drizzle-orm"
import {
  boolean,
  bigint,
  check,
  date,
  index,
  integer,
  pgEnum,
  pgSequence,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"

export const role = pgEnum("Role", ["USER", "ADMIN"])

export const BOOKING_ROOMS = [
  "aula-lantai-1",
  "ruang-solat-lantai-2",
  "pelataran-masjid",
  "lapangan-parkir",
] as const

export const BOOKING_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const

export const bookingNumberSequence = pgSequence("booking_number_seq")
export const FINANCE_TRANSACTION_TYPES = ["INCOME", "EXPENSE"] as const

export const user = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").default(false).notNull(),
  image: text("image"),
  role: role("role").default("USER").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expiresAt").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ipAddress"),
    userAgent: text("userAgent"),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_user_id_idx").on(table.userId)]
)

export const account = pgTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    accountId: text("accountId").notNull(),
    providerId: text("providerId").notNull(),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("accessToken"),
    refreshToken: text("refreshToken"),
    idToken: text("idToken"),
    accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
    refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("account_user_id_idx").on(table.userId)]
)

export const verification = pgTable(
  "verifications",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expiresAt").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)]
)

export const aspiration = pgTable(
  "aspiration",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    isAnonymous: boolean("is_anonymous").default(true).notNull(),
    name: text("name"),
    message: text("message").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("aspiration_created_at_idx").on(table.createdAt),
    check(
      "aspiration_message_length_check",
      sql`char_length(${table.message}) between 10 and 2000`
    ),
    check(
      "aspiration_identity_check",
      sql`(${table.isAnonymous} and ${table.name} is null) or (not ${table.isAnonymous} and coalesce(char_length(trim(${table.name})), 0) between 2 and 100)`
    ),
  ]
)

export const apiRateLimit = pgTable(
  "api_rate_limits",
  {
    key: text("key").primaryKey(),
    count: integer("count").default(1).notNull(),
    resetAt: timestamp("reset_at", { withTimezone: true }).notNull(),
  },
  (table) => [
    index("api_rate_limit_reset_at_idx").on(table.resetAt),
    check("api_rate_limit_count_check", sql`${table.count} > 0`),
  ]
)

export const booking = pgTable(
  "bookings",
  {
    id: text("id")
      .primaryKey()
      .default(sql`next_booking_id()`),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    contactName: text("contact_name").notNull(),
    whatsapp: text("whatsapp"),
    organizer: text("organizer"),
    eventName: text("event_name").notNull(),
    room: text("room").notNull(),
    startAt: timestamp("start_at", { withTimezone: true }).notNull(),
    endAt: timestamp("end_at", { withTimezone: true }).notNull(),
    status: text("status").default("PENDING").notNull(),
    letterKey: text("letter_key").unique(),
    letterName: text("letter_name"),
    letterSize: integer("letter_size"),
    letterMime: text("letter_mime"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("booking_user_id_idx").on(table.userId),
    index("booking_user_created_at_idx").on(table.userId, table.createdAt),
    index("booking_start_at_idx").on(table.startAt),
    index("booking_end_at_idx").on(table.endAt),
    index("booking_created_at_idx").on(table.createdAt),
    index("booking_status_idx").on(table.status),
    check(
      "booking_room_check",
      sql`${table.room} in ('aula-lantai-1', 'ruang-solat-lantai-2', 'pelataran-masjid', 'lapangan-parkir')`
    ),
    check(
      "booking_status_check",
      sql`${table.status} in ('PENDING', 'APPROVED', 'REJECTED')`
    ),
    check("booking_time_check", sql`${table.startAt} < ${table.endAt}`),
    check(
      "booking_contact_name_length_check",
      sql`char_length(trim(${table.contactName})) between 3 and 100`
    ),
    check(
      "booking_organizer_length_check",
      sql`${table.organizer} is null or char_length(trim(${table.organizer})) between 3 and 150`
    ),
    check(
      "booking_event_name_length_check",
      sql`char_length(trim(${table.eventName})) between 3 and 150`
    ),
    check(
      "booking_letter_check",
      sql`(${table.letterKey} is null and ${table.letterName} is null and ${table.letterSize} is null and ${table.letterMime} is null) or (${table.letterSize} between 1 and 2097152 and ${table.letterMime} = 'application/pdf')`
    ),
  ]
)

export const financeTransaction = pgTable(
  "finance_transactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    occurredOn: date("occurred_on", { mode: "string" }).notNull(),
    title: text("title").notNull(),
    category: text("category").default("Lainnya").notNull(),
    type: text("type").notNull(),
    amount: bigint("amount", { mode: "number" }).notNull(),
    createdBy: text("created_by").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("finance_transaction_occurred_on_idx").on(table.occurredOn),
    index("finance_transaction_type_idx").on(table.type),
    check(
      "finance_transaction_type_check",
      sql`${table.type} in ('INCOME', 'EXPENSE')`
    ),
    check("finance_transaction_amount_check", sql`${table.amount} > 0`),
    check(
      "finance_transaction_title_length_check",
      sql`char_length(trim(${table.title})) between 3 and 150`
    ),
    check(
      "finance_transaction_category_length_check",
      sql`char_length(trim(${table.category})) between 2 and 100`
    ),
  ]
)

export const userRelations = relations(user, ({ many }) => ({
  accounts: many(account),
  bookings: many(booking),
  financeTransactions: many(financeTransaction),
  sessions: many(session),
}))

export const bookingRelations = relations(booking, ({ one }) => ({
  user: one(user, {
    fields: [booking.userId],
    references: [user.id],
  }),
}))

export const financeTransactionRelations = relations(
  financeTransaction,
  ({ one }) => ({
    creator: one(user, {
      fields: [financeTransaction.createdBy],
      references: [user.id],
    }),
  })
)

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}))
