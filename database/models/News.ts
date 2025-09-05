// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Model } from "@nozbe/watermelondb";
import { field, text } from "@nozbe/watermelondb/decorators";

export default class News extends Model {
  static table = 'news';

  @field('createdByAccount') createdByAccount!: string;
  @field('newsId') newsId!: string;
  @text('title') title!: string;
  @field('createdAt') createdAt!: number;
  @field('acknowledged') acknowledged!: boolean;
  @text('attachments') attachments!: string;
  @text('content') content!: string;
  @text('author') author!: string;
  @text('category') category!: string;
}
