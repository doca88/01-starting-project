import { WritableSignal, signal } from '@angular/core';
import { WindowViewModel } from '../common/window/window-view-model';
import { Order } from '../common/models';

export type OrderDraft = Pick<Order, 'orderId' | 'quantity' | 'tradeDate' | 'managerId' | 'strategyId' | 'sid'>;

/**
 * ViewModel order forme. order = null -> novi order.
 * Rezultat prozora je poslednji snimljeni Order (ili undefined ako ništa nije snimljeno).
 */
export class OrderViewModel extends WindowViewModel<Order> {
  override readonly width = '1000px';

  /** Trenutni nalog. Signal, pa se naslov prozora sam osveži kad Book vrati snimljeni nalog. */
  readonly order: WritableSignal<Order | null>;

  constructor(order: Order | null = null) {
    super();
    this.order = signal(order);
  }

  get isNew() {
    return this.order() === null;
  }

  get title() {
    const o = this.order();
    return o ? `Order ${o.orderId}` : 'New Order';
  }

  get subtitle() {
    const o = this.order();
    return o ? `${o.manager?.display ?? ''} · ${o.strategy?.display ?? ''}` : 'Order Id 0 · New';
  }
}