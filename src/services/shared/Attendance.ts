import type { Absence } from "./Absence";
import type { Delay } from "./Delay";
import type { Observation } from "./Observation";
import type { Punishment } from "./Punishment";

export interface Attendance {
  delays: Delay[];
  absences: Absence[];
  punishments: Punishment[];
  observations: Observation[];
}
