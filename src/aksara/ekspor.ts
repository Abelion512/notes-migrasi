import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import JSZip from 'jszip';
import { Catatan } from './jenis';

export async function eksporKePDF(catatan: Catatan[]) {
  const doc = new jsPDF();
  catatan.forEach((c, index) => {
    if (index > 0) doc.addPage();
    doc.setFontSize(20);
    doc.text(c.judul || 'Tanpa Judul', 10, 20);
    doc.setFontSize(12);
    const splitText = doc.splitTextToSize(c.konten?.replace(/<[^>]*>/g, '') || '', 180);
    doc.text(splitText, 10, 30);
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
        new TextRun(c.konten?.replace(/<[^>]*>/g, '') || ''),
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

export function eksporKeJSON(catatan: Catatan[]) {
  const blob = new Blob([JSON.stringify(catatan, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'abelion-notes.json';
  a.click();
}

export async function eksporKeMarkdown(catatan: Catatan[], gabung = false) {
  if (gabung) {
    const fullMd = catatan.map(c => `# ${c.judul}\n\n${c.konten?.replace(/<[^>]*>/g, '')}`).join('\n\n---\n\n');
    const blob = new Blob([fullMd], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'abelion-notes.md';
    a.click();
  } else {
    const zip = new JSZip();
    catatan.forEach(c => {
      zip.file(`${c.judul || 'Tanpa Judul'}.md`, `# ${c.judul}\n\n${c.konten?.replace(/<[^>]*>/g, '')}`);
    });
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'abelion-notes-md.zip';
    a.click();
  }
}

export async function eksporKeTXT(catatan: Catatan[], gabung = false) {
    if (gabung) {
      const fullTxt = catatan.map(c => `${c.judul}\n\n${c.konten?.replace(/<[^>]*>/g, '')}`).join('\n\n' + '='.repeat(20) + '\n\n');
      const blob = new Blob([fullTxt], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'abelion-notes.txt';
      a.click();
    } else {
      const zip = new JSZip();
      catatan.forEach(c => {
        zip.file(`${c.judul || 'Tanpa Judul'}.txt`, `${c.judul}\n\n${c.konten?.replace(/<[^>]*>/g, '')}`);
      });
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'abelion-notes-txt.zip';
      a.click();
    }
  }
