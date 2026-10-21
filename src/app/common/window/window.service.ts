import { Injectable, inject } from '@angular/core';
import { Dialog, DIALOG_DATA } from '@angular/cdk/dialog';
import { firstValueFrom } from 'rxjs';
import { WindowViewModel } from './window-view-model';
import { WINDOW_VIEWS } from './window-views';

export interface WindowOptions {
  width?: string;    // ako se ne zada, uzima se vm.width
  height?: string;   // ako se ne zada, uzima se vm.height
}

@Injectable({ providedIn: 'root' })
export class WindowService {
  private dialog = inject(Dialog);
  private views = inject(WINDOW_VIEWS);

  show<TResult>(vm: WindowViewModel<TResult>, options: WindowOptions = {}): Promise<TResult | undefined> {
    const view = this.views.get(vm.constructor as any);
    if (!view) {
      throw new Error(`WindowService: no view registered for ${vm.constructor.name}`);
    }

    const ref = this.dialog.open<TResult>(view, {
      data: vm,
      width: options.width ?? vm.width,
      height: options.height ?? vm.height,
      maxWidth: '95vw',
      maxHeight: '90vh',
      ariaLabel: vm.title,
      backdropClass: 'app-window-backdrop',
      panelClass: 'app-window-panel',
    });

    vm.attachClose((result) => ref.close(result));
    return firstValueFrom(ref.closed);
  }
}

/** u komponenti prozora: vm = injectViewModel<OrderViewModel>(); */
export function injectViewModel<T extends WindowViewModel<any>>(): T {
  return inject<T>(DIALOG_DATA);
}