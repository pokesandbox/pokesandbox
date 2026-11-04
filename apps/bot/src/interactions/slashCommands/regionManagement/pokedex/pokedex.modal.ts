import type { ModalConfig } from '@flowcord/core';
import {
  LabelBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';

import type { AdminMenuContext } from '@bot/classes';
import { getModalTextValue } from '@bot/utils';
import { EDIT_POKEDEX_SLOT_COMMAND_NAME } from './editPokedexSlot';
import { handleAddPokemonToSlot } from './pokedexHelperFunctions';
import type { PokedexMenuState } from './types';

export const POKEDEX_SLOT_MODAL_ID = 'pokedex-slot-modal';
const POKEDEX_NO_FIELD_ID = 'pokedex-no';
const POKEMON_NAME_FIELD_ID = 'pokemon-name';
const MAX_POKEDEX_NO = 1500;

export const INVALID_POKEDEX_NO_PROMPT = 'Please enter a valid Pokédex number';

/**
 * Returns the Pokédex number if the text is a whole number in range, else undefined.
 */
export const parsePokedexNo = (text: string): number | undefined => {
  const trimmed = text.trim();
  if (!/^\d+$/.test(trimmed)) return undefined;
  const pokedexNo = Number(trimmed);
  return pokedexNo >= 1 && pokedexNo <= MAX_POKEDEX_NO ? pokedexNo : undefined;
};

const buildPokedexSlotModal = (): ModalBuilder =>
  new ModalBuilder()
    .setCustomId(POKEDEX_SLOT_MODAL_ID)
    .setTitle('Add or Edit Pokédex Slot')
    .addLabelComponents(
      new LabelBuilder()
        .setLabel(`Pokédex Number (1-${MAX_POKEDEX_NO})`)
        .setTextInputComponent(
          new TextInputBuilder()
            .setCustomId(POKEDEX_NO_FIELD_ID)
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('25')
            .setRequired(true),
        ),
      new LabelBuilder()
        .setLabel('Pokémon Name (Optional)')
        .setDescription('Leave empty to modify an existing slot')
        .setTextInputComponent(
          new TextInputBuilder()
            .setCustomId(POKEMON_NAME_FIELD_ID)
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Pikachu')
            .setRequired(false),
        ),
    );

export const getPokedexSlotModal = (
  regionId: string,
): ModalConfig<AdminMenuContext<PokedexMenuState>> => ({
  id: POKEDEX_SLOT_MODAL_ID,
  builder: buildPokedexSlotModal(),
  onSubmit: async (ctx, fields) => {
    const pokedexNo = parsePokedexNo(
      getModalTextValue(fields.fields, POKEDEX_NO_FIELD_ID, true),
    );
    if (pokedexNo === undefined) {
      ctx.state.set('prompt', INVALID_POKEDEX_NO_PROMPT);
      return;
    }

    const pokemonName = getModalTextValue(
      fields.fields,
      POKEMON_NAME_FIELD_ID,
    )?.trim();

    if (!pokemonName) {
      await ctx.goTo(EDIT_POKEDEX_SLOT_COMMAND_NAME, {
        region_id: regionId,
        pokedex_no: pokedexNo,
      });
      return;
    }

    await handleAddPokemonToSlot(
      ctx,
      regionId,
      pokedexNo.toString(),
      pokemonName,
    );
  },
});

export const POKEMON_NAME_MODAL_ID = 'pokedex-pokemon-name-modal';

/**
 * A modal that asks for just a Pokémon name, for menus already scoped to one slot.
 */
export const getPokemonNameModal = (
  title: string,
  onName: (
    ctx: AdminMenuContext<PokedexMenuState>,
    pokemonName: string,
  ) => Promise<void>,
): ModalConfig<AdminMenuContext<PokedexMenuState>> => ({
  id: POKEMON_NAME_MODAL_ID,
  builder: new ModalBuilder()
    .setCustomId(POKEMON_NAME_MODAL_ID)
    .setTitle(title)
    .addLabelComponents(
      new LabelBuilder()
        .setLabel('Pokémon Name')
        .setTextInputComponent(
          new TextInputBuilder()
            .setCustomId(POKEMON_NAME_FIELD_ID)
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Pikachu')
            .setRequired(true),
        ),
    ),
  onSubmit: async (ctx, fields) => {
    await onName(
      ctx,
      getModalTextValue(fields.fields, POKEMON_NAME_FIELD_ID, true).trim(),
    );
  },
});
