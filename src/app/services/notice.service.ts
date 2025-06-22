import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { CreateNoticeDto } from '../interfaces/notice';
import {API} from '../shared/api';

@Injectable({ providedIn: 'root' })
export class NoticeService {
  private http = inject(HttpClient);
  private readonly base = '/api/notifications';

  /** POST /api/notices */
  create(dto: CreateNoticeDto): Promise<void> {
    return firstValueFrom(this.http.post<void>(API.notices, dto));
  }
}

