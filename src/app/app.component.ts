import { Component, signal } from '@angular/core';
import { OrdersComponent } from './orders/orders.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [OrdersComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {

  selectedUserName = signal<string>('');

  onSelectUser(userId: string) {

  }

}
