import AttendanceElement from "./Elements/AttendanceElement";
import GradesElement from "./Elements/GradesElement";
import HomeworksElement from "./Elements/HomeworksElement";
import TimetableElement from "./Elements/TimetableElement";
import React from "react";

export const Elements = [
  {
    id:  "timetable",
    component: TimetableElement,
  },
  {
    id:  "grades",
    component: GradesElement,
  },
  {
    id:  "attendance",
    component: AttendanceElement,
  },
  {
    id:  "homeworks",
    component: HomeworksElement,
  }
];

export type Element = {
  id: string
  component: React.FC<any>
  importance?: number
};
