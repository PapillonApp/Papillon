// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

import { Meal } from '@/services/shared/canteen';

export default class CanteenMenu extends Model {
  static table = "canteenmenus";

	@field('id') id: string;
	@field('date') date: number;
	@field('lunch') lunchRaw: string;
	@field('dinner') mealRaw: string;
	@field('createdByAccount') createdByAccount: string;
	
	get lunch(): Meal {
	  return JSON.parse(this.lunchRaw);
	}

	get dinner(): Meal {
	  return JSON.parse(this.mealRaw);
	}
}