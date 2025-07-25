import {
  ApplicationConfig,
  mergeApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core'
import { provideRouter } from '@angular/router'
import { provideClientHydration, withEventReplay } from '@angular/platform-browser'
import { provideServerRendering, withRoutes } from '@angular/ssr'
import { Routes } from '@angular/router'
import { RenderMode, ServerRoute } from '@angular/ssr'
import { provideTanStackQuery, QueryClient } from '@tanstack/angular-query-experimental'

const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Server,
  }
]

const routes: Routes = []

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideTanStackQuery(new QueryClient()),
  ]
}

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
  ]
}

export const config = mergeApplicationConfig(appConfig, serverConfig)
