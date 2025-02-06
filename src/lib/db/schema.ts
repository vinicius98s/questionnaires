import {
  pgTable,
  varchar,
  timestamp,
  integer,
  pgEnum,
  serial,
  primaryKey,
} from "drizzle-orm/pg-core";

export const rolesEnum = pgEnum("roles", ["user", "admin"]);
export const users = pgTable("users", {
  id: serial().primaryKey().notNull(),
  username: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  role: rolesEnum().default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const questionnaires = pgTable("questionnaires", {
  id: serial().primaryKey().notNull(),
  name: varchar({ length: 255 }).notNull(),
});

export const questionType = pgEnum("question_type", ["mcq", "input"]);
export const questions = pgTable("questions", {
  id: serial().primaryKey().notNull(),
  text: varchar({ length: 255 }).notNull(),
  type: questionType().notNull(),
  priority: integer().notNull(),
  questionnaireId: serial("questionnaire_id")
    .references(() => questionnaires.id)
    .notNull(),
});

export const questionOptions = pgTable("question_options", {
  id: serial().primaryKey().notNull(),
  text: varchar({ length: 255 }).notNull(),
  questionId: serial("question_id")
    .references(() => questions.id)
    .notNull(),
});

export const answers = pgTable(
  "answers",
  {
    text: varchar({ length: 255 }),
    option: serial().references(() => questionOptions.id),
    questionId: serial("question_id")
      .references(() => questions.id)
      .notNull(),
    userId: serial("user_id")
      .references(() => users.id)
      .notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.option, table.userId, table.questionId],
    }),
  ]
);
