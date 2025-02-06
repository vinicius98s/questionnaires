import Link from "next/link";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { answers, questionnaires, questions, users } from "@/lib/db/schema";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

export default async function UserQuestionnaires(props: {
  params: Promise<{ userId: string }>;
}) {
  const { userId: id } = await props.params;
  const userId = Number(id);
  const [user] = await db
    .select({ username: users.username })
    .from(users)
    .where(eq(users.id, userId));

  if (!user) {
    return (
      <div className="w-screen h-screen flex flex-col justify-center items-center">
        <h1 className="text-xl font-semibold mb-8">User not found</h1>
      </div>
    );
  }

  const questionnairesData = await db.select().from(questionnaires);
  const answersData = await db
    .select({ questionnaireId: questions.questionnaireId })
    .from(answers)
    .leftJoin(questions, eq(questions.id, answers.questionId))
    .where(eq(answers.userId, userId));

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center">
      <h1 className="text-xl font-semibold mb-8">
        Questionnaires from: {user.username}
      </h1>
      <div className="flex flex-col gap-6 w-full max-w-96 text-center">
        {questionnairesData.map((questionnaire) => {
          const isAnswered = answersData.some(
            (answer) => answer.questionnaireId === questionnaire.id
          );
          if (isAnswered) {
            return (
              <Link
                key={questionnaire.id}
                href={`/admin/${userId}/${questionnaire.id}`}
                className="hover:bg-border px-4 py-2 rounded"
              >
                <p className="text-base font-semibold">{questionnaire.name}</p>
              </Link>
            );
          }

          return (
            <TooltipProvider key={questionnaire.id}>
              <Tooltip delayDuration={300}>
                <TooltipTrigger>
                  <div className="bg-border px-4 py-2 rounded cursor-auto">
                    <p className="text-base font-semibold">
                      {questionnaire.name}
                    </p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    This questionnaire has not been answered by this user yet
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}

        <Button variant="secondary" className="mt-8" asChild>
          <Link href="/admin">Back</Link>
        </Button>
      </div>
    </div>
  );
}
