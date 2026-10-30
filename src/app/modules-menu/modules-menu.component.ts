import { Component, model, signal } from '@angular/core';

export type Module = 'orders' | 'securities' | 'configuration';

@Component({
  selector: 'app-modules-menu',
  standalone: true,
  templateUrl: './modules-menu.component.html',
  styleUrl: './modules-menu.component.css',
})
export class ModulesMenuComponent {
  readonly module = model<Module>('orders');
  protected readonly collapsed = signal(false);
}
