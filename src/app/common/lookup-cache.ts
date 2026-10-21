import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { Manager, Strategy } from './models';

/**
 * Kes za lookup liste (manageri, strategije).
 * Ucitava se jednom, pri prvom koriscenju; posle toga svi citaju iz memorije.
 */
@Injectable({ providedIn: 'root' })
export class LookupCache {
  private http = inject(HttpClient);

  readonly managers = signal<Manager[]>([]);
  readonly strategies = signal<Strategy[]>([]);

  /** brza pretraga po id-u: managerById().get(5)?.display */
  readonly managerById = computed(() => new Map(this.managers().map((m) => [m.id, m])));
  readonly strategyById = computed(() => new Map(this.strategies().map((s) => [s.id, s])));

  constructor() {
    this.refresh();   // servis se pravi pri prvom inject-u -> tada se i ucita
  }

  /** ponovo ucitaj sa servera (npr. posle dodavanja novog managera) */
  refresh() {
  this.load<Manager>('/managers/query').subscribe({
    next: (list) => this.managers.set(list),
    error: (e) => console.error('managers load failed', e),
  });
  this.load<Strategy>('/strategies/query').subscribe({
    next: (list) => this.strategies.set(list),
    error: (e) => console.error('strategies load failed', e),
  });
}

  /** POST /xxx/query sa praznim upitom, sortirano po imenu */
  private load<T extends { display: string }>(url: string) {
    return this.http
      .post<T[]>(url, {})
      .pipe(map((list) => [...list].sort((a, b) => a.display.localeCompare(b.display))));
  }
}