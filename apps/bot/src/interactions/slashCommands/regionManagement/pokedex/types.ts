export type PokedexMenuState = {
  prompt?: string;
  thumbnail?: string;
};

export type NavigateMenuOptions = {
  commandName: string;
  navigatePayload?: Record<string, any>;
};

export type PokedexSlotCustomizeMenuState = {
  region_id?: string;
  pokedex_no?: string;
};

export type Slot = {
  name: string;
  speciesId: string;
  isBaseFormNotIncluded?: boolean;
  baseFormOrdinal?: number;
  includedForms?: { speciesId: string; ordinal: number }[];
};

export type Form = {
  speciesId: string;
  name: string;
};
