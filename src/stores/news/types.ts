import type { Information } from "@/services/shared/Information";

export interface NewsStore {
  informations: Information[],
  updateInformations: (informations: Information[]) => void
}
