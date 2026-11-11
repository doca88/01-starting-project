import { bootstrapApplication } from '@angular/platform-browser';
import { provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { ModuleRegistry } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { AppComponent } from './app/app.component';
import { provideWindowViews } from './app/common/window/window-views';
import { OrderViewModel } from './app/order/order.view-model';
import { OrderComponent } from './app/order/order.component';
import { LookupViewModel } from './app/lookup/lookup.view-model';
import { LookupComponent } from './app/lookup/lookup.component';
import { LoginViewModel } from './app/login/login.view-model';
import { LoginComponent } from './app/login/login.component';
import { SecurityViewModel } from './app/security/security.view-model';
import { SecurityComponent } from './app/security/security.component';

ModuleRegistry.registerModules([AllEnterpriseModule]);

bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),   // zadrži zone.js i posle Angulara 21
    provideHttpClient(),
    provideWindowViews(
      [OrderViewModel, OrderComponent],
      [LookupViewModel, LookupComponent],
      [LoginViewModel, LoginComponent],
      [SecurityViewModel, SecurityComponent],
    ),
  ],
}).catch((err) => console.error(err));