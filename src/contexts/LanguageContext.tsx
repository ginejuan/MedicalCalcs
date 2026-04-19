import React, { createContext, useContext, useState, type ReactNode } from 'react';

type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations.en) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const translations = {
  en: {
    // Shared
    calculatorsTitle: 'Clinical Calculators',
    calculatorsSubtitle: 'Obstetrics and Gynecology',
    fetalWeightCalcDesc: 'Calculates the customized fetal weight percentile adjusting for maternal and fetal characteristics.',
    fetalBmiCalcDesc: 'Calculates the customized fetal BMI percentile adjusting for maternal and fetal characteristics.',
    intergrowthCalcDesc: 'Calculates the fetal weight percentile using international INTERGROWTH-21st standards.',
    
    // Medical Calcs Shared
    h_fetal: 'Fetal data',
    h_maternal: 'Maternal data',
    h_data: 'Neonatal / fetal data',
    lbl_ga: 'Gestational age',
    unit_weeks_28: 'Weeks (28–42)',
    unit_weeks_33: 'Weeks (33–42)',
    unit_days: 'Days (0–6)',
    lbl_efw: 'Estimated fetal weight',
    lbl_weight: 'Weight',
    unit_efw: 'Grams (ultrasound)',
    unit_wt: 'Grams',
    lbl_sex: 'Fetal sex',
    opt_select: 'Select...',
    opt_male: 'Male',
    opt_female: 'Female',
    lbl_height: 'Maternal height',
    lbl_weight_mat: 'Weight at start of pregnancy',
    lbl_parity: 'Parity',
    opt_nulli: 'Nulliparous',
    opt_multi: 'Multiparous',
    lbl_age: 'Maternal age',
    unit_age: 'Years',
    btnCalc: 'Calculate percentile',
    h_chart: 'Percentile curves',
    btnPdfText: 'Export to PDF',
    
    // Classifications
    iugr: 'IUGR — Intrauterine growth restriction',
    peg: 'SGA — Small for gestational age',
    aeg: 'AGA — Appropriate for gestational age',
    geg: 'LGA — Large for gestational age',
    
    // Chart
    xAxis: 'Gestational age (weeks)',
    yAxisWt: 'Fetal weight (g)',
    yAxisBmi: 'Fetal BMI (kg/m²)',
    tooltipWeek: 'Week',
    caseLabel: 'Current case',
    
    // Errors
    errFill: 'Please complete all fields.',
    errGA_28: 'Gestational age must be between 28+0 and 42+6.',
    errGA_33: 'Gestational age must be between 33+0 and 42+6.',
    errEFW: 'Estimated fetal weight must be between 500 and 6000 g.',
    errHeight: 'Maternal height must be between 130 and 200 cm.',
    errWeight: 'Weight must be between 35 and 200 kg.',
    
    // PDF Labels
    pdfGA: 'Gestational age',
    pdfEFW: 'Estimated fetal weight',
    pdfWeight: 'Weight',
    pdfSex: 'Sex',
    pdfMaternalHeight: 'Maternal height',
    pdfMaternalWeight: 'Weight at start of pregnancy',
    pdfParity: 'Parity',
    pdfAge: 'Maternal age',
    pdfPercentile: 'Percentile',
    pdfClassification: 'Classification',
    pdfMale: 'Male', 
    pdfFemale: 'Female',
    pdfNulli: 'Nulliparous', 
    pdfMulti: 'Multiparous',
    
    // Specifics - Fetal Weight
    title_fw: 'Customized Fetal Weight Percentile Calculator',
    subtitle_fw: 'Prenatal nutritional status assessment',
    percentileLabel_fw: 'Customized fetal weight percentile',
    lbl_wt_obs: 'Observed EFW',
    lbl_wt_exp: 'Expected weight',
    pdfTitle_fw: 'Customized Fetal Weight Report',
    pdfObsWt: 'Observed EFW',
    pdfExpWt: 'Expected weight',
    pdfZscore: 'Z-score',
    info_method_fw: 'Methodology: Coefficient of variation (CV) = 12%. Maternal pre-pregnancy weight is corrected for underweight (BMI < 18.5 kg/m²) and obesity (BMI ≥ 30 kg/m²).',
    empty_fw: 'Enter data and calculate to view customized percentile',
    
    // Specifics - Fetal BMI
    title_bmi: 'Customized Fetal BMI Percentile Calculator',
    subtitle_bmi: 'Prenatal nutritional status assessment',
    percentileLabel_bmi: 'Customized fetal BMI percentile',
    lbl_bmi_obs: 'Observed fetal BMI',
    lbl_bmi_exp: 'Expected fetal BMI',
    pdfTitle_bmi: 'Customized Fetal BMI Report',
    pdfObsBMI: 'Observed fetal BMI',
    pdfExpBMI: 'Expected fetal BMI',
    info_method_bmi: 'Methodology: Coefficient of variation (CV) = 9.7%. Maternal pre-pregnancy weight is corrected for underweight (BMI < 18.5 kg/m²) and obesity (BMI ≥ 30 kg/m²).',
    empty_bmi: 'Enter data and calculate to view customized percentile',
    
    // Specifics - Intergrowth 21
    title_ig: 'INTERGROWTH-21st Weight Percentile Calculator',
    subtitle_ig: 'International standards for newborn size',
    percentileLabel_ig: 'INTERGROWTH-21st weight percentile',
    lbl_wt_p50: 'P50 reference',
    lbl_ratio: 'Weight / P50',
    pdfTitle_ig: 'INTERGROWTH-21st Weight Report',
    pdfP50: 'P50 reference',
    pdfRatio: 'Weight / P50',
    info_text_ig: 'Population-based standard. No maternal adjustment. Reference range: 33+0 to 42+6 weeks.',
    empty_ig: 'Enter data and calculate to view INTERGROWTH-21st percentile',
    
    // Disclaimer
    disc_title: 'Terms of use:',
    disc_text: 'This calculator is designed for exclusive use by healthcare professionals. If this is not your case, please do not use it. The information provided must always be interpreted by a professional and should not replace medical consultation or any diagnostic or therapeutic procedure. The authors are not responsible for inappropriate use of this calculator.',
  },
  es: {
    calculatorsTitle: 'Calculadoras Clínicas',
    calculatorsSubtitle: 'Obstetricia y Ginecología',
    fetalWeightCalcDesc: 'Calcula el percentil de peso fetal customizado ajustando según características maternas y fetales.',
    fetalBmiCalcDesc: 'Calcula el percentil de IMC fetal customizado ajustando según características maternas y fetales.',
    intergrowthCalcDesc: 'Calcula el percentil de peso fetal usando los estándares internacionales de INTERGROWTH-21st.',

    h_fetal: 'Datos fetales',
    h_maternal: 'Datos maternos',
    h_data: 'Datos neonatales / fetales',
    lbl_ga: 'Edad gestacional',
    unit_weeks_28: 'Semanas (28–42)',
    unit_weeks_33: 'Semanas (33–42)',
    unit_days: 'Días (0–6)',
    lbl_efw: 'Peso fetal estimado',
    lbl_weight: 'Peso',
    unit_efw: 'Gramos (ecografía)',
    unit_wt: 'Gramos',
    lbl_sex: 'Sexo fetal',
    opt_select: 'Seleccionar...',
    opt_male: 'Varón',
    opt_female: 'Mujer',
    lbl_height: 'Talla materna',
    lbl_weight_mat: 'Peso al inicio de la gestación',
    lbl_parity: 'Paridad',
    opt_nulli: 'Nulípara',
    opt_multi: 'Multípara',
    lbl_age: 'Edad materna',
    unit_age: 'Años',
    btnCalc: 'Calcular percentil',
    h_chart: 'Curvas de percentiles',
    btnPdfText: 'Exportar a PDF',
    
    iugr: 'CIR — Crecimiento intrauterino restringido',
    peg: 'PEG — Pequeño para la edad gestacional',
    aeg: 'AEG — Adecuado para la edad gestacional',
    geg: 'GEG — Grande para la edad gestacional',
    
    xAxis: 'Edad gestacional (semanas)',
    yAxisWt: 'Peso fetal (g)',
    yAxisBmi: 'IMC fetal (kg/m²)',
    tooltipWeek: 'Semana',
    caseLabel: 'Caso actual',
    
    errFill: 'Por favor, complete todos los campos.',
    errGA_28: 'La edad gestacional debe estar entre 28+0 y 42+6.',
    errGA_33: 'La edad gestacional debe estar entre 33+0 y 42+6.',
    errEFW: 'El peso fetal estimado debe estar entre 500 y 6000 g.',
    errHeight: 'La talla materna debe estar entre 130 y 200 cm.',
    errWeight: 'El peso debe estar entre 35 y 200 kg.',
    
    pdfGA: 'Edad gestacional',
    pdfEFW: 'Peso fetal estimado',
    pdfWeight: 'Peso',
    pdfSex: 'Sexo',
    pdfMaternalHeight: 'Talla materna',
    pdfMaternalWeight: 'Peso al inicio de la gestación',
    pdfParity: 'Paridad',
    pdfAge: 'Edad materna',
    pdfPercentile: 'Percentil',
    pdfClassification: 'Clasificación',
    pdfMale: 'Varón', 
    pdfFemale: 'Mujer',
    pdfNulli: 'Nulípara', 
    pdfMulti: 'Multípara',
    
    title_fw: 'Calculadora de Percentil de Peso Fetal Customizado',
    subtitle_fw: 'Evaluación prenatal del estado nutricional',
    percentileLabel_fw: 'Percentil de peso fetal customizado',
    lbl_wt_obs: 'PFE observado',
    lbl_wt_exp: 'Peso esperado',
    pdfTitle_fw: 'Informe de Peso Fetal Customizado',
    pdfObsWt: 'PFE observado',
    pdfExpWt: 'Peso esperado',
    pdfZscore: 'Z-score',
    info_method_fw: 'Metodología: Coeficiente de variación (CV) = 12%. El peso materno pregestacional se corrige por infrapeso (IMC < 18.5 kg/m²) y obesidad (IMC ≥ 30 kg/m²).',
    empty_fw: 'Introduzca los datos y calcule para ver el percentil customizado',
    
    title_bmi: 'Calculadora de Percentil de IMC Fetal Customizado',
    subtitle_bmi: 'Evaluación prenatal del estado nutricional',
    percentileLabel_bmi: 'Percentil de IMC fetal customizado',
    lbl_bmi_obs: 'IMC fetal observado',
    lbl_bmi_exp: 'IMC fetal esperado',
    pdfTitle_bmi: 'Informe de IMC Fetal Customizado',
    pdfObsBMI: 'IMC fetal observado',
    pdfExpBMI: 'IMC fetal esperado',
    info_method_bmi: 'Metodología: Coeficiente de variación (CV) = 9.7%. El peso materno pregestacional se corrige por infrapeso (IMC < 18.5 kg/m²) y obesidad (IMC ≥ 30 kg/m²).',
    empty_bmi: 'Introduzca los datos y calcule para ver el percentil customizado',
    
    title_ig: 'Calculadora de Percentil de Peso INTERGROWTH-21st',
    subtitle_ig: 'Estándares internacionales de tamaño neonatal',
    percentileLabel_ig: 'Percentil de peso INTERGROWTH-21st',
    lbl_wt_p50: 'P50 referencia',
    lbl_ratio: 'Peso / P50',
    pdfTitle_ig: 'Informe de Peso INTERGROWTH-21st',
    pdfP50: 'P50 referencia',
    pdfRatio: 'Peso / P50',
    info_text_ig: 'Estándar poblacional. Sin ajuste materno. Rango de referencia: 33+0 a 42+6 semanas.',
    empty_ig: 'Introduzca los datos y calcule para ver el percentil INTERGROWTH-21st',
    
    disc_title: 'Términos de uso:',
    disc_text: 'Esta calculadora está diseñada para uso exclusivo por profesionales sanitarios. Si no es su caso, rogamos no la utilice. La información arrojada debe ser siempre interpretada por un profesional y no sustituye la consulta médica ni ninguna actuación diagnóstica ni terapéutica. Los autores no se hacen responsables del uso inapropiado de la misma.',
  }
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('es');

  const t = (key: keyof typeof translations.en) => {
    return translations[language][key] || translations.en[key];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
