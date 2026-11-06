import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GetContextMenuItems, GetRowIdFunc } from 'ag-grid-community';
import { MatchMode, SecuritiesFilterComponent, SecurityFilter } from '../securities-filter/securities-filter.component';
import { LookupCache } from '../common/lookup-cache';
import { Security } from '../common/models';
import { WindowService } from '../common/window/window.service';
import { SecurityViewModel } from '../security/security.view-model';

@Component({
  selector: 'app-securities',
  standalone: true,
  imports: [AgGridAngular, SecuritiesFilterComponent],
  templateUrl: './securities.component.html',
  styleUrl: './securities.component.css',
})
export class SecuritiesComponent {
  private readonly windows = inject(WindowService);
  private readonly lookups = inject(LookupCache);

  filterBar = viewChild(SecuritiesFilterComponent);

  /** primenjeni filter; prazan = sve hartije */
  applied = signal<SecurityFilter>({ sid: '', description: '', mode: 'contains' });

  /** hartije koje prolaze filter; preračuna se i kad SignalR osveži listu */
  readonly rows = computed(() => {
    const f = this.applied();
    return this.lookups.securities().filter((s) =>
      matches(String(s.sid), f.sid, f.mode) &&
      matches(s.description ?? '', f.description, f.mode)
    );
  });

  columns: ColDef<Security>[] = [
    { field: 'sid', headerName: 'Sid', width: 110 },
    { field: 'description', headerName: 'Description', flex: 1 },
  ];

  defaultColDef: ColDef = { filter: true, sortable: true, resizable: true };

  getRowId: GetRowIdFunc<Security> = (p) => String(p.data.sid);

  /** desni klik na grid: New Security, pa standardne stavke (Copy, Export...) */
  getContextMenuItems: GetContextMenuItems<Security> = (p) => [
    { name: 'New Security', action: () => this.openNew() },
    'separator',
    ...(p.defaultItems ?? []),
  ];

  /** Search dugme */
  applyFilter() {
    const filters = this.filterBar()?.getFilter();
    if (filters) this.applied.set(filters);
  }

  /** Enter u filteru */
  applyFilterFromFilterFields(filter: SecurityFilter) {
    this.applied.set(filter);
  }

  /** New dugme i kontekstni meni: prazna forma */
  openNew() {
    this.windows.show(new SecurityViewModel());
  }
}

/** da li vrednost prolazi tekst filtera; prazan tekst = nema filtera */
function matches(value: string, text: string, mode: MatchMode): boolean {
  if (!text) return true;
  const v = value.toLowerCase();
  const t = text.toLowerCase();
  switch (mode) {
    case 'equals':     return v === t;
    case 'startsWith': return v.startsWith(t);
    default:           return v.includes(t);
  }
}