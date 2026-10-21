import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { Manager, Security, Strategy } from './models';

/**
 * Kes za lookup liste (manageri, strategije, hartije).
 * Ucitava se jednom, pri prvom koriscenju; posle toga svi citaju iz memorije.
 */
@Injectable({ providedIn: 'root' })
export class LookupCache {
  private http = inject(HttpClient);

  readonly managers = signal<Manager[]>([]);
  readonly strategies = signal<Strategy[]>([]);
  readonly securities = signal<Security[]>([]);

  /** brza pretraga po id-u: managerById().get(5)?.display */
  readonly managerById = computed(() => new Map(this.managers().map((m) => [m.id, m])));
  readonly strategyById = computed(() => new Map(this.strategies().map((s) => [s.id, s])));

  constructor() {
    this.refresh();   // servis se pravi pri prvom inject-u -> tada se i ucita
  }

  /** ponovo ucitaj sa servera (npr. posle dodavanja novog managera) */
  refresh() {
    this.load<Manager>('/managers/query', (m) => m.display).subscribe({
      next: (list) => this.managers.set(list),
      error: (e) => console.error('managers load failed', e),
    });
    this.load<Strategy>('/strategies/query', (s) => s.display).subscribe({
      next: (list) => this.strategies.set(list),
      error: (e) => console.error('strategies load failed', e),
    });
    this.load<Security>('/securities/query', (s) => s.description).subscribe({
      next: (list) => this.securities.set(list),
      error: (e) => console.error('securities load failed', e),
    });
  }

  /** POST /xxx/query sa praznim upitom, sortirano po nazivu (Manager 2 pre Manager 10) */
  private load<T>(url: string, name: (item: T) => string) {
    return this.http
      .post<T[]>(url, {})
      .pipe(
        map((list) =>
          [...list].sort((a, b) =>
            name(a).localeCompare(name(b), undefined, { numeric: true, sensitivity: 'base' }),
          ),
        ),
      );
  }
}