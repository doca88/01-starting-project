import { Component, input } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';
import { Allocation } from '../common/models';

/** 1093.48 -> "1,093.48" */
const formatQty = (value: number | null | undefined) =>
  value?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '';

@Component({
  selector: 'app-allocations',
  standalone: true,
  imports: [AgGridAngular],
  templateUrl: './allocations.component.html',
  styleUrl: './allocations.component.css',
})
export class AllocationsComponent {
  orderId = input<number | null>(null);
  allocations = input<Allocation[]>([]);

  columns: ColDef<Allocation>[] = [
    {
      field: 'allocationId',
      valueFormatter: (p) => (p.node?.footer ? 'Total' : String(p.value ?? '')),   // labela u Total redu
    },
    {
      field: 'quantity',
      type: 'rightAligned',
      aggFunc: 'sum',                                                            // sabira se u Total redu
      valueFormatter: (p) => formatQty(p.value),
    },
    { field: 'manager.display', headerName: 'Manager' },
    { field: 'strategy.display', headerName: 'Strategy' },
  ];
}