import jsPDF from 'jspdf';
import { translations } from '../contexts/LanguageContext';
import { BRCA_CRITERIA } from '../data/calculators/brcaCriteria';
import type { BrcaAnswers, BrcaCriterion, BrcaResult } from '../data/calculators/brcaCriteria';
import { IOTA_FEATURES } from '../data/calculators/iotaRules';
import type { IotaAnswers, IotaFeature, IotaResult } from '../data/calculators/iotaRules';
import type { GdmRiskInput, GdmRiskResult } from '../data/calculators/gdmRisk';
import { getBmiCategory } from '../data/calculators/gdmRisk';

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

export const exportBrcaPDF = (answers: BrcaAnswers, result: BrcaResult, lang: Language) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210, margin = 20, cw = W - 2 * margin;
  let y = margin;

  // Title block
  const titleText = lang === 'es'
    ? 'Indicación de Prueba Genética BRCA'
    : 'BRCA Genetic Testing Indication';
  doc.setFillColor(84, 110, 122);   // #546E7A — consistent with other calc PDFs
  doc.rect(0, 0, W, 36, 'F');
  doc.setTextColor(255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(titleText, W / 2, 14, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(
    new Date().toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    W / 2, 24, { align: 'center' }
  );
  doc.text(
    'González-Santiago S, et al. SEOM HBOC guidelines. Clin Transl Oncol. 2020;22(2):193–200',
    W / 2, 31, { align: 'center' }
  );
  y = 44;

  doc.setTextColor(33);

  // Section header
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(lang === 'es' ? 'Criterios evaluados' : 'Criteria evaluated', margin, y); y += 7;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  const renderGroup = (title: string, items: readonly BrcaCriterion[]) => {
    if (y > 260) { doc.addPage(); y = margin; }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(title, margin, y); y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    items.forEach(c => {
      const label = lang === 'es' ? c.es : c.en;
      const ans = answers[c.id];
      const wrapped = doc.splitTextToSize(label, cw - 8) as string[];
      const needed = wrapped.length * 5 + 1;
      if (y + needed > 278) { doc.addPage(); y = margin; }
      // Draw checkbox square (avoids jsPDF WinAnsi missing-glyph issue)
      const boxSize = 2.8;
      const boxX = margin;
      const boxY = y - 2.6;
      if (ans) {
        doc.setFillColor(198, 40, 40);
        doc.setDrawColor(198, 40, 40);
        doc.rect(boxX, boxY, boxSize, boxSize, 'FD');
      } else {
        doc.setDrawColor(140, 140, 140);
        doc.rect(boxX, boxY, boxSize, boxSize, 'D');
      }
      doc.setTextColor(33);
      doc.text(wrapped, margin + 5, y);
      y += needed;
    });
    y += 3;
  };

  renderGroup(
    lang === 'es' ? 'A. Antecedentes personales oncológicos' : 'A. Personal oncologic history',
    BRCA_CRITERIA.filter(c => c.group === 'personal')
  );
  renderGroup(
    lang === 'es' ? 'B. Antecedentes familiares y ascendencia' : 'B. Family history & ancestry',
    BRCA_CRITERIA.filter(c => c.group === 'family')
  );

  // Result box
  if (y + 32 > 280) { doc.addPage(); y = margin; }
  const indicated = result.indicated;
  const boxColor: [number, number, number] = indicated ? [255, 235, 238] : [232, 245, 233];
  const txtColor: [number, number, number] = indicated ? [198, 40, 40]  : [46, 125, 50];
  const resultLabel = indicated
    ? (lang === 'es' ? 'SE RECOMIENDA PRUEBA GENÉTICA BRCA' : 'BRCA GENETIC TESTING INDICATED')
    : (lang === 'es' ? 'NO SE INDICA PRUEBA GENÉTICA BRCA'  : 'BRCA GENETIC TESTING NOT INDICATED');
  const countText = indicated
    ? (lang === 'es'
        ? `${result.criteriaMet.length} criterio${result.criteriaMet.length === 1 ? '' : 's'} cumplido${result.criteriaMet.length === 1 ? '' : 's'}`
        : `${result.criteriaMet.length} ${result.criteriaMet.length === 1 ? 'criterion' : 'criteria'} met`)
    : (lang === 'es' ? 'Ningún criterio SEOM cumplido' : 'No SEOM criteria met');

  y += 4;
  doc.setFillColor(boxColor[0], boxColor[1], boxColor[2]);
  doc.roundedRect(margin, y, cw, 24, 3, 3, 'F');
  doc.setFontSize(13); doc.setFont('helvetica', 'bold');
  doc.setTextColor(txtColor[0], txtColor[1], txtColor[2]);
  doc.text(resultLabel, W / 2, y + 10, { align: 'center' });
  doc.setFontSize(9); doc.setFont('helvetica', 'normal');
  doc.text(countText, W / 2, y + 18, { align: 'center' });
  y += 32;

  doc.setTextColor(33);

  // Clinical note
  if (y > 260) { doc.addPage(); y = margin; }
  doc.setFontSize(9); doc.setFont('helvetica', 'normal');
  const noteText = indicated
    ? (lang === 'es'
        ? 'Según las guías SEOM HBOC, el paciente cumple al menos un criterio para derivación a estudio genético de BRCA1/BRCA2. La decisión debe individualizarse y siempre estar precedida de consejo genético.'
        : 'According to SEOM HBOC guidelines, this patient meets at least one criterion for BRCA1/BRCA2 genetic testing referral. The decision should always be individualized and preceded by genetic counselling.')
    : (lang === 'es'
        ? 'No se cumplen criterios SEOM HBOC para estudio de BRCA. El juicio clínico y el contexto individual deben prevalecer sobre la regla de cribado.'
        : 'No SEOM HBOC criteria for BRCA testing are met. Clinical judgment and individual context should always prevail over the screening rule.');
  const noteLines = doc.splitTextToSize(noteText, cw) as string[];
  doc.text(noteLines, margin, y);
  y += noteLines.length * 5 + 4;

  // Disclaimer
  if (y > 265) { doc.addPage(); y = margin; }
  doc.setFontSize(7); doc.setTextColor(100);
  const disc = lang === 'es'
    ? 'Esta calculadora está diseñada para uso exclusivo de profesionales sanitarios. La información arrojada debe ser siempre interpretada por un profesional y no sustituye la consulta médica ni ninguna actuación diagnóstica ni terapéutica. Los autores no se hacen responsables del uso inapropiado de la misma.'
    : 'This calculator is designed for exclusive use by healthcare professionals. The information provided must always be interpreted by a professional and should not replace medical consultation or any diagnostic or therapeutic procedure.';
  doc.text(doc.splitTextToSize(disc, cw), margin, y);

  doc.save('brca_testing_indication.pdf');
};

export const exportIotaPDF = (answers: IotaAnswers, result: IotaResult, lang: Language) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210, margin = 20, cw = W - 2 * margin;
  let y = margin;

  // Title block
  const titleText = lang === 'es'
    ? 'Clasificación IOTA Simple Rules (masas anexiales)'
    : 'IOTA Simple Rules (adnexal masses)';
  doc.setFillColor(84, 110, 122);   // #546E7A — consistent with other calc PDFs
  doc.rect(0, 0, W, 36, 'F');
  doc.setTextColor(255);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text(titleText, W / 2, 14, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(
    new Date().toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    W / 2, 24, { align: 'center' }
  );
  doc.text(
    'Timmerman D, Van Calster B, et al. Am J Obstet Gynecol. 2016;214(4):424–437',
    W / 2, 31, { align: 'center' }
  );
  y = 44;

  doc.setTextColor(33);

  // Section header
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(lang === 'es' ? 'Hallazgos ecográficos evaluados' : 'Ultrasound findings evaluated', margin, y); y += 7;

  const renderGroup = (title: string, items: readonly IotaFeature[], markerColor: [number, number, number]) => {
    if (y > 260) { doc.addPage(); y = margin; }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(markerColor[0], markerColor[1], markerColor[2]);
    doc.text(title, margin, y); y += 6;
    doc.setTextColor(33);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    items.forEach(f => {
      const label = `${f.short}. ${lang === 'es' ? f.es : f.en}`;
      const ans = answers[f.id];
      const wrapped = doc.splitTextToSize(label, cw - 8) as string[];
      const needed = wrapped.length * 5 + 1;
      if (y + needed > 278) { doc.addPage(); y = margin; }
      const boxSize = 2.8;
      const boxX = margin;
      const boxY = y - 2.6;
      if (ans) {
        doc.setFillColor(markerColor[0], markerColor[1], markerColor[2]);
        doc.setDrawColor(markerColor[0], markerColor[1], markerColor[2]);
        doc.rect(boxX, boxY, boxSize, boxSize, 'FD');
      } else {
        doc.setDrawColor(140, 140, 140);
        doc.rect(boxX, boxY, boxSize, boxSize, 'D');
      }
      doc.setTextColor(33);
      doc.text(wrapped, margin + 5, y);
      y += needed;
    });
    y += 3;
  };

  renderGroup(
    lang === 'es' ? 'Rasgos B (signos de benignidad)' : 'B-features (benign signs)',
    IOTA_FEATURES.filter(f => f.group === 'benign'),
    [46, 125, 50]
  );
  renderGroup(
    lang === 'es' ? 'Rasgos M (signos de malignidad)' : 'M-features (malignant signs)',
    IOTA_FEATURES.filter(f => f.group === 'malignant'),
    [198, 40, 40]
  );

  // Result box
  if (y + 32 > 280) { doc.addPage(); y = margin; }
  const cls = result.classification;
  const boxColor: [number, number, number] =
    cls === 'benign'       ? [232, 245, 233] :
    cls === 'malignant'    ? [255, 235, 238] :
    cls === 'inconclusive' ? [255, 243, 224] :
                             [235, 235, 235];
  const txtColor: [number, number, number] =
    cls === 'benign'       ? [46, 125, 50]   :
    cls === 'malignant'    ? [198, 40, 40]   :
    cls === 'inconclusive' ? [230, 81, 0]    :
                             [100, 100, 100];
  const resultLabel =
    cls === 'benign'       ? (lang === 'es' ? 'SOSPECHOSO DE BENIGNIDAD' : 'SUSPECTED BENIGN')
    : cls === 'malignant'  ? (lang === 'es' ? 'SOSPECHOSO DE MALIGNIDAD' : 'SUSPECTED MALIGNANT')
    : cls === 'inconclusive' ? (lang === 'es' ? 'INDETERMINADO'           : 'INCONCLUSIVE')
    :                          (lang === 'es' ? 'SIN RASGOS SELECCIONADOS' : 'NO FEATURES SELECTED');
  const countText = lang === 'es'
    ? `${result.benignMet.length} rasgos B · ${result.malignantMet.length} rasgos M`
    : `${result.benignMet.length} B-features · ${result.malignantMet.length} M-features`;

  y += 4;
  doc.setFillColor(boxColor[0], boxColor[1], boxColor[2]);
  doc.roundedRect(margin, y, cw, 24, 3, 3, 'F');
  doc.setFontSize(13); doc.setFont('helvetica', 'bold');
  doc.setTextColor(txtColor[0], txtColor[1], txtColor[2]);
  doc.text(resultLabel, W / 2, y + 10, { align: 'center' });
  doc.setFontSize(9); doc.setFont('helvetica', 'normal');
  doc.text(countText, W / 2, y + 18, { align: 'center' });
  y += 32;

  doc.setTextColor(33);

  // Clinical note
  if (y > 260) { doc.addPage(); y = margin; }
  doc.setFontSize(9); doc.setFont('helvetica', 'normal');
  const noteText =
    cls === 'benign'
      ? (lang === 'es'
          ? 'Solo hay rasgos B presentes. Según las Reglas Simples IOTA, la masa se clasifica como sospechosa de benignidad. El juicio clínico debe siempre prevalecer.'
          : 'Only B-features are present. According to IOTA Simple Rules, this mass is classified as suspected benign. Clinical judgement must always prevail.')
      : cls === 'malignant'
        ? (lang === 'es'
            ? 'Solo hay rasgos M presentes. Según las Reglas Simples IOTA, la masa se clasifica como sospechosa de malignidad. Derivar para valoración oncológica y estadificación.'
            : 'Only M-features are present. According to IOTA Simple Rules, this mass is classified as suspected malignant. Refer for oncologic evaluation and staging.')
        : cls === 'inconclusive'
          ? (lang === 'es'
              ? 'Coexisten rasgos B y M — las Reglas Simples IOTA no permiten clasificar esta masa. Revalorar por ecografista experto o aplicar un modelo más amplio (p. ej. IOTA ADNEX).'
              : 'B and M features coexist — IOTA Simple Rules cannot classify this mass. Re-evaluate by an expert sonographer or apply a more extensive model (e.g. IOTA ADNEX).')
          : (lang === 'es'
              ? 'No se ha marcado ningún rasgo ecográfico.'
              : 'No ultrasound features were selected.');
  const noteLines = doc.splitTextToSize(noteText, cw) as string[];
  doc.text(noteLines, margin, y);
  y += noteLines.length * 5 + 4;

  // Disclaimer
  if (y > 265) { doc.addPage(); y = margin; }
  doc.setFontSize(7); doc.setTextColor(100);
  const disc = lang === 'es'
    ? 'Esta calculadora está diseñada para uso exclusivo de profesionales sanitarios. La información arrojada debe ser siempre interpretada por un profesional y no sustituye la consulta médica ni ninguna actuación diagnóstica ni terapéutica. Los autores no se hacen responsables del uso inapropiado de la misma.'
    : 'This calculator is designed for exclusive use by healthcare professionals. The information provided must always be interpreted by a professional and should not replace medical consultation or any diagnostic or therapeutic procedure.';
  doc.text(doc.splitTextToSize(disc, cw), margin, y);

  doc.save('iota_simple_rules.pdf');
};

export const exportGdmRiskPDF = (inputs: GdmRiskInput, result: GdmRiskResult, lang: Language) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210, margin = 20, cw = W - 2 * margin;
  let y = margin;

  // Title block
  const titleText = lang === 'es'
    ? 'Informe de Riesgo de Diabetes Gestacional (GDM)'
    : 'Gestational Diabetes Mellitus (GDM) Risk Report';
  doc.setFillColor(84, 110, 122);   // #546E7A
  doc.rect(0, 0, W, 36, 'F');
  doc.setTextColor(255);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text(titleText, W / 2, 14, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(
    new Date().toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    W / 2, 23, { align: 'center' }
  );
  doc.text(
    lang === 'es'
      ? 'Modelo predictivo desarrollado sobre la cohorte del Hospital Universitario Puerto Real (2020-2025)'
      : 'Predictive model developed on the Hospital Universitario Puerto Real cohort (2020-2025)',
    W / 2, 29, { align: 'center' }
  );
  y = 44;

  doc.setTextColor(33);

  // Section A — Patient
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(lang === 'es' ? 'A. Características maternas' : 'A. Maternal characteristics', margin, y); y += 8;
  doc.setFontSize(10);

  const bmiCat = getBmiCategory(result.imc);
  const bmiCatLabel = lang === 'es' ? bmiCat.labelEs : bmiCat.labelEn;

  const section_a: [string, string][] = [
    [lang === 'es' ? 'Edad materna' : 'Maternal age', `${inputs.age} ${lang === 'es' ? 'años' : 'years'}`],
    [lang === 'es' ? 'Peso pregestacional' : 'Pregestational weight', `${inputs.weight} kg`],
    [lang === 'es' ? 'Talla' : 'Height', `${inputs.height} cm`],
    ['IMC (Calculado)', `${result.imc.toFixed(1)} kg/m² (${bmiCatLabel})`],
    [lang === 'es' ? 'Antecedente familiar diabetes' : 'Diabetes family history', inputs.familyHistory ? (lang === 'es' ? 'Sí' : 'Yes') : 'No'],
    [lang === 'es' ? 'Paridad' : 'Parity', inputs.multipara ? (lang === 'es' ? 'Multípara (≥1 parto)' : 'Multiparous (≥1 birth)') : (lang === 'es' ? 'Primigesta' : 'Primiparous')],
  ];
  section_a.forEach(([lbl, val]) => {
    doc.setFont('helvetica', 'bold'); doc.text(lbl + ':', margin, y);
    doc.setFont('helvetica', 'normal'); doc.text(val, margin + 80, y); y += 5.5;
  });
  y += 3;

  // Section B — Labs & Screening (only if present)
  const showGlucose = inputs.glucose !== undefined && inputs.glucose !== null && !isNaN(inputs.glucose);
  const showHba1c = inputs.hba1c !== undefined && inputs.hba1c !== null && !isNaN(inputs.hba1c);
  const showPappa = inputs.pappa !== undefined && inputs.pappa !== null && !isNaN(inputs.pappa);
  const showBhcg = inputs.freeBhcg !== undefined && inputs.freeBhcg !== null && !isNaN(inputs.freeBhcg);

  if (showGlucose || showHba1c || showPappa || showBhcg) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(lang === 'es' ? 'B. Laboratorio y cribado 1T' : 'B. 1T Lab & Screening', margin, y); y += 8;
    doc.setFontSize(10);

    const section_b: [string, string][] = [];
    if (showGlucose) section_b.push([lang === 'es' ? 'Glucosa basal' : 'Fasting glucose', `${inputs.glucose} mg/dL`]);
    if (showHba1c) section_b.push(['HbA1c', `${inputs.hba1c}%`]);
    if (showPappa) section_b.push(['PAPP-A', `${inputs.pappa} MoM`]);
    if (showBhcg) section_b.push(['β-hCG libre', `${inputs.freeBhcg} MoM`]);

    section_b.forEach(([lbl, val]) => {
      doc.setFont('helvetica', 'bold'); doc.text(lbl + ':', margin, y);
      doc.setFont('helvetica', 'normal'); doc.text(val, margin + 80, y); y += 5.5;
    });
    y += 3;
  }

  // Section C — Risk Estimation
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(lang === 'es' ? 'C. Estimación del riesgo de diabetes gestacional' : 'C. Gestational diabetes risk estimation', margin, y); y += 6;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80);
  const levelDesc = lang === 'es'
    ? `Modelo activo: Nivel ${result.level} (AUC Total: ${result.auc.total.toFixed(3)}, Precoz: ${result.auc.precoz.toFixed(3)}, Tardía: ${result.auc.tardia.toFixed(3)})`
    : `Active model: Level ${result.level} (AUC Total: ${result.auc.total.toFixed(3)}, Early: ${result.auc.precoz.toFixed(3)}, Late: ${result.auc.tardia.toFixed(3)})`;
  doc.text(levelDesc, margin, y); y += 8;

  doc.setTextColor(33);

  // Side-by-side risk boxes
  const boxW = 52;
  const boxH = 32;
  const gap = 7;

  const getRiskStyles = (p: number): { box: [number, number, number], txt: [number, number, number], lbl: string } => {
    if (p < 5) {
      return { box: [225, 245, 238], txt: [15, 110, 86], lbl: lang === 'es' ? 'RIESGO BAJO' : 'LOW RISK' };
    }
    if (p <= 10) {
      return { box: [250, 238, 218], txt: [133, 79, 11], lbl: lang === 'es' ? 'RIESGO MEDIO' : 'MEDIUM RISK' };
    }
    return { box: [252, 235, 235], txt: [163, 45, 45], lbl: lang === 'es' ? 'RIESGO ALTO' : 'HIGH RISK' };
  };

  const risks = [
    { titleEs: 'Riesgo Total', titleEn: 'Total Risk', val: result.p_total },
    { titleEs: 'DG Precoz', titleEn: 'Early GDM', val: result.p_precoz },
    { titleEs: 'DG Tardía', titleEn: 'Late GDM', val: result.p_tardia }
  ];

  risks.forEach((r, idx) => {
    const x = margin + idx * (boxW + gap);
    const styles = getRiskStyles(r.val);

    doc.setFillColor(...styles.box);
    doc.roundedRect(x, y, boxW, boxH, 3, 3, 'F');

    // Title inside box
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80);
    doc.text(lang === 'es' ? r.titleEs : r.titleEn, x + boxW / 2, y + 6, { align: 'center' });

    // Percentage value
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...styles.txt);
    doc.text(`${r.val.toFixed(1)}%`, x + boxW / 2, y + 17, { align: 'center' });

    // Category Label
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(styles.lbl, x + boxW / 2, y + 26, { align: 'center' });
  });

  y += boxH + 8;
  doc.setTextColor(33);

  // Section D — Recommendations
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(lang === 'es' ? 'D. Recomendación clínica' : 'D. Clinical recommendation', margin, y); y += 7;

  let recText = '';
  if (result.p_precoz > 10) {
    recText = lang === 'es'
      ? 'Riesgo alto de diabetes gestacional precoz. Considerar O\'Sullivan anticipado en el primer trimestre y, si positivo, OGTT confirmatoria precoz. Iniciar intervención sobre estilo de vida sin esperar al cribado convencional.'
      : 'High risk of early gestational diabetes. Consider early O\'Sullivan test in the first trimester and, if positive, early confirmatory OGTT. Initiate lifestyle intervention without waiting for conventional screening.';
  } else if (result.p_precoz > 5 || result.p_total > 10) {
    recText = lang === 'es'
      ? 'Riesgo intermedio. Vigilancia activa y refuerzo de medidas higiénico-dietéticas. Considerar adelantar el cribado de 24-28 semanas si concurren otros factores clínicos.'
      : 'Intermediate risk. Active surveillance and reinforcement of hygienic-dietary measures. Consider advancing the 24-28 week screening if other clinical factors concur.';
  } else {
    recText = lang === 'es'
      ? 'Riesgo bajo. Cribado de O\'Sullivan según protocolo estándar (semanas 24-28). Mantener recomendaciones generales de control del embarazo.'
      : 'Low risk. O\'Sullivan screening according to standard protocol (weeks 24-28). Maintain general pregnancy control recommendations.';
  }

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const recLines = doc.splitTextToSize(recText, cw) as string[];
  doc.text(recLines, margin, y); y += recLines.length * 5 + 8;

  // Bibliography
  if (y > 240) { doc.addPage(); y = margin; }
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(lang === 'es' ? 'Atribución y bibliografía' : 'Attribution & bibliography', margin, y); y += 6;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80);
  
  const biblioText = lang === 'es'
    ? '• Desarrollado y validado en el Hospital Universitario Puerto Real, Cádiz, España (2020-2025).\n• Cohorte de estudio: 3.981 gestaciones caracterizadas prospectivamente (238 casos de DG, prevalencia 6,0%).\n• Diagnóstico por criterios de Carpenter-Coustan. Algoritmo de regresión logística Ridge con validación interna por bootstrap.'
    : '• Developed and validated at Hospital Universitario Puerto Real, Cádiz, Spain (2020-2025).\n• Study cohort: 3,981 prospectively characterized pregnancies (238 GDM cases, prevalence 6.0%).\n• Diagnosis based on Carpenter-Coustan criteria. Ridge logistic regression algorithm with internal bootstrap validation.';
  
  const biblioLines = doc.splitTextToSize(biblioText, cw) as string[];
  doc.text(biblioLines, margin, y); y += biblioLines.length * 4.5 + 8;

  // Disclaimer
  if (y > 270) { doc.addPage(); y = margin; }
  doc.setFontSize(7.5);
  doc.setTextColor(120);
  const discText = lang === 'es'
    ? 'Esta calculadora está diseñada para uso exclusivo de profesionales de la salud. La información proporcionada debe ser interpretada por un profesional y no sustituye la consulta médica ni ninguna prueba diagnóstica o terapéutica. Los autores no se hacen responsables del uso inapropiado.'
    : 'This calculator is designed for exclusive use by healthcare professionals. The information provided must be interpreted by a professional and does not replace medical consultation or any diagnostic or therapeutic procedure. The authors are not responsible for inappropriate use.';
  
  const discLines = doc.splitTextToSize(discText, cw) as string[];
  doc.text(discLines, margin, y);

  doc.save('gdm_risk_report.pdf');
};

