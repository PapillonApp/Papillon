// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Model } from '@nozbe/watermelondb';
import { field, relation } from '@nozbe/watermelondb/decorators';

export class Chat extends Model {
  static table = 'chats';
	
	@field('createdByAccount') createdByAccount: string;
	@field('id') id: string;
	@field('subject') subject: string;
	@field('recipient') recipient?: string;
	@field('creator') creator?: string;
	@field('date') date: number;
	@relation('recipients', 'id') recipients?: Recipient[];
	@children('messages') messages?: Message[];
}

export class Recipient extends Model {
  static table = 'recipients';

	@field('id') id: string;
	@field('name') name: string;
	@field('class') class?: string;
	@relation('chats', 'id') chat;
}

export class Message extends Model {
  static table = 'messages';

	@field('id') id: string;
	@field('content') content: string;
	@field('author') author: string;
	@field('subject') subject: string;
	@field('date') date: number;
	@field('attachments') attachments: string;
	@relation('chats', 'id') chat: Chat;
}