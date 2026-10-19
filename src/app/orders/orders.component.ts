import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { OrdersService } from '../common/orders.service';
import { Order } from '../common/models';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [DatePipe, DecimalPipe],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css',
})
export class OrdersComponent implements OnInit {
  private ordersService = inject(OrdersService);

  orders = signal<Order[]>([]);
  error = signal('');

  ngOnInit() {
    this.ordersService.getAll().subscribe({
      next: (data) => this.orders.set(data),
      error: (err) => this.error.set(`${err.status} ${err.statusText}`),
    });
  }
}