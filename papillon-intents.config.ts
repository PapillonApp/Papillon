import type { PapillonIntentsConfig } from "papillon-intents";

const config: PapillonIntentsConfig = {
  settings: {
    appGroup: "group.xyz.getpapillon.ios",
    defaultTimeoutMs: 25000,
    logLevel: "warn",
    backgroundLaunch: true,
    cache: { enabled: true, ttlMs: 5 * 60 * 1000 },
    donations: { enabled: true },
    spotlight: { enabled: false },
  },

  // ──────────────────────────────────────── Entities ────────────────────────

  entities: {
    grade: {
      typeName: "Grade",
      typeDisplayName: "Note",
      display: {
        title: "title",
        subtitle: "subject",
        image: { systemImage: "list.number" },
      },
      properties: {
        id:      { type: "string" },
        subject: { type: "string",  title: "Matière",             queryable: true, searchable: true },
        title:   { type: "string",  title: "Évaluation",          searchable: true },
        value:   { type: "number",  title: "Note" },
        scale:   { type: "number?", title: "Barème" },
        average: { type: "number?", title: "Moyenne de la classe" },
        date:    { type: "date?",   title: "Date",                queryable: true },
      },
      defaultQueryProperty: "subject",
      stringQueryProperties: ["subject", "title"],
      indexed: true,
    },

    course: {
      typeName: "Course",
      typeDisplayName: "Cours",
      display: {
        title: "subject",
        subtitle: "room",
        image: { systemImage: "calendar" },
      },
      properties: {
        id:         { type: "string",  title: "Identifiant" },
        subject:    { type: "string",  title: "Matière",    queryable: true, searchable: true },
        from:       { type: "date",    title: "Début",      queryable: true },
        to:         { type: "date",    title: "Fin" },
        room:       { type: "string?", title: "Salle",      searchable: true },
        teacher:    { type: "string?", title: "Professeur", searchable: true },
        isCanceled: { type: "bool",    title: "Annulé" },
        status:     { type: "string?", title: "Statut" },
      },
      defaultQueryProperty: "subject",
      stringQueryProperties: ["subject", "teacher", "room"],
      indexed: true,
    },

    homework: {
      typeName: "Homework",
      typeDisplayName: "Devoir",
      display: {
        title: "subject",
        subtitle: "content",
        image: { systemImage: "book.closed" },
      },
      properties: {
        id:         { type: "string", title: "Identifiant" },
        subject:    { type: "string", title: "Matière",     queryable: true, searchable: true },
        content:    { type: "string", title: "Contenu",     searchable: true },
        dueDate:    { type: "date",   title: "Pour le",     queryable: true },
        isDone:     { type: "bool",   title: "Fait" },
        evaluation: { type: "bool",   title: "Évaluation" },
      },
      defaultQueryProperty: "subject",
      stringQueryProperties: ["subject", "content"],
      indexed: true,
    },
  },

  // ──────────────────────────────────────── Intents ─────────────────────────

  intents: [
    // ── Grades ──────────────────────────────────────────────────────────────
    {
      id: "getLatestGrades",
      action: "grades.getLatest",
      title: "Mes dernières notes",
      description: "Récupère et lit les dernières notes depuis Papillon.",
      phrases: [
        "Mes notes dans ${applicationName}",
        "Quelles sont mes dernières notes dans ${applicationName}",
        "Montre mes notes dans ${applicationName}",
      ],
      shortTitle: "Notes",
      systemImage: "list.number",
      openAppWhenRun: false,
      requiresAuth: true,
      timeoutMs: 25000,
      parameters: [],
      returns: {
        type: "entityList",
        entity: "grade",
        dialog: "${count} notes récupérées.",
      },
    },

    // ── Timetable ────────────────────────────────────────────────────────────
    {
      id: "getTodayTimetable",
      action: "timetable.getToday",
      title: "Mes cours d'aujourd'hui",
      description: "Récupère les cours d'aujourd'hui depuis Papillon.",
      phrases: [
        "Mon emploi du temps aujourd'hui dans ${applicationName}",
        "Mes cours d'aujourd'hui dans ${applicationName}",
        "Qu'est-ce que j'ai comme cours aujourd'hui dans ${applicationName}",
      ],
      shortTitle: "Cours aujourd'hui",
      systemImage: "calendar",
      openAppWhenRun: false,
      requiresAuth: true,
      timeoutMs: 25000,
      parameters: [],
      returns: {
        type: "entityList",
        entity: "course",
        dialog: "${count} cours aujourd'hui.",
      },
    },
    {
      id: "getTimetableForDay",
      action: "timetable.getForDay",
      title: "Mes cours pour un jour précis",
      description: "Récupère les cours d'un jour précis depuis Papillon.",
      phrases: [
        "Mes cours pour un jour précis dans ${applicationName}",
        "Mon emploi du temps d'un jour dans ${applicationName}",
      ],
      shortTitle: "Cours du jour",
      systemImage: "calendar.badge.clock",
      openAppWhenRun: false,
      requiresAuth: true,
      timeoutMs: 25000,
      parameters: [
        { name: "day", type: "string", title: "Jour (JJ/MM/AAAA)" },
      ],
      returns: {
        type: "entityList",
        entity: "course",
        dialog: "${count} cours ce jour-là.",
      },
    },

    // ── Homework ─────────────────────────────────────────────────────────────
    {
      id: "getTodayHomework",
      action: "homework.getToday",
      title: "Mes devoirs pour aujourd'hui",
      description: "Récupère les devoirs à faire pour aujourd'hui depuis Papillon.",
      phrases: [
        "Mes devoirs pour aujourd'hui dans ${applicationName}",
        "Qu'est-ce que j'ai à faire aujourd'hui dans ${applicationName}",
      ],
      shortTitle: "Devoirs aujourd'hui",
      systemImage: "book.closed",
      openAppWhenRun: false,
      requiresAuth: true,
      timeoutMs: 25000,
      parameters: [],
      returns: {
        type: "entityList",
        entity: "homework",
        dialog: "${count} devoir(s) pour aujourd'hui.",
      },
    },
    {
      id: "getHomeworkForDate",
      action: "homework.getForDate",
      title: "Mes devoirs pour une date",
      description: "Récupère les devoirs à faire pour une date précise depuis Papillon.",
      phrases: [
        "Mes devoirs pour une date précise dans ${applicationName}",
        "Qu'est-ce que j'ai à faire ce jour dans ${applicationName}",
      ],
      shortTitle: "Devoirs pour le",
      systemImage: "book.closed.fill",
      openAppWhenRun: false,
      requiresAuth: true,
      timeoutMs: 25000,
      parameters: [
        { name: "date", type: "string", title: "Date (JJ/MM/AAAA)" },
      ],
      returns: {
        type: "entityList",
        entity: "homework",
        dialog: "${count} devoir(s) pour cette date.",
      },
    },
  ],
};

export default config;
