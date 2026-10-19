import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Order } from './models';

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
}