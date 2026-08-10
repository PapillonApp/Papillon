import { EntityDef } from "papillon-intents";

const CourseEntity: EntityDef = {
  typeName: "Course",
  typeDisplayName: "Cours",
  display: {
    title: "subject",
    subtitle: "room",
    image: { systemImage: "calendar" },
  },
  properties: {
    id: { type: "string", title: "Identifiant" },
    subject: {
      type: "string",
      title: "Matière",
      queryable: true,
      searchable: true,
    },
    from: { type: "date", title: "Début", queryable: true },
    to: { type: "date", title: "Fin" },
    room: { type: "string?", title: "Salle", searchable: true },
    teacher: { type: "string?", title: "Professeur", searchable: true },
    isCanceled: { type: "bool", title: "Annulé" },
    status: { type: "string?", title: "Statut" },
  },
  defaultQueryProperty: "subject",
  stringQueryProperties: ["subject", "teacher", "room"],
  indexed: true,
};

export const entities: Record<string, EntityDef> = { course: CourseEntity };