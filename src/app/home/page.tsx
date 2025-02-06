import Link from "next/link";

import { db } from "@/lib/db";
import { questionnaires } from "@/lib/db/schema";

export default async function Home() {
  const questionnairesData = await db.select().from(questionnaires);

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center">
      <h1 className="text-xl font-semibold mb-8">Questionnaires</h1>
      <div className="flex flex-col gap-6 w-full text-center max-w-96">
        {questionnairesData.map((questionnaire) => (
          <Link
            key={questionnaire.id}
            href={`/questionnaire/${questionnaire.id}`}
            className="hover:bg-border px-4 py-2 rounded"
          >
            <p className="text-base font-semibold">{questionnaire.name}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
