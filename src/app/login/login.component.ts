import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { injectViewModel } from '../common/window/window.service';
import { WindowFrameComponent } from '../common/window/window-frame.component';
import { AuthService } from '../common/auth-service';
import { LoginViewModel } from './login.view-model';


@Component({
    selector: 'app-login',
    imports: [FormsModule, WindowFrameComponent],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  protected readonly vm = injectViewModel<LoginViewModel>();

  // unapred popunjeno za razvoj; lozinku i dalje proverava server
  protected readonly username = signal('admin');
  protected readonly password = signal('admin');

  protected readonly busy = signal(false);
  protected readonly error = signal('');

  protected ok(): void {
    this.busy.set(true);
    this.error.set('');

    this.auth.login(this.username(), this.password()).subscribe({
      next: () => this.vm.close(true),
      error: (err) => {
        this.error.set(err.status === 401 ? 'Wrong username or password.' : `${err.status} ${err.statusText}`);
        this.busy.set(false);
      },
    });
  }

  protected cancel(): void {
    this.vm.close();
  }
}