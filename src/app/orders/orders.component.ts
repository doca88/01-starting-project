import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Order, OrdersService } from '../common/orders.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css',
})
export class OrdersComponent implements OnInit {
  private ordersService = inject(OrdersService);

  orders = signal<Order[]>([]);
  error = signal('');

  // Kolone iz prvog ordera; npr. "managerId" se preskače jer postoji "manager" objekat
  columns = computed(() => {
    const first = this.orders()[0];
    if (!first) return [];
    return Object.keys(first).filter((key) => {
      if (!key.endsWith('Id')) return true;
      const ref = first[key.slice(0, -2)];
      return !(ref && typeof ref === 'object');
    });
  });

  gridColumns = computed(() => `repeat(${this.columns().length}, minmax(80px, 1fr))`);

  ngOnInit() {
    this.ordersService.getAll().subscribe({
      next: (data) => this.orders.set(data),
      error: (err) => this.error.set(`${err.status} ${err.statusText}`),
    });
  }

  // { id, display } -> display, lista -> broj stavki, ostalo -> vrednost
  cell(value: unknown): unknown {
    if (Array.isArray(value)) return value.length;
    if (value && typeof value === 'object' && 'display' in value) return value.display;
    return value;
  }
}