import { bootstrapApplication } from '@angular/platform-browser';
import { ModuleRegistry } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import { AppComponent } from './app/app.component';
import { provideWindowViews } from './app/common/window/window-views';
import { OrderViewModel } from './app/order/order.view-model';
import { OrderComponent } from './app/order/order.component';

   import { provideHttpClient } from '@angular/common/http';

   ModuleRegistry.registerModules([AllEnterpriseModule]);

   bootstrapApplication(AppComponent, {
     providers: [provideHttpClient(),
     provideWindowViews([OrderViewModel, OrderComponent])]

   }).catch((err) => console.error(err));


   //npm install @angular/cdk@18
