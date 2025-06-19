import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  FormGroup,
} from '@angular/forms';

import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import html2pdf from 'html2pdf.js';

@Component({
  selector: 'app-notice',
  standalone: true,                         // ⬅ ключ к компонентному подходу
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './notice.component.html',
  styleUrls: ['./notice.component.scss'],
})
export class NoticeComponent {
  /** Реактивная форма */
  readonly f: FormGroup;

  constructor(private fb: FormBuilder) {
    this.f = this.fb.group({
      org: ['ООО «Газпром трансгаз Санкт-Петербург»', Validators.required],
      num: ['', Validators.required],
      to: [''],
      copy: [''],
      day: [''],
      month: [''],
      year: [''],
      body: [''],
    });
  }

  /* ---------- DOCX ---------- */
  async saveDocx(): Promise<void> {
    const v = this.f.value;
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({ children: [new TextRun({ text: v.org, bold: true })] }),
            new Paragraph({}),
            new Paragraph({
              children: [new TextRun({ text: 'УВЕДОМЛЕНИЕ', bold: true, size: 32 })],
              spacing: { after: 200 },
            }),
            new Paragraph({
              text: `О ВЫЯВЛЕННЫХ НАРУШЕНИЯХ № ${v.num}`,
              spacing: { after: 200 },
            }),
            new Paragraph({ text: `«${v.day}» ${v.month} ${v.year} г.` }),
            new Paragraph({ text: v.body }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, this.fileName('docx'));
  }

  /* ---------- PDF ---------- */
  savePdf(): void {
    const el = document.querySelector('#printRoot') as HTMLElement;
    if (!el) return;
    html2pdf().from(el).set({ filename: this.fileName('pdf'), margin: 10 }).save();
  }

  /* ---------- Print ---------- */
  print(): void {
    window.print();
  }

  /* --- helpers --- */
  private fileName(ext: string): string {
    return `Уведомление_${this.f.value.num || '___'}.${ext}`;
  }
}
