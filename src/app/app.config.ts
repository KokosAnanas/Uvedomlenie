import {APP_INITIALIZER, ApplicationConfig, importProvidersFrom, provideZoneChangeDetection} from '@angular/core';
import { provideRouter } from '@angular/router';
import {DatePipe} from '@angular/common';
import { routes } from './app.routes';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {providePrimeNG} from 'primeng/config';
import Aura from '@primeng/themes/aura';
import Material from '@primeng/themes/material';
import Lara  from '@primeng/themes/lara';
import Nora  from '@primeng/themes/nora';
import {ReactiveFormsModule} from '@angular/forms';
import {HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {provideAnimations} from '@angular/platform-browser/animations';
import {ConfigService} from './services/config.service';
import {AuthInterceptor} from './services/auth.interceptor';
import AuraTeal from '../theme/aura-teal';
import AuraLime from '../theme/aura-lime';

const loadConfig = (cfg: ConfigService) => () => cfg.loadPromise();

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom(ReactiveFormsModule),
    provideAnimationsAsync(),
    provideAnimations(),
    DatePipe,
    providePrimeNG({
      theme: {
        preset: AuraLime
      }
    }),
    {
      provide: APP_INITIALIZER,
      useFactory: loadConfig,
      deps: [ConfigService],
      multi: true
    },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ]
};
