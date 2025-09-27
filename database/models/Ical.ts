// @ts-nocheck

import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export default class Ical extends Model {
  static table = 'icals';

  @field('title') title!: string;
  @field('url') url!: string;
  @field('lastupdated') lastUpdated!: number;
  @field('intelligent_parsing') intelligentParsing!: boolean;
  @field('provider') provider!: string;
}
