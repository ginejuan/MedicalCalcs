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

export const exportThyroidRiskPDF = (inputs: {
  age: number;
  sex: 'female' | 'male';
  familyHistory: boolean;
  tsh: number;
  thyroiditis: boolean;
  diameter: number;
  consistency: string;
  echogenicity: string;
  irregularMargins: boolean;
  calcifications: string;
  tallerThanWide: boolean;
  suspiciousNode: boolean;
}, result: { risk: number; ataWarning?: string; cysticMessage?: string; nodeMessage?: string; isCysticBenign: boolean }, lang: Language) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210, margin = 20, cw = W - 2 * margin;
  let y = margin;

  // Title block
  const titleText = lang === 'es' ? 'Informe de Riesgo de Nódulo Tiroideo' : 'Thyroid Nodule Malignancy Risk Report';
  doc.setFillColor(84, 110, 122);   // #546E7A — consistent with other calc buttons
  doc.rect(0, 0, W, 42, 'F');
  doc.setTextColor(255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(titleText, W / 2, 14, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(
    new Date().toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    W / 2, 22, { align: 'center' }
  );
  doc.text('Carral F, Fernández Alba JJ, et al. Endocr Pract. 2020;26(10):1077–1084', W / 2, 30, { align: 'center' });
  doc.text(
    (lang === 'es' ? 'Validación externa: ' : 'External validation: ') +
      'Fernández Alba JJ, Carral F, et al. Diagnostics. 2025;15(6):686',
    W / 2, 37, { align: 'center' }
  );
  y = 50;

  doc.setTextColor(33);

  // Section A — Patient
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(lang === 'es' ? 'A. Características del paciente' : 'A. Patient characteristics', margin, y); y += 8;
  doc.setFontSize(10);

  const section_a: [string, string][] = [
    [lang === 'es' ? 'Edad' : 'Age',                      `${inputs.age} ${lang === 'es' ? 'años' : 'years'}`],
    [lang === 'es' ? 'Sexo' : 'Sex',                      inputs.sex === 'male' ? (lang === 'es' ? 'Hombre' : 'Male') : (lang === 'es' ? 'Mujer' : 'Female')],
    [lang === 'es' ? 'Antec. familiar CDT' : 'Family history',  inputs.familyHistory ? (lang === 'es' ? 'Sí' : 'Yes') : 'No'],
    ['TSH',                                                 `${inputs.tsh.toFixed(1)} mUI/L`],
    [lang === 'es' ? 'Tiroiditis autoinmune' : 'Autoimmune thyroiditis', inputs.thyroiditis ? (lang === 'es' ? 'Sí' : 'Yes') : 'No'],
  ];
  section_a.forEach(([lbl, val]) => {
    doc.setFont('helvetica', 'bold'); doc.text(lbl + ':', margin, y);
    doc.setFont('helvetica', 'normal'); doc.text(val, margin + 80, y); y += 6;
  });
  y += 4;

  // Section B — Nodule
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(lang === 'es' ? 'B. Características ecográficas' : 'B. Ultrasound characteristics', margin, y); y += 8;
  doc.setFontSize(10);

  const consistencyLabel: Record<string, string> = {
    cystic: lang === 'es' ? 'Quístico' : 'Cystic',
    mixed:  lang === 'es' ? 'Mixto/Espongiforme' : 'Mixed/Spongiform',
    solid:  lang === 'es' ? 'Sólido' : 'Solid',
  };
  const echoLabel: Record<string, string> = {
    anechoic: lang === 'es' ? 'Anecoico' : 'Anechoic',
    isoHyper: lang === 'es' ? 'Isoecoico/Hiperecoico' : 'Isoechoic/Hyperechoic',
    hypo:     lang === 'es' ? 'Hipoecoico' : 'Hypoechoic',
  };
  const calcLabel: Record<string, string> = {
    no:    'No',
    macro: lang === 'es' ? 'Macrocalcificaciones' : 'Macrocalcifications',
    micro: lang === 'es' ? 'Microcalcificaciones' : 'Microcalcifications',
  };

  const section_b: [string, string][] = [
    [lang === 'es' ? 'Diámetro máximo' : 'Maximum diameter', `${inputs.diameter} mm`],
    [lang === 'es' ? 'Contenido' : 'Content',               consistencyLabel[inputs.consistency] ?? inputs.consistency],
    [lang === 'es' ? 'Ecogenicidad' : 'Echogenicity',       echoLabel[inputs.echogenicity] ?? inputs.echogenicity],
    [lang === 'es' ? 'Márgenes' : 'Margins',                inputs.irregularMargins ? (lang === 'es' ? 'Irregulares' : 'Irregular') : (lang === 'es' ? 'Regulares' : 'Well-defined')],
    [lang === 'es' ? 'Calcificaciones' : 'Calcifications',  calcLabel[inputs.calcifications] ?? inputs.calcifications],
    [lang === 'es' ? 'Forma' : 'Shape',                     inputs.tallerThanWide ? (lang === 'es' ? 'Más alto que ancho' : 'Taller than wide') : (lang === 'es' ? 'Ovalado' : 'Oval')],
    [lang === 'es' ? 'Ganglio sospechoso' : 'Suspicious node', inputs.suspiciousNode ? (lang === 'es' ? 'Sí' : 'Yes') : 'No'],
  ];
  section_b.forEach(([lbl, val]) => {
    doc.setFont('helvetica', 'bold'); doc.text(lbl + ':', margin, y);
    doc.setFont('helvetica', 'normal'); doc.text(val, margin + 80, y); y += 6;
  });
  y += 6;

  // Result box — 3-zone stratification from Diagnostics 2025 external validation
  // (4.94 = maximum-sensitivity threshold; 9.55 = optimal cut-off)
  const riskPct = result.isCysticBenign ? 0 : result.risk;
  const boxColor: [number, number, number] = riskPct < 4.94 ? [232, 245, 233] : riskPct < 9.55 ? [255, 243, 224] : [255, 235, 238];
  const txtColor: [number, number, number] = riskPct < 4.94 ? [46, 125, 50]  : riskPct < 9.55 ? [230, 81, 0]   : [198, 40, 40];
  const riskLabel = result.isCysticBenign
    ? (lang === 'es' ? 'BENIGNO (QUÍSTICO)' : 'BENIGN (CYSTIC)')
    : riskPct < 4.94 ? (lang === 'es' ? 'RIESGO BAJO'        : 'LOW RISK')
    : riskPct < 9.55 ? (lang === 'es' ? 'RIESGO INTERMEDIO'  : 'INTERMEDIATE RISK')
    :                  (lang === 'es' ? 'RIESGO ALTO'        : 'HIGH RISK');

  doc.setFillColor(...boxColor);
  doc.roundedRect(margin, y, cw, 26, 3, 3, 'F');
  doc.setFontSize(24); doc.setFont('helvetica', 'bold');
  doc.setTextColor(...txtColor);
  doc.text(`${riskPct.toFixed(result.isCysticBenign ? 0 : 1)}%`, W / 2, y + 10, { align: 'center' });
  doc.setFontSize(10); doc.setFont('helvetica', 'normal');
  doc.text(riskLabel, W / 2, y + 20, { align: 'center' });
  y += 34;

  doc.setTextColor(33);

  // Clinical alerts
  const alerts = [result.ataWarning, result.cysticMessage, result.nodeMessage].filter(Boolean) as string[];
  if (alerts.length > 0) {
    doc.setFontSize(11); doc.setFont('helvetica', 'bold');
    doc.setTextColor(200, 80, 0);
    doc.text(lang === 'es' ? 'Alertas clínicas:' : 'Clinical alerts:', margin, y); y += 7;
    doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(33);
    alerts.forEach(a => {
      const lines = doc.splitTextToSize(a, cw) as string[];
      if (y + lines.length * 5 > 280) { doc.addPage(); y = margin; }
      doc.text(lines, margin, y); y += lines.length * 5 + 3;
    });
    y += 4;
  }

  // Model statistics
  if (y > 270) { doc.addPage(); y = margin; }
  doc.setFontSize(9); doc.setTextColor(80);
  const statsText = lang === 'es'
    ? 'Validación externa (n = 455 pacientes): AUC = 0,84 (IC 95%: 0,80–0,89). Sensibilidad 71,4% · Especificidad 82,4% al punto de corte óptimo de 9,55%.'
    : 'External validation (n = 455 patients): AUC = 0.84 (95% CI: 0.80–0.89). Sensitivity 71.4% · Specificity 82.4% at the optimal cut-off of 9.55%.';
  doc.text(doc.splitTextToSize(statsText, cw), margin, y); y += 12;

  // Disclaimer
  if (y > 265) { doc.addPage(); y = margin; }
  doc.setFontSize(7); doc.setTextColor(100);
  const disc = lang === 'es'
    ? 'Esta calculadora está diseñada para uso exclusivo de profesionales sanitarios. La información arrojada debe ser siempre interpretada por un profesional y no sustituye la consulta médica ni ninguna actuación diagnóstica ni terapéutica. Los autores no se hacen responsables del uso inapropiado de la misma.'
    : 'This calculator is designed for exclusive use by healthcare professionals. The information provided must always be interpreted by a professional and should not replace medical consultation or any diagnostic or therapeutic procedure.';
  doc.text(doc.splitTextToSize(disc, cw), margin, y);

  doc.save('thyroid_nodule_risk.pdf');
};

