import { Category } from "@/modules/Categories";

export interface WidgetCategoryItem extends Partial<Category> {
    value: number;
    color?: string;
}