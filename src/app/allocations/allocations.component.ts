import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';
import { Allocation } from '../common/models';
import { formatQty } from '../common/utilities';

@Component({
    selector: 'app-allocations',
    imports: [AgGridAngular],
    templateUrl: './allocations.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './allocations.component.css'
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