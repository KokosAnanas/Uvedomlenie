import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);
  private readonly base = '/api/notifications';

  create(dto: unknown) {
    return this.http.post(this.base, dto).toPromise();
  }
}
