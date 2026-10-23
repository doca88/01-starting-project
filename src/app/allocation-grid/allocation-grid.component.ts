import { Component, computed, inject, input, model, signal } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import {
  CellValueChangedEvent,
  ColDef,
  GetContextMenuItems,
  GetRowIdFunc,
  GridApi,
  GridReadyEvent,
  PostSortRowsParams,
  RowClassParams,
  RowStyle,
  ValueFormatterParams,
  ValueSetterParams,
} from 'ag-grid-community';

import { Allocation } from '../common/models';
import { LookupCache } from '../common/lookup-cache';

/** Input red ima id 0, koji nikad nema ni pravi (> 0) ni novi (< 0) red */
const INPUT_ROW_ID = 0;

function emptyRow(): Allocation {
  return { allocationId: INPUT_ROW_ID, orderId: 0, managerId: 0, strategyId: 0, quantity: 0 } as Allocation;
}

function isInputRow(a: Allocation | null | undefined): boolean {
  return a?.allocationId === INPUT_ROW_ID;
}

/** Input red pokazuje "New allocation…" dok manager nije izabran */
const managerFormatter = (p: ValueFormatterParams<Allocation, string>) =>
  isInputRow(p.data) && !p.value ? 'New allocation…' : p.value ?? '';

const textFormatter = (p: ValueFormatterParams<Allocation, string>) =>
  p.value ?? '';

/** 0 se ne prikazuje (input red pre unosa; prava alokacija ima quantity >= 1) */
const qtyFormatter = (p: ValueFormatterParams<Allocation, number>) =>
  !p.value ? '' : p.value.toLocaleString('en-US');

const idFormatter = (p: ValueFormatterParams<Allocation, number>) => {
  if (isInputRow(p.data)) return '';                                  // input red još nije alokacija
  return p.value != null && p.value > 0 ? String(p.value) : '0';     // novi, nesnimljen red: 0
};

@Component({
  selector: 'app-allocation-grid',
  standalone: true,
  imports: [AgGridAngular],
  templateUrl: './allocation-grid.component.html',
  styleUrl: './allocation-grid.component.css',
})
export class AllocationGridComponent {
  private readonly lookups = inject(LookupCache);
  private gridApi?: GridApi<Allocation>;

  /**
   * Alokacije, dvosmerni binding [(allocations)]: novi red i Delete menjaju listu i u parentu.
   * Izmene iz ćelija se upisuju direktno u objekte iz liste.
   */
  readonly allocations = model<Allocation[]>([]);

  /** true kad je order forma u Edit režimu (ili je nalog nov) */
  readonly editable = input(false);

  /** Prazan red za unos; nije u allocations dok se ne popuni */
  private readonly inputRow = signal(emptyRow());

  /** Redovi grida: alokacije, a u Edit režimu i input red kao poslednji */
  readonly rows = computed(() => (this.editable() ? [...this.allocations(), this.inputRow()] : this.allocations()));

  /** treba otvoriti editor u input redu čim bude vidljiv u gridu */
  private editInputRowPending = false;

  columns: ColDef<Allocation>[] = [
    {
      field: 'allocationId',
      headerName: 'Id',
      valueFormatter: idFormatter,
      filter: true,
      maxWidth: 90,
    },
    {
      field: 'manager.display',
      headerName: 'Manager',
      valueFormatter: managerFormatter,
      filter: true,
      editable: () => this.editable(),
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: () => ({ values: this.lookups.managers().map(m => m.display) }),
      valueSetter: p => this.setManager(p),
    },
    {
      field: 'strategy.display',
      headerName: 'Strategy',
      valueFormatter: textFormatter,
      filter: true,
      editable: () => this.editable(),
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: () => ({ values: this.lookups.strategies().map(s => s.display) }),
      valueSetter: p => this.setStrategy(p),
    },
    {
      field: 'quantity',
      headerName: 'Quantity',
      type: 'rightAligned',
      cellDataType: 'number',
      valueFormatter: qtyFormatter,
      maxWidth: 140,
      editable: () => this.editable(),
      cellEditor: 'agNumberCellEditor',
      cellEditorParams: { min: 1, precision: 0 },
    },
  ];

  defaultColDef: ColDef<Allocation> = {
    flex: 1,
    minWidth: 100,
    sortable: true,
    resizable: true,
  };

  getRowId: GetRowIdFunc<Allocation> = p => String(p.data.allocationId);

  /** Input red u kurzivu, da se vidi da još nije alokacija */
  getRowStyle = (p: RowClassParams<Allocation>): RowStyle | undefined =>
    isInputRow(p.data) ? { fontStyle: 'italic' } : undefined;

  /** Posle sortiranja vrati input red na kraj */
  postSortRows = (p: PostSortRowsParams<Allocation>) => {
    const i = p.nodes.findIndex(n => isInputRow(n.data));
    if (i >= 0 && i < p.nodes.length - 1) p.nodes.push(p.nodes.splice(i, 1)[0]);
  };

  /** Desni klik: Add otvara input red; Delete samo na pravom redu; van Edit režima onemogućeni */
  getContextMenuItems: GetContextMenuItems<Allocation> = p => {
    const row = p.node?.data && !isInputRow(p.node.data) ? p.node.data : undefined;
    return [
      { name: 'Add allocation', disabled: !this.editable(), action: () => this.editInputRow() },
      { name: 'Delete allocation', disabled: !this.editable() || !row, action: () => row && this.deleteRow(row) },
    ];
  };

  onGridReady(e: GridReadyEvent<Allocation>) {
    this.gridApi = e.api;

    // Nalog bez alokacija u Edit režimu (npr. novi nalog): odmah otvori input red za unos
    if (this.editable() && this.allocations().length === 0) this.editInputRow();
  }

  /** Kad se input red popuni (manager, strategija, quantity), postaje prava alokacija, a ispod nje novi prazan */
  onCellValueChanged(e: CellValueChangedEvent<Allocation>) {
    if (!isInputRow(e.data)) return;

    const row = e.data;
    if (!row.managerId || !row.strategyId || !(row.quantity > 0)) return;   // još nije popunjen

    const list = this.allocations();
    const id = Math.min(0, ...list.map(a => a.allocationId)) - 1;   // privremeni negativan id, pravi dodeljuje server
    this.allocations.set([...list, { ...row, allocationId: id }]);

    this.inputRow.set(emptyRow());
    this.editInputRowPending = true;   // novi input red stiže u grid tek posle change detection-a
  }

  /**
   * Posle svake promene redova, sortiranja ili filtera: ako čekamo, otvori editor u input redu.
   * Čeka se baš trenutni input red (posle popunjavanja stiže novi objekat sa istim id-em).
   */
  tryEditInputRow() {
    if (!this.editInputRowPending || !this.gridApi) return;

    const node = this.gridApi.getRowNode(String(INPUT_ROW_ID));
    if (node?.rowIndex == null || node.data !== this.inputRow()) return;

    this.editInputRowPending = false;
    this.gridApi.startEditingCell({ rowIndex: node.rowIndex, colKey: 'manager.display' });
  }

  /**
   * Esc u gridu ne sme da zatvori prozor:
   * - u editoru ćelije AG Grid sam poništi izmenu (i označi Esc kao obrađen);
   * - u context meniju ili filteru zatvaramo popup sami.
   * Esc van editora i popupa i dalje zatvara prozor kao i inače.
   */
  onEscape(e: Event) {
    if (e.defaultPrevented) {
      e.stopPropagation();
    } else if ((e.target as HTMLElement).closest('.ag-popup')) {
      this.gridApi?.hidePopupMenu();
      e.stopPropagation();
    }
  }

  /** Otvara Manager ćeliju input reda; ako ga filter skriva, prvo skloni filter */
  private editInputRow() {
    this.editInputRowPending = true;
    this.tryEditInputRow();

    if (this.editInputRowPending && this.gridApi?.isAnyFilterPresent()) {
      this.gridApi.setFilterModel(null);   // tryEditInputRow se ponovo poziva posle (modelUpdated)
    }
  }

  private deleteRow(row: Allocation) {
    this.allocations.set(this.allocations().filter(a => a !== row));
  }

  private setManager(p: ValueSetterParams<Allocation>): boolean {
    const m = this.lookups.managers().find(x => x.display === p.newValue);
    if (!m || m.id === p.data.managerId) return false;
    p.data.manager = m;
    p.data.managerId = m.id;
    return true;
  }

  private setStrategy(p: ValueSetterParams<Allocation>): boolean {
    const s = this.lookups.strategies().find(x => x.display === p.newValue);
    if (!s || s.id === p.data.strategyId) return false;
    p.data.strategy = s;
    p.data.strategyId = s.id;
    return true;
  }
}