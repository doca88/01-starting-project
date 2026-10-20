import { Component, signal } from '@angular/core';
import { OrdersComponent } from './orders/orders.component';
import { AllocationsComponent } from './allocations/allocations.component';
import { Order } from './common/models';
import { LoadingComponent } from './loading/loading.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [OrdersComponent, AllocationsComponent, LoadingComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  selectedOrder = signal<Order | null>(null);
}