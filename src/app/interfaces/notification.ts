import {FormControl} from '@angular/forms';

export interface INotificationViolation {
  place: string;
  element: string;
  subject: string;
  norm: string;
  deadline: string;
  note: string;
}

// каждая клетка таблицы — FormControl<string>
export type INotificationViolationForm = {
  [K in keyof INotificationViolation]: FormControl<string>;
};
