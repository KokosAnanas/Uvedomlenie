
import {
  Component,
  ViewChild,
  ElementRef,
  inject,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {CommonModule, DatePipe} from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { saveAs } from 'file-saver';
import html2pdf from 'html2pdf.js';
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
import { NotificationService } from '../../services/notification.service';
import {INotificationViolation, INotificationViolationForm} from '../../interfaces/notification';
import {DatePicker} from 'primeng/datepicker';
import {InputText} from 'primeng/inputtext';
import { InputTextModule } from 'primeng/inputtext';
import {TextareaModule} from 'primeng/textarea';
import {FloatLabel} from 'primeng/floatlabel';
import {Button} from 'primeng/button';
import { ButtonModule } from 'primeng/button';
import {ButtonGroupModule} from 'primeng/buttongroup';

/* ------------- Компонент --------------- */
@Component({
  selector: 'app-blank',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,
    HttpClientModule, DatePicker, InputTextModule, InputText,
    TextareaModule, FloatLabel, ButtonModule, ButtonGroupModule, Button],
  templateUrl: './blank.component.html',
  styleUrls: ['./blank.component.scss'],
})
export class BlankComponent {
  /* --- DI --- */
  private fb: NonNullableFormBuilder = inject(FormBuilder).nonNullable;
  private api = inject(NotificationService);

  /* --- DOM --- */
  @ViewChild('printArea') printArea!: ElementRef<HTMLElement>;

  /* ============== ОСНОВНАЯ ФОРМА =================== */
  form = this.fb.group({
    orgName: [''],
    notifNum: [''],
    notifDate: [''],
    toWhom: [''],
    copyTo: [''],
    specialist: [''],
    present: [''],
    objectName: [''],
    workType: [''],
    violations: this.fb.array<FormGroup<INotificationViolationForm>>([]),
    actions: [''],
    contacts: [''],
    // Validators.required
  });

  /* --------- геттер для удобства *ngFor ------------ */
  get violations(): FormArray<FormGroup<INotificationViolationForm>> {
    return this.form.get('violations') as FormArray<FormGroup<INotificationViolationForm>>;
  }

  /* --------- создание группы‑нарушения ----------- */
  private createViolationGroup(): FormGroup<INotificationViolationForm> {
    return this.fb.group<INotificationViolationForm>({
      place: this.fb.control(''),
      element: this.fb.control(''),
      subject: this.fb.control(''),
      norm: this.fb.control(''),
      deadline: this.fb.control(''),
      note: this.fb.control(''),
    });
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


  /* ============ КНОПКИ ============== */
  async saveToDb() {
    if (this.form.invalid) return;
    await this.api.create(this.form.value);
    alert('Уведомление сохранено в базе данных');
  }

  async saveAsDocx() {
    if (this.form.invalid) return;
    const doc = this.buildDocx();
    const blob = await Packer.toBlob(doc);
    saveAs(blob, this.fileName('.docx'));
  }

  saveAsPdf() {
    if (this.form.invalid) return;
    html2pdf()
      .set({ margin: 10, filename: this.fileName('.pdf') })
      .from(this.printArea.nativeElement)
      .save();
  }

  print() {
    window.print();
  }

  /* ------------- ВСПОМОГАТЕЛЬНОЕ ---------------- */
  private fileName(ext: string) {
    return `Уведомление_${this.form.value.notifNum}.${ext.replace('.', '')}`;
  }

  private datePipe = inject(DatePipe);

  /* ----------- DOCX ---------------- */
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

  private formatRuDate(iso: string): string {
    const d = new Date(iso);
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
                    new TextRun(this.formatRuDate(f.notifDate ?? '')),
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
        ...(f.violations as INotificationViolation[]).map((v, i) =>
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
              new TableCell({ children: [new Paragraph(v.note)] }),
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
                  text: `О ВЫЯВЛЕННЫХ НАРУШЕНИЯХ № ${f.notifNum}`,
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
              children: [
                new TextRun(
                  `Мною, ${f.specialist}, в присутствии ${f.present}
на объекте ${f.objectName} в ходе выполнения ${f.workType} работ
выявлены следующие нарушения требований действующих нормативных
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
              text:
                `В связи с тем, что выявленные нарушения ведут к снижению качества работ и
                уровня безопасности объектов ПАО «Газпром», необходимо: ${f.actions}`,
            }),
            new Paragraph({ text: ' ' }),
            new Paragraph({
              text: `После устранения нарушений прошу направить официальный ответ в ${f.orgName} на E-mail: ${f.contacts}`,
            }),
            new Paragraph({ text: ' ' }),

            /* — Подписи — */
            new Paragraph({ children: [new TextRun({ text: 'Подписи:', bold: true })] }),
            new Paragraph({ text: `${f.specialist}    __________  (подпись)` }),
            new Paragraph({ text: 'Представитель генподрядчика __________  (подпись)' }),
            new Paragraph({ text: 'Представитель подрядчика __________  (подпись)' }),
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
