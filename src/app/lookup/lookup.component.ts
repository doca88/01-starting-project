import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { injectViewModel } from '../common/window/window.service';
import { WindowFrameComponent } from '../common/window/window-frame.component';
import { LookupViewModel } from './lookup.view-model';
import { LookupService } from './lookup.service';

@Component({
  selector: 'app-lookup',
  standalone: true,
  imports: [FormsModule, WindowFrameComponent],
  templateUrl: './lookup.component.html',
  styleUrl: './lookup.component.css',
})
export class LookupComponent {
  private readonly lookupService = inject(LookupService);

  /** DataContext prozora: tip i naslov */
  protected readonly vm = injectViewModel<LookupViewModel>();

  protected readonly name = signal('');

  /** true dok traje snimanje: Save je tada onemogućen (nema duplog snimanja) */
  protected readonly saving = signal(false);

  /** greška sa servera, prikazuje se u formi */
  protected readonly error = signal('');

  protected save(): void {
    this.saving.set(true);
    this.error.set('');

    this.lookupService.create(this.vm.type, this.name().trim()).subscribe({
      next: () => this.vm.close(true),        // pozivalac dobija true = snimljeno
      error: (err) => {
        this.error.set(`${err.status} ${err.statusText}`);
        this.saving.set(false);               // prozor ostaje otvoren, može ponovo
      },
    });
  }

  protected close(): void {
    this.vm.close();                          // pozivalac dobija undefined = odustao
  }
}