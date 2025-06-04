import { describe, it, expect } from 'vitest';
import { convertWeight } from '../src/utils/unitConversion';

describe('convertWeight', () => {
  it('converts kg to lb', () => {
    expect(convertWeight(100, 'kg', 'lb')).toBe(220.5);
  });
});
