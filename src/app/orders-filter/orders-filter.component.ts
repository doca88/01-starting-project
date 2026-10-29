import { Component, output, inject, signal, computed } from '@angular/core';
import { LookupCache } from '../common/lookup-cache';
import { FormsModule } from '@angular/forms';

export interface OrdersFilter {
  sid: string;
  orderId: string;
  endDate: string;   // 'yyyy-MM-dd' ili ''
  startDate: string;   // 'yyyy-MM-dd' ili ''
  managerId: number | null;
  strategyId: number | null;
}

@Component({
  selector: 'app-orders-filter',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './orders-filter.component.html',
  styleUrl: './orders-filter.component.css'
})

export class OrdersFilterComponent {

  public lookups = inject(LookupCache);
  public filterChange = output<OrdersFilter>();

  protected readonly sid = signal('');
  protected readonly orderId = signal('');
  protected readonly startDate = signal('');
  protected readonly endDate = signal('');
  protected readonly managerId = signal<number | null>(null);
  protected readonly strategyId = signal<number | null>(null);

  /** Sve vrednosti zajedno; roditelj ga čita na Search */
  readonly filter = computed<OrdersFilter>(() => ({
    sid: this.sid(),
    orderId: this.orderId(),
    startDate: this.startDate(),
    endDate: this.endDate(),
    managerId: this.managerId(),
    strategyId: this.strategyId(),
  }));

   /** Vraća sva polja na početne vrednosti; poziva je roditelj (Clear) */
  clear(): void {
    this.sid.set('');
    this.startDate.set('');
    this.endDate.set('');
    this.managerId.set(null);
    this.strategyId.set(null);
    this.orderId.set('')
  }
}
