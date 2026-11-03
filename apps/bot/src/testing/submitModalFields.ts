import type { MenuHarness } from '@flowcord/testing';

/**
 * Submits the open modal with the given text field values.
 *
 * `MenuHarness.submitModal` only fakes `fields.getField`, but our modal
 * handlers read `fields.fields` (the `ModalSubmitFields` collection discord.js
 * provides), so this enqueues a submit in that shape instead.
 *
 * A shared workaround for flowcord-dev/flowcord#112; #229 deletes it once
 * FlowCord ships the fix.
 */
export const submitModalFields = async (
  harness: MenuHarness,
  values: Record<string, string>,
): Promise<void> => {
  harness.adapter.enqueueModalSubmit({
    getFieldValue: (id: string) => values[id] ?? '',
    raw: {
      deferred: false,
      replied: false,
      deferUpdate: async () => undefined,
      fields: {
        fields: new Map(
          Object.entries(values).map(([id, value]) => [id, { value }]),
        ),
      },
    },
  } as never);
  await harness.adapter.waitForNextRender();
};
