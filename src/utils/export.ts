// src/utils/export.ts
import { jsPDF } from "jspdf";
import { Document, Paragraph, Packer, TextRun, HeadingLevel } from "docx";
import type { TranscriptItem } from "../types/api";

// 将 TranscriptItem 转换为可读的文本格式
function formatTranscriptText(transcript: TranscriptItem[]): string {
    return transcript.map((item) => {
        const speaker = item.speaker === 'A' ? '面试官(A)' : '候选人(B)';
        return `${speaker}: ${item.text}`;
    }).join('\n\n');
}

// 将 TranscriptItem 转换为 Markdown 格式
function formatTranscriptMarkdown(transcript: TranscriptItem[]): string {
    let md = '# 面试转录记录\n\n';
    md += `> 生成时间: ${new Date().toLocaleString()}\n\n`;
    md += '---\n\n';
    
    transcript.forEach((item, index) => {
        const speaker = item.speaker === 'A' ? '面试官(A)' : '候选人(B)';
        md += `### 对话 ${index + 1}\n\n`;
        md += `**${speaker}**\n\n`;
        md += `${item.text}\n\n`;
    });
    
    return md;
}

// 导出为 Markdown 文件
export function exportToMarkdown(transcript: TranscriptItem[]): void {
    const markdown = formatTranscriptMarkdown(transcript);
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `面试转录_${new Date().toLocaleDateString()}.md`;
    link.click();
    
    URL.revokeObjectURL(url);
}

// 导出为 PDF 文件
export function exportToPDF(transcript: TranscriptItem[]): void {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const lineHeight = 7;
    let y = margin;
    
    // 标题
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('面试转录记录', margin, y);
    y += 10;
    
    // 时间
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`生成时间: ${new Date().toLocaleString()}`, margin, y);
    y += 10;
    
    // 分隔线
    doc.setDrawColor(200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;
    
    // 转录内容
    transcript.forEach((item, index) => {
        const speaker = item.speaker === 'A' ? '面试官(A)' : '候选人(B)';
        
        // 检查是否需要换页
        if (y + lineHeight * 3 > pageHeight - margin) {
            doc.addPage();
            y = margin;
        }
        
        // 说话人
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(speaker, margin, y);
        y += lineHeight;
        
        // 对话内容（需要自动换行）
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const textLines = doc.splitTextToSize(item.text, pageWidth - margin * 2);
        
        textLines.forEach((line: string) => {
            if (y + lineHeight > pageHeight - margin) {
                doc.addPage();
                y = margin;
            }
            doc.text(line, margin, y);
            y += lineHeight;
        });
        
        y += lineHeight; // 对话间增加间距
    });
    
    doc.save(`面试转录_${new Date().toLocaleDateString()}.pdf`);
}

// 导出为 Word 文件
export async function exportToWord(transcript: TranscriptItem[]): Promise<void> {
    const doc = new Document({
        sections: [
            {
                properties: {},
                children: [
                    // 标题
                    new Paragraph({
                        heading: HeadingLevel.HEADING_1,
                        children: [
                            new TextRun({
                                text: '面试转录记录',
                                bold: true,
                                size: 32,
                            }),
                        ],
                        spacing: { after: 200 },
                    }),
                    
                    // 时间
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `生成时间: ${new Date().toLocaleString()}`,
                                size: 20,
                                color: '666666',
                            }),
                        ],
                        spacing: { after: 400 },
                    }),
                    
                    // 分隔线
                    new Paragraph({
                        border: {
                            bottom: {
                                color: 'CCCCCC',
                                space: 1,
                                style: 'single',
                                size: 6,
                            },
                        },
                        spacing: { after: 400 },
                    }),
                    
                    // 转录内容
                    ...transcript.map((item, index) => {
                        const speaker = item.speaker === 'A' ? '面试官(A)' : '候选人(B)';
                        
                        return [
                            // 对话标题
                            new Paragraph({
                                heading: HeadingLevel.HEADING_3,
                                children: [
                                    new TextRun({
                                        text: `对话 ${index + 1}`,
                                        bold: true,
                                    }),
                                ],
                                spacing: { before: 300, after: 200 },
                            }),
                            
                            // 说话人
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: speaker,
                                        bold: true,
                                        color: '0066CC',
                                        size: 24,
                                    }),
                                ],
                                spacing: { after: 100 },
                            }),
                            
                            // 对话内容
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: item.text,
                                        size: 22,
                                    }),
                                ],
                                spacing: { after: 300 },
                            }),
                        ];
                    }).flat(),
                ],
            },
        ],
    });
    
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `面试转录_${new Date().toLocaleDateString()}.docx`;
    link.click();
    
    URL.revokeObjectURL(url);
}