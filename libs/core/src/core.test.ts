import * as formulas from '@core/formulas';
import * as ports from '@core/ports';
import * as registries from '@core/registries';
import * as schemas from '@core/schemas';
import * as validation from '@core/validation';

describe('@core/* alias', () => {
  it.each([
    ['formulas', formulas],
    ['ports', ports],
    ['registries', registries],
    ['schemas', schemas],
    ['validation', validation],
  ])('resolves @core/%s', (_name, mod) => {
    expect(mod).toBeDefined();
  });
});
