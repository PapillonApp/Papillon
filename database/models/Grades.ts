// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Model } from '@nozbe/watermelondb';
import { field } from "@nozbe/watermelondb/decorators";

export default class Period extends Model {
  static readonly table = 'periods';

  @field('createdByAccount') createdByAccount: string;
  @field('name') name: string;
  @field('id') id: string;
  @field('start') start: number;
  @field('end') end: number;
}