import { Component } from '@angular/core';
import {InputSwitch} from 'primeng/inputswitch';
import {RouterLink} from '@angular/router';
import {ButtonDirective} from 'primeng/button';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    ButtonDirective
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

}
