import { WindowViewModel } from '../common/window/window-view-model';

/** šta može da se pravi u Configuration modulu */
export type LookupType = 'manager' | 'strategy';

/** manager ili strategija: isti oblik */
export interface LookupItem {
  id: number;
  display: string;
}

/** prozor za Manager / Strategy; item = postojeći za izmenu, bez njega = novi; rezultat: true ako je snimljeno */
export class LookupViewModel extends WindowViewModel<boolean> {
  readonly title: string;
  override readonly width = '360px';   // mali prozor, umesto default 880px

  constructor(readonly type: LookupType, readonly item?: LookupItem) {
    super();
    const what = type === 'manager' ? 'Manager' : 'Strategy';
    this.title = `${item ? 'Edit' : 'New'} ${what}`;
  }
}