import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from './models';
import { OrdersFilter } from '../orders-filter/orders-filter.component';
import { OrderDraft } from '../order/order.view-model';

/** Isto kao FilterOperator enum na serveru (šalje se kao ime) */
type FilterOperator = 'Equals' | 'GreaterThan' | 'GreaterThanOrEqual' | 'LessThan' | 'LessThanOrEqual' | 'Contains';

/** Isto kao QueryFilter klasa na serveru */
interface QueryFilter {
  field: string;            // property na Order, npr. 'TradeDate' ili 'Manager.Id'
  operator: FilterOperator;
  value: string;            // uvek tekst; server ga pretvara u tip polja
}

/** '2026-08-31' -> '2026-09-01' */
const nextDay = (date: string): string => {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().substring(0, 10);
};

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private http = inject(HttpClient);

  /** Svi nalozi (bez filtera) */
  getAll(): Observable<Order[]> {
    return this.queryOrders();
  }

  /** Nalozi po filteru iz filter trake; null = bez filtera */
  queryOrders(filter: OrdersFilter | null = null): Observable<Order[]> {
    const filters: QueryFilter[] = [];
    const add = (field: string, operator: FilterOperator, value: string) =>
      filters.push({ field, operator, value });

    // šalju se samo popunjena polja
    if (filter) {
      if (filter.sid) add('Sid', 'Equals', filter.sid);
      if (filter.orderId) add('OrderId', 'Equals', filter.orderId);
      if (filter.startDate) add('TradeDate', 'GreaterThanOrEqual', filter.startDate);
      if (filter.endDate) add('TradeDate', 'LessThan', nextDay(filter.endDate));   // ceo krajnji dan
      if (filter.managerId != null) add('ManagerId', 'Equals', String(filter.managerId));
      if (filter.strategyId != null) add('StrategyId', 'Equals', String(filter.strategyId));
    }

    return this.http.post<Order[]>('/orders/query', {
      sortBy: 'OrderId',
      sortDescending: false,
      filters,
    });
  }

  /** Jedan nalog sa servera (za Refresh) */
  get(orderId: number) {
    return this.http.get<Order>(`/orders/${orderId}`);
  }

  /** Snima nalog: orderId 0 -> novi (POST), inače izmena postojećeg (PUT). Vraća snimljeni nalog. */
  save(draft: OrderDraft) {
    return draft.orderId === 0
      ? this.http.post<Order>('/orders', draft)
      : this.http.put<Order>(`/orders/${draft.orderId}`, draft);
  }
}