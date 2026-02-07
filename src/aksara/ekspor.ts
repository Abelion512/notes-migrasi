import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';
// import { saveAs } from 'file-saver'; // I need to install file-saver or use native blob
import { Catatan } from './jenis';

export async function eksporKePDF(catatan: Catatan[]) {
  const doc = new jsPDF();
  catatan.forEach((c, index) => {
    if (index > 0) doc.addPage();
    doc.setFontSize(20);
    doc.text(c.judul || 'Tanpa Judul', 10, 20);
    doc.setFontSize(12);
    doc.text(c.konten || '', 10, 30);
  });
  doc.save('abelion-notes.pdf');
}

export async function eksporKeDocx(catatan: Catatan[]) {
  const children = catatan.flatMap(c => [
    new Paragraph({
      children: [
        new TextRun({
          text: c.judul || 'Tanpa Judul',
          bold: true,
          size: 32,
        }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun(c.konten || ''),
      ],
    }),
    new Paragraph({ text: '' }), // Spacer
  ]);

  const doc = new Document({
    sections: [{
      properties: {},
      children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'abelion-notes.docx';
  link.click();
}
