import { WindowViewModel } from '../common/window/window-view-model';
import { Order } from '../common/models';


/** ViewModel order forme. order = null -> novi order */
export class OrderViewModel extends WindowViewModel<Order> {

  override readonly width = '1000px';
  override readonly height = '600px';
  
  constructor(readonly order: Order | null = null) {
    super();
  }

  get isNew() {
    return this.order === null;
  }

  get title() {
    return this.isNew ? 'New Order' : `Order ${this.order!.orderId}`;
  }

  get subtitle() {
    return this.isNew ? 'Order Id 0 · New' : `${this.order!.manager.display} · ${this.order!.strategy.display}`;
  }

  book() {
    // TODO: snimiti preko API-ja, pa vratiti snimljeni order
    this.close(this.order ?? undefined);
  }
}