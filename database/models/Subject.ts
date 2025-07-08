import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export default class Subject extends Model {
  static table = 'subjects';

  @field('name') name!: string;
  @field('code') code?: string;
  @field('color') color?: string;
}
