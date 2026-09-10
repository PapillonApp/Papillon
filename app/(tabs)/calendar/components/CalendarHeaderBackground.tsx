// The calendar title is a custom component, so the bar needs the shared
// stand-in for UIKit's scroll-edge material. Kept as its own module so the
// calendar layout goes on importing it from here.
export { ProgressiveHeaderBackground as CalendarHeaderBackground, default } from "@/components/ProgressiveHeaderBackground";
