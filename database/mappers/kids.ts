import Kid from "../models/Kid";
import { Kid as SharedKid } from "@/services/shared/kid";

export function mapKidsToShared(kid: Kid): SharedKid {
	return {
		createdByAccount: kid.createdByAccount,
		id: kid.kidId,
		firstName: kid.firstName,
		lastName: kid.lastName,
		class: kid.class,
		dateOfBirth: new Date(kid.dateOfBirth)
	}
}