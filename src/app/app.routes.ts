import { Routes } from '@angular/router';
import {HomeComponent} from './pages/home/home.component';
import {RegistryComponent} from './pages/registry/registry.component';
import {LayoutComponent} from './layout/layout/layout.component';
import {AuthComponent} from './pages/auth/auth/auth.component';
import {NoticeComponent} from './pages/notice/notice.component';
import {authGuard} from './shared/guards/auth.guard';

export const routes: Routes = [
  { path: 'auth', component: AuthComponent },
  { path: '', redirectTo: '/auth', pathMatch: 'full' },
  { path: '', canActivate: [authGuard], component: LayoutComponent, children: [
      { path: 'home', component: HomeComponent },
      { path: 'registry', component: RegistryComponent },
      { path: 'notice', component: NoticeComponent },]
  },
  { path: '**', redirectTo: '/auth', pathMatch: 'full' },
];
