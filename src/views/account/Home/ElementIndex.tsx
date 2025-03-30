import React, { lazy } from "react";

// Lazy load components to improve initial load performance
const AttendanceElement = lazy(() => import("./Elements/AttendanceElement"));
const GradesElement = lazy(() => import("./Elements/GradesElement"));
const HomeworksElement = lazy(() => import("./Elements/HomeworksElement"));
const TimetableElement = lazy(() => import("./Elements/TimetableElement"));

export type Element = {
  id: string;
  component: React.LazyExoticComponent<React.FC<any>>; // Use LazyExoticComponent for lazy-loaded components
  importance?: number;
};

export const Elements: Element[] = [
  {
    id: "timetable",
    component: TimetableElement,
  },
  {
    id: "grades",
    component: GradesElement,
  },
  {
    id: "attendance",
    component: AttendanceElement,
  },
  {
    id: "homeworks",
    component: HomeworksElement,
  },
];
