import { Component } from '@angular/core';
import {RouterLink} from '@angular/router';
import {ButtonDirective} from 'primeng/button';
import {MenuItem} from 'primeng/api';
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
    { label: 'Реестр уведомлений',         routerLink: '/registry' }
  ];

  logout(): void {

  }
}
