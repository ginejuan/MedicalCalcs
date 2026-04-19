import jsPDF from 'jspdf';
import { translations } from '../contexts/LanguageContext';

type Language = 'es' | 'en';

const getTranslation = (lang: Language, key: keyof typeof translations.en) => {
  return translations[lang][key] || translations.en[key];
};

const drawPDFBase = (
  doc: jsPDF,
  title: string,
  lang: Language,
  patientRows: [string, string][],
  resultRows: [string, string][],
  percentile: number,
  classificationKey: keyof typeof translations.en
) => {
  const W = 210, margin = 20, cw = W - 2 * margin;
  let y = margin;

  // Title block
  doc.setFillColor(21, 101, 192);
  doc.rect(0, 0, W, 36, 'F');
  doc.setTextColor(255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, W / 2, 16, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(
    new Date().toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    W / 2, 26, { align: 'center' }
  );
  y = 44;

  doc.setTextColor(33);

  // Patient data
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(lang === 'es' ? 'Datos del caso' : 'Case data', margin, y); y += 8;
  doc.setFontSize(10);

  patientRows.forEach(([lbl, val]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(lbl + ':', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(val, margin + 70, y);
    y += 6;
  });
  y += 6;

  // Results Title
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(lang === 'es' ? 'Resultado' : 'Result', margin, y); y += 8;

  // Percentile Box
  const getBoxColors = (key: string) => {
    if (key === 'iugr') return { box: [255, 235, 238], txt: [198, 40, 40] };
    if (key === 'peg') return { box: [255, 243, 224], txt: [230, 81, 0] };
    if (key === 'geg') return { box: [227, 242, 253], txt: [21, 101, 192] };
    return { box: [232, 245, 233], txt: [46, 125, 50] };
  };

  const colors = getBoxColors(classificationKey as string);
  doc.setFillColor(colors.box[0], colors.box[1], colors.box[2]);
  doc.roundedRect(margin, y, cw, 24, 3, 3, 'F');
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.txt[0], colors.txt[1], colors.txt[2]);
  doc.text('P ' + percentile.toFixed(1), W / 2, y + 10, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(getTranslation(lang, classificationKey), W / 2, y + 18, { align: 'center' });
  y += 32;

  doc.setTextColor(33);
  doc.setFontSize(10);

  resultRows.forEach(([lbl, val]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(lbl + ':', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(val, margin + 70, y);
    y += 6;
  });
  y += 6;

  // Chart image
  const canvas = document.getElementById('percentile-chart-canvas') as HTMLCanvasElement;
  if (canvas) {
    const imgData = canvas.toDataURL('image/png', 1.0);
    const imgW = cw;
    const imgH = imgW / 1.6;
    if (y + imgH > 280) { doc.addPage(); y = margin; }
    doc.addImage(imgData, 'PNG', margin, y, imgW, imgH);
    y += imgH + 6;
  }

  // Reference Text
  if (y > 280) { doc.addPage(); y = margin; }
  doc.setFontSize(7);
  doc.setTextColor(100);
  const infoText = getTranslation(lang, 'disc_text');
  doc.text(infoText, margin, y, { maxWidth: cw });
  
  return doc;
};

const getClassKey = (percentile: number): keyof typeof translations.en => {
  if (percentile < 3) return 'iugr';
  if (percentile < 10) return 'peg';
  if (percentile > 90) return 'geg';
  return 'aeg';
};

export const exportFetalWeightPDF = (inputs: any, results: any, lang: Language) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const t = (k: keyof typeof translations.en) => getTranslation(lang, k);

  const sexLabel = inputs.sex === 1 ? t('pdfMale') : t('pdfFemale');
  const parLabel = inputs.parity === 0 ? t('pdfNulli') : t('pdfMulti');
  const gaStr = `${inputs.weeks}+${inputs.days}`;
  const egDecimal = inputs.weeks + inputs.days / 7;

  const patientRows: [string, string][] = [
    [t('pdfGA'), `${gaStr} (${egDecimal.toFixed(2)} ${lang==='es'?'sem.':'wk.'})`],
    [t('pdfEFW'), `${inputs.efw} g`],
    [t('pdfSex'), sexLabel],
    [t('pdfMaternalHeight'), `${inputs.maternalHeight} cm`],
    [t('pdfMaternalWeight'), `${inputs.maternalWeight} kg`],
    [t('pdfParity'), parLabel],
    [t('pdfAge'), `${inputs.maternalAge} ${t('unit_age').toLowerCase()}`],
  ];

  const resultRows: [string, string][] = [
    [t('pdfObsWt'), `${Math.round(inputs.efw)} g`],
    [t('pdfExpWt'), `${Math.round(results.pesoEst)} g`],
    [t('pdfZscore'), `${(results.z >= 0 ? '+' : '')}${results.z.toFixed(3)}`],
  ];

  const finalDoc = drawPDFBase(doc, t('pdfTitle_fw'), lang, patientRows, resultRows, results.percentil, getClassKey(results.percentil));
  finalDoc.save('fetal_weight_customized.pdf');
};

export const exportFetalBmiPDF = (inputs: any, results: any, lang: Language) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const t = (k: keyof typeof translations.en) => getTranslation(lang, k);

  const sexLabel = inputs.sex === 1 ? t('pdfMale') : t('pdfFemale');
  const parLabel = inputs.parity === 0 ? t('pdfNulli') : t('pdfMulti');
  const gaStr = `${inputs.weeks}+${inputs.days}`;
  const egDecimal = inputs.weeks + inputs.days / 7;

  const patientRows: [string, string][] = [
    [t('pdfGA'), `${gaStr} (${egDecimal.toFixed(2)} ${lang==='es'?'sem.':'wk.'})`],
    [t('pdfEFW'), `${inputs.efw} g`],
    [t('pdfSex'), sexLabel],
    [t('pdfMaternalHeight'), `${inputs.maternalHeight} cm`],
    [t('pdfMaternalWeight'), `${inputs.maternalWeight} kg`],
    [t('pdfParity'), parLabel],
    [t('pdfAge'), `${inputs.maternalAge} ${t('unit_age').toLowerCase()}`],
  ];

  const resultRows: [string, string][] = [
    [t('pdfObsBMI'), `${results.imcObs.toFixed(2)} kg/m²`],
    [t('pdfExpBMI'), `${results.imcEst.toFixed(2)} kg/m²`],
    [t('pdfZscore'), `${(results.z >= 0 ? '+' : '')}${results.z.toFixed(3)}`],
  ];

  const finalDoc = drawPDFBase(doc, t('pdfTitle_bmi'), lang, patientRows, resultRows, results.percentil, getClassKey(results.percentil));
  finalDoc.save('fetal_bmi_customized.pdf');
};

export const exportIntergrowth21PDF = (inputs: any, results: any, lang: Language) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const t = (k: keyof typeof translations.en) => getTranslation(lang, k);

  const sexLabel = inputs.sex === 1 ? t('pdfMale') : t('pdfFemale');
  const gaStr = `${inputs.weeks}+${inputs.days}`;
  const egDecimal = inputs.weeks + inputs.days / 7;

  const patientRows: [string, string][] = [
    [t('pdfGA'), `${gaStr} (${egDecimal.toFixed(2)} ${lang==='es'?'sem.':'wk.'})`],
    [t('pdfWeight'), `${inputs.efw} g`],
    [t('pdfSex'), sexLabel],
  ];

  const resultRows: [string, string][] = [
    [t('pdfWeight'), `${inputs.efw} g`],
    [t('pdfP50'), `${Math.round(results.p50)} g`],
    [t('pdfRatio'), `${results.ratio.toFixed(3)}`],
  ];

  const finalDoc = drawPDFBase(doc, t('pdfTitle_ig'), lang, patientRows, resultRows, results.percentil, getClassKey(results.percentil));
  finalDoc.save('intergrowth21.pdf');
};
