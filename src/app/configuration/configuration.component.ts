import { Component, computed, inject, signal } from '@angular/core';
import { WindowService } from '../common/window/window.service';
import { LookupItem, LookupType, LookupViewModel } from '../lookup/lookup.view-model';
import { LookupCache } from '../common/lookup-cache';
import { ColDef, GetContextMenuItems, RowDoubleClickedEvent } from 'ag-grid-enterprise';
import { AgGridAngular } from 'ag-grid-angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-configuration',
  standalone: true,
  imports: [AgGridAngular, FormsModule],
  templateUrl: './configuration.component.html',
  styleUrl: './configuration.component.css',
})
export class ConfigurationComponent {
  private readonly windows = inject(WindowService);
  private readonly lookups = inject(LookupCache);

  protected readonly type = signal<LookupType>('manager');

  /** tekst u Name polju; menja se dok kucaš */
  protected readonly name = signal('');

  /** filter po imenu primenjen poslednjim Search-om */
  private readonly appliedName = signal('');

  /** ako su izabrani manageri, prikaži managere; inače strategije */
  protected readonly rows = computed(() => {
    const list = this.type() === 'manager' ? this.lookups.managers() : this.lookups.strategies();
    const text = this.appliedName().trim().toLowerCase();
    return text ? list.filter((x) => x.display.toLowerCase().includes(text)) : list;
  });

  protected readonly columns: ColDef[] = [
    { field: 'id', headerName: 'Id', width: 100 },
    { field: 'display', headerName: 'Name', width: 200 },   // Name uzima ostatak širine
  ];
  
/** primeni tekst iz Name polja */
  protected search(): void {
    this.appliedName.set(this.name());
  }

  /** isprazni Name polje i prikaži celu listu */
  protected clear(): void {
    this.name.set('');
    this.appliedName.set('');
  }
 /** dupli klik na red: otvori ga */
  protected onRowDoubleClicked(e: RowDoubleClickedEvent<LookupItem>): void {
    if (e.data) this.open(e.data);
  }

  /** kontekstni meni: Open, pa podrazumevane stavke (Copy, Export...) */
  protected readonly getContextMenuItems: GetContextMenuItems<LookupItem> = (params) => [
    {
      name: 'Open',
      disabled: !params.node?.data,
      action: () => this.open(params.node!.data!),
    },
    'separator',
    ...(params.defaultItems ?? []),
  ];

  /** otvori postojeći red u prozoru za izmenu; grid osveži SignalR */
  protected async open(item: LookupItem): Promise<void> {
    await this.windows.show(new LookupViewModel(this.type(), item));
  }

  /** klik na stavku u CREATE NEW listi: otvori prazan prozor; grid osveži SignalR */
  protected async openCreate(type: LookupType): Promise<void> {
    await this.windows.show(new LookupViewModel(type));
  }
}