import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config';

bootstrapApplication(App, appConfig).then(() => {
  console.log('✅ Angular application started successfully!');
}).catch((err) => {
  console.error('❌ Error starting Angular application:', err);
});
