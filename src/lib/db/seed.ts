import { parse } from "csv/sync";
import { promises as fs } from "fs";

import { db } from ".";
import { questionnaires, questionOptions, questions, users } from "./schema";

type Question =
  | {
      type: "mcq";
      options: string[];
      question: string;
    }
  | {
      type: "input";
      question: string;
    };

async function main() {
  await db
    .insert(users)
    .values({ username: "admin", password: "admin", role: "admin" })
    .onConflictDoNothing();

  const questionnairesFile = await fs.readFile(
    "./data/questionnaire_questionnaires.csv"
  );
  const [, ...questionnairesData] = parse(questionnairesFile, { bom: true });
  const formattedQuestionnaires = (questionnairesData as [string, string]).map(
    ([id, name]) => ({ id: Number(id), name })
  );
  await db
    .insert(questionnaires)
    .values(formattedQuestionnaires)
    .onConflictDoNothing();

  const questionsFile = await fs.readFile("./data/questionnaire_questions.csv");
  const [, ...questionsData] = parse(questionsFile, { bom: true });
  const junctionFile = await fs.readFile("./data/questionnaire_junction.csv");
  const [, ...junctionData] = parse(junctionFile, { bom: true });
  const questionOptionsData: { questionId: number; text: string }[] = [];
  const formattedQuestions = (questionsData as [string, string]).map(
    ([id, data]) => {
      const [, , questionnaireId, priority] =
        (junctionData as [[string, string, string, string]]).find(
          ([, questionId]) => questionId === id
        ) ?? [];

      const question = JSON.parse(data) as Question;
      if (question.type === "mcq") {
        for (const text of question.options) {
          questionOptionsData.push({ questionId: Number(id), text });
        }
      }

      return {
        id: Number(id),
        text: question.question,
        type: question.type,
        questionnaireId: Number(questionnaireId),
        priority: Number(priority),
      };
    }
  );

  await db.insert(questions).values(formattedQuestions);
  await db.insert(questionOptions).values(questionOptionsData);
}

main();
