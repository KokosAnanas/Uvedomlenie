import {Injectable} from '@angular/core';
import {Router} from "@angular/router";
// import {UserAccessService} from "../user-access/user-access.service";
// import {UserRules} from "../../shared/mock/rules";
import {BehaviorSubject, Subject} from "rxjs";
import {IUser} from '../interfaces/users';

export const LOCAL_STORAGE_NAME = 'currentUser';
export const LOCAL_STORAGE_TOKEN = 'access_token';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new Subject();
  user$ = this.userSubject.asObservable();

  private userBehaviorSubject = new BehaviorSubject(null);
  userBehavior$ = this.userBehaviorSubject.asObservable();
  private userStorage: IUser[] = [];
  private currentUser: IUser | null = null;
  private currentToken: string;

  private userBasketSubject = new Subject();
  basket$ = this.userBasketSubject.asObservable();

  constructor(
    private router: Router,
    // private accessService: UserAccessService
  ) {

    const storedUser: IUser | null = JSON.parse(localStorage.getItem(LOCAL_STORAGE_NAME) || 'null');
    if (storedUser) {
      //this.userStorage.push(storedUser);
      this.auth(storedUser)
    }
  }

  private getUser(login: string): IUser | null {
    return this.userStorage.find((user) => login === user.login) || null;
  }

  private auth(user: IUser, isRememberMe?: boolean) {
    console.log('user', user)
    this.currentUser = user;
    // this.accessService.initAccess(UserRules);

    localStorage.setItem(LOCAL_STORAGE_NAME, JSON.stringify(user));

    // send user to Subject
    this.userSubject.next(this.currentUser);
  }

  initUserToSubject(): void {
    this.userSubject.next(this.currentUser);
    // this.userBehaviorSubject.next(this.currentUser);
  }

  addBasketToSubject(): void {
    this.userBasketSubject.next('basket' +  Math.random());
  }

  setUser(user: IUser): void {
    this.currentUser = user;
  }

  setToken(token: string): void {
    this.currentToken = token;
    localStorage.setItem(LOCAL_STORAGE_TOKEN, token);
  }

  // setToken(token: string): void {
  //   this.token = token;
  // }

  setToStore(token: string): void {
    localStorage.setItem(LOCAL_STORAGE_NAME, JSON.stringify(token));
  }

  // setToStore(token: string) {
  //   window.localStorage.setItem('userToken', token);
  // }



  private authAndRedirect(user: IUser, isRememberMe?: boolean) {
    this.auth(user, isRememberMe);
    this.router.navigate(['tickets']);
  }

  get isAuthenticated(): boolean  {
    return !!this.currentToken || !!localStorage.getItem(LOCAL_STORAGE_TOKEN);
  }
  get isUserInStore(): boolean  {
    return !!localStorage.getItem(LOCAL_STORAGE_NAME);
  }


  get user(): IUser | null {
    return this.currentUser;
  }
  getCurrentUser(): IUser | null {
    return this.currentUser;
  }


  get token(): string | null {
    return this.currentToken ?? localStorage.getItem(LOCAL_STORAGE_TOKEN);
  }

  authUser(login: string, password: string, isRememberMe: boolean): true | string {
    const user = this.getUser(login);
    if (!user) {
      return 'User not found';
    }
    if (user.password !== password) {
      return 'Wrong password';
    }
    this.authAndRedirect(user, isRememberMe)
    return true;
  }

  addUser(user: IUser, isRememberMe?: boolean): true | string {
    if (this.getUser(user.login)) {
      return 'User already exists';
    }
    this.userStorage.push(user);
    this.authAndRedirect(user, isRememberMe)
    return true;
  }

  logout() {
    this.userStorage = this.userStorage.filter(({login}) => login === this.currentUser?.login);
    this.currentUser = null;
    localStorage.removeItem(LOCAL_STORAGE_NAME);
    this.router.navigate(['auth']);
  }

  changePassword(password: string) {
    if (!this.currentUser) {
      return
    }
    this.currentUser.password = password;
    const dbUser = this.userStorage.find(({login}) => login === this.currentUser?.login)!;
    dbUser.password = password
  }
}

