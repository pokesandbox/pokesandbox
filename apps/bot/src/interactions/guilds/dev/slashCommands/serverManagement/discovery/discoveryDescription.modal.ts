import type { ModalConfig } from '@flowcord/core';
import {
  LabelBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';

import { saveServer } from '@bot/cache';
import type { AdminMenuContext } from '@bot/classes';
import { getModalTextValue } from '@bot/utils';

export const DISCOVERY_DESCRIPTION_MODAL_ID = 'discovery-description-modal';
const DESCRIPTION_FIELD_ID = 'discovery-description';
const MAX_DESCRIPTION_LENGTH = 1000;

export const getDiscoveryDescriptionModal = (
  currentDescription?: string,
): ModalConfig<AdminMenuContext> => ({
  id: DISCOVERY_DESCRIPTION_MODAL_ID,
  builder: new ModalBuilder()
    .setCustomId(DISCOVERY_DESCRIPTION_MODAL_ID)
    .setTitle('Server Discovery Description')
    .addLabelComponents(
      new LabelBuilder().setLabel('Server Description').setTextInputComponent(
        new TextInputBuilder()
          .setCustomId(DESCRIPTION_FIELD_ID)
          .setStyle(TextInputStyle.Paragraph)
          .setMaxLength(MAX_DESCRIPTION_LENGTH)
          .setRequired(true)
          .setValue(currentDescription?.slice(0, MAX_DESCRIPTION_LENGTH) ?? ''),
      ),
    ),
  onSubmit: async (ctx, fields) => {
    const server = await ctx.admin.getServer();
    server.discovery.description = getModalTextValue(
      fields.fields,
      DESCRIPTION_FIELD_ID,
      true,
    );

    await saveServer(server);
    ctx.state.set('prompt', 'Successfully updated the server description.');
  },
});
