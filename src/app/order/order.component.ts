import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { LookupCache } from '../common/lookup-cache';
import { injectViewModel } from '../common/window/window.service';
import { WindowFrameComponent } from '../common/window/window-frame.component';
import { OrderDraft, OrderViewModel } from './order.view-model';

/** Stavka za combo/lookup (security). */
export interface LookupItem {
  id: number;
  name: string;
}

type OrderTab = 'order' | 'allocations';
type FieldName = 'sid' | 'tradeDate' | 'quantity' | 'managerId' | 'strategyId';

const positive: ValidatorFn = c => (Number(c.value) > 0 ? null : { positive: true });
const selected: ValidatorFn = c => (Number(c.value) > 0 ? null : { required: true });

let nextId = 0;

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [ReactiveFormsModule, WindowFrameComponent],
  templateUrl: './order.component.html',
  styleUrl: './order.component.css',
})
export class OrderComponent {
  private readonly fb = inject(FormBuilder);
  private readonly lookups = inject(LookupCache);

  /** ViewModel prozora (title, subtitle, close, book); protected da ga vidi template. */
  protected readonly vm = injectViewModel<OrderViewModel>();

  /** Nalog iz VM-a; null = novi nalog */
  readonly order = signal(this.vm.order).asReadonly();
  securities = input<LookupItem[]>([]);

  readonly managers = this.lookups.managers;
  readonly strategies = this.lookups.strategies;

  // Napomena: u dialogu ovi output-i nemaju slušaoca.
  securityOpened = output<number>();
  newAllocation = output<void>();

  /** Jedinstven prefiks za id-jeve, jer više prozora može biti otvoreno istovremeno. */
  readonly uid = `order-form-${nextId++}`;

  activeTab = signal<OrderTab>('order');
  securityText = signal('');

  allocations = computed(() => this.order()?.allocations ?? []);

  form = this.fb.nonNullable.group({
    sid: [0, selected],
    tradeDate: [todayIso(), Validators.required], // yyyy-MM-dd za <input type="date">
    quantity: [null as number | null, positive],
    managerId: [0, selected],
    strategyId: [0, selected],
  });

  constructor() {
    // Učitavanje postojećeg naloga u formu
    effect(() => {
      const o = this.order();
      if (!o) return;
      this.form.reset({
        sid: o.sid,
        tradeDate: o.tradeDate.substring(0, 10),
        quantity: o.quantity,
        managerId: o.managerId,
        strategyId: o.strategyId,
      });
    });

    // Prikaz naziva hartije kad stignu i nalog i lista hartija
    effect(() => {
      const sid = this.order()?.sid;
      const name = this.securities().find(s => s.id === sid)?.name;
      if (name) this.securityText.set(name);
    });
  }

  onSecurityInput(text: string): void {
    this.securityText.set(text);
    const match = this.securities().find(s => s.name === text);
    this.form.controls.sid.setValue(match?.id ?? 0);
    this.form.controls.sid.markAsTouched();
  }

  openSecurity(): void {
    const sid = this.form.controls.sid.value;
    if (sid > 0) this.securityOpened.emit(sid);
  }

  isInvalid(name: FieldName): boolean {
    const c = this.form.controls[name];
    return c.invalid && c.touched;
  }

  /** Zatvara prozor bez rezultata; show() vraća undefined. */
  close(): void {
    this.vm.close();
  }

  /** Validira i predaje draft VM-u, koji snima i zatvara prozor sa Order-om. */
  book(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.activeTab.set('order');
      return;
    }

    const v = this.form.getRawValue();
    const draft: OrderDraft = {
      orderId: this.order()?.orderId ?? 0,
      sid: v.sid,
      tradeDate: `${v.tradeDate}T00:00:00`,
      quantity: v.quantity ?? 0,
      managerId: v.managerId,
      strategyId: v.strategyId,
    };

    this.vm.book(draft);
  }
}

/** Današnji datum kao yyyy-MM-dd, u lokalnoj zoni (toISOString bi dao UTC). */
function todayIso(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}