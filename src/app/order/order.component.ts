import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { LookupCache } from '../common/lookup-cache';
import { OrdersService } from '../common/orders.service';
import { injectViewModel } from '../common/window/window.service';
import { WindowFrameComponent } from '../common/window/window-frame.component';
import { OrderViewModel } from './order.view-model';
import { AllocationGridComponent } from '../allocation-grid/allocation-grid.component';
import { Allocation, Order, Security } from '../common/models';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [ReactiveFormsModule, WindowFrameComponent, AllocationGridComponent],
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css'],
})
export class OrderComponent {
  private readonly fb = inject(FormBuilder);
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

  /** Polja forme, popunjena iz naloga (ili prazna za novi) */
  readonly form = this.fb.nonNullable.group({
    sid: this.orderViewModel.order()?.sid ?? 0,
    tradeDate: (this.orderViewModel.order()?.tradeDate ?? new Date().toLocaleDateString('sv-SE')).substring(0, 10), // yyyy-MM-dd
    quantity: this.orderViewModel.order()?.quantity ?? 0,
    managerId: this.orderViewModel.order()?.managerId ?? 0,
    strategyId: this.orderViewModel.order()?.strategyId ?? 0,
  });

  constructor() {
    // Polja otključana za novi nalog i u Edit režimu; inače zaključana (readonly)
    effect(() => {
      if (this.editable()) this.form.enable();
      else this.form.disable();
    });
  }

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
    this.form.controls.sid.setValue(0);
    this.securityOpen.set(true);
  }

  /** izbor iz liste: sid u formu, description u polje */
  pickSecurity(s: Security) {
    this.securityText.set(s.description);
    this.securityQuery.set('');
    this.form.controls.sid.setValue(s.sid);
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
        this.form.setValue({
          sid: o.sid,
          tradeDate: o.tradeDate.substring(0, 10),
          quantity: o.quantity,
          managerId: o.managerId,
          strategyId: o.strategyId,
        });
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
    if (this.saving() || !this.editable()) return;   // i Enter u formi ne sme da snimi readonly nalog

    const v = this.form.getRawValue();
    this.saving.set(true);

    this.ordersService
      .save({
        ...v,
        orderId: this.orderViewModel.order()?.orderId ?? 0,
        tradeDate: `${v.tradeDate}T00:00:00`,
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