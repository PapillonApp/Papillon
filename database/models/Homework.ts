// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Model } from '@nozbe/watermelondb';
import { field, relation } from "@nozbe/watermelondb/decorators";

import Subject from './Subject';

export default class Homework extends Model {
  static table = 'homework';

  static associations = {
    subjects: { type: 'belongs_to', key: 'subjectId' },
  };

  @field('createdByAccount') createdByAccount: string;
  @field('homeworkId') homeworkId: string;
  @field('subjectId') subjectId: string;
  @relation('subjects', 'subjectId') subject: Subject;
  @field('content') content: string;
  @field('dueDate') dueDate: number;
  @field('isDone') isDone: boolean;
  @field('returnFormat') returnFormat: number;
  @field('attachments') attachments: string;
  @field('evaluation') evaluation: boolean;
  @field('custom') custom: boolean;
}