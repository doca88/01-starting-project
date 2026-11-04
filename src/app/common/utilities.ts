import { ValueFormatterParams } from "ag-grid-enterprise";
import { Allocation } from "./models";

/** 1093.48 -> "1,093.48" */
export const formatQty = (value: number | null | undefined) =>
  value?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '';

/** Input red pokazuje "New allocation…" dok manager nije izabran */
export const managerFormatter = (p: ValueFormatterParams<Allocation, string>) =>
  isInputRow(p.data) && !p.value ? 'New allocation…' : p.value ?? '';

export const textFormatter = (p: ValueFormatterParams<Allocation, string>) =>
  p.value ?? '';

/** 0 se ne prikazuje (input red pre unosa; prava alokacija ima quantity >= 1) */
export const qtyFormatter = (p: ValueFormatterParams<Allocation, number>) =>
  !p.value ? '' : p.value.toLocaleString('en-US');

export const idFormatter = (p: ValueFormatterParams<Allocation, number>) => {
  if (isInputRow(p.data)) return '';                                  // input red još nije alokacija
  return p.value != null && p.value > 0 ? String(p.value) : '0';     // novi, nesnimljen red: 0
};

export function isInputRow(a: Allocation | null | undefined): boolean {
    return a?.allocationId === 0;
}

