import { signal, WritableSignal } from '@angular/core';
import { WindowViewModel } from '../common/window/window-view-model';
import { Security } from '../common/models';

export class SecurityViewModel extends WindowViewModel<boolean> {
  override readonly width = '800px';
  override readonly height = '200px';

  /** Trenutna hartija; null = nova. Signal, pa se naslov sam osveži posle Save. */
  readonly security: WritableSignal<Security | null>;

  constructor(security: Security | null = null) {
    super();
    this.security = signal(security);
  }

  get isNew() {
    return this.security() === null;
  }

  get title() {
    const s = this.security();
    return s ? `Security ${s.sid}` : 'New Security';
  }

  get subtitle() {
    const s = this.security();
    return s ? s.description : 'Sid · auto';
  }
}