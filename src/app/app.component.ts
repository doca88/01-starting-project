import { Component, effect, inject, signal } from '@angular/core';
import { OrdersComponent } from './orders/orders.component';
import { AllocationsComponent } from './allocations/allocations.component';
import { LoadingComponent } from './loading/loading.component';
import { Order } from './common/models';
import { WindowService } from './common/window/window.service';
import { OrderViewModel } from './order/order.view-model';
import { Module, ModulesMenuComponent } from './modules-menu/modules-menu.component';
import { ConfigurationComponent } from './configuration/configuration.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthService } from './common/auth-service';
import { LoginViewModel } from './login/login.view-model';
import { SecuritiesComponent } from './securities/securities.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [OrdersComponent, AllocationsComponent, LoadingComponent, ModulesMenuComponent, ConfigurationComponent, DashboardComponent, SecuritiesComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  private windows = inject(WindowService);
  protected auth = inject(AuthService);
  private loginOpen = false;

  module = signal<Module>('orders');

  selectedOrder = signal<Order | null>(null);

  constructor() {
    // kad god nisi ulogovan (start, logout, 401) -> otvori login
    effect(() => {
      if (!this.auth.isLoggedIn()) {
        setTimeout(() => this.openLogin());
      }
    });
  }

  async newOrder(orders: OrdersComponent) {
    const saved = await this.windows.show(new OrderViewModel());
    if (saved) {
      orders.search();   // order je snimljen -> osveži grid
    }
  }

  async openLogin() {
    if (this.loginOpen) return;
    this.loginOpen = true;
    await this.windows.show(new LoginViewModel());
    this.loginOpen = false;
  }
}

//npm install ag-charts-angular@11 ag-charts-community@11