import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Manager, Strategy } from '../common/models';
import { LookupType } from './lookup.view-model';

/** tip -> ruta kontrolera na serveru */
const urls: Record<LookupType, string> = {
  manager: '/managers',
  strategy: '/strategies',
};

@Injectable({ providedIn: 'root' })
export class LookupService {
  private readonly http = inject(HttpClient);

  /** POST /managers ili /strategies: novi unos */
  create(type: LookupType, display: string): Observable<Manager | Strategy> {
    return this.http.post<Manager | Strategy>(urls[type], { display });
  }

  /** PUT /managers/5 ili /strategies/5: izmena postojećeg */
  update(type: LookupType, id: number, display: string): Observable<Manager | Strategy> {
    return this.http.put<Manager | Strategy>(`${urls[type]}/${id}`, { display });
  }
}