import { Schema } from 'mongoose';
import { z } from 'zod';

export const pokedexSlotSchema = z
  .object({
    speciesId: z.string().min(1),
    name: z.string(),
    isBaseFormNotIncluded: z.boolean().optional(),
    baseFormOrdinal: z.number().optional(),
    includedForms: z
      .array(
        z.object({
          speciesId: z.string().min(1),
          ordinal: z.number(),
        }),
      )
      .optional(),
  })
  .nullable();

export const pokedexSlotDbSchema = new Schema({
  speciesId: { type: String, required: false },
  name: String,
  isBaseFormNotIncluded: Boolean,
  baseFormOrdinal: Number,
  includedForms: [
    {
      speciesId: String,
      ordinal: Number,
    },
  ],
});
