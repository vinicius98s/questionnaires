import { eq, and } from "drizzle-orm";

import { db } from "@/lib/db";
import { questions, questionOptions, answers } from "@/lib/db/schema";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export async function QuestionField({
  question,
  userId,
  readOnly,
}: {
  question: typeof questions.$inferSelect;
  userId: number;
  readOnly?: boolean;
}) {
  const questionId = question.id.toString();
  const options = await db
    .select()
    .from(questionOptions)
    .where(eq(questionOptions.questionId, question.id));

  const userAnswers = await db
    .select()
    .from(answers)
    .where(
      and(eq(answers.questionId, question.id), eq(answers.userId, userId))
    );

  return (
    <div>
      <Label htmlFor={questionId} className="text-md font-semibold">
        {question.text}
        {question.type === "input" ? (
          <span className="text-destructive">*</span>
        ) : null}
      </Label>
      {question.type === "mcq" && options.length ? (
        <div className="mt-2">
          {options.map((option) => {
            const id = `${questionId}-${option.id}`;
            const checked = userAnswers.some(
              (answer) => answer.option === option.id
            );
            return (
              <div key={option.id} className="flex items-center gap-3 mb-1">
                <Checkbox
                  id={id}
                  name={id}
                  aria-readonly={readOnly}
                  {...(readOnly ? { checked } : { defaultChecked: checked })}
                />
                <label htmlFor={id} className="font-light">
                  {option.text}
                </label>
              </div>
            );
          })}
        </div>
      ) : (
        <Input
          id={questionId}
          name={questionId}
          className="mt-2"
          required
          readOnly={readOnly}
          defaultValue={
            userAnswers.find((answer) => answer.questionId === question.id)
              ?.text ?? ""
          }
        />
      )}
    </div>
  );
}
