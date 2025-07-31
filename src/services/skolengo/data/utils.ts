import { User } from "scolengo-api/types/models/Common";

export const userToFormalName = (user: User) => `${user.firstName.at(0)}. ${user.lastName}`;
export const userToName = (user: User) => `${user.lastName} ${user.firstName}`;

export const _skoUcFist = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));