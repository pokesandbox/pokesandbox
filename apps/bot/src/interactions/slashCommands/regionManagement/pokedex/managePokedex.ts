import {
  ButtonStyle,
  InteractionContextType,
  SlashCommandBuilder,
} from 'discord.js';
import { z } from 'zod';

import { getAssertedCachedRegion } from '@bot/cache';
import { AdminMenuBuilder } from '@bot/classes';
import type { ISlashCommand } from '@bot/structures/interfaces';
import {
  handleRegionAutocomplete,
  onlyAdminRoles,
  parseCommandOptions,
} from '@bot/utils';
import { getManagePokedexMenuEmbeds } from './pokedex.embeds';
import { getPokedexSlotModal, POKEDEX_SLOT_MODAL_ID } from './pokedex.modal';
import type { PokedexMenuState } from './types';

const COMMAND_NAME = 'manage-pokedex';
export const MANAGE_POKEDEX_COMMAND_NAME = COMMAND_NAME;

const managePokedexCommandOptionsSchema = z.object({
  region_id: z.string().min(1),
});

export const ManagePokedexCommand: ISlashCommand = {
  name: COMMAND_NAME,
  anyUserPermissions: ['Administrator'],
  onlyRoles: onlyAdminRoles,
  onlyRolesOrAnyUserPermissions: true,
  returnOnlyRolesError: false,
  autocomplete: handleRegionAutocomplete,
  command: new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription('Manage the Pokédex for one of your PokéSandbox Regions')
    .setContexts(InteractionContextType.Guild)
    .addStringOption((option) =>
      option
        .setName('region_id')
        .setDescription('The region to manage')
        .setRequired(true)
        .setAutocomplete(true),
    ),
  createMenu: async (session, options) => {
    const { region_id } = parseCommandOptions(
      managePokedexCommandOptionsSchema,
      options,
    );

    return new AdminMenuBuilder<PokedexMenuState>(
      session,
      COMMAND_NAME,
      options,
    )
      .setButtons(() => [
        {
          label: 'Add / Edit Slot',
          fixedPosition: 'start',
          style: ButtonStyle.Success,
          opensModal: POKEDEX_SLOT_MODAL_ID,
        },
      ])
      .setEmbeds((ctx) => getManagePokedexMenuEmbeds(ctx, region_id))
      .setCancellable()
      .setListPagination({
        itemsPerPage: 50,
        getTotalQuantityItems: async () => {
          const region = await getAssertedCachedRegion(region_id);
          return region.pokedex.length;
        },
      })
      .setModal(() => getPokedexSlotModal(region_id))
      .setReturnable()
      .setTrackedInHistory()
      .build();
  },
};
