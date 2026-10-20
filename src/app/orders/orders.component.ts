import { Component, OnInit, inject, signal, output } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GetContextMenuItems, RowSelectionOptions, SelectionChangedEvent, StatusBar } from 'ag-grid-community';
import { OrdersService } from '../common/orders.service';
import { Order } from '../common/models';
import { delay } from 'rxjs';

/** 1093.48 -> "1,093.48" */
const formatQty = (value: number | null | undefined) =>
  value?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [AgGridAngular],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css',
})
export class OrdersComponent implements OnInit {
  private ordersService = inject(OrdersService);

  orders = signal<Order[]>([]);
  error = signal('');
  orderSelected = output<Order | null>();
  loading = signal(true);

  // ---- status bar na dnu grida ----
  statusBar: StatusBar = {
    statusPanels: [
      { statusPanel: 'agTotalAndFilteredRowCountComponent', align: 'left' },   // Rows: 40 / Rows: 12 of 40
      {
        statusPanel: 'agAggregationComponent',                                 // Sum / Avg / Count označenih ćelija
        statusPanelParams: {
          aggFuncs: ['sum', 'avg', 'count'],
          valueFormatter: (p: { key: string; value: number | null }) =>
            p.key === 'count' ? String(p.value) : formatQty(p.value),
        },
      },
    ],
  };

  defaultColDef: ColDef = {
    filter: true,         // ikonica filtera u headeru
    enableRowGroup: true, // kolona moze da se prevuce u group panel
  };

  columns: ColDef<Order>[] = [
    {
      field: 'orderId',
      // Total red nema order -> labela; kad je grid grupisan, labelu vec ispisuje Group kolona
      valueFormatter: (p) =>
        p.node?.footer
          ? (p.api.getRowGroupColumns().length ? '' : 'Total')
          : String(p.value ?? ''),
    },
    { field: 'sid' },
    {
      field: 'quantity',
      type: 'rightAligned',
      aggFunc: 'sum',
      valueFormatter: (p) => formatQty(p.value),
    },
    { field: 'tradeDate', valueFormatter: (p) => p.value?.substring(0, 10) },
    { field: 'manager.display', headerName: 'Manager' },
    { field: 'strategy.display', headerName: 'Strategy' },
  ];

  rowSelection: RowSelectionOptions = {
    mode: 'singleRow',
    checkboxes: false,
    enableClickSelection: true,
  };

  ngOnInit() {
    this.search();
  }

  search() {
    this.loading.set(true);
    this.error.set('');

    this.ordersService.getAll()
      .pipe(delay(1000))          // TODO: privremeno, samo da se vidi animacija
      .subscribe({
        next: (data) => {
          this.orders.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(`${err.status} ${err.statusText}`);
          this.loading.set(false);
        },
      });
  }

  onSelectionChanged(e: SelectionChangedEvent<Order>) {
    this.orderSelected.emit(e.api.getSelectedNodes()[0]?.data ?? null);
  }

  // ---- kontekstni meni ----
  getContextMenuItems: GetContextMenuItems<Order> = (params) => [
    {
      name: 'Open Order',
      disabled: !params.node?.data,          // group red nema order
      action: () => this.openOrder(params.node!.data!),
    },
    'separator',
    ...(params.defaultItems ?? []),          // Copy, Export...
  ];

  openOrder(order: Order) {
    // TODO: otvoriti order formu
  }
}