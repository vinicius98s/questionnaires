import { eq } from "drizzle-orm";
import Link from "next/link";

import { db } from "@/lib/db";
import { questions } from "@/lib/db/schema";

import { QuestionField } from "@/components/question-field";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default async function Questionnaire(props: {
  params: Promise<{ questionnaireId: string; userId: string }>;
  searchParams?: Promise<{ error?: string }>;
}) {
  const { questionnaireId: qId, userId: uId } = await props.params;
  const questionnaireId = Number(qId);
  const userId = Number(uId);

  const questionsData = await db
    .select()
    .from(questions)
    .where(eq(questions.questionnaireId, questionnaireId))
    .orderBy(questions.priority);

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center">
      <Breadcrumb className="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/${userId}`}>User</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Questionnaire</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {questionsData.length ? (
        <form className="flex flex-col gap-6 w-full max-w-96">
          {questionsData.map((question) => (
            <QuestionField
              key={question.id}
              question={question}
              userId={userId}
              readOnly
            />
          ))}

          <Button variant="secondary" className="w-full" asChild>
            <Link href={`/admin/${userId}`}>Back</Link>
          </Button>
        </form>
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
