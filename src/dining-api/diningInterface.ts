export interface INutrient {
    id: string;
    name: string; // "Calories"
    value: number;
    uom: string; // Unit of measure
    value_numeric: number;
}

export interface IFilter {
    id: string;
    name: string; // "Vegetarian", "Egg"
    type: "label" | "allergen";
}

export interface IFood {
    id: string;
    name: string; // Hard Fried Eggs
    mrn: number;
    rev: number;
    mrn_full: number;
    desc: string;
    webtrition_id: string;
    sort_order: number;
    portion: string;
    qty: null;
    nutrients: INutrient[];
    filters: IFilter;
    custom_allergens: any[];
    calories: number;
}

export interface IStation {
    id: string;
    name: string;
    sort_order: number;
    items: IFood[];
}

export interface IMealPeriod {
    id: string;
    name: string;
    sort_order: number;
    categories: IStation[];
}

export interface IMenu {
    id: string;
    date: string;
    periods: IMealPeriod[];
}

export interface ILocation {
    id: string;
    name: string;
    menu: IMenu;
  }
