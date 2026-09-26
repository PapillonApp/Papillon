import { Skolengo } from "skolengojs";

import { Kid } from "../shared/kid";

export function fetchSkolengoKids(session: Skolengo, accountId: string): Kid[] {
  return (session.kids ?? []).map(kid => ({
    id: kid.userId,
    firstName: kid.firstName,
    lastName: kid.lastName,
    class: kid.className,
    dateOfBirth: kid.dateOfBirth,
    createdByAccount: accountId,
    ref: kid
  }))
}