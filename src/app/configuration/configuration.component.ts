import { Component, inject } from '@angular/core';
import { WindowService } from '../common/window/window.service';
import { LookupType, LookupViewModel } from '../lookup/lookup.view-model';

@Component({
  selector: 'app-configuration',
  standalone: true,
  imports: [],
  templateUrl: './configuration.component.html',
  styleUrl: './configuration.component.css',
})
export class ConfigurationComponent {
  private readonly windows = inject(WindowService);

  /** klik na stavku u CREATE NEW listi: otvori prozor i sačekaj da se zatvori */
  protected async openCreate(type: LookupType): Promise<void> {
    const saved = await this.windows.show(new LookupViewModel(type));
    if (saved) {
      // TODO korak 3: osveži grid
    }
  }
}