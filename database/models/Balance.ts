// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export class Balance extends Model {
	static table = "balances";

	@field('createdByAccount') createdByAccount: string;
	@field('balanceId') balanceId: string;
	@field('amount') amount: number;
	@field('currency') currency: string;
	@field('lunchRemaining') lunchRemaining: number;
	@field('lunchPrice') lunchPrice: number;
	@field('label') label: string;
}