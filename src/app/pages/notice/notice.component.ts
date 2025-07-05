
import {
  Component,
  ViewChild,
  ElementRef,
  inject, OnInit,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
  ReactiveFormsModule, ValidatorFn, AbstractControl, ValidationErrors,
} from '@angular/forms';
import {CommonModule, DatePipe} from '@angular/common';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import { saveAs } from 'file-saver';

import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun, UnderlineType, VerticalAlign,
  WidthType,
} from 'docx';
import { NoticeService } from '../../services/notice.service';
import {
  CreateNoticeDto,
  INotice,
  INoticeFormGroup,
  INoticeViolation,
  INoticeViolationForm
} from '../../interfaces/notice';
import {DatePicker} from 'primeng/datepicker';
import {InputText} from 'primeng/inputtext';
import {TextareaModule} from 'primeng/textarea';
import {FloatLabel} from 'primeng/floatlabel';
import { ButtonModule } from 'primeng/button';
import {ButtonGroupModule} from 'primeng/buttongroup';
import {DropdownModule} from 'primeng/dropdown';
import {FileUploadModule, FileSelectEvent, FileRemoveEvent, FileUpload} from 'primeng/fileupload';
import {API} from '../../shared/api';
import {createSignatureBlockTable} from '../../shared/docx/createSignatureBlockTable';
import {createSignatureBlockTable2} from '../../shared/docx/createSignatureBlockTable2';

interface ActionOpt { label: string; value: string; }

/* ------------- Компонент --------------- */
@Component({
  selector: 'app-notice',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,
    HttpClientModule, DatePicker, InputText, FileUploadModule,
    TextareaModule, FloatLabel, ButtonModule, ButtonGroupModule, DropdownModule],
  templateUrl: './notice.component.html',
  styleUrls: ['./notice.component.scss'],
})
export class NoticeComponent implements OnInit {
  /* --- DI --- */
  private fb: NonNullableFormBuilder = inject(FormBuilder).nonNullable;
  private noticeService = inject(NoticeService);
  private http = inject(HttpClient)

  private selectedFiles: File[] = [];
  existingPhotos: string[] = [];
  private editNoticeNum: string | null = null;

  private toDate(val: string | Date): Date {
    return val instanceof Date ? val : new Date(val);
  }

  private deadlineNotBeforeNotice: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    const deadline   = group.get('deadline')?.value;
    const noticeDate = this.form?.controls.noticeDate.value;

    if (deadline && noticeDate && new Date(deadline) < new Date(noticeDate)) {
      return { earlyDeadline: true };
    }
    return null;
  };

  private dateInput(val: string | Date): string {
    return this.toDate(val).toISOString().split('T')[0];
  }

  /* ---------------- DOM -------------------- */
  @ViewChild('uploader') uploader!: FileUpload;

  /* ============== ОСНОВНАЯ ФОРМА =================== */
  form = this.fb.group<INoticeFormGroup>({
    orgName:    this.fb.control(''),
    noticeNum:   this.fb.control('', { validators: Validators.required }),
    noticeDate:  this.fb.control(''),
    toWhom:     this.fb.control(''),
    copyTo:     this.fb.control(''),
    specialist: this.fb.control(''),
    present:    this.fb.control(''),
    objectName: this.fb.control(''),
    workType:   this.fb.control(''),
    violations: this.fb.array<FormGroup<INoticeViolationForm>>([]),
    actions:    this.fb.control<string>(''),
    contacts:   this.fb.control(''),
    photos:     this.fb.control<string[]>([]),

  });

  /* ---------- загрузка файлов ---------- */

  /** Добавление файлов */
  onSelect(ev: FileSelectEvent) {
    /* spread-оператор вместо push, чтобы не получить вложенный массив */
    this.selectedFiles = [...this.selectedFiles, ...ev.files as File[]];
    this.refreshPhotosField();
  }

  /** Удаление одного файла («красный ×») */
  onRemove(ev: FileRemoveEvent) {
    const f = ev.file;
    this.selectedFiles = this.selectedFiles.filter(
      x => !(x.name === f.name && x.size === f.size && x.lastModified === f.lastModified)
    );
    this.refreshPhotosField();
  }

  /** Очистка всей очереди (иконка «корзина») */
  onClear() {
    this.selectedFiles = [];
    this.refreshPhotosField();
  }

  /** Обновляем поле `photos` формы, чтобы оно показывало только актуальные имена */
  private refreshPhotosField() {
    const names = [
      ...this.existingPhotos,
      ...this.selectedFiles.map(f => f.name),
    ];
    this.form.controls.photos.setValue(names);
  }

  /* ----------Подготовка FormData для POST ---------- */
  private buildFormData(): FormData {
    const dto  = this.buildDto();           // сформировать JSON-объект DTO
    const data = new FormData();

    data.append('notice', JSON.stringify(dto));     // вложить JSON с данными
    this.selectedFiles.forEach(file => data.append('photos', file));

    return data;
  }

  actionsOpc: ActionOpt[] = [
    { label: 'устранить выявленные нарушения в указанный срок', value: 'fix1' },
    { label: 'предоставить требуемые документы в установленный срок.', value: 'fix2' },
    { label: 'приостановить работы до устранения', value: 'stop' },
    { label: 'Другое...', value: 'other' },
  ];

  ngOnInit(): void {
    const stateNotice = history.state['notice'] as INotice | undefined;
    if (stateNotice) {
      this.patchForm(stateNotice);
    }
    if (this.violations.length === 0) {
      this.addViolation();
    }
  }

  get violations(): FormArray<FormGroup<INoticeViolationForm>> {
    return this.form.controls.violations;
  }

  /* --------- создание группы‑нарушения ----------- */
  private createViolationGroup(): FormGroup<INoticeViolationForm> {
    const group = this.fb.group<INoticeViolationForm>({
      place:    this.fb.control(''),
      element:  this.fb.control(''),
      subject:  this.fb.control(''),
      norm:     this.fb.control(''),
      deadline: this.fb.control<string | Date>(''),
      note:     this.fb.control(''),
    }, { validators: this.deadlineNotBeforeNotice });

    /* всплывающее alert-сообщение */
    group.statusChanges.subscribe(status => {
      if (status === 'INVALID' && group.errors?.['earlyDeadline']) {
        alert('дата уведомления позже, чем Предлагаемый  срок устранения');
      }
    });

    return group;
  }

  addViolation() {
    this.violations.push(this.createViolationGroup());
  }

  removeLastViolation(): void {
    const last = this.violations.length - 1;
    if (last >= 0) {
      this.violations.removeAt(last);
    }
  }

  private patchForm(notice: INotice) {
    this.form.patchValue({
      orgName: notice.orgName,
      noticeNum: notice.noticeNum,
      noticeDate: this.toDate(notice.noticeDate),
      toWhom: notice.toWhom,
      copyTo: notice.copyTo,
      specialist: notice.specialist,
      present: notice.present ?? '',
      objectName: notice.objectName,
      workType: notice.workType,
      actions: notice.actions,
      contacts: notice.contacts ?? '',
      photos: notice.photos,
    });

    this.existingPhotos = [...notice.photos];
    this.refreshPhotosField();

    this.violations.clear();
    notice.violations.forEach(v => {
      this.violations.push(this.fb.group<INoticeViolationForm>({
        place: this.fb.control(v.place),
        element: this.fb.control(v.element),
        subject: this.fb.control(v.subject),
        norm: this.fb.control(v.norm),
        deadline: this.fb.control(this.toDate(v.deadline)),
        note: this.fb.control(v.note ?? ''),
      }));
    });
  }

  photoSrc(name: string): string {
    return `${API.uploads}/${name}`;
  }

  removeExistingPhoto(name: string) {
    this.existingPhotos = this.existingPhotos.filter(p => p !== name);
    this.refreshPhotosField();
  }


  /* ---------- подготовка DTO ---------- */
  private buildDto(): CreateNoticeDto {
    const f = this.form.getRawValue();               // строго типизированное значение
    console.log(this);
    return {
      orgName:    f.orgName,
      noticeNum:  f.noticeNum,
      noticeDate: new Date(f.noticeDate).toISOString(),
      toWhom:     f.toWhom,
      copyTo:     f.copyTo,
      specialist: f.specialist,
      present:    f.present,
      objectName: f.objectName,
      workType:   f.workType,
      violations: f.violations.map(
          v => ({
            ...v,
        deadline: new Date(v.deadline).toISOString(),
      })),
      actions:    f.actions as string,
      contacts:   f.contacts,
      photos: [...this.existingPhotos, ...this.selectedFiles.map(f => f.name)],
    };

  }

  /* ============ КНОПКИ ============== */

  /** Кнопка «Сохранить в БД» */
  // Подготовка FormData и отправка запроса POST
  async saveToDb() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    try {
      const data = this.buildFormData();
      if (this.editNoticeNum) {
        await this.noticeService.updateNotice(this.editNoticeNum, data);
      } else {
        await this.noticeService.create(data);
      }

      alert('Уведомление сохранено.');
    } catch (e) {
      console.error(e);
      alert('Ошибка при сохранении.');
    }
  }

  /** Кнопка «Сохранить в DOC» */
  async saveAsDocx() {
    if (this.form.invalid) return;
    const doc = this.buildDocx();
    const blob = await Packer.toBlob(doc);
    saveAs(blob, this.fileName('.docx'));
  }

  /** Очистить все поля формы */
  clearForm() {
    this.form = this.fb.group<INoticeFormGroup>({
      orgName:    this.fb.control(''),
      noticeNum:  this.fb.control(''),
      noticeDate: this.fb.control(''),
      toWhom:     this.fb.control(''),
      copyTo:     this.fb.control(''),
      specialist: this.fb.control(''),
      present:    this.fb.control(''),
      objectName: this.fb.control(''),
      workType:   this.fb.control(''),
      violations: this.fb.array<FormGroup<INoticeViolationForm>>([]),
      actions:    this.fb.control<string>(''),
      contacts:   this.fb.control(''),
      photos:     this.fb.control<string[]>([]),
    });
    this.selectedFiles = [];
    this.existingPhotos = [];
    this.editNoticeNum = null;
    this.addViolation();
  }


  /* ------------- ВСПОМОГАТЕЛЬНОЕ ---------------- */
  private fileName(ext: string) {
    return `Уведомление_${this.form.value.noticeNum}.${ext.replace('.', '')}`;
  }

  private datePipe = inject(DatePipe);

  /* --------------------------- DOCX ------------------------------------- */
  private readonly RU_MONTHS = [
    'января',
    'февраля',
    'марта',
    'апреля',
    'мая',
    'июня',
    'июля',
    'августа',
    'сентября',
    'октября',
    'ноября',
    'декабря',
  ];

  private formatRuDate(date: string | Date): string {
    const d = date instanceof Date ? date : new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    return `« ${day} »  ${this.RU_MONTHS[d.getMonth()]}  ${d.getFullYear()} г.`;
  }

  private buildDocx(): Document {
    const f = this.form.value;

    /* ------------------------- Блок «Дата / Кому» на одной строке --------------------------------- */
    const dateToWhomTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },   // таблица во всю ширину
      borders: {                 // убираем все линии (делаем «невидимой»)
        top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        insideVertical:   { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      },

      rows: [
        new TableRow({
          children: [
            /* ─── левая ячейка: дата ─── */
            new TableCell({
              verticalAlign: VerticalAlign.TOP,
              width: { size: 50, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  alignment: AlignmentType.LEFT,
                  children: [
                    new TextRun(this.formatRuDate(f.noticeDate ?? '')),
                  ],
                }),
              ],
            }),

            /* ─── правая ячейка: «Кому» ─── */
            new TableCell({
              verticalAlign: VerticalAlign.TOP,
              width: { size: 50, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  alignment: AlignmentType.LEFT,
                  children: [
                    new TextRun({
                      text: 'Кому: ',
                      bold: true,
                    }),
                    new TextRun(String(f.toWhom)),
                  ],
                }),
                new Paragraph({ text: ' ' }),

                new Paragraph({
                  alignment: AlignmentType.LEFT,
                  children: [
                    new TextRun({
                      text: 'Копия: ',
                      bold: true,
                    }),
                    new TextRun(String(f.copyTo)),
                  ],
                }),

              ],
            }),
          ],
        }),
      ],
    });

    /* --- Таблица нарушений --- */
    const violationsTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 1 },
        left: { style: BorderStyle.SINGLE, size: 1 },
        right: { style: BorderStyle.SINGLE, size: 1 },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
        insideVertical: { style: BorderStyle.SINGLE, size: 1 },
      },
      rows: [
        /* --- заголовок --- */
        new TableRow({
          children: [
            this.headerCell('№\nп/п', 5),
            this.headerCell('Перечень выявленных нарушений', 45),
            this.headerCell(
              'Наименование нормативного документа, пункт, шифр проекта, лист',
              25,
            ),
            this.headerCell('Предлагаемый срок устранения', 15),
            this.headerCell('Примечание', 10),
          ],
        }),
        /* --- строки из формы --- */
        ...(f.violations as INoticeViolation[]).map((v, i) =>
          new TableRow({
            children: [
              new TableCell({
                verticalAlign: VerticalAlign.CENTER,
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun(String(i + 1))],
                  }),
                ],
              }),
              new TableCell({
                children: [

                  new Paragraph({
                    indent: { left: 400 },
                    children: [
                      new TextRun({
                        text: 'Место нарушения:',
                        italics: true,
                        underline: { type: UnderlineType.SINGLE },
                      }),
                    ],
                  }),
                  new Paragraph({
                    alignment: AlignmentType.START,
                    children: [ new TextRun(String(v.place)) ],
                  }),

                  new Paragraph({
                    indent: { left: 400 },
                    children: [
                      new TextRun({
                        text: 'Элемент нарушения:',
                        italics: true,
                        underline: { type: UnderlineType.SINGLE },
                      }),
                    ],
                  }),
                  new Paragraph({
                    alignment: AlignmentType.START,
                    children: [ new TextRun(String(v.element)) ],
                  }),

                  new Paragraph({
                    indent: { left: 400 },
                    children: [
                      new TextRun({
                        text: 'Предмет нарушения:',
                        italics: true,
                        underline: { type: UnderlineType.SINGLE },
                      }),
                    ],
                  }),
                  new Paragraph({
                    alignment: AlignmentType.START,
                    children: [ new TextRun(String(v.subject)) ],
                  }),

                ],
              }),
              new TableCell({
                verticalAlign: VerticalAlign.CENTER,
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [ new TextRun(v.norm) ],
                  }),
                ],
              }),
              new TableCell({
                verticalAlign: VerticalAlign.CENTER,
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new TextRun(
                        this.datePipe.transform(v.deadline, 'dd.MM.yyyy') ?? ''
                      ),
                    ],
                  }),
                ],
              }),
              new TableCell({ children: [new Paragraph(v.note ?? '')] }),
            ],
          }),
        ),
      ],
    });

    /* --------------------------- Документ -------------------------------------------------------- */
    return new Document({
      styles: {
        default: {
          document: {
            /* run — настройки символов */
            run: {
              /* 12 pt = 24 half-points */
              size: 24,
              font: 'Times New Roman',
            },
          },
        },
      },

      sections: [
        {
          /* поля страницы: 20мм слева, 10мм справа, 10мм сверху/снизу */
          properties: {
            page: {
              margin: { left: 1134, right: 567, top: 567, bottom: 567 }, // 20 мм / 10 мм / 1 мм ≈ 56,7
            },
          },
          children: [
            /* --- шапка --- */
            new Paragraph({
              alignment: AlignmentType.CENTER,

              /* одна сплошная линия вдоль всей строки */
              border: {
                bottom: {                         // нижняя граница параграфа
                  style: BorderStyle.SINGLE,      // сплошная
                  size: 6,                        // 6 half-points ≈ 0,75 pt
                  color: 'auto',                  // чёрный по умолчанию
                },
              },

              children: [
                new TextRun({ text: f.orgName }),
              ],
            }),

            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({
                text: '(наименование организации, осуществляющей СК заказчика)',
                superScript: true,                   // текст надстрочный
                italics: true,
              })],
            }),

            new Paragraph({ text: ' ' }),

            /* -- Название документа -- */
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 120, after: 60 },
              children: [new TextRun({ text: 'УВЕДОМЛЕНИЕ', bold: true })],
            }),

            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: `О ВЫЯВЛЕННЫХ НАРУШЕНИЯХ № ${f.noticeNum}`,
                  bold: true,
                }),
              ],
            }),
            new Paragraph({ text: ' ' }),

            /* ------------ Дата, Кому, Копия ----------------------------- */
            dateToWhomTable,

            new Paragraph({ text: ' ' }),

            /* ---------------------- Присутствующие и объект ---------------------- */

            new Paragraph({
              indent: { firstLine: 567 },     // отступ 10 мм (567 twip)
              alignment: AlignmentType.JUSTIFIED,
              children: [
                new TextRun(
                  `Мною, ${f.specialist}, в присутствии ${f.present}
на объекте: ${f.objectName} в ходе выполнения ${f.workType} выявлены следующие нарушения требований действующих нормативных
документов, отступления от проектной документации:`
                ),
              ],
            }),
            new Paragraph({ text: ' ' }),

            /* ---------------------- Таблица нарушений -------------------------------- */
            violationsTable,
            new Paragraph({ text: ' ' }),

            /* — Действия — */
            new Paragraph({
              alignment: AlignmentType.JUSTIFIED,   // выравнивание по ширине
              indent: { firstLine: 567 },           // 10 мм ≈ 567 twip
              children: [
                new TextRun(
                  'В связи с тем, что выявленные нарушения ведут к снижению качества работ и\n' +
                  'уровня безопасности объектов ПАО «Газпром», '
                ),
                new TextRun({
                  text: `необходимо: ${f.actions}`,
                  bold: true,                        // жирный шрифт
                }),
              ],
            }),

            new Paragraph({
              indent: { firstLine: 567 },     // отступ 10 мм (567 twip)
              alignment: AlignmentType.JUSTIFIED,
              children: [
                new TextRun(
                  `После устранения нарушений прошу Вас представить официальный ответ ${f.contacts}`
                ),
              ],
            }),
            new Paragraph({ text: ' ' }),

            /* — Подписи — */
            new Paragraph({
              children: [new TextRun({ text: 'Подписи:'})],
            }),

            createSignatureBlockTable(),
            new Paragraph({ text: ' ' }),
            createSignatureBlockTable2('Представитель генерального подрядчика'),
            createSignatureBlockTable2('Представитель подрядчика'),

            new Paragraph({ text: ' ' }),

            new Paragraph({
              text: 'Отметка о закрытии уведомления ________________________________________',
            }),





          ],
        },
      ],
    });
  }




  /* ─────────────── util: Header Cell ─────────────── */
  private headerCell(text: string, widthPercentage: number): TableCell {
    return new TableCell({
      verticalAlign: VerticalAlign.CENTER,
      width: { size: widthPercentage, type: WidthType.PERCENTAGE },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text, bold: true })],
        }),
      ],
    });
  }





}
