import { bootstrapApplication } from '@angular/platform-browser';
import { ModuleRegistry } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import { AppComponent } from './app/app.component';

   import { provideHttpClient } from '@angular/common/http';

   ModuleRegistry.registerModules([AllEnterpriseModule]);

   bootstrapApplication(AppComponent, {
     providers: [provideHttpClient()],
   }).catch((err) => console.error(err));
