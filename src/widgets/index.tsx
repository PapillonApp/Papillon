import {ForwardRefExoticComponent, RefAttributes} from "react";
import GeneralAverageWidget from "./Components/GeneralAverage";
import NextCourseWidget from "./Components/NextCourse";
import LastGradeWidget from "./Components/LastGrade";
import RestaurantQRCodeWidget from "./Components/RestaurantQRCode";
import RestaurantBalanceWidget from "./Components/RestaurantBalance";
import LastNewsWidget from "@/widgets/Components/LastNews";
import LastAttendanceEventWidget from "@/widgets/Components/LastAttendanceEvent";
import {WidgetProps} from "@/components/Home/Widget";
import TimetableChanges from "@/widgets/Components/TimetableChanges";
import NextHomeworksWidget from "@/widgets/Components/NextHomeworks";
import NextExamWidget from "@/widgets/Components/NextExam";

interface Widget {
  component: ForwardRefExoticComponent<WidgetProps & RefAttributes<unknown>>
  isLarge: boolean
  importance: () => number
}

function isDateInTimeRange (date: Date, startHour: number, endHour: number) {
  return date.getHours() > startHour && date.getHours() < endHour;
}

// Maybe it would be nice to add more precise "importance" functions !

export const Widgets: Widget[] = [
  {
    component: RestaurantQRCodeWidget,
    isLarge: false,
    importance: () => isDateInTimeRange(new Date(), 11.5, 13) ? 5 : 0
  },
  {
    component: RestaurantBalanceWidget,
    isLarge: false,
    importance: () => isDateInTimeRange(new Date(), 11.5, 13) ? 4 : 1
  },
  {
    component: NextCourseWidget,
    isLarge: false,
    importance: () => 4
  },
  {
    component: GeneralAverageWidget,
    isLarge: false,
    importance: () => 3
  },
  {
    component: LastGradeWidget,
    isLarge: false,
    importance: () => 3
  },
  {
    component: LastNewsWidget,
    isLarge: true,
    importance: () => 3
  },
  {
    component: LastAttendanceEventWidget,
    isLarge: false,
    importance: () => 3
  },
  {
    component: TimetableChanges,
    isLarge: false,
    importance: () => 5
  },
  {
    component: NextHomeworksWidget,
    isLarge: true,
    importance: () => isDateInTimeRange(new Date(), 18, 23) ? 4 : 1
  },
  {
    component: NextExamWidget,
    isLarge: false,
    importance: () => 3
  }
];
