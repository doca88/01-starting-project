import { WindowViewModel } from '../common/window/window-view-model';

/** prozor za prijavu; rezultat: true ako je korisnik prijavljen */
export class LoginViewModel extends WindowViewModel<boolean> {
  readonly title = 'Login';
  override readonly width = '320px';
}