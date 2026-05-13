import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Document, Paragraph, Packer, TextRun, HeadingLevel } from 'docx';

function fileBaseName(): string {
  return `简历AI优化建议_${new Date().toLocaleDateString()}`;
}

export function exportResumeAnalysisToMarkdown(analysisText: string): void {
  let md = '# 简历 AI 优化建议\n\n';
  md += `> 导出时间: ${new Date().toLocaleString()}\n\n`;
  md += '---\n\n';
  md += analysisText.trim();

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileBaseName()}.md`;
  link.click();
  URL.revokeObjectURL(url);
}

export async function exportResumeAnalysisToPdf(element: HTMLElement): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#f8fafc',
    width: element.scrollWidth,
    height: element.scrollHeight,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const imgWidth = pageWidth - margin * 2;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let y = margin;

  pdf.addImage(imgData, 'PNG', margin, y, imgWidth, imgHeight);
  heightLeft -= pageHeight - margin * 2;

  while (heightLeft > 0) {
    y = -(imgHeight - heightLeft - margin);
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', margin, y, imgWidth, imgHeight);
    heightLeft -= pageHeight - margin * 2;
  }

  pdf.save(`${fileBaseName()}.pdf`);
}

export async function exportResumeAnalysisToWord(analysisText: string): Promise<void> {
  const lines = analysisText.trim().split('\n');

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            children: [
              new TextRun({
                text: '简历 AI 优化建议',
                bold: true,
                size: 32,
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `导出时间: ${new Date().toLocaleString()}`,
                size: 20,
                color: '666666',
              }),
            ],
            spacing: { after: 400 },
          }),
          ...lines.map(
            (line) =>
              new Paragraph({
                children: [new TextRun({ text: line.length ? line : ' ', size: 22 })],
                spacing: { after: 120 },
              }),
          ),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileBaseName()}.docx`;
  link.click();
  URL.revokeObjectURL(url);
}
