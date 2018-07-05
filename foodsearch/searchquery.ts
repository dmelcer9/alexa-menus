export interface INutrientFilter {
    type: "Nutrient";
    nutrientName: string;
    lowerBound: number;
    upperBound: number;
}

export interface ILabelFilter {
    type: "Label";
    labelName: string;
}

export interface IAllergyFilter {
    type: "Allergy";
    allergenName: string;
}

export type SearchFilter = INutrientFilter | ILabelFilter | IAllergyFilter;

export interface ISearchQuery {
    searchTerm: string;
    dates: number | string[]; // Number of days ahead or array of dates
    filters?: SearchFilter[];
}
