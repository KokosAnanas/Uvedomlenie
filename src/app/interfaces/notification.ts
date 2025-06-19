export interface NotificationViolation {
  place:    string;   // место нарушения
  element:  string;   // элемент конструкции
  subject:  string;   // предмет нарушения
  norm:     string;   // норматив, пункт
  deadline: string;   // срок устранения (ISO-дата)
  note:     string;   // примечание
}
