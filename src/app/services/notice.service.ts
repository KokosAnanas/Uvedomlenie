import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {firstValueFrom, Observable} from 'rxjs';
import {INotice} from '../interfaces/notice';
import {API} from '../shared/api';

@Injectable({ providedIn: 'root' })
export class NoticeService {
  private http = inject(HttpClient);

  /** POST /api/notices */
  create(dto: FormData): Promise<void> {
    return firstValueFrom(this.http.post<void>(API.notices, dto));
  }
  getNotices(): Observable<INotice[]> {
    // Выполняем GET-запрос к бэкенду
    return this.http.get<INotice[]>(API.notices, {
    });
  }

  /** DELETE /api/notices/:noticeNum */
  deleteNotice(noticeNum: string): Observable<void> {
    const encoded = encodeURIComponent(noticeNum);
    return this.http.delete<void>(`${API.notices}/${encoded}`);
  }

  /** PUT /api/notices/:noticeNum */
  updateNotice(noticeNum: string, dto: FormData): Promise<void> {
    const encoded = encodeURIComponent(noticeNum);
    return firstValueFrom(this.http.put<void>(`${API.notices}/${encoded}`, dto));
  }
}

