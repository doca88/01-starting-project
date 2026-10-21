import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Order } from './models';
import type { OrderDraft } from '../order/order.view-model';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private http = inject(HttpClient);

  getAll() {
    return this.http.post<Order[]>('/orders/query', {
      sortBy: 'OrderId',
      sortDescending: false,
      filters: [],
    });
  }

  /** Jedan nalog sa servera (za Refresh) */
  get(orderId: number) {
    return this.http.get<Order>(`/orders/${orderId}`);
  }

  /** Snima nalog: orderId 0 -> novi (POST), inače izmena postojećeg (PUT). Vraća snimljeni nalog. */
  save(draft: OrderDraft) {
    return draft.orderId === 0
      ? this.http.post<Order>('/orders', draft)
      : this.http.put<Order>(`/orders/${draft.orderId}`, draft);
  }
}