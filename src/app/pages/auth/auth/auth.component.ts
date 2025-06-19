import { Component, OnDestroy, OnInit } from '@angular/core';
import { RegistrationComponent } from "../registration/registration.component";
import { TabsModule } from 'primeng/tabs';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import {AuthorizationComponent} from '../authorization/authorization.component';

@Component({
  selector: 'app-auth',
  imports: [AuthorizationComponent, RegistrationComponent, TabsModule, Toast],
  providers: [MessageService],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent implements OnInit, OnDestroy {

  ngOnInit(): void { }

  ngOnDestroy(): void { }

}
