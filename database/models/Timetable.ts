// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Model } from '@nozbe/watermelondb';
import { field } from "@nozbe/watermelondb/decorators";

export default class Course extends Model {
  static table = 'courses';

  @field('createdByAccount') createdByAccount: string;
	@field('kidName') kidName: string;
  @field('courseId') courseId: string;
	@field('subject') subject: string;
	@field('type') type: number;
	@field('from') from: number;
	@field('to') to: number;
	@field('additionalInfo') additionalInfo?: string;
	@field('room') room?: string;
	@field('teacher') teacher?: string;
	@field('group') group?: string;
	@field('backgroundColor') backgroundColor?: string;
	@field('status') status?: number;
	@field('url') url?: string;
}