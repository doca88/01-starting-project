import { Component, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgCharts } from 'ag-charts-angular';
import { AgCartesianChartOptions, AgPolarChartOptions } from 'ag-charts-community';
import { LookupCache } from '../common/lookup-cache';
import { OrdersService } from '../common/orders.service';
import { Order } from '../common/models';

/** zbir količine po ključu (dan, strategija, hartija) */
function sumBy(orders: Order[], key: (o: Order) => string) {
  const sums = new Map<string, number>();
  for (const o of orders) sums.set(key(o), (sums.get(key(o)) ?? 0) + o.quantity);
  return [...sums].map(([label, quantity]) => ({ label, quantity }));
}

/** isti izgled za sve grafikone */
const look = { theme: 'ag-default-dark', background: { fill: '#262626' } } as const;

/** boje pride zastave */
const pride = {
  red: '#e40303',
  orange: '#ff8c00',
  yellow: '#ffed00',
  green: '#008026',
  blue: '#004dff',
  violet: '#750787',
};
const rainbow = Object.values(pride);

@Component({
    selector: 'app-dashboard',
    imports: [FormsModule, DecimalPipe, AgCharts],
    templateUrl: './dashboard.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  protected readonly lookups = inject(LookupCache);
  private readonly ordersService = inject(OrdersService);

  protected readonly managerId = signal<number | null>(null);
  protected readonly orders = signal<Order[]>([]);

  // KPI
  protected readonly total = computed(() => this.orders().reduce((sum, o) => sum + o.quantity, 0));
  protected readonly count = computed(() => this.orders().length);
  protected readonly avg = computed(() => (this.count() ? this.total() / this.count() : 0));
  protected readonly largest = computed(() => Math.max(0, ...this.orders().map((o) => o.quantity)));

  /** ukupno alocirano: zbir količina svih alokacija svih naloga */
  protected readonly allocated = computed(() =>
    this.orders().reduce((sum, o) => sum + (o.allocations ?? []).reduce((s, a) => s + a.quantity, 0), 0));

  /** po danu, od najstarijeg */
  private readonly byDay = computed(() =>
    sumBy(this.orders(), (o) => o.tradeDate.substring(0, 10)).sort((a, b) => a.label.localeCompare(b.label)));

  // 1. stubići po danu: crvena
  protected readonly dayChart = computed<AgCartesianChartOptions>(() => ({
    ...look,
    data: this.byDay(),
    series: [{ type: 'bar', xKey: 'label', yKey: 'quantity', fill: pride.red }],
  }));

  // 2. kumulativno kroz period: narandžasta
  protected readonly cumulativeChart = computed<AgCartesianChartOptions>(() => {
    let sum = 0;
    return {
      ...look,
      data: this.byDay().map((d) => ({ label: d.label, quantity: (sum += d.quantity) })),
      series: [{ type: 'area', xKey: 'label', yKey: 'quantity', fill: pride.orange, stroke: pride.orange, fillOpacity: 0.3 }],
    };
  });

  // 3. alocirano naspram nealociranog: žuta
  protected readonly allocationChart = computed<AgPolarChartOptions>(() => ({
    ...look,
    data: [
      { label: 'Allocated', quantity: this.allocated() },
      { label: 'Unallocated', quantity: Math.max(0, this.total() - this.allocated()) },
    ],
    series: [{ type: 'donut', angleKey: 'quantity', legendItemKey: 'label', fills: [pride.yellow, '#555555'] }],
  }));

  // 4. krug po strategiji: sve boje duge
  protected readonly strategyChart = computed<AgPolarChartOptions>(() => ({
    ...look,
    data: sumBy(this.orders(), (o) => o.strategy?.display ?? '—'),
    series: [{ type: 'donut', angleKey: 'quantity', legendItemKey: 'label', fills: rainbow }],
  }));

  // 5. vodoravni stubići po hartiji: zelena
  protected readonly securityChart = computed<AgCartesianChartOptions>(() => ({
    ...look,
    data: sumBy(this.orders(), (o) => `SID ${o.sid}`),
    series: [{ type: 'bar', direction: 'horizontal', xKey: 'label', yKey: 'quantity', fill: pride.green }],
  }));

  // 6. histogram veličine naloga: plava
  protected readonly sizeChart = computed<AgCartesianChartOptions>(() => ({
    ...look,
    data: this.orders().map((o) => ({ quantity: o.quantity })),
    series: [{ type: 'histogram', xKey: 'quantity', fill: pride.blue }],
  }));

  /** izbor u listi: učitaj naloge tog managera */
  protected load(id: number): void {
    this.managerId.set(id);
    this.ordersService
      .queryOrders({ sid: '', orderId: '', startDate: '', endDate: '', managerId: id, strategyId: null })
      .subscribe((list) => this.orders.set(list));
  }
}