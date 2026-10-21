import { Component } from '@angular/core';
import { WindowFrameComponent } from '../common/window/window-frame.component';
import { injectViewModel } from '../common/window/window.service';
import { OrderViewModel } from './order.view-model';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [WindowFrameComponent],
  templateUrl: './order.component.html',
  styleUrl: './order.component.css',
})
export class OrderComponent {
  vm = injectViewModel<OrderViewModel>();
}