// src/app/pages/registry/registry.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';                      // ✨ для filterGlobal
import { TableModule } from 'primeng/table';
import { MultiSelectModule } from 'primeng/multiselect';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import {DatePipe, NgFor, NgSwitch, NgSwitchCase, NgSwitchDefault} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NoticeService } from '../../services/notice.service';
import { INotice, RegistryRow } from '../../interfaces/notice';

@Component({
  standalone: true,
  selector   : 'app-registry',
  imports: [
    TableModule, MultiSelectModule, ButtonModule, InputTextModule,
    FormsModule, NgFor, NgSwitch, NgSwitchCase, DatePipe, NgSwitchDefault
  ],
  templateUrl: './registry.component.html'
})
export class RegistryComponent implements OnInit {

  @ViewChild('dt') table!: Table;          // ссылка на p-table

  notices: INotice[] = [];
  cols: any[] = [];
  selectedColumns: any[] = [];
  first = 0;
  rows  = 10;

  constructor(private noticeApi: NoticeService) {}

  ngOnInit(): void {

    /* ===== 15 столбцов из INotice + INoticeViolation ===== */
    this.cols = [
      { field: 'orgName'    , header: 'Организация'  },
      { field: 'noticeNum'  , header: '№ уведомл.'   },
      { field: 'noticeDate' , header: 'Дата'         },
      { field: 'toWhom'     , header: 'Кому'         },
      { field: 'copyTo'     , header: 'Копия'        },
      { field: 'specialist' , header: 'Специалист'   },
      { field: 'objectName' , header: 'Объект'       },
      { field: 'workType'   , header: 'Вид работ'    },
      { field: 'place'      , header: 'Место'        }, // ▼ из violations
      { field: 'element'    , header: 'Элемент'      },
      { field: 'subject'    , header: 'Предмет'      },
      { field: 'norm'       , header: 'НД (пункт)'   },
      { field: 'deadline'   , header: 'Срок'         },
      { field: 'actions'    , header: 'Действия'     },
      { field: 'note'       , header: 'Примечание'   }
    ];
    this.selectedColumns = this.cols.slice();

    /* ===== загрузка данных ===== */
    this.noticeApi.getNotices().subscribe(data => {
      /* разворачиваем violations, чтобы каждая строка = одно нарушение
         и можно было применить pRowGroup rowSpan */
      this.notices = data.flatMap((n: INotice) =>
        n.violations?.length
          ? n.violations.map(v => ({ ...n, ...v })) // place, element… deadline, note
          : [{ ...n }]
      );
    });
  }

  /* ---------- программный пагинатор ---------- */
  // next()  { this.first = Math.min(this.first + this.rows, this.notices.length); }
  // prev()  { this.first = Math.max(this.first - this.rows, 0); }
  // reset() { this.first = 0; }
  // isLastPage()  { return this.first + this.rows >= this.notices.length; }
  // isFirstPage() { return this.first === 0; }

  /* ---------- безопасный глобальный фильтр ---------- */
  onGlobalFilter(e: Event) {
    const value = (e.target as HTMLInputElement | null)?.value ?? '';
    this.table.filterGlobal(value, 'contains');
  }
}
