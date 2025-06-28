import { Component } from '@angular/core';
import {InputSwitch} from 'primeng/inputswitch';
import {RouterLink} from '@angular/router';
import {ButtonDirective} from 'primeng/button';
import {MenuItem, PrimeTemplate} from 'primeng/api';
import {Menubar} from 'primeng/menubar';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    ButtonDirective,
    Menubar,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  items: MenuItem[] = [
    { label: 'Главная',        routerLink: '/' },
    { label: 'Уведомление',    routerLink: '/notice' },
    { label: 'Реестр',         routerLink: '/registry' }
  ];

  logout(): void {
    // TODO: подключить AuthService → выйти и редиректнуть на /login
  }
}
