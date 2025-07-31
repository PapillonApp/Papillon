import { lazy } from "react";
// Lazy load components to improve initial load performance
var AttendanceElement = lazy(function () { return import("./Elements/AttendanceElement"); });
var GradesElement = lazy(function () { return import("./Elements/GradesElement"); });
var HomeworksElement = lazy(function () { return import("./Elements/HomeworksElement"); });
var TimetableElement = lazy(function () { return import("./Elements/TimetableElement"); });
export var Elements = [
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
