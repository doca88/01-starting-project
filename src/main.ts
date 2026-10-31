import { bootstrapApplication } from '@angular/platform-browser';
import { ModuleRegistry } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import { AppComponent } from './app/app.component';
import { provideWindowViews } from './app/common/window/window-views';
import { OrderViewModel } from './app/order/order.view-model';
import { OrderComponent } from './app/order/order.component';

   import { provideHttpClient } from '@angular/common/http';
import { LookupComponent } from './app/lookup/lookup.component';
import { LookupViewModel } from './app/lookup/lookup.view-model';

   ModuleRegistry.registerModules([AllEnterpriseModule]);

   bootstrapApplication(AppComponent, {
     providers: [provideHttpClient(),
     provideWindowViews([OrderViewModel, OrderComponent],
      [LookupViewModel, LookupComponent],
     )]

   }).catch((err) => console.error(err));


  
