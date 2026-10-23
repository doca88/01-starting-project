import { Component, signal } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import {
  ColDef,
  GetRowIdFunc,
  GridApi,
  GridReadyEvent,
  ValueFormatterParams,
  ValueSetterParams,
} from 'ag-grid-community';

import { Allocation, Manager, Strategy } from '../common/models';

const textFormatter = (p: ValueFormatterParams<Allocation, string>) =>
  p.value ?? '';

const qtyFormatter = (p: ValueFormatterParams<Allocation, number>) =>
  p.value == null ? '' : p.value.toLocaleString('en-US');

@Component({
  selector: 'app-allocation-grid',
  standalone: true,
  imports: [AgGridAngular],
  templateUrl: './allocation-grid.component.html',
  styleUrl: './allocation-grid.component.css',
})
export class AllocationGridComponent {
  allocations = signal<Allocation[]>([]);
  managers = signal<Manager[]>([]);
  strategies = signal<Strategy[]>([]);

  editMode = signal(false);
  dirty = signal(false);

  private gridApi?: GridApi<Allocation>;
  private snapshot: Allocation[] = [];

  columns: ColDef<Allocation>[] = [
    {
      field: 'manager.display',
      headerName: 'Manager',
      valueFormatter: textFormatter,
      filter: true,
      editable: () => this.editMode(),
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: () => ({ values: this.managers().map(m => m.display) }),
      valueSetter: p => this.setManager(p),
    },
    {
      field: 'strategy.display',
      headerName: 'Strategy',
      valueFormatter: textFormatter,
      filter: true,
      editable: () => this.editMode(),
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: () => ({ values: this.strategies().map(s => s.display) }),
      valueSetter: p => this.setStrategy(p),
    },
    {
      field: 'quantity',
      headerName: 'Quantity',
      type: 'rightAligned',
      cellDataType: 'number',
      valueFormatter: qtyFormatter,
      maxWidth: 140,
      editable: () => this.editMode(),
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

  onGridReady(e: GridReadyEvent<Allocation>) {
    this.gridApi = e.api;
  }

  startEdit() {
    // Grid piše izmene direktno u objekte iz rowData, zato čuvamo kopiju za Cancel.
    this.snapshot = structuredClone(this.allocations());
    this.dirty.set(false);
    this.editMode.set(true);
  }

  cancelEdit() {
    this.gridApi?.stopEditing(true);
    this.allocations.set(this.snapshot);
    this.dirty.set(false);
    this.editMode.set(false);
  }

  save() {
    // Zatvara editor ako je korisnik kliknuo Save dok je ćelija još otvorena.
    this.gridApi?.stopEditing();

    const rows = this.allocations(); // već sadrži izmene iz grida
    // TODO: this.allocationService.save(rows).subscribe(...)

    this.dirty.set(false);
    this.editMode.set(false);
  }

  private setManager(p: ValueSetterParams<Allocation>): boolean {
    const m = this.managers().find(x => x.display === p.newValue);
    if (!m || m.id === p.data.managerId) return false;
    p.data.manager = m;
    p.data.managerId = m.id;
    return true;
  }

  private setStrategy(p: ValueSetterParams<Allocation>): boolean {
    const s = this.strategies().find(x => x.display === p.newValue);
    if (!s || s.id === p.data.strategyId) return false;
    p.data.strategy = s;
    p.data.strategyId = s.id;
    return true;
  }
}