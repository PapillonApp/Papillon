import { Skolengo } from "skolengojs";

import { GenericInterface } from "./types";

export interface Kid extends GenericInterface {
	id: string,
	firstName: string,
	lastName: string,
	class: string,
	dateOfBirth: Date,
	ref?: Skolengo
}