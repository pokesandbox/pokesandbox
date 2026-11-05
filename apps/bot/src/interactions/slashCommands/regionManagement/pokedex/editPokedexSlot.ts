import type { ButtonInputConfig } from '@flowcord/core';
import {
  ButtonStyle,
  InteractionContextType,
  SlashCommandBuilder,
} from 'discord.js';

import { getAssertedCachedRegion, saveRegion } from '@bot/cache';
import { AdminMenuBuilder, type AdminMenuContext } from '@bot/classes';
import type { ISlashCommand } from '@bot/structures/interfaces';
import {
  handleRegionAutocomplete,
  onlyAdminRoles,
  parseCommandOptions,
} from '@bot/utils';
import {
  getAddPokedexSlotEmbeds,
  getEditPokedexSlotEmbeds,
} from './pokedex.embeds';
import { getPokemonNameModal, POKEMON_NAME_MODAL_ID } from './pokedex.modal';
import {
  checkHasOtherFormes,
  handleAddPokemonToSlot,
  handleSwapPokemonInSlot,
  removePokedexSlot,
} from './pokedexHelperFunctions';
import { pokedexNoCommandOptionsSchema } from './schemas';
import type { PokedexMenuState } from './types';

const COMMAND_NAME = 'edit-pokedex-slot';
export const EDIT_POKEDEX_SLOT_COMMAND_NAME = COMMAND_NAME;

export const EditPokedexSlotCommand: ISlashCommand = {
  name: COMMAND_NAME,
  flag: 'discord.authoring',
  anyUserPermissions: ['Administrator'],
  onlyRoles: onlyAdminRoles,
  onlyRolesOrAnyUserPermissions: true,
  returnOnlyRolesError: false,
  autocomplete: handleRegionAutocomplete,
  command: new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription('Add a Pokémon to a regional Pokédex slot')
    .setContexts(InteractionContextType.Guild)
    .addStringOption((option) =>
      option
        .setName('region_id')
        .setDescription('The region to manage')
        .setRequired(true)
        .setAutocomplete(true),
    )
    .addIntegerOption((option) =>
      option
        .setName('pokedex_no')
        .setDescription('The Pokédex slot number')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(1500),
    ),
  createMenu: async (session, options) => {
    const { region_id, pokedex_no } = parseCommandOptions(
      pokedexNoCommandOptionsSchema,
      options,
    );
    const region = await getAssertedCachedRegion(region_id);

    const builder = new AdminMenuBuilder<PokedexMenuState>(
      session,
      COMMAND_NAME,
      options,
    )
      .setCancellable()
      .setReturnable()
      .setTrackedInHistory();

    if (!region.pokedex[+pokedex_no - 1]) {
      // handle add pokedex slot
      builder
        .setEmbeds((ctx) => getAddPokedexSlotEmbeds(ctx, region_id, pokedex_no))
        .setButtons(() => [
          {
            label: 'Add Pokémon',
            style: ButtonStyle.Success,
            opensModal: POKEMON_NAME_MODAL_ID,
          },
        ])
        .setModal(() =>
          getPokemonNameModal('Add Pokémon to Slot', (ctx, pokemonName) =>
            handleAddPokemonToSlot(ctx, region_id, pokedex_no, pokemonName),
          ),
        );
    } else {
      builder
        .setEmbeds((ctx) =>
          getEditPokedexSlotEmbeds(ctx, region_id, pokedex_no),
        )
        .setButtons((ctx) =>
          getEditPokedexSlotButtons(ctx, region_id, pokedex_no),
        )
        .setModal(() =>
          getPokemonNameModal('Swap In Pokémon', (ctx, pokemonName) =>
            handleSwapPokemonInSlot(ctx, region_id, pokedex_no, pokemonName),
          ),
        );
    }

    return builder.build();
  },
};

const getEditPokedexSlotButtons = async (
  _ctx: AdminMenuContext<PokedexMenuState>,
  regionId: string,
  pokedexNo: string,
): Promise<ButtonInputConfig<AdminMenuContext<PokedexMenuState>>[]> => {
  const hasOtherFormes = await checkHasOtherFormes(regionId, pokedexNo);

  const buttons: ButtonInputConfig<AdminMenuContext<PokedexMenuState>>[] = [];

  if (hasOtherFormes) {
    buttons.push({
      label: 'Customize',
      style: ButtonStyle.Primary,
      action: async (ctx) =>
        ctx.goTo('customize-pokedex-slot', {
          region_id: regionId,
          pokedex_no: pokedexNo,
        }),
    });
  }
  buttons.push(
    {
      label: 'Swap',
      style: ButtonStyle.Primary,
      opensModal: POKEMON_NAME_MODAL_ID,
    },
    {
      label: 'Remove',
      style: ButtonStyle.Danger,
      action: async (ctx) => {
        const region = await ctx.admin.getRegion(regionId);
        const pokedexIndex = +pokedexNo - 1;

        removePokedexSlot(region, pokedexIndex);
        await saveRegion(region);
        await ctx.hardRefresh();
      },
    },
  );
  return buttons;
};
