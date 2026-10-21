import test from 'node:test';
import assert from 'node:assert/strict';
import { convertSpec } from '../apps/web/src/lib/units.ts';
import { interpretDiscovery } from '../apps/web/src/lib/discovery.ts';
test('unit conversions distinguish power, speed, mass and unknown values', () => {
  assert.deepEqual(convertSpec(100, 'hp', 'metric'), { value: 74.57, unit: 'kW' });
  assert.deepEqual(convertSpec(100, 'kg', 'imperial'), { value: 220.46, unit: 'lb' });
  assert.deepEqual(convertSpec('unknown', 'kg', 'imperial'), { value: 'unknown', unit: 'kg' });
  assert.deepEqual(convertSpec(0, 'kg', 'imperial'), { value: 0, unit: 'lb' });
  assert.deepEqual(convertSpec(100, 'mph', 'metric'), { value: 160.93, unit: 'km/h' });
});
test('discovery exposes deterministic interpretation without inventing fastest claims', () => {
  const result = interpretDiscovery('show me lightweight classics'); assert.equal(result.sort, 'weight'); assert.equal(result.classic, true); assert.equal(result.remaining, '');
  assert.equal(interpretDiscovery('fastest cars').sort, '');
});
