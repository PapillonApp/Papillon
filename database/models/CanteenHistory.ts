// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export default class CanteenHistoryItem extends Model {
    static table = "canteentransactions";

    @field('transactionId') transactionId: string;
    @field('date') date: number;
    @field('label') label: string;
    @field('currency') currency: string;
    @field('amount') amount: number;
    @field('createdByAccount') createdByAccount: string;
}