# GDM Risk Calculator — Technical Specification

Documento técnico para la implementación de la calculadora de riesgo de diabetes gestacional. Generado a partir de los modelos de regresión logística entrenados sobre la cohorte del HUPM 2020-2025 (n=3.981 episodios de embarazo, 238 GDM, prevalencia 6,0%).

Este documento es la referencia única para reimplementar la calculadora en cualquier entorno (Claude Code/Antigravity, Shiny, Streamlit, app móvil, etc.).

---

## 1. Variables de entrada

### 1.1. Datos clínicos básicos (Nivel A — obligatorios)

**Inputs solicitados al clínico** (cuatro campos para introducir manualmente):

| Variable mostrada al usuario | Unidad | Tipo | Rango válido |
|---|---|---|---|
| Edad materna | años | numérico | 14–55 |
| Peso pregestacional | kg | numérico | 30–200 |
| Talla | cm | numérico | 130–210 |
| Antecedente familiar de diabetes | sí/no | binario | 0/1 |
| Paridad | primigesta / multípara | binario | 0/1 (0=primigesta, 1=multípara con ≥1 parto previo) |

**Variable derivada que utiliza el modelo internamente**:

| Variable interna del modelo | Cálculo | Unidad | Rango plausible |
|---|---|---|---|
| `IMC` | `peso (kg) / (talla (cm) / 100)²` | kg/m² | 15–60 (mostrar advertencia fuera de rango) |

**Variables binarias del modelo** (nombres internos):

| Nombre interno | Codificación |
|---|---|
| `edad` | años (numérico) |
| `IMC` | kg/m² (numérico, calculado) |
| `ant_fam_diabetes` | 0=no, 1=sí |
| `multipara` | 0=primigesta, 1=multípara |

**Diseño UX recomendado**: el IMC calculado debe mostrarse en tiempo real bajo los campos de peso y talla, con su categoría OMS (bajo peso / normopeso / sobrepeso / obesidad I/II/III) en color para feedback visual al clínico:

| Rango IMC | Categoría | Color sugerido |
|---|---|---|
| < 18,5 | Bajo peso | Amarillo (#854F0B) |
| 18,5 – 24,9 | Normopeso | Verde (#0F6E56) |
| 25,0 – 29,9 | Sobrepeso | Amarillo (#854F0B) |
| 30,0 – 34,9 | Obesidad I | Rojo (#A32D2D) |
| 35,0 – 39,9 | Obesidad II | Rojo (#A32D2D) |
| ≥ 40,0 | Obesidad III | Rojo (#A32D2D) |

### 1.2. Analítica de primer trimestre (Nivel B — opcional)

| Variable | Nombre interno | Unidad | Tipo | Rango válido |
|---|---|---|---|---|
| Glucosa basal | `glucosa_basal_1t` | mg/dL | numérico | 40–200 |
| HbA1c | `hba1c_1t` | % | numérico | 3,0–10,0 |

### 1.3. Cribado combinado de 1T (Nivel C — opcional)

| Variable | Nombre interno | Unidad | Tipo | Rango válido |
|---|---|---|---|---|
| PAPP-A | `papp_a_mom_1t` | MoM | numérico | 0,1–5,0 |
| β-hCG libre | `bhcg_libre_mom_1t` | MoM | numérico | 0,1–5,0 |

---

## 2. Lógica de selección del modelo

```
si (PAPP-A y β-hCG disponibles) y (glucosa y HbA1c disponibles):
    usar modelos C_total, C_precoz, C_tardia
sino si (glucosa y HbA1c disponibles):
    usar modelos B_total, B_precoz, B_tardia
sino:
    usar modelos A_total, A_precoz, A_tardia
```

El modelo C requiere los 8 valores. Si falta alguno del nivel B (glucosa o HbA1c), baja a nivel A.

---

## 3. Coeficientes de los modelos (en unidades originales, sin estandarizar)

Fórmula general:

```
logit(p) = intercept + Σ (coef_i × x_i)
p = 1 / (1 + exp(-logit(p)))
```

### 3.1. Modelo A (Nivel clínico básico)

| Variable | A_total | A_precoz | A_tardia |
|---|---|---|---|
| **(intercept)** | -7,3336 | -10,3436 | -6,9871 |
| edad | +0,0751 | +0,0809 | +0,0728 |
| IMC | +0,0690 | +0,1117 | +0,0508 |
| ant_fam_diabetes | +0,6610 | +1,0900 | +0,5058 |
| multipara | +0,0610 | -0,1035 | +0,1045 |

AUC (validación interna): total 0,687 | precoz 0,815 | tardío 0,649

### 3.2. Modelo B (Nivel clínico + glucosa + HbA1c)

| Variable | B_total | B_precoz | B_tardia |
|---|---|---|---|
| **(intercept)** | -10,7932 | -15,9516 | -9,5581 |
| edad | +0,0675 | +0,0690 | +0,0672 |
| IMC | +0,0575 | +0,0917 | +0,0435 |
| ant_fam_diabetes | +0,5898 | +0,9329 | +0,4664 |
| multipara | +0,0492 | -0,0769 | +0,0970 |
| glucosa_basal_1t | +0,0132 | +0,0232 | +0,0081 |
| hba1c_1t | +0,5829 | +0,9053 | +0,4548 |

AUC: total 0,697 | precoz 0,822 | tardío 0,660

### 3.3. Modelo C (Nivel completo)

| Variable | C_total | C_precoz | C_tardia |
|---|---|---|---|
| **(intercept)** | -10,4462 | -15,7706 | -9,1469 |
| edad | +0,0689 | +0,0714 | +0,0686 |
| IMC | +0,0573 | +0,0931 | +0,0428 |
| ant_fam_diabetes | +0,5903 | +0,9389 | +0,4678 |
| multipara | +0,0397 | -0,0675 | +0,0827 |
| glucosa_basal_1t | +0,0129 | +0,0226 | +0,0078 |
| hba1c_1t | +0,5568 | +0,8983 | +0,4237 |
| papp_a_mom_1t | -0,1753 | -0,0338 | -0,2251 |
| bhcg_libre_mom_1t | -0,0199 | -0,1451 | +0,0031 |

AUC: total 0,699 | precoz 0,819 | tardío 0,664

---

## 4. Ejemplo de cálculo paso a paso

**Perfil**: Mujer de 35 años, peso 76 kg, talla 165 cm, sin antecedente familiar de diabetes, multípara, glucosa basal 85 mg/dL, HbA1c 5,4%, PAPP-A 0,9 MoM, β-hCG 1,0 MoM.

**Paso 0 — cálculo del IMC**:

```
IMC = 76 / (1,65)² = 76 / 2,7225 = 27,9 kg/m²  (sobrepeso)
```

**Modelo activo**: C (todos los valores disponibles).

**Cálculo de p(DG total) con C_total**:

```
logit = -10,4462
      + 0,0689 × 35       (edad)        = +2,4115
      + 0,0573 × 27,9     (IMC)         = +1,5987
      + 0,5903 × 0        (ant fam)     =  0,0000
      + 0,0397 × 1        (multipara)   = +0,0397
      + 0,0129 × 85       (glucosa)     = +1,0965
      + 0,5568 × 5,4      (HbA1c)       = +3,0067
      + (-0,1753) × 0,9   (PAPP-A)      = -0,1578
      + (-0,0199) × 1,0   (β-hCG)       = -0,0199
      -------------------
      logit total                       = -2,4708

p = 1 / (1 + exp(2,4708)) = 1 / (1 + 11,83) = 0,0779 ≈ 7,8%
```

Verificación: este es el resultado que produce la calculadora.

---

## 5. Umbrales clínicos sugeridos

Para cualquiera de los tres outputs (total, precoz, tardía):

| Categoría | Probabilidad | Color UI | Acción sugerida |
|---|---|---|---|
| **Bajo** | <5% | Verde (#0F6E56 / fondo #E1F5EE) | Cribado estándar (O'Sullivan 24-28 sem) |
| **Intermedio** | 5–10% | Amarillo (#854F0B / fondo #FAEEDA) | Vigilancia activa, medidas higiénico-dietéticas reforzadas |
| **Alto** | >10% | Rojo (#A32D2D / fondo #FCEBEB) | Considerar O'Sullivan anticipado en 1T |

**Recomendaciones integradas** (mostrar mensaje en cuadro destacado):

- Si `p_precoz` es alto: "Riesgo alto de DG precoz. Considerar O'Sullivan anticipado en el primer trimestre y, si positivo, OGTT confirmatoria precoz. Iniciar intervención sobre estilo de vida sin esperar al cribado convencional."
- Si `p_precoz` es intermedio o `p_total` es alto: "Riesgo intermedio. Vigilancia activa y refuerzo de medidas higiénico-dietéticas. Considerar adelantar el cribado de 24-28 semanas si concurren otros factores clínicos."
- En otro caso: "Riesgo bajo. Cribado de O'Sullivan según protocolo estándar (semanas 24-28). Mantener recomendaciones generales de control del embarazo."

---

## 6. Coeficientes en JSON (copy-paste ready)

```json
{
  "A_total":  {"intercept": -7.3336,  "coefs": {"edad": 0.0751, "IMC": 0.0690, "ant_fam_diabetes": 0.6610, "multipara":  0.0610}},
  "A_precoz": {"intercept": -10.3436, "coefs": {"edad": 0.0809, "IMC": 0.1117, "ant_fam_diabetes": 1.0900, "multipara": -0.1035}},
  "A_tardia": {"intercept": -6.9871,  "coefs": {"edad": 0.0728, "IMC": 0.0508, "ant_fam_diabetes": 0.5058, "multipara":  0.1045}},
  "B_total":  {"intercept": -10.7932, "coefs": {"edad": 0.0675, "IMC": 0.0575, "ant_fam_diabetes": 0.5898, "multipara":  0.0492, "glucosa_basal_1t": 0.0132, "hba1c_1t": 0.5829}},
  "B_precoz": {"intercept": -15.9516, "coefs": {"edad": 0.0690, "IMC": 0.0917, "ant_fam_diabetes": 0.9329, "multipara": -0.0769, "glucosa_basal_1t": 0.0232, "hba1c_1t": 0.9053}},
  "B_tardia": {"intercept": -9.5581,  "coefs": {"edad": 0.0672, "IMC": 0.0435, "ant_fam_diabetes": 0.4664, "multipara":  0.0970, "glucosa_basal_1t": 0.0081, "hba1c_1t": 0.4548}},
  "C_total":  {"intercept": -10.4462, "coefs": {"edad": 0.0689, "IMC": 0.0573, "ant_fam_diabetes": 0.5903, "multipara":  0.0397, "glucosa_basal_1t": 0.0129, "hba1c_1t": 0.5568, "papp_a_mom_1t": -0.1753, "bhcg_libre_mom_1t": -0.0199}},
  "C_precoz": {"intercept": -15.7706, "coefs": {"edad": 0.0714, "IMC": 0.0931, "ant_fam_diabetes": 0.9389, "multipara": -0.0675, "glucosa_basal_1t": 0.0226, "hba1c_1t": 0.8983, "papp_a_mom_1t": -0.0338, "bhcg_libre_mom_1t": -0.1451}},
  "C_tardia": {"intercept": -9.1469,  "coefs": {"edad": 0.0686, "IMC": 0.0428, "ant_fam_diabetes": 0.4678, "multipara":  0.0827, "glucosa_basal_1t": 0.0078, "hba1c_1t": 0.4237, "papp_a_mom_1t": -0.2251, "bhcg_libre_mom_1t":  0.0031}}
}
```

---

## 7. Función de predicción (Python)

```python
import math

def predict_gdm_risk(inputs, models):
    """
    inputs: dict con claves:
        - obligatorias: edad (años), peso (kg), talla (cm),
          ant_fam_diabetes (0/1), multipara (0/1)
        - opcionales: glucosa_basal_1t (mg/dL), hba1c_1t (%),
          papp_a_mom_1t (MoM), bhcg_libre_mom_1t (MoM)
    models: dict de coeficientes cargado del JSON.

    Devuelve: dict con {'nivel': 'A'|'B'|'C', 'imc': float,
                        'p_total': float, 'p_precoz': float, 'p_tardia': float}
    """
    # Cálculo interno del IMC
    inputs = dict(inputs)
    inputs['IMC'] = inputs['peso'] / ((inputs['talla'] / 100.0) ** 2)
    # Selección del nivel
    has_B = (inputs.get('glucosa_basal_1t') is not None
             and inputs.get('hba1c_1t') is not None)
    has_C = (has_B
             and inputs.get('papp_a_mom_1t') is not None
             and inputs.get('bhcg_libre_mom_1t') is not None)
    nivel = 'C' if has_C else ('B' if has_B else 'A')

    def logit_to_p(model):
        z = model['intercept']
        for var, coef in model['coefs'].items():
            z += coef * inputs[var]
        return 1.0 / (1.0 + math.exp(-z))

    return {
        'nivel': nivel,
        'imc': inputs['IMC'],
        'p_total':  logit_to_p(models[f'{nivel}_total']),
        'p_precoz': logit_to_p(models[f'{nivel}_precoz']),
        'p_tardia': logit_to_p(models[f'{nivel}_tardia']),
    }
```

---

## 8. Función de predicción (JavaScript)

```javascript
function predictGdmRisk(inputs, models) {
  // Inputs esperados:
  //   obligatorios: edad (años), peso (kg), talla (cm),
  //                 ant_fam_diabetes (0/1), multipara (0/1)
  //   opcionales:   glucosa_basal_1t (mg/dL), hba1c_1t (%),
  //                 papp_a_mom_1t (MoM), bhcg_libre_mom_1t (MoM)

  // Cálculo interno del IMC
  inputs = Object.assign({}, inputs);
  inputs.IMC = inputs.peso / Math.pow(inputs.talla / 100, 2);

  const hasB = inputs.glucosa_basal_1t != null && inputs.hba1c_1t != null;
  const hasC = hasB && inputs.papp_a_mom_1t != null && inputs.bhcg_libre_mom_1t != null;
  const nivel = hasC ? 'C' : (hasB ? 'B' : 'A');

  function logitToP(model) {
    let z = model.intercept;
    for (const [v, c] of Object.entries(model.coefs)) {
      z += c * inputs[v];
    }
    return 1 / (1 + Math.exp(-z));
  }

  return {
    nivel,
    imc: inputs.IMC,
    p_total:  logitToP(models[nivel + '_total']),
    p_precoz: logitToP(models[nivel + '_precoz']),
    p_tardia: logitToP(models[nivel + '_tardia']),
  };
}
```

---

## 9. Diseño de la interfaz de usuario

### 9.1. Estructura recomendada

1. **Cabecera**: título corto y descripción de una línea ("Modelo desarrollado en cohorte HUPM 2020-2025").

2. **Sección 1 (siempre visible)**: "Datos clínicos básicos (obligatorios)" — los 4 inputs del nivel A.

3. **Sección 2 (siempre visible, pero opcional)**: "Analítica de primer trimestre" — glucosa basal y HbA1c. Marcar como "opcional" claramente.

4. **Sección 3 (siempre visible, pero opcional)**: "Cribado combinado de primer trimestre" — PAPP-A y β-hCG en MoM. Mismo tratamiento.

5. **Botones**: "Calcular riesgo" (acción principal) y "Reset" (limpiar formulario).

6. **Panel de resultados** (oculto hasta primer cálculo):
   - Indicador del nivel activo (A/B/C) y los AUCs correspondientes.
   - Tres barras horizontales (DG total, DG precoz, DG tardía) con porcentaje, color por categoría de riesgo y etiqueta textual ("Bajo"/"Intermedio"/"Alto").
   - Cuadro de recomendación clínica con código de color.
   - Disclaimer al pie.

### 9.2. Detalles de UX importantes

- **No mezclar niveles**: si la mujer tiene glucosa pero no HbA1c, baja a nivel A; no usar un nivel "B parcial". Esto evita predicciones inconsistentes.

- **Ancho de las barras**: las probabilidades en esta cohorte son típicamente <20%, así que la barra debe amplificar visualmente (multiplicar por ~3 para que el 10% ocupe ~30% de la barra y se distinga del 5%). Limitar a 100% máximo de ancho.

- **Mostrar el nivel activo**: el usuario debe saber qué modelo se está usando para que entienda por qué la predicción puede cambiar al añadir más datos.

- **Disclaimer obligatorio**: "Esta herramienta tiene fines de investigación y apoyo clínico; no sustituye el juicio profesional ni el protocolo de cribado estándar."

---

## 10. Casos de prueba (verificación)

Tras implementar, verificar con estos casos:

| Caso | Edad | IMC | AF DM | Multi | Glu | HbA1c | PAPP-A | βhCG | Nivel | p_total | p_precoz | p_tardia |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Bajo riesgo | 28 | 22 | 0 | 0 | — | — | — | — | A | ~2,2% | ~0,3% | ~1,9% |
| Riesgo medio | 33 | 25 | 0 | 0 | — | — | — | — | A | ~4,5% | ~0,7% | ~3,9% |
| Perfil DG precoz | 36 | 32 | 1 | 0 | 88 | 5,5 | 0,7 | 1,0 | C | ~24% | ~16% | ~9% |
| Perfil DG tardía | 38 | 27 | 1 | 1 | 80 | 5,1 | 0,9 | 1,1 | C | ~10% | ~1,2% | ~8,7% |

Si tu implementación da resultados muy distintos en estos casos, revisar la fórmula y los coeficientes.

---

## 11. Bibliografía y atribución

- Modelo desarrollado en Hospital Universitario Puerto Real (HUPM), Cádiz, España, 2020–2025.
- Cohorte: 3.981 episodios de embarazo prospectivamente caracterizados; 238 casos de DG (6,0%).
- Algoritmo: regresión logística con regularización Ridge.
- Validación interna por bootstrap (corrección de optimismo).
- Diagnóstico de GDM por criterios de Carpenter-Coustan aplicados a OGTT.
- Controles incluyen O'Sullivan negativo para evitar sesgo de espectro.
- Versión: v1 — 2026-05.

---

*Documento generado como apoyo a la implementación. Cualquier discrepancia entre este documento y los coeficientes en `calculadora_modelos.json` debe resolverse a favor del JSON.*
