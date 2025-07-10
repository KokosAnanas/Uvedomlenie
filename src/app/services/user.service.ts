import { Injectable } from '@angular/core';
import { IUser, IUserRegister } from '../interfaces/users';
import { HttpClient } from '@angular/common/http';
import { API } from '../shared/api';
import {map, tap} from 'rxjs';

export const LOCAL_STORAGE_TOKEN = 'access_token';

@Injectable({ providedIn: 'root' })
export class UserService {

  private currentUser: IUser | null = null;
  private currentToken: string | null = localStorage.getItem(LOCAL_STORAGE_TOKEN);

  constructor(private http: HttpClient) {}

  /* ---------- регистрация ---------- */
  registerUser(dto: IUserRegister) {
    return this.http
      .post<{ access_token: string }>(API.registration, dto)      // <-- BACK отправляет {access_token}
      .pipe(
        tap(res => this.storeToken(res.access_token)),
        map(res => res.access_token)
      );
  }

  /* ---------- авторизация ---------- */
  authUser(credentials: IUser) {
    return this.http
      .post<{ access_token: string }>(API.auth(credentials.login), credentials)
      .pipe(
        tap(res => this.storeToken(res.access_token)),
        map(res => res.access_token)
      );
  }

  /* ---------- токен и пользователь ---------- */
  get token(): string | null {
    return this.currentToken ?? localStorage.getItem(LOCAL_STORAGE_TOKEN);
  }

  /* ---------- прочее, как было ---------- */
  getUser(): IUser | null {
    return this.currentUser ?? JSON.parse(sessionStorage.getItem('login') || 'null');
  }

  setUser(user: IUser | null): void {
    this.currentUser = user;
    sessionStorage.setItem('login', user ? JSON.stringify({ login: user.login }) : '');
  }

  /* ---------- приватный помощник ---------- */
  private storeToken(token: string | null) {
    this.currentToken = token;
    token
      ? localStorage.setItem(LOCAL_STORAGE_TOKEN, token)
      : localStorage.removeItem(LOCAL_STORAGE_TOKEN);
  }
}
