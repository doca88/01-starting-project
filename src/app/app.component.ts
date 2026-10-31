import { Component, inject, signal } from '@angular/core';
import { OrdersComponent } from './orders/orders.component';
import { AllocationsComponent } from './allocations/allocations.component';
import { LoadingComponent } from './loading/loading.component';
import { Order } from './common/models';
import { WindowService } from './common/window/window.service';
import { OrderViewModel } from './order/order.view-model';
import { Module, ModulesMenuComponent } from './modules-menu/modules-menu.component';
import { ConfigurationComponent } from './configuration/configuration.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [OrdersComponent, AllocationsComponent, LoadingComponent, ModulesMenuComponent, ConfigurationComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  private windows = inject(WindowService);

  module = signal<Module>('orders');
  
  selectedOrder = signal<Order | null>(null);

  async newOrder(orders: OrdersComponent) {
    const saved = await this.windows.show(new OrderViewModel());
    if (saved) {
      orders.search();   // order je snimljen -> osveži grid
    }
  }
}