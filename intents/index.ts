import { configure } from "papillon-intents";
import config from "@/papillon-intents.config";
import "@/intents/grades/handler";
import "@/intents/timetable/handler";
import "@/intents/homework/handler";

configure(config.settings ?? {});
