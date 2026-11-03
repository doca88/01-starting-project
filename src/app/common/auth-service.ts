import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

/** odgovor servera na login */
export interface AuthUser {
  token: string;
  username: string;
  expiresAt: string;
}

const storageKey = 'auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  /** prijavljeni korisnik; null = nije prijavljen */
  readonly user = signal<AuthUser | null>(null);

  readonly isLoggedIn = computed(() => this.user() != null);

  /** POST /auth/login; uspeh: sačuvaj korisnika i token */
  login(username: string, password: string): Observable<AuthUser> {
    return this.http.post<AuthUser>('/auth/login', { username, password }).pipe(
      tap((user) => {
        localStorage.setItem(storageKey, JSON.stringify(user));
        this.user.set(user);
      }),
    );
  }

  logout(): void {
    localStorage.removeItem(storageKey);
    this.user.set(null);
  }

  /** token za Authorization header i SignalR */
  token(): string | null {
    return this.user()?.token ?? null;
  }
}

/** posle osvežavanja stranice: korisnik iz localStorage, ako token nije istekao */
function restore(): AuthUser | null {
  try {
    const user = JSON.parse(localStorage.getItem(storageKey) ?? 'null') as AuthUser | null;
    return user && new Date(user.expiresAt) > new Date() ? user : null;
  } catch {
    return null;
  }
}