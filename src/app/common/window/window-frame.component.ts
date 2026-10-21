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
  template: `
    <div class="header">
      <h2 class="title">{{ title() }}</h2>
      @if (subtitle()) {
        <span class="subtitle">{{ subtitle() }}</span>
      }
      <span class="spacer"></span>
      <button type="button" class="close" aria-label="Close" (click)="closeClicked.emit()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18"></path>
        </svg>
      </button>
    </div>

    <div class="body">
      <ng-content></ng-content>
    </div>

    <div class="footer">
      <ng-content select="[windowFooter]"></ng-content>
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      max-height: 90vh;
      box-sizing: border-box;
      background: #262626;
      color: #e0e0e0;
      border: 1px solid #3c3c3c;
      border-top: 2px solid #d8364a;   /* crveni akcent, kao kod loadera */
      border-radius: 6px;
      box-shadow: 0 24px 64px rgba(0, 0, 0, 0.65);
      overflow: hidden;
      font-size: 12px;
    }
    .header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 5px 8px 5px 14px;
      background: #181818;
      border-bottom: 1px solid #3c3c3c;
    }
    .title {
      margin: 0;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.15em;
    }
    .subtitle {
      color: #9a9a9a;
    }
    .spacer {
      flex-grow: 1;
    }
    .close {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      background: transparent;
      border: 1px solid transparent;
      border-radius: 3px;
      color: #cfcfcf;
      cursor: pointer;
    }
    .close:hover {
      background: #3a3a3a;
      color: #ffffff;
    }
    .body {
      flex: 1;
      min-height: 0;
      overflow: auto;
    }
    .footer {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 10px 16px;
      border-top: 1px solid #3c3c3c;
      background: #222222;
    }
  `,
})
export class WindowFrameComponent {
  title = input.required<string>();
  subtitle = input<string>('');
  closeClicked = output<void>();
}