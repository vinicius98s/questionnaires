import Link from "next/link";
import { redirect } from "next/navigation";
import { count, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { answers, questionnaires, questions, users } from "@/lib/db/schema";

import { getSession } from "@/lib/auth";

export default async function Admin() {
  const userId = await getSession();
  if (!userId) {
    redirect("/");
  }

  const [{ count: totalQuestionnaires }] = await db
    .select({ count: count() })
    .from(questionnaires);
  const usersData = await db
    .select({
      id: users.id,
      username: users.username,
      questionnaireId: questions.questionnaireId,
    })
    .from(users)
    .leftJoin(answers, eq(answers.userId, users.id))
    .leftJoin(questions, eq(questions.id, answers.questionId))
    .groupBy(users.id, questions.questionnaireId);

  const usersDataWithAnsweredQuestionnaires = usersData.reduce<
    {
      id: number;
      username: string;
      questionnaireId: number | null;
      answeredQuestionnaires: number;
    }[]
  >((acc, userData) => {
    const user = acc.find((u) => u.id === userData.id);
    const answeredQuestionnaires = !!userData.questionnaireId
      ? (user?.answeredQuestionnaires ?? 0) + 1
      : 0;

    return !!user
      ? acc.map((u) =>
          u.id === userData.id ? { ...u, answeredQuestionnaires } : u
        )
      : [...acc, { ...userData, answeredQuestionnaires }];
  }, []);

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center">
      <h1 className="text-xl font-semibold mb-8">Users</h1>
      <div className="flex flex-col gap-6">
        {usersDataWithAnsweredQuestionnaires.map((user) => (
          <Link
            key={user.id}
            href={`/admin/${user.id}`}
            className="hover:bg-border px-4 py-2 rounded text-center"
          >
            <p className="text-base font-semibold">{user.username}</p>
            <p className="text-sm font-semibold">
              Questionnaires: {user.answeredQuestionnaires}/
              {totalQuestionnaires}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
