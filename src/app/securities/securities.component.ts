import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { MatchMode, SecuritiesFilterComponent, SecurityFilter } from '../securities-filter/securities-filter.component';
import { FormsModule } from '@angular/forms';
import { LookupCache } from '../common/lookup-cache';
import { ColDef, GetRowIdFunc } from 'ag-grid-enterprise';
import { Security } from '../common/models';

@Component({
  selector: 'app-securities',
  standalone: true,
  imports: [AgGridAngular, SecuritiesFilterComponent, FormsModule],
  templateUrl: './securities.component.html',
  styleUrl: './securities.component.css'
})
export class SecuritiesComponent {

  private readonly lookups = inject(LookupCache);
  filterBar = viewChild(SecuritiesFilterComponent);
  applied = signal<SecurityFilter>({ sid: '', description: '', mode: 'contains' });
  mode = signal<MatchMode>('contains');

  applyFilter() {
    if (this.filterBar() != null) {
      this.applied.set(this.filterBar()!.getFilter());
    }
  }

  applyFilterFromFilterFields(filter: SecurityFilter) {
    this.applied.set(filter);
  }

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
}

/** da li vrednost prolazi tekst filtera; prazan tekst = nema filtera */
function matches(value: string, text: string, mode: MatchMode): boolean {
  if (!text) return true;
  const v = value.toLowerCase();
  const t = text.toLowerCase();
  switch (mode) {
    case 'equals': return v === t;
    case 'startsWith': return v.startsWith(t);
    default: return v.includes(t);
  }
}
