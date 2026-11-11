import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SecurityViewModel } from './security.view-model';
import { injectViewModel } from '../common/window/window.service';
import { WindowFrameComponent } from '../common/window/window-frame.component';
import { LookupCache } from '../common/lookup-cache';
import { Security } from '../common/models';

@Component({
  selector: 'app-security',
  standalone: true,
  imports: [WindowFrameComponent, FormsModule],
  templateUrl: './security.component.html',
  styleUrl: './security.component.css',
})
export class SecurityComponent {
  protected readonly vm = injectViewModel<SecurityViewModel>();
  private readonly lookups = inject(LookupCache);

  /** polja forme; postojeća hartija -> njene vrednosti, nova -> prazno */
  readonly sid = signal<number | null>(this.vm.security()?.sid ?? null);
  readonly description = signal(this.vm.security()?.description ?? '');

  /** true dok traje snimanje ili učitavanje */
  readonly saving = signal(false);

  /** true kad je korisnik kliknuo Edit na postojećoj hartiji */
  readonly editing = signal(false);

  /** poruka ako server odbije zahtev */
  readonly error = signal('');

  /** polja se mogu menjati: nova hartija ili Edit režim; inače readonly */
  readonly editable = computed(() => this.vm.isNew || this.editing());

  /** Save aktivan samo kad se sme menjati, opis je popunjen i ništa ne traje */
  readonly canSave = computed(
    () => this.editable() && !this.descriptionMissing() && !this.saving(),
  );

  /** Save: nova -> POST, postojeća -> PUT; posle snimanja ponovo učitaj sa servera */
  save() {
    if (!this.canSave()) return;
    this.saving.set(true);
    this.error.set('');

    this.lookups
      .saveSecurity(
        { sid: this.sid() ?? 0, description: this.description().trim() },
        this.vm.isNew,
      )
      .subscribe({
        next: (saved) => {
          this.vm.security.set(saved); // od sad postojeća: isNew -> false, naslov -> "Security <sid>"
          this.refresh();
        },
        error: (e) => this.fail(e),
      });
  }

  /** Refresh: ponovo učitaj hartiju sa servera; nesnimljene izmene se odbacuju */
  refresh() {
    const sid = this.vm.security()?.sid;
    if (!sid) return;
    this.saving.set(true);
    this.error.set('');

    this.lookups.getSecurity(sid).subscribe({
      next: (s) => this.show(s),
      error: (e) => this.fail(e),
    });
  }

  /** Edit: otključaj polja postojeće hartije */
  edit() {
    this.editing.set(true);
  }

  close() {
    this.vm.close();
  }

  /** upiši hartiju sa servera u formu i vrati je u readonly */
  private show(s: Security) {
    this.vm.security.set(s);
    this.sid.set(s.sid);
    this.description.set(s.description);
    this.editing.set(false);
    this.saving.set(false);
  }

  private fail(e: { status: number; statusText: string }) {
    this.error.set(`${e.status} ${e.statusText}`);
    this.saving.set(false);
  }

  readonly descriptionMissing = computed(
    () => this.editable() && !this.description().trim(),
  );
}
