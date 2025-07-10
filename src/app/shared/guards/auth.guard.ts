import {CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {UserService} from '../../services/user.service';

export const authGuard: CanActivateFn = (route, state) => {

  const userService = inject(UserService);
  const  router = inject(Router);

  const isAuth = !!userService.getUser();

  if (!isAuth) {
    router.navigate(['auth']);
    return false;
  } else {
    return true;
  }
};
