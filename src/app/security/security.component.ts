import { Component } from '@angular/core';
import { SecurityViewModel } from './security.view-model';
import { injectViewModel } from '../common/window/window.service';
import { WindowFrameComponent } from '../common/window/window-frame.component';

@Component({
  selector: 'app-security',
  standalone: true,
  imports: [WindowFrameComponent],
  templateUrl: './security.component.html',
  styleUrl: './security.component.css'
})
export class SecurityComponent {
save() {
throw new Error('Method not implemented.');
}

  protected readonly vm = injectViewModel<SecurityViewModel>();

  close() {
    this.vm.close();
  }
}
