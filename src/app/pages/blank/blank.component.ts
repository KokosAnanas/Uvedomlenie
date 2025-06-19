
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
import { CommonModule } from '@angular/common';
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
  TextRun,
  WidthType,
} from 'docx';
import { NotificationService } from '../../services/notification.service';

/* ─────────────── Типы формы ─────────────── */
export interface NotificationViolationModel {
  place: string;
  element: string;
  subject: string;
  norm: string;
  deadline: string;
  note: string;
}

// каждая клетка таблицы — FormControl<string>
export type NotificationViolationForm = {
  [K in keyof NotificationViolationModel]: FormControl<string>;
};

/* ─────────────── Компонент ─────────────── */
@Component({
  selector: 'app-blank',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './blank.component.html',
  styleUrls: ['./blank.component.scss'],
})
export class BlankComponent {
  /* — DI — */
  private fb: NonNullableFormBuilder = inject(FormBuilder).nonNullable;
  private api = inject(NotificationService);

  /* — DOM — */
  @ViewChild('printArea') printArea!: ElementRef<HTMLElement>;

  /* ═══════════════ ОСНОВНАЯ ФОРМА ═══════════════ */
  form = this.fb.group({
    orgName: [''],
    notifNum: [''],
    notifDate: [''],
    toWhom: ['', Validators.required],
    copyTo: ['', Validators.required],
    specialist: [''],
    present: [''],
    objectName: [''],
    workType: [''],
    violations: this.fb.array<FormGroup<NotificationViolationForm>>([]),
    actions: [''],
    contacts: [''],
  });

  /* ───── геттер для удобства *ngFor ───── */
  get violations(): FormArray<FormGroup<NotificationViolationForm>> {
    return this.form.get('violations') as FormArray<FormGroup<NotificationViolationForm>>;
  }

  /* ───── создаём группу‑нарушение ───── */
  private createViolationGroup(): FormGroup<NotificationViolationForm> {
    return this.fb.group<NotificationViolationForm>({
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

  /* ═══════════════ КНОПКИ ═══════════════ */
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

  /* ─────────────── ВСПОМОГАТЕЛЬНОЕ ─────────────── */
  private fileName(ext: string) {
    return `Уведомление_${this.form.value.notifNum}.${ext.replace('.', '')}`;
  }

  /* ─────────────── DOCX ─────────────── */
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

    /* —— Таблица нарушений —— */
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
        /* — заголовок — */
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
        /* — строки из формы — */
        ...(f.violations as NotificationViolationModel[]).map((v, i) =>
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(String(i + 1))] }),
              new TableCell({
                children: [
                  new Paragraph(`Место: ${v.place}`),
                  new Paragraph(`Элемент: ${v.element}`),
                  new Paragraph(`Предмет: ${v.subject}`),
                ],
              }),
              new TableCell({ children: [new Paragraph(v.norm)] }),
              new TableCell({ children: [new Paragraph(v.deadline)] }),
              new TableCell({ children: [new Paragraph(v.note)] }),
            ],
          }),
        ),
      ],
    });

    /* —— Документ —— */
    return new Document({
      sections: [
        {
          /* поля страницы: 20 мм слева, 10 мм справа, 10 мм сверху/снизу */
          properties: {                           //  ✅ корректное место
            page: {
              margin: { left: 1134, right: 567, top: 567, bottom: 567 }, // 20 мм / 10 мм
            },
          },
          children: [
            /* — шапка — */
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: f.orgName, italics: true }),
              ],
            }),
            /* — Название документа — */
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

            /* — Дата, Кому, Копия — */
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun(this.formatRuDate(f.notifDate ?? ''))],
            }),
            new Paragraph({ text: ' ' }),
            new Paragraph({ text: `Кому: ${f.toWhom}` }),
            new Paragraph({ text: `Копия: ${f.copyTo}` }),
            new Paragraph({ text: ' ' }),

            /* — Присутствующие и объект — */
            new Paragraph({ text: `Мною, ${f.specialist}` }),
            new Paragraph({ text: `в присутствии ${f.present}` }),
            new Paragraph({ text: `на объекте ${f.objectName}` }),
            new Paragraph({ text: `в ходе выполнения ${f.workType} работ` }),
            new Paragraph({ text: ' ' }),

            /* — Таблица нарушений — */
            violationsTable,
            new Paragraph({ text: ' ' }),

            /* — Действия — */
            new Paragraph({
              text:
                'В связи с тем, что выявленные нарушения ведут к снижению качества работ и уровня безопасности объектов ПАО «Газпром», необходимо:',
            }),
            new Paragraph({ children: [new TextRun({ text: f.actions, bold: true })] }),
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
