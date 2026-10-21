import { Component, input, output } from '@angular/core';

/**
 * Zajednički "chrome" svakog prozora: naslov, X, telo i futer za dugmad.
 * <app-window-frame [title]="vm.title" (closeClicked)="vm.close()">
 *   ...telo...
 *   <ng-container windowFooter> ...dugmad... </ng-container>
 * </app-window-frame>
 */
@Component({
  selector: 'app-window-frame',
  standalone: true,
  templateUrl: './window-frame.component.html',
  styleUrl: './window-frame.component.css'
})

export class WindowFrameComponent {
  title = input.required<string>();
  subtitle = input<string>('');
  closeClicked = output<void>();
}