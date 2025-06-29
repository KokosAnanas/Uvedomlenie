import {FormArray, FormControl, FormGroup} from '@angular/forms';

export interface INotice {
  orgName:    string;
  noticeNum:  string;
  noticeDate: string | Date;  // string
  toWhom:     string;
  copyTo:     string;
  specialist: string;
  present?:    string;               //?
  objectName: string;
  workType:   string;
  violations: INoticeViolation[];
  actions:    string;
  contacts?:   string;                   //?
  photos: string[];
}

export interface INoticeViolation {
  place: string;
  element: string;
  subject: string;
  norm: string;
  deadline: string | Date;       // string
  note?: string | null;                   //?
}

export type INoticeFormGroup = {
  orgName:     FormControl<string>;
  noticeNum:   FormControl<string>;
  noticeDate:  FormControl<string | Date>;          // ISO-строка
  toWhom:      FormControl<string>;
  copyTo:      FormControl<string>;
  specialist:  FormControl<string>;
  present:     FormControl<string>;
  objectName:  FormControl<string>;
  workType:    FormControl<string>;
  violations:  FormArray<FormGroup<INoticeViolationForm>>;
  actions:     FormControl<string>;
  contacts:    FormControl<string>;
  photos:      FormControl<string[]>;
};

export type INoticeViolationForm = {
  place: FormControl<string>;
  element: FormControl<string>;
  subject: FormControl<string>;
  norm: FormControl<string>;
  deadline: FormControl<string | Date>;
  note: FormControl<string>;
};

export interface CreateNoticeDto extends Omit<INotice, 'violations'|'noticeDate'|'photos'> {
  noticeDate: string;
  violations: INoticeViolation[];
  photos: string[];
}

export type RegistryRow = INotice & INoticeViolation;

