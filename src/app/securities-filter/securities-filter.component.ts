import { Component, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

export type MatchMode = 'contains' | 'startsWith' | 'equals';

export interface SecurityFilter {
  sid: string;
  description: string;
  mode: MatchMode;
}

@Component({
  selector: 'app-securities-filter',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './securities-filter.component.html',
  styleUrl: './securities-filter.component.css'
})

export class SecuritiesFilterComponent {

  enterDown($event: Event) {
    this.search.emit(this.getFilter());
  }

  search = output<SecurityFilter>();
  sid = signal<string>('');
  description = signal<string>('');
  mode = signal<MatchMode>('contains');

  public getFilter(): SecurityFilter {
    return { sid: this.sid(), description: this.description(), mode: this.mode() };
  }
}


