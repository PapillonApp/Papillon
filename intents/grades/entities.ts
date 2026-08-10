import { EntityDef } from "papillon-intents";

const GradeEntity: EntityDef = {
  typeName: "Grade",
  typeDisplayName: "Note",
  display: {
    title: "title",
    subtitle: "subject",
    image: { systemImage: "list.number" },
  },
  properties: {
    id: { type: "string" },
    subject: {
      type: "string",
      title: "Matière",
      queryable: true,
      searchable: true,
    },
    title: { type: "string", title: "Évaluation", searchable: true },
    value: { type: "number", title: "Note" },
    scale: { type: "number?", title: "Barème" },
    average: { type: "number?", title: "Moyenne de la classe" },
    date: { type: "date?", title: "Date", queryable: true },
  },
  defaultQueryProperty: "subject",
  stringQueryProperties: ["subject", "title"],
  indexed: true,
};

export const entities: Record<string, EntityDef> = { grade: GradeEntity };
