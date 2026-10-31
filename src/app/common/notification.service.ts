import { Injectable } from '@angular/core';
import { HubConnectionBuilder } from '@microsoft/signalr';

/** imena poruka, ista kao konstante u NotificationHub na serveru */
export const Notifications = {
  ManagersChanged: 'ManagersChanged',
  StrategiesChanged: 'StrategiesChanged',
  SecuritiesChanged: 'SecuritiesChanged',
  OrderChanged: 'OrderChanged',
  AllocationChanged: 'AllocationChanged'
} as const;

/** jedna SignalR veza za celu aplikaciju */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly connection = new HubConnectionBuilder()
    .withUrl('/hubs/notifications')
    .withAutomaticReconnect()            // sam se ponovo poveže ako veza pukne
    .build();

  constructor() {
    this.connection.start().catch((e) => console.error('SignalR connect failed', e));
  }

  /** pretplata na poruku sa servera; vraća funkciju za odjavu */
  on(event: string, handler: (...args: any[]) => void): () => void {
    this.connection.on(event, handler);
    return () => this.connection.off(event, handler);
  }
}