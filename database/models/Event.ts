// @ts-nocheck

import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export default class Event extends Model {
  static table = 'events';

  @field('title') title!: string;
  @field('start') start!: number;
  @field('end') end!: number;
  @field('color') color?: string;
  @field('room') room?: string;
  @field('teacher') teacher?: string;
  @field('status') status?: string;
  @field('canceled') canceled?: boolean;
  @field('readonly') readonly?: boolean;
}
