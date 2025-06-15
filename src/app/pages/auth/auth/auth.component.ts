import { Component } from '@angular/core';
import {Tab, TabList, TabPanel, TabPanels, Tabs} from 'primeng/tabs';
import {AutorizationComponent} from '../autorization/autorization.component';
import {RegistrationComponent} from '../registration/registration.component';
import {Toast} from 'primeng/toast';
import {MessageService} from 'primeng/api';

@Component({
  selector: 'app-auth',
  imports: [
    Tabs,
    TabList,
    Tab,
    TabPanels,
    AutorizationComponent,
    TabPanel,
    RegistrationComponent,
    Toast
  ],
  providers: [MessageService],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {

}
