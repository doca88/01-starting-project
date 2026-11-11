import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { injectViewModel } from '../common/window/window.service';
import { WindowFrameComponent } from '../common/window/window-frame.component';
import { LookupViewModel } from './lookup.view-model';
import { LookupService } from './lookup.service';

@Component({
    selector: 'app-lookup',
    imports: [FormsModule, WindowFrameComponent],
    templateUrl: './lookup.component.html',
    styleUrl: './lookup.component.css'
})
export class LookupComponent {
  private readonly lookupService = inject(LookupService);

  /** DataContext prozora: tip, naslov i (za izmenu) postojeći red */
  protected readonly vm = injectViewModel<LookupViewModel>();

  /** kod izmene polje počinje sa postojećim imenom */
  protected readonly name = signal(this.vm.item?.display ?? '');

  /** true dok traje snimanje: Save je tada onemogućen (nema duplog snimanja) */
  protected readonly saving = signal(false);

  /** greška sa servera, prikazuje se u formi */
  protected readonly error = signal('');

  protected save(): void {
    this.saving.set(true);
    this.error.set('');

    const name = this.name().trim();
    const request = this.vm.item
      ? this.lookupService.update(this.vm.type, this.vm.item.id, name)   // izmena
      : this.lookupService.create(this.vm.type, name);                   // novi

    request.subscribe({
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