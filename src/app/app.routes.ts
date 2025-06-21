import { Routes } from '@angular/router';
import {HomeComponent} from './pages/home/home.component';
import {NoticeComponent} from './pages/notice/notice.component';
import {RegisterComponent} from './pages/register/register.component';
import {LayoutComponent} from './layout/layout/layout.component';
import {AuthComponent} from './pages/auth/auth/auth.component';
import {BlankComponent} from './pages/blank/blank.component';
import {authGuard} from './shared/guards/auth.guard';

export const routes: Routes = [
  { path: 'auth', component: AuthComponent },
  { path: '', redirectTo: '/auth', pathMatch: 'full' },
  { path: '', canActivate: [authGuard], component: LayoutComponent, children: [
      { path: 'blank', component: BlankComponent },
      { path: 'home', component: HomeComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'notice', component: NoticeComponent },]
  },
  { path: '**', redirectTo: '/auth', pathMatch: 'full' },
];
