// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Model } from '@nozbe/watermelondb';
import { field } from "@nozbe/watermelondb/decorators";

export default class Kid extends Model {
  static table = 'kids';

  @field('createdByAccount') createdByAccount: string;
  @field('kidId') kidId: string;
	@field('firstName') firstName: string;
	@field('lastName') lastName: string;
	@field('class') class: string;
	@field('dateOfBirth') dateOfBirth: number
}