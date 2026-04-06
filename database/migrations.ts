import { addColumns, schemaMigrations } from "@nozbe/watermelondb/Schema/migrations";

export const migrations = schemaMigrations({
  migrations: [
    {
      toVersion: 38,
      steps: [
        addColumns({
          table: "homework",
          columns: [{ name: "lessonContent", type: "string", isOptional: true }],
        }),
      ],
    },
    {
      toVersion: 39,
      steps: [
        addColumns({
          table: "homework",
          columns: [{ name: "supportsCompletion", type: "boolean", isOptional: true }],
        }),
      ],
    },
  ],
});
