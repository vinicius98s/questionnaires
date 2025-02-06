import { eq, and } from "drizzle-orm";

import { db } from "@/lib/db";
import { questions, questionOptions, answers } from "@/lib/db/schema";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type Question = typeof questions.$inferSelect;

function Options(props: {
  question: Question;
  options: (typeof questionOptions.$inferSelect)[];
  userAnswers: (typeof answers.$inferSelect)[];
  readOnly?: boolean;
}) {
  if (props.question.type === "multi_select") {
    return (
      <div className="mt-2">
        {props.options.map((option) => {
          const id = `${props.question.id}-${option.id}`;
          const checked = props.userAnswers.some(
            (answer) => answer.option === option.id
          );

          return (
            <div key={option.id} className="flex items-center gap-3 mb-1">
              <Checkbox
                id={id}
                name={id}
                aria-readonly={props.readOnly}
                {...(props.readOnly
                  ? { checked }
                  : { defaultChecked: checked })}
              />
              <label htmlFor={id} className="font-light">
                {option.text}
              </label>
            </div>
          );
        })}
      </div>
    );
  }

  const userAnswer = props.userAnswers
    .find((answer) => answer.questionId === props.question.id)
    ?.option.toString();

  return (
    <RadioGroup
      className="mt-2"
      name={`select-${props.question.id.toString()}`}
      {...(props.readOnly
        ? { value: userAnswer }
        : { defaultValue: userAnswer })}
    >
      {props.options.map((option) => {
        const id = option.id.toString();
        return (
          <div key={option.id} className="flex items-center space-x-2">
            <RadioGroupItem value={id} id={id} />
            <Label htmlFor={id}>{option.text}</Label>
          </div>
        );
      })}
    </RadioGroup>
  );
}

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
      {options.length ? (
        <Options
          options={options}
          question={question}
          readOnly={readOnly}
          userAnswers={userAnswers}
        />
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
