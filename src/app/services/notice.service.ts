import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {firstValueFrom, Observable} from 'rxjs';
import {CreateNoticeDto, INotice} from '../interfaces/notice';
import {API} from '../shared/api';

interface Notice {
}

@Injectable({ providedIn: 'root' })
export class NoticeService {
  private http = inject(HttpClient);

  /** POST /api/notices */
  create(dto: FormData): Promise<void> {
    return firstValueFrom(this.http.post<void>(API.notices, dto));
  }
  getNotices(): Observable<INotice[]> {
    // Выполняем GET-запрос к бэкенду (URL и тип могут отличаться при настройке API)
    return this.http.get<INotice[]>(API.notices, {
      /* если /notices защищён JWT, раскомментировать: */
      // headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }

  /** DELETE /api/notices/:noticeNum */
  deleteNotice(noticeNum: string): Observable<void> {
    const encoded = encodeURIComponent(noticeNum);
    return this.http.delete<void>(`${API.notices}/${encoded}`);
  }
}

