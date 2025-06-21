import { Injectable } from '@angular/core';
import { IUser, IUserRegister } from '../interfaces/users';
import { HttpClient } from '@angular/common/http';
import { API } from '../shared/api';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class UserService {

  private currentUser: IUser | null = null;

  constructor(private http: HttpClient) { }

  registerUser(user: IUserRegister): Observable<string> {
    return this.http.post(API.registration, user, {responseType: 'text'});
  }

  authUser(user: IUser): Observable<string> {
    return this.http.post<string>(API.auth(user.login), user,);
  }

  getUser(): IUser {
    return this.currentUser || JSON.parse(<string>sessionStorage.getItem('login'));
  }

  setUser(user: IUser): void {
    this.currentUser = user;
    if (user !== null) {
      sessionStorage.setItem('login', JSON.stringify({login:user.login}));
    } else {
      sessionStorage.setItem('login', '');
    }
    // console.log(sessionStorage);
  }
}
