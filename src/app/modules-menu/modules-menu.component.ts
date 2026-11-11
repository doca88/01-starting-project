import { Component, model, signal, ChangeDetectionStrategy } from '@angular/core';

export type Module = 'orders' | 'securities' | 'configuration' |'dashboard';

@Component({
  selector: 'app-modules-menu',
  standalone: true,
  templateUrl: './modules-menu.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './modules-menu.component.css',
})
export class ModulesMenuComponent {
  readonly module = model<Module>('orders');
  protected readonly collapsed = signal(false);
}
