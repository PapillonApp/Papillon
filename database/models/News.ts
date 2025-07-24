// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Model } from '@nozbe/watermelondb';
import { field } from "@nozbe/watermelondb/decorators";

export default class News extends Model {
  static table = 'news';

  @field('createdByAccount') createdByAccount: string;
  @field('newsId') newsId: string;
  @field('title') title: string;
  @field('createdAt') createdAt: number;
  @field('acknowledged') acknowledged: boolean;
  @field('attachments') attachments: string;
  @field('content') content: string;
  @field('author') author: string;
  @field('category') category: string;
}