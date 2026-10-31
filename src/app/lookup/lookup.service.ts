import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LookupType } from './lookup.view-model';

/** isto kao Manager / Strategy na serveru */
export interface LookupItem {
  id: number;
  display: string;
}

/** tip -> ruta kontrolera na serveru */
const urls: Record<LookupType, string> = {
  manager: '/managers',
  strategy: '/strategies',
};

@Injectable({ providedIn: 'root' })
export class LookupService {
  private readonly http = inject(HttpClient);

  /** POST /managers ili /strategies; server vraća novi red sa Id */
  create(type: LookupType, display: string): Observable<LookupItem> {
    return this.http.post<LookupItem>(urls[type], { display });
  }
}