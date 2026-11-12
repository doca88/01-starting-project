import { Component, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { form, FormField, readonly, required, min, validate } from '@angular/forms/signals';
import { LookupCache } from '../common/lookup-cache';
import { OrdersService } from '../common/orders.service';
import { injectViewModel } from '../common/window/window.service';
import { WindowFrameComponent } from '../common/window/window-frame.component';
import { OrderViewModel } from './order.view-model';
import { AllocationGridComponent } from '../allocation-grid/allocation-grid.component';
import { Allocation, Order, Security } from '../common/models';

/** podaci order forme; select radi sa stringom, pa su managerId i strategyId stringovi ('' = nije izabran) */
interface OrderModel {
  sid: number;              // 0 = hartija nije izabrana iz liste
  tradeDate: string;        // yyyy-MM-dd
  quantity: number | null;  // null = prazno polje
  managerId: string;
  strategyId: string;
}

/** nalog sa servera -> model forme (null = nov nalog) */
function toModel(o: Order | null): OrderModel {
  return {
    sid: o?.sid ?? 0,
    tradeDate: (o?.tradeDate ?? new Date().toLocaleDateString('sv-SE')).substring(0, 10),
    quantity: o?.quantity ?? null,
    managerId: o ? String(o.managerId) : '',
    strategyId: o ? String(o.strategyId) : '',
  };
}

@Component({
    selector: 'app-order-form',
    imports: [FormField, WindowFrameComponent, AllocationGridComponent],
    templateUrl: './order.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./order.component.css']
})
export class OrderComponent {
  private readonly ordersService = inject(OrdersService);
  protected readonly orderViewModel = injectViewModel<OrderViewModel>();
  protected readonly lookups = inject(LookupCache);

  /** Aktivni tab */
  readonly tab = signal<'order' | 'allocations'>('order');

  /**
   * Radna kopija alokacija trenutnog naloga: grid upisuje izmene ovde, a ne u order().
   * Grid je menja preko [(allocations)] (popunjen input red, Delete, editovanje ćelija).
   * Izmene preživljavaju prelazak sa taba na tab; Book i Refresh je prave iznova.
   */
  readonly allocations = signal<Allocation[]>(this.copyAllocations());

  /** true dok traje snimanje - Book je tada onemogućen (nema duplog snimanja) */
  readonly saving = signal(false);

  /** true kad je korisnik kliknuo Edit na postojećem nalogu */
  readonly editing = signal(false);

  /** polja se mogu menjati: novi nalog ili Edit režim; inače je forma readonly */
  readonly editable = computed(() => this.orderViewModel.isNew || this.editing());

  /** suma quantity svih alokacija */
  readonly allocatedQty = computed(() => this.allocations().reduce((sum, a) => sum + a.quantity, 0));

  /** model forme: podaci naloga koje korisnik menja */
  readonly orderObject = signal<OrderModel>(toModel(this.orderViewModel.order()));

  /** forma nad modelom: sva pravila na jednom mestu */
  readonly orderForm = form(this.orderObject, (p) => {
    // cela forma zaključana van Edit režima; zaključana polja se i ne validiraju
    readonly(p, { when: () => !this.editable() });

    min(p.sid, 1, { message: 'Select a security' });
    required(p.tradeDate, { message: 'Trade date is required' });
    required(p.managerId, { message: 'Select a manager' });
    required(p.strategyId, { message: 'Select a strategy' });

    required(p.quantity, { message: 'Quantity is required' });
    min(p.quantity, 0.01, { message: 'Quantity must be > 0' });
    // suma alokacija mora biti jednaka Quantity (zaokruženo na 2 decimale)
    validate(p.quantity, ({ value }) =>
      Math.round(this.allocatedQty() * 100) !== Math.round((value() ?? 0) * 100)
        ? { kind: 'allocation', message: `Allocated ${this.allocatedQty().toFixed(2)}` }
        : undefined,
    );
  });

  // ----- Security: padajuća lista koja pretražuje po sid-u, a u polje upisuje description -----

  /** tekst koji se vidi u polju (posle izbora: description) */
  readonly securityText = signal(this.orderViewModel.order()?.security?.description ?? '');

  /** ono što je korisnik otkucao; po tome se filtrira lista */
  readonly securityQuery = signal('');

  /** da li je padajuća lista otvorena */
  readonly securityOpen = signal(false);

  /** hartije čiji sid počinje otkucanim tekstom (prvih 20) */
  readonly securityMatches = computed(() => {
    const q = this.securityQuery().trim();
    return this.lookups.securities()
      .filter((s) => String(s.sid).startsWith(q))
      .slice(0, 20);
  });

  /** kucanje: filtriraj listu i poništi prethodni izbor */
  searchSecurity(text: string) {
    this.securityText.set(text);
    this.securityQuery.set(text);
    this.orderObject.update((m) => ({ ...m, sid: 0 }));
    this.securityOpen.set(true);
  }

  /** izbor iz liste: sid u model, description u polje */
  pickSecurity(s: Security) {
    this.securityText.set(s.description);
    this.securityQuery.set('');
    this.orderObject.update((m) => ({ ...m, sid: s.sid }));
    this.securityOpen.set(false);
  }

  /** Enter u polju: izaberi prvu hartiju iz liste (i ne šalji formu) */
  pickFirstSecurity(e: Event) {
    e.preventDefault();
    const first = this.securityMatches()[0];
    if (first) this.pickSecurity(first);
  }

  /** Esc: zatvori listu; ako je već zatvorena, Esc zatvara prozor kao i inače */
  closeSecurityList(e: Event) {
    if (this.securityOpen()) {
      e.stopPropagation();
      this.securityOpen.set(false);
    }
  }

  // ----- Dugmad -----

  /** Edit: otključaj polja postojećeg naloga */
  edit() {
    this.editing.set(true);
  }

  /** Refresh: ponovo učitaj nalog sa servera; nesnimljene izmene se odbacuju */
  refresh() {
    const id = this.orderViewModel.order()?.orderId;
    if (!id) return;

    this.ordersService.get(id).subscribe({
      next: (o: Order) => {
        this.orderViewModel.order.set(o);
        this.orderObject.set(toModel(o));
        this.securityText.set(o.security?.description ?? '');
        this.allocations.set(this.copyAllocations());   // nesnimljene izmene u gridu se odbacuju
        this.editing.set(false);   // nazad u readonly
      },
      error: (e: unknown) => console.error('order refresh failed', e),
    });
  }

  /** Zatvara prozor; pozivalac dobija poslednji snimljeni nalog (da osveži grid) */
  close() {
    this.orderViewModel.close(this.orderViewModel.order() ?? undefined);
  }

  /**
   * Snimi nalog i ostavi prozor otvoren: novi -> POST, Edit režim -> PUT.
   * Posle snimanja forma je ponovo readonly, a Book onemogućen do sledećeg Edit-a.
   */
  book() {
    if (this.saving() || !this.editable() || this.orderForm().invalid()) return;

    const v = this.orderObject();
    this.saving.set(true);

    this.ordersService
      .save({
        orderId: this.orderViewModel.order()?.orderId ?? 0,
        sid: v.sid,
        tradeDate: `${v.tradeDate}T00:00:00`,
        quantity: v.quantity ?? 0,
        managerId: Number(v.managerId),     // select daje string -> server očekuje broj
        strategyId: Number(v.strategyId),
        allocations: this.allocations()
          .filter((a) => a.managerId && a.strategyId && a.quantity > 0)     // nepopunjeni redovi se ne šalju
          .map((a) => (a.allocationId < 0 ? { ...a, allocationId: 0 } : a)), // novi red: id dodeljuje server
      })
      .subscribe({
        next: (saved: Order) => {
          this.orderViewModel.order.set(saved);   // naslov prozora prelazi na "Order <id>"
          this.allocations.set(this.copyAllocations());   // alokacije kako ih je server snimio
          this.editing.set(false);    // nazad u readonly
          this.saving.set(false);
        },
        error: (e: unknown) => {
          console.error('order save failed', e);
          this.saving.set(false);
        },
      });
  }

  /** Kopija alokacija iz naloga (grid menja kopiju, order() ostaje poslednje snimljeno stanje) */
  private copyAllocations(): Allocation[] {
    return structuredClone(this.orderViewModel.order()?.allocations ?? []);
  }
}