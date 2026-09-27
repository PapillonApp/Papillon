// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

import { Meal } from '@/services/shared/canteen';

export default class CanteenMenu extends Model {
  	static table = "canteenmenus";

	@field('menuId') menuId: string;
	@field('date') date: number;
	@field('lunch') lunchRaw: string;
	@field('dinner') mealRaw: string;
	@field('createdByAccount') createdByAccount: string;
	
	get lunch(): Meal | undefined {
	  if (!this.lunchRaw) return undefined;
	  try {
	    return JSON.parse(this.lunchRaw);
	  } catch {
	    return undefined;
	  }
	}

	get dinner(): Meal | undefined {
	  if (!this.mealRaw) return undefined;
	  try {
	    return JSON.parse(this.mealRaw);
	  } catch {
	    return undefined;
	  }
	}
}