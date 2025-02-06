import { eq, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import Form from "next/form";

import { db } from "@/lib/db";
import { answers, questionnaires, questions } from "@/lib/db/schema";

import { getSession } from "@/lib/auth";

import { Button } from "@/components/ui/button";
import { QuestionField } from "@/components/question-field";

const MISSING_FIELDS_ERROR = "missing_fields";
export default async function Questionnaire(props: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string }>;
}) {
  const { id } = await props.params;
  const { error } = (await props.searchParams) ?? {};

  const userId = await getSession();
  if (!userId) {
    redirect("/");
  }

  const questionnaireId = Number(id);
  const questionsData = await db
    .select()
    .from(questions)
    .where(eq(questions.questionnaireId, questionnaireId))
    .orderBy(questions.priority);

  const [questionnaireData] = await db
    .select()
    .from(questionnaires)
    .where(eq(questionnaires.id, questionnaireId));

  const onSubmitAnswers = async (formData: FormData) => {
    "use server";
    const userAnswers = [];
    const questionIds = [];
    const userId = await getSession();
    const questionnaireId = formData.get("questionnaire-id");
    if (userId && questionnaireId) {
      for (const [key, value] of formData) {
        if (value.toString().trim() === "" && !key.includes("$ACTION_ID")) {
          redirect(
            `/questionnaire/${questionnaireId}?error=${MISSING_FIELDS_ERROR}`
          );
        }

        const [id, optionId] = key.split("-");

        const questionId = Number(id);
        if (questionId && !Number.isNaN(questionId)) {
          questionIds.push(questionId);
          if (optionId && value === "on") {
            userAnswers.push({
              option: Number(optionId),
              questionId,
              userId,
            });
          } else {
            userAnswers.push({
              questionId,
              userId,
              text: value.toString(),
            });
          }
        }
      }

      await db.delete(answers).where(inArray(answers.questionId, questionIds));
      await db.insert(answers).values(userAnswers);

      redirect("/home");
    }
  };

  const errorMessage = (error: string) => {
    switch (error) {
      case MISSING_FIELDS_ERROR:
        return "* You must fill all required fields";
      default:
        return "Something went wrong";
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center">
      <div className="text-center mb-20">
        <p className="text-lg font-semibold">{questionnaireData.name}</p>
      </div>

      {questionsData.length ? (
        <Form
          className="flex flex-col gap-6 w-full max-w-96"
          action={onSubmitAnswers}
        >
          <input
            name="questionnaire-id"
            value={questionnaireId}
            className="hidden"
            readOnly
            hidden
            aria-hidden
          />
          {questionsData.map((question) => (
            <QuestionField
              key={question.id}
              question={question}
              userId={userId}
            />
          ))}
          {error ? (
            <p className="text-destructive">{errorMessage(error)}</p>
          ) : null}
          <Button type="submit">Save</Button>
          <Button variant="secondary" className="w-full -mt-4" asChild>
            <Link href="/home">Back</Link>
          </Button>
        </Form>
      ) : (
        <div className="min-w-96 text-center">
          <p className="text-lg">No questions found</p>
          <Button className="w-full mt-4" variant="secondary" asChild>
            <Link href="/home">Back</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
