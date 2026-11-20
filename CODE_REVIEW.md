# Code review: Security Master Angular frontend

**Datum:** 2026-11-20
**Obim:** ceo `src/` (Angular 22, AG Grid Enterprise, AG Charts, SignalR)
**Status:** samo review, ništa nije menjano

**Ocena:** arhitektura 8/10, auth 1/10

Arhitektura sa `WindowService` / ViewModel (WPF stil) je pametno urađena, signali se koriste dosledno, a kod je dobro komentarisan. Glavni problem je auth: sav potreban kod postoji (interceptor, restore, 401 handling), ali ništa od toga nije povezano.

> ⚠️ Auth popravke (tačke 1–3) rade se **zajedno sa backendom** (`D:\SecurityMaster\Core\CODE_REVIEW.md`, tačke 1–3). Čim se backend zaštiti, frontend bez ovih popravki vraća 401 na sve.

---

## 🔴 Kritično: auth ne radi

### 1. `authInterceptor` nije registrovan, pa se token nikad ne šalje
`main.ts:23` ima `provideHttpClient(withXhr())` bez interceptora:
- nijedan zahtev nema `Authorization` header
- logika "na 401 odjavi korisnika" (`auth.interceptor.ts:17`) nikad se ne izvršava

**Rešenje:**
```ts
provideHttpClient(withXhr(), withInterceptors([authInterceptor])),
```

### 2. `restore()` se nigde ne poziva, pa refresh stranice odjavljuje korisnika
`auth-service.ts:45` čita korisnika iz `localStorage`, ali `user` signal (`:19`) počinje kao `null`.

**Rešenje:**
```ts
readonly user = signal<AuthUser | null>(restore());
```

### 3. SignalR se povezuje bez tokena
`notification.service.ts:16-19` nema `accessTokenFactory`, iako backend već čita `access_token` iz query stringa za `/hubs`. Konekcija se otvara jednom, pre logina, i ne ponavlja se posle logina/logouta.

**Rešenje:**
```ts
.withUrl('/hubs/notifications', { accessTokenFactory: () => auth.token() ?? '' })
```
i pokretati / zaustavljati konekciju na login / logout.

### 4. Login forma je unapred popunjena sa `admin` / `admin`
`login.component.ts:21-22`. Ide i u produkcioni build. Vezati za `isDevMode()` ili obrisati.

---

## 🟠 Bagovi

### 5. Order bez alokacija ne može da se booknuje
`order.component.ts:196-203`: komentar kaže "*ako ima alokacija*, jednak njihovoj sumi", ali kod uvek poredi `allocatedQty` sa `qty`. Bez alokacija je `0 ≠ qty`, pa je `qtyMismatch = true` i Book ostaje onemogućen.

**Rešenje:** dodati proveru `this.allocations().length > 0`. Ako je namerno da order mora imati alokacije, onda ispraviti komentar.

### 6. Dupli klik na order ne otvara order
`orders.component.ts:104` ima `onRowDoubleClicked`, ali u `orders.component.html` nema `(rowDoubleClicked)="onRowDoubleClicked($event)"`. Radi samo desni klik → Open Order.

### 7. Greška pri snimanju ordera se ne prikazuje
`order.component.ts:172-175`: na grešku se radi samo `console.error`. Korisnik klikne Book i ništa se ne desi. Treba dodati `error()` signal kao u `security` i `lookup` formama.

### 8. Orders grid se ne osvežava uživo
`OrderChanged` i `AllocationChanged` (`notification.service.ts:9-10`) se nigde ne slušaju. Promene drugih korisnika se ne vide do ručnog Search-a. Isto važi za Dashboard.

### 9. Filter po Sid / Order Id šalje tekst bez provere
`orders-filter` ima `type="text"`. Unos "abc" ide na server i daje **500** (backend tačka 9). Koristiti `type="number"` ili validaciju.

### 10. Clear u Securities ne briše polja filtera
`securities.component.html:17` resetuje `applied`, ali polja u `app-securities-filter` ostaju popunjena. Treba uraditi kao u Orders (`filterBar()?.clear()`).

### 11. Greške sa servera gube poruku
`lookup`, `security`, `orders` i `login` prikazuju samo `${status} ${statusText}` ("409 Conflict"), a ne tekst sa backenda ("Manager is already used..."). Koristiti `err.error`.

---

## 🟡 Kvalitet / sitnice

12. **AG Grid Enterprise bez licence:** `AllEnterpriseModule` je registrovan bez `LicenseManager.setLicenseKey(...)`, što daje watermark i grešku u konzoli. Za komercijalnu upotrebu treba licenca ili prelazak na Community (grupisanje, status bar i context menu su Enterprise funkcije).
13. **Nema testova:** Karma i Jasmine su podešeni, ali nema nijednog `.spec.ts`.
14. **Logout ne čisti stanje:** `LookupCache` i SignalR konekcija ostaju od prethodnog korisnika.
15. **Token u `localStorage`** je dostupan svakom XSS-u. Za internu aplikaciju je prihvatljivo, ali treba znati za taj rizik.
16. **Privremeni kod:** `delay(100)` sa TODO (`orders.component.ts:86`), onemogućeno dugme "Open security" (`order.component.html:46`), `//npm install ...` komentari (`app.component.ts:55`).
17. **Duplikati i višak:**
    - dva `viewChild(OrdersFilterComponent)` u `OrdersComponent` (`:78`, `:125`)
    - neiskorišćen `orderId` input u `AllocationsComponent`
    - neiskorišćen `filterChange` output u `OrdersFilterComponent`
    - neiskorišćeni importi (`formatQty` i drugi u `allocation-grid.component.ts`)
18. **Mešanje importa:** `ag-grid-enterprise` i `ag-grid-community` za iste tipove (`utilities.ts`, `configuration.component.ts`).
19. **Imena:** paket se zove `"essentials"`, a repo `01-starting-project`, što su ostaci iz kursa.
20. **Formatiranje:** `order.component.ts` od `:184` i `allocation-grid.component.ts:141-159` nemaju uvlačenje; `allocation-grid.component.ts:226` ima komentar sa `???????`. `configuration.component.ts:37` ima komentar "Name uzima ostatak širine", ali kolona ima `width: 200` bez `flex`.

---

## Plan

| # | Šta | Trud |
|---|---|---|
| 1–3 | Auth (interceptor, restore, SignalR token), zajedno sa backendom | ~15 min |
| 4 | Ukloniti `admin/admin` iz forme | 1 min |
| 5–7 | Bagovi u order formi i gridu | ~30 min |
| 8 | Live refresh ordera preko SignalR-a | ~20 min |
| 9–11 | Validacija filtera, Clear, poruke grešaka | ~30 min |
| 12+ | Licenca, testovi, čišćenje | po želji |
