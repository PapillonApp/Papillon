import { EntityDef } from "papillon-intents";

const HomeworkEntity: EntityDef = {
  typeName: "Homework",
  typeDisplayName: "Devoir",
  display: {
    title: "subject",
    subtitle: "content",
    image: { systemImage: "book.closed" },
  },
  properties: {
    id: { type: "string", title: "Identifiant" },
    subject: {
      type: "string",
      title: "Matière",
      queryable: true,
      searchable: true,
    },
    content: { type: "string", title: "Contenu", searchable: true },
    dueDate: { type: "date", title: "Pour le", queryable: true },
    isDone: { type: "bool", title: "Fait" },
    evaluation: { type: "bool", title: "Évaluation" },
  },
  defaultQueryProperty: "subject",
  stringQueryProperties: ["subject", "content"],
  indexed: true,
};

export const entities: Record<string, EntityDef> = { homework: HomeworkEntity };