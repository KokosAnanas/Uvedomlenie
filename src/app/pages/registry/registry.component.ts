// src/app/pages/registry/registry.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { TableModule } from 'primeng/table';
import { MultiSelectModule } from 'primeng/multiselect';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import {
  CommonModule,
  DatePipe,
  NgFor,
  NgSwitch,
  NgSwitchCase,
  NgSwitchDefault,
} from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NoticeService } from '../../services/notice.service';
import {
  INotice,
  INoticeViolation,
} from '../../interfaces/notice';
import {StyleClass} from 'primeng/styleclass';
import {ImageModule} from 'primeng/image';
import {API} from '../../shared/api';
import {Router} from '@angular/router';
import {Tooltip} from 'primeng/tooltip';

type RegistryRow = INotice & INoticeViolation;

@Component({
  standalone: true,
  selector: 'app-registry',
  imports: [
    ImageModule,
    CommonModule,
    TableModule,
    MultiSelectModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    NgFor,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    DatePipe,
    StyleClass,
    Tooltip,
  ],
  templateUrl: './registry.component.html',
})
export class RegistryComponent implements OnInit {
  @ViewChild('dt') table!: Table;

  notices: RegistryRow[] = [];
  cols: { field: keyof RegistryRow; header: string }[] = [];
  selectedColumns: { field: keyof RegistryRow; header: string }[] = [];
  globalFilterValue = '';

  first = 0;
  rows = 10;
  private groupedCols: Array<keyof RegistryRow> = [
    'orgName', 'noticeNum', 'noticeDate', 'toWhom',
    'copyTo', 'specialist', 'objectName', 'workType', 'actions', 'photos'
  ];

  constructor(
    private noticeApi: NoticeService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    /* 15 колонок (INotice + INoticeViolation) */
    this.cols = [
      { field: 'orgName', header: 'Организация' },
      { field: 'noticeNum', header: '№ уведомл.' },
      { field: 'noticeDate', header: 'Дата' },
      { field: 'toWhom', header: 'Кому' },
      { field: 'copyTo', header: 'Копия' },
      { field: 'specialist', header: 'Специалист' },
      { field: 'objectName', header: 'Объект' },
      { field: 'workType', header: 'Вид работ' },
      { field: 'place', header: 'Место' },
      { field: 'element', header: 'Элемент' },
      { field: 'subject', header: 'Предмет' },
      { field: 'norm', header: 'НД (пункт)' },
      { field: 'deadline', header: 'Срок' },
      { field: 'actions', header: 'Действия' },
      { field: 'photos', header: 'Фото нарушения' },
      { field: 'note', header: 'Примечание' },
    ];
    this.selectedColumns = [...this.cols];

    /* Загрузка и «расплющивание» нарушений */
    this.noticeApi.getNotices().subscribe((data: INotice[]) => {
      this.notices = data.flatMap((n) =>
        n.violations?.length
          ? n.violations.map((v) => ({ ...n, ...v }))
          : [{ ...n } as RegistryRow],
      );
    });
  }

  /** Глобальный фильтр */
  onGlobalFilter(e: Event) {
    const value = (e.target as HTMLInputElement | null)?.value ?? '';
    this.globalFilterValue = value;
    this.table.filterGlobal(value, 'contains');
  }

  resetGlobalFilter(input: HTMLInputElement) {
    this.globalFilterValue = '';
    input.value = '';
    this.table.filterGlobal('', 'contains');
  }


  /** Показать ли ячейку? */
  displayCell(field: keyof RegistryRow, firstOfGroup: boolean) {
    return !this.groupedCols.includes(field) || firstOfGroup;
  }

  /** Какой rowspan ставить */
  getRowspan(
    field: keyof RegistryRow,
    firstOfGroup: boolean,
    span?: number
  ): string | null {
    return this.groupedCols.includes(field) && firstOfGroup && span
      ? String(span)
      : null;
  }

  photoSrc(fileName?: string | null) {
    return fileName ? `http://localhost:3000/uploads/${fileName}` : '';
  }

  openNotice(row: RegistryRow) {
    this.router.navigate(['/notice'], { state: { notice: row } });
  }

  deleteNotice(row: RegistryRow) {
    if (confirm('Удалить уведомление?')) {
      this.noticeApi.deleteNotice(row.noticeNum).subscribe(() => {
        this.notices = this.notices.filter(n => n.noticeNum !== row.noticeNum);
      });
    }
  }



  // photoSrc(fileName?: string | null) {
  //   return fileName ? API.uploads + `/${fileName}` : '';
  // }
}
