import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './client/app';
import { appConfig } from './config';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));

