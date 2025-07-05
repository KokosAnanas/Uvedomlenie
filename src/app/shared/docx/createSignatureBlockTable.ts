import {
  AlignmentType,
  BorderStyle,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";

/**
 * Возвращает таблицу блока «Подписи» без вертикальных перегородок в узких
 * промежуточных столбцах (2‑м и 4‑м). Видимы только нижние линии 1, 3, 5‑го
 * столбцов первой строки.
 */
export function createSignatureBlockTable(): Table {
  const fnBottomBorder = (visible: boolean) =>
    visible
      ? { style: BorderStyle.SINGLE, size: 4, color: "000000" }
      : { style: BorderStyle.NONE };

  /* ------------ 1‑я строка: линии для подписей ------------- */
  const firstRow = new TableRow({
    cantSplit: true,
    children: [0, 1, 2, 3, 4].map((idx) =>
      new TableCell({
        width: {
          size: idx === 0 ? 40 : idx === 2 ? 15 : idx === 4 ? 25 : 5,
          type: WidthType.PERCENTAGE,
        },
        borders: {
          top: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE },
          bottom: fnBottomBorder(idx === 0 || idx === 2 || idx === 4),
        },
        children: [new Paragraph({})],
      })
    ),
  });

  /* ------------ 2‑я строка: подписи к линиям ------------- */
  const secondRow = new TableRow({
    cantSplit: true,
    children: [
      new TableCell({
        borders: { top: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE } },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "(должность специалиста строительного контроля)",
                italics: true,
                size: 18,
              }),
            ],
          }),
        ],
      }),
      new TableCell({
        borders: { top: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE } },
        children: [new Paragraph({})],
      }),
      new TableCell({
        borders: { top: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE } },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "(подпись)", italics: true, size: 18 })],
          }),
        ],
      }),
      new TableCell({
        borders: { top: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE } },
        children: [new Paragraph({})],
      }),
      new TableCell({
        borders: { top: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE } },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "(расшифровка подписи)", italics: true, size: 18 }),
            ],
          }),
        ],
      }),
    ],
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE }, // убирает вертикальные перегородки
    },
    rows: [firstRow, secondRow],
  });
}
