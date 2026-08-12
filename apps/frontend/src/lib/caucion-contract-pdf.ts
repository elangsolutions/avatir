import { jsPDF } from 'jspdf';
import {
  CaucionSimulationResult,
  formatMoney,
  formatRate,
} from './caucion';

export type CaucionContractInput = {
  clientName: string;
  beneficiary: string;
  riskTypeLabel: string;
  notes?: string;
  simulation: CaucionSimulationResult;
  locale: string;
  labels: {
    title: string;
    subtitle: string;
    partiesHeading: string;
    obligor: string;
    beneficiary: string;
    insurer: string;
    insurerValue: string;
    coverageHeading: string;
    product: string;
    productValue: string;
    bondType: string;
    coverageAmount: string;
    premium: string;
    rate: string;
    term: string;
    termValue: (months: number) => string;
    objectHeading: string;
    objectBody: string;
    clausesHeading: string;
    clauses: string[];
    signaturesHeading: string;
    signatureObligor: string;
    signatureBeneficiary: string;
    signatureInsurer: string;
    disclaimer: string;
    generatedOn: (date: string) => string;
    filename: string;
  };
};

function wrapText(doc: jsPDF, text: string, maxWidth: number) {
  return doc.splitTextToSize(text, maxWidth) as string[];
}

export function downloadCaucionContractPdf(input: CaucionContractInput) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  const ensureSpace = (needed: number) => {
    const pageHeight = doc.internal.pageSize.getHeight();
    if (y + needed > pageHeight - 18) {
      doc.addPage();
      y = 20;
    }
  };

  const writeLines = (lines: string[], lineHeight = 5.5) => {
    for (const line of lines) {
      ensureSpace(lineHeight);
      doc.text(line, margin, y);
      y += lineHeight;
    }
  };

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(input.labels.title, margin, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  writeLines(wrapText(doc, input.labels.subtitle, contentWidth), 5);
  y += 3;

  const issuedAt = new Date().toLocaleDateString(input.locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.setFontSize(9);
  doc.setTextColor(90);
  writeLines(wrapText(doc, input.labels.generatedOn(issuedAt), contentWidth), 4.5);
  doc.setTextColor(0);
  y += 4;

  doc.setDrawColor(180);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(input.labels.partiesHeading, margin, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  writeLines([
    `${input.labels.obligor}: ${input.clientName}`,
    `${input.labels.beneficiary}: ${input.beneficiary}`,
    `${input.labels.insurer}: ${input.labels.insurerValue}`,
  ]);
  y += 4;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(input.labels.coverageHeading, margin, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  writeLines([
    `${input.labels.product}: ${input.labels.productValue}`,
    `${input.labels.bondType}: ${input.riskTypeLabel}`,
    `${input.labels.coverageAmount}: ${formatMoney(input.simulation.coverageAmount, input.simulation.currency, input.locale)}`,
    `${input.labels.premium}: ${formatMoney(input.simulation.premium, input.simulation.currency, input.locale)}`,
    `${input.labels.rate}: ${formatRate(input.simulation.annualRate, input.locale)}`,
    `${input.labels.term}: ${input.labels.termValue(input.simulation.termMonths)}`,
  ]);
  y += 4;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(input.labels.objectHeading, margin, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const objectText = input.notes?.trim()
    ? `${input.labels.objectBody}\n\n${input.notes.trim()}`
    : input.labels.objectBody;
  writeLines(wrapText(doc, objectText, contentWidth), 5);
  y += 4;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(input.labels.clausesHeading, margin, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  input.labels.clauses.forEach((clause, index) => {
    writeLines(wrapText(doc, `${index + 1}. ${clause}`, contentWidth), 5);
    y += 1.5;
  });
  y += 6;

  ensureSpace(42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(input.labels.signaturesHeading, margin, y);
  y += 14;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const signatureWidth = (contentWidth - 10) / 3;
  const signatures = [
    input.labels.signatureObligor,
    input.labels.signatureBeneficiary,
    input.labels.signatureInsurer,
  ];

  signatures.forEach((label, index) => {
    const x = margin + index * (signatureWidth + 5);
    doc.line(x, y, x + signatureWidth, y);
    doc.text(label, x, y + 5);
  });
  y += 18;

  ensureSpace(16);
  doc.setFontSize(8);
  doc.setTextColor(100);
  writeLines(wrapText(doc, input.labels.disclaimer, contentWidth), 4);

  const safeClient = input.clientName
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
  const filename = `${input.labels.filename}-${safeClient || 'caucion'}.pdf`;
  doc.save(filename);
}
