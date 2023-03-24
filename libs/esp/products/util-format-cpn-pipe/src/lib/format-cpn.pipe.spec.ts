import { createPipeFactory } from '@ngneat/spectator/jest';

import { FormatCPNPipe } from './format-cpn.pipe';

describe('FormatCPNPipe', () => {
  const createPipe = createPipeFactory({
    pipe: FormatCPNPipe,
  });

  beforeEach(() => {
    createPipe();
  });

  it('create an instance', () => {
    const pipe = new FormatCPNPipe();
    expect(pipe).toBeTruthy();
  });

  it('returns empty string if product id is 0', () => {
    const pipe = new FormatCPNPipe();
    const val = pipe.transform(0, 12345);
    expect(val).toEqual('');
  });

  it('returns empty string if product id is not provided', () => {
    const pipe = new FormatCPNPipe();
    const val = pipe.transform(undefined, 12345);
    expect(val).toEqual('');
  });

  it('adds 1 to the company id of the user', () => {
    const pipe = new FormatCPNPipe();
    const val = pipe.transform(1, 12345);
    expect(val).toEqual('CPN-12346');
  });

  it('returns empty string when company id does not exist', () => {
    const pipe = new FormatCPNPipe();
    const val = pipe.transform(1);
    expect(val).toEqual('');
  });
});
