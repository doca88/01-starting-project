export abstract class WindowViewModel<TResult = unknown> {
  /** naslov prozora */
  abstract readonly title: string;

  /** veličina prozora (kao Width/Height u WPF-u); visina prazna = koliko treba sadržaju */
  readonly width: string = '880px';
  readonly height?: string;

  private closeFn?: (result?: TResult) => void;

  /** poziva WindowService pri otvaranju - ne koristi se direktno */
  attachClose(closeFn: (result?: TResult) => void) {
    this.closeFn = closeFn;
  }

  /** zatvori prozor; result se vraća onome ko je pozvao show() */
  close(result?: TResult) {
    this.closeFn?.(result);
  }
}