import { WindowViewModel } from '../common/window/window-view-model';

/** šta može da se pravi u Configuration modulu */
export type LookupType = 'manager' | 'strategy';

/** prozor za novi Manager / Strategy; rezultat: true ako je snimljeno */
export class LookupViewModel extends WindowViewModel<boolean> {
  readonly title: string;
  override readonly width = '360px';   // mali prozor, umesto default 880px

  constructor(readonly type: LookupType) {
    super();
    this.title = type === 'manager' ? 'New Manager' : 'New Strategy';
  }
}