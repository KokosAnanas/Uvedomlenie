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
 * Таблица блока «Подписи»
 *  • В первой строке — горизонтальные линии; в 1‑м столбце поверх линии
 *    выводится подпись «Представитель генерального подрядчика».
 *  • У видимых столбцов (1,3,5) — только нижняя граница первой строки.
 *  • Во второй строке показаны подписи‑подписи: (подпись), (расшифровка подписи).
 *    Ячейка 1‑го столбца во второй строке оставлена пустой (по требованию).
 */
export function createSignatureBlockTable2(pr: string): Table {
  const lineBorder = { style: BorderStyle.SINGLE, size: 4, color: "000000" };
  const noBorder = { style: BorderStyle.NONE };

  /* ------------ 1‑я строка: линии для подписей ------------- */
  const firstRow = new TableRow({
    cantSplit: true,
    children: [0, 1, 2, 3, 4].map((idx) => {
      const isVisibleLine = idx === 2 || idx === 4;

      /* Контент ячейки: для idx 0 — надпись, иначе пусто */
      const cellChildren = idx === 0
        ? [
          new Paragraph({
            alignment: AlignmentType.LEFT,
            children: [
              new TextRun({
                text: pr,
                size: 24,
              }),
            ],
          }),
        ]
        : [new Paragraph({})];

      return new TableCell({
        width: {
          size: idx === 0 ? 40 : idx === 2 ? 15 : idx === 4 ? 25 : 5,
          type: WidthType.PERCENTAGE,
        },
        borders: {
          top: noBorder,
          left: noBorder,
          right: noBorder,
          bottom: isVisibleLine ? lineBorder : noBorder,
        },
        children: cellChildren,
      });
    }),
  });

  /* ------------ 2‑я строка: подписи к линиям ------------- */
  const secondRow = new TableRow({
    cantSplit: true,
    children: [
      // 1‑й столбец — пустой (убрали прежний текст)
      new TableCell({
        borders: { top: noBorder, left: noBorder, right: noBorder, bottom: noBorder },
        children: [new Paragraph({})],
      }),
      // 2‑й столбец — узкий разделитель без границ/контента
      new TableCell({
        borders: { top: noBorder, left: noBorder, right: noBorder, bottom: noBorder },
        children: [new Paragraph({})],
      }),
      // 3‑й столбец — «(подпись)»
      new TableCell({
        borders: { top: noBorder, left: noBorder, right: noBorder, bottom: noBorder },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "(подпись)", italics: true, size: 18 })],
          }),
        ],
      }),
      // 4‑й столбец — узкий разделитель без границ
      new TableCell({
        borders: { top: noBorder, left: noBorder, right: noBorder, bottom: noBorder },
        children: [new Paragraph({})],
      }),
      // 5‑й столбец — «(расшифровка подписи)»
      new TableCell({
        borders: { top: noBorder, left: noBorder, right: noBorder, bottom: noBorder },
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

  /* ------------ Таблица целиком ------------- */
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: noBorder,
      left: noBorder,
      right: noBorder,
      bottom: noBorder,
      insideHorizontal: noBorder,
      insideVertical: noBorder,
    },
    rows: [firstRow, secondRow],
  });
}
