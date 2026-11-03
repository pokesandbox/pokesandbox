import type { AdminMenuContext } from '@bot/classes';
import {
  getPokedexSlotModal,
  getPokemonNameModal,
  parsePokedexNo,
} from './pokedex.modal';
import { handleAddPokemonToSlot } from './pokedexHelperFunctions';

jest.mock('./editPokedexSlot', () => ({
  EDIT_POKEDEX_SLOT_COMMAND_NAME: 'edit-pokedex-slot',
}));
jest.mock('./pokedexHelperFunctions', () => ({
  handleAddPokemonToSlot: jest.fn(),
}));

const buildCtx = () =>
  ({
    state: { set: jest.fn() },
    goTo: jest.fn(),
  }) as unknown as AdminMenuContext;

const buildFields = (values: Record<string, string>) =>
  ({
    fields: {
      get: (id: string) => (id in values ? { value: values[id] } : undefined),
    },
  }) as never;

describe('parsePokedexNo', () => {
  it('accepts whole numbers in range, ignoring whitespace', () => {
    expect(parsePokedexNo('1')).toBe(1);
    expect(parsePokedexNo(' 25 ')).toBe(25);
    expect(parsePokedexNo('1500')).toBe(1500);
  });

  it.each(['', '0', '1501', '-3', '1.5', 'abc', '12 pikachu'])(
    'rejects %p',
    (text) => {
      expect(parsePokedexNo(text)).toBeUndefined();
    },
  );
});

describe('getPokedexSlotModal onSubmit', () => {
  const submit = (values: Record<string, string>) => {
    const ctx = buildCtx();
    return getPokedexSlotModal('region1')
      .onSubmit?.(ctx as never, buildFields(values))
      .then(() => ctx);
  };

  // The invalid-number and number-only paths are covered end to end in
  // managePokedex.integration.test.ts.
  it('adds the Pokémon when a name is given', async () => {
    const ctx = await submit({
      'pokedex-no': '25',
      'pokemon-name': ' Pikachu ',
    });
    expect(handleAddPokemonToSlot).toHaveBeenCalledWith(
      ctx,
      'region1',
      '25',
      'Pikachu',
    );
  });
});

describe('getPokemonNameModal onSubmit', () => {
  it('passes the trimmed name to the callback', async () => {
    const onName = jest.fn();
    const ctx = buildCtx();
    await getPokemonNameModal('Swap', onName).onSubmit?.(
      ctx as never,
      buildFields({ 'pokemon-name': ' Eevee ' }),
    );
    expect(onName).toHaveBeenCalledWith(ctx, 'Eevee');
  });
});
