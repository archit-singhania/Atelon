export function convertSpec(value: string | number | boolean, unit: string | undefined, mode: string) {
  const number = typeof value === 'number' ? value : Number(value); const original = { value, unit: unit || '' };
  if (!Number.isFinite(number) || mode === 'source') return original;
  const normalized = (unit || '').toLowerCase().trim();
  const metric: Record<string, [number, string]> = { hp: [.745699872, 'kW'], bhp: [.745699872, 'kW'], ps: [.73549875, 'kW'], mph: [1.609344, 'km/h'], lb: [.45359237, 'kg'], lbs: [.45359237, 'kg'], 'lb-ft': [1.355817948, 'Nm'], 'lb·ft': [1.355817948, 'Nm'], in: [25.4, 'mm'] };
  const imperial: Record<string, [number, string]> = { kw: [1.34102209, 'hp'], 'km/h': [.621371192, 'mph'], kg: [2.204622622, 'lb'], nm: [.737562149, 'lb-ft'], mm: [.039370079, 'in'] };
  const conversion = (mode === 'metric' ? metric : imperial)[normalized];
  return conversion ? { value: Number((number * conversion[0]).toFixed(2)), unit: conversion[1] } : original;
}
