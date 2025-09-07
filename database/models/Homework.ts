// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Model } from '@nozbe/watermelondb';
import { field} from "@nozbe/watermelondb/decorators";

export default class Homework extends Model {
  static table = 'homework';

  static associations = {
    subjects: { type: 'belongs_to', key: 'subjectId' },
  };

  @field('createdByAccount') createdByAccount: string;
	@field('kidName') kidName: string;
  @field('homeworkId') homeworkId: string;
  @field('subject') subject: string;
  @field('content') content: string;
  @field('dueDate') dueDate: number;
  @field('isDone') isDone: boolean;
  @field('returnFormat') returnFormat: number;
  @field('attachments') attachments: string;
  @field('evaluation') evaluation: boolean;
  @field('custom') custom: boolean;
}