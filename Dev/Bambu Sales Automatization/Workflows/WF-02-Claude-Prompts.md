# WF-02: Prompts de Copy por Vertical
## Bambu Tech Services · Outbound Automatizado
### Versión 1.0 · Junio 2026

---

## Estructura de prompt principal (Code Node n8n)

El Code Node construye el prompt dinámicamente con los datos de Lusha e invoca Claude API.
El output es un JSON con `email_a` y `email_b` (variante A/B).

```javascript
// Dentro del Code Node n8n — ver WF-02-n8n.json
const prompt = buildPrompt(contact, vertical);
// contact: { first_name, last_name, title, company_name, company_size, industry }
// vertical: "financiero" | "retail" | "manufactura" | "salud" | "gobierno"
```

---

## Prompt maestro (enviado a Claude API)

```
Eres un experto en ventas B2B consultivas para empresas de tecnología en México.
Escribe DOS variantes de email frío (A y B) para el siguiente contacto.

DATOS DEL CONTACTO:
- Nombre: {{first_name}} {{last_name}}
- Cargo: {{title}}
- Empresa: {{company_name}}
- Tamaño empresa: {{company_size}} empleados
- Industria: {{industry}}
- Vertical objetivo: {{vertical}}

SOBRE BAMBU TECH SERVICES:
Bambu es una empresa mexicana de desarrollo de software a la medida, integraciones estratégicas
(SAP, Oracle, Salesforce, sistemas legados), cloud e infraestructura, y soluciones de Data & AI.
10+ años de experiencia, 500+ proyectos entregados. Clientes: Gayosso, Bonafont, Office Depot,
GNP Seguros, Farmacia San Pablo, DINA.

CASO DE ÉXITO CLAVE:
Isela Montenegro, Directora de Tecnología de Grupo Gayosso, habla sobre cómo Bambu transformó
su operación tecnológica con desarrollo a la medida e integraciones estratégicas.
Video: https://youtu.be/6y1Jm8M-V38

REGLAS DE ESCRITURA:
- Asunto: máximo 8 palabras, sin signos de exclamación, sin mayúsculas innecesarias
- Cuerpo: máximo 120 palabras
- Tono: directo, colega a colega, sin jerga de ventas
- Usar framework indicado para este vertical (ver abajo)
- Primera línea: mencionar algo específico de {{company_name}} o del rol de {{title}}
- NO usar: "espero que estés bien", "me permito escribirte", "a quien corresponda"
- NO mencionar precios ni "soluciones innovadoras"
- Personalización obligatoria: mencionar empresa o cargo en las primeras 2 líneas
- Cierre: UNA sola pregunta abierta o CTA específico (no dos)

FRAMEWORK PARA VERTICAL {{vertical}}:
{{framework_instructions}}

FORMATO DE RESPUESTA (JSON estricto, sin texto adicional):
{
  "email_a": {
    "subject": "asunto variante A",
    "body": "cuerpo variante A (sin saludo formal, directo al punto)"
  },
  "email_b": {
    "subject": "asunto variante B",
    "body": "cuerpo variante B (enfoque diferente)"
  }
}
```

---

## Framework por vertical

### FINANCIERO / SEGUROS — Framework: PAS (Problem-Agitate-Solution)
```
FRAMEWORK PAS para sector Financiero/Seguros:

Estructura obligatoria:
1. PROBLEM (1-2 líneas): Nombrar un problema específico del sector
   (legacy systems, regulación CNBV/CNSF, integraciones core bancario, tiempo de TTM)
2. AGITATE (1-2 líneas): Consecuencia real de no resolver
   (pérdida de clientes digitales, multas regulatorias, ventaja competidora)
3. SOLUTION (1-2 líneas): Cómo Bambu lo resuelve sin vender, solo mostrando el camino

Pain points comunes a mencionar (elegir 1):
- Core bancario / CBS que no se integra con canales digitales
- Time-to-market de 12-18 meses para nuevos productos
- Dependencia de un solo proveedor legacy (lock-in)
- Cumplimiento regulatorio CNBV/CNSF con sistemas obsoletos

Ejemplo de asunto variante A: "integración core bancario sin reemplazarlo"
Ejemplo de asunto variante B: "{{company_name}} y el problema del legacy"
```

---

### RETAIL / eCOMMERCE — Framework: AIDA (Attention-Interest-Desire-Action)
```
FRAMEWORK AIDA para sector Retail/eCommerce:

Estructura obligatoria:
1. ATTENTION (1 línea): Dato o pregunta que interrumpa — específico para retail mexicano
2. INTEREST (1-2 líneas): Contexto de por qué es relevante para {{company_name}}
3. DESIRE (1-2 líneas): Resultado concreto que obtuvo un cliente similar (Bonafont, Office Depot)
4. ACTION (1 línea): Una sola pregunta para abrir conversación

Pain points comunes a mencionar (elegir 1):
- Desconexión entre e-commerce, POS y ERP/SAP
- Personalización en tiempo real sin datos unificados
- Estacionalidad (Buen Fin, Hot Sale) que rompe los sistemas
- Omnicanalidad incompleta (inventario no sincronizado)

Ejemplo de asunto variante A: "inventario unificado en línea y tienda física"
Ejemplo de asunto variante B: "Buen Fin sin caídas del sistema"
```

---

### MANUFACTURA / INDUSTRIAL — Framework: Before-After (Antes-Después)
```
FRAMEWORK BEFORE-AFTER para Manufactura/Industrial:

Estructura obligatoria:
1. BEFORE (1-2 líneas): Situación actual sin resolver — específica para manufactura
2. AFTER (1-2 líneas): Cómo sería diferente con la solución correcta (sin nombrar Bambu aún)
3. BRIDGE (1 línea): Bambu como el puente entre ambos estados
4. CTA (1 línea): Pregunta concreta sobre su situación actual

Pain points comunes a mencionar (elegir 1):
- Planta sin visibilidad en tiempo real del piso de producción
- Datos de OEE en Excel, no en dashboards accionables
- ERP central no conectado con sistemas de planta (MES, SCADA)
- Reportes manuales que toman 2-3 días en consolidarse

Ejemplo de asunto variante A: "datos de planta en tiempo real sin cambiar el ERP"
Ejemplo de asunto variante B: "OEE visible desde el escritorio del director"
```

---

### SALUD / HEALTHCARE — Framework: Case Study
```
FRAMEWORK CASE STUDY para Sector Salud:

Estructura obligatoria:
1. CONTEXTO (1 línea): Presentar brevemente el caso análogo (sin revelar cliente si es confidencial)
2. PROBLEMA que tenía ese cliente (1 línea)
3. LO QUE HIZO Bambu (1-2 líneas, técnico pero entendible)
4. RESULTADO (1 línea con métrica si es posible)
5. CONEXIÓN (1 línea): "En {{company_name}} podría aplicar algo similar porque..."
6. CTA (1 línea): Pregunta abierta

Pain points comunes a mencionar (elegir 1):
- Sistemas de historia clínica sin interoperabilidad (HL7/FHIR)
- Facturación y CFDI sin integración al expediente
- Datos de pacientes en silos (laboratorio, hospitalización, farmacia)
- Falta de portal de paciente / app móvil funcional

Ejemplo de asunto variante A: "expediente clínico integrado sin reemplazar el HIS"
Ejemplo de asunto variante B: "interoperabilidad en salud — caso práctico"
```

---

### GOBIERNO / SECTOR PÚBLICO — Framework: PAS con énfasis normativo
```
FRAMEWORK PAS-NORMATIVO para Gobierno:

Estructura obligatoria:
1. PROBLEM (1-2 líneas): Reto de modernización con restricciones presupuestales o normativas
2. AGITATE (1 línea): Consecuencia (rezago ciudadano, auditorías, cambio de administración)
3. SOLUTION (1-2 líneas): Desarrollo a la medida que respeta marco normativo existente
4. CREDENCIAL (1 línea): Mención a DINA u otro cliente de sector público/industrial

Pain points comunes a mencionar (elegir 1):
- Sistemas heredados sin soporte que no cumplen normativa vigente
- Trámites presenciales que no se han digitalizado
- Falta de interoperabilidad entre dependencias
- Proyectos de modernización detenidos por complejidad de migración

Nota de tono: Más formal que otros verticales. Usar "usted".
Evitar anglicismos. Enfatizar cumplimiento normativo y transparencia.

Ejemplo de asunto variante A: "modernización sin reemplazar sistemas críticos"
Ejemplo de asunto variante B: "digitalización de trámites — experiencia en sector público"
```

---

## Emails de follow-up (E2-E7)

Claude genera estos emails en la misma llamada si se incluye en el prompt principal.
Cada uno referencia el anterior sutilmente.

### Prompt adicional para follow-ups

```
Además de los 2 emails de apertura, genera los siguientes follow-ups.
Cada uno debe ser aún más corto (máx 80 palabras) y hacer referencia implícita
al email anterior sin decir "como mencioné anteriormente".

EMAIL 3 (Día 8) - Caso de uso específico:
Compartir un resultado concreto de Bambu relevante para {{industry}}.
Formato: 1 dato + 1 pregunta. Sin pitch.

EMAIL 4 (Día 12) - Pregunta directa:
Solo una pregunta que diagnostique si hay proyecto activo en {{company_name}}.
Máximo 3 líneas. Sin contexto adicional.

EMAIL 5 (Día 15) - Prueba social:
Mencionar Gayosso u otro cliente relevante para el vertical.
Incluir link al video: https://youtu.be/6y1Jm8M-V38

EMAIL 6 (Día 18) - Breakup:
"¿No es prioridad en este momento?" — dar opción de decir no.
Máximo 4 líneas. Tono ligero, sin presión.

EMAIL 7 (Día 21) - Recurso de valor:
Compartir un insight, artículo o recurso útil para {{industry}} sin pedir nada.
Terminar con: "Si en algún momento quieres conversar, aquí estaré."
```

---

## Clasificación de respuestas (webhook Instantly → Claude)

Cuando Instantly detecta una respuesta, n8n la envía a Claude con este prompt:

```
Clasifica la siguiente respuesta de email de ventas en UNA de estas categorías:

POSITIVA: El prospecto muestra interés, hace preguntas, pide más info o propone reunión
NEGATIVA: Rechaza explícitamente, no tiene presupuesto, no es decisor, no les interesa
OOO: Out-of-office, respuesta automática de vacaciones o ausencia
NO_APTO: Cambió de empresa, no es el contacto correcto, email equivocado
REFERIDO: Redirige a otra persona en la empresa (incluir nombre/email si está en el texto)

RESPUESTA A CLASIFICAR:
"{{reply_text}}"

FORMATO DE RESPUESTA (JSON estricto):
{
  "categoria": "POSITIVA|NEGATIVA|OOO|NO_APTO|REFERIDO",
  "razon": "explicación breve en 1 línea",
  "accion_sugerida": "qué debe hacer el BDR o el sistema",
  "contacto_referido": "nombre y email si categoria=REFERIDO, null si no aplica",
  "reactivar_en_dias": 30  // solo para OOO o NEGATIVA temporal, null si no aplica
}
```

---

## Notas de calibración

- **Si reply rate < 1% en E1:** cambiar asunto (probar variante B si se venía usando A)
- **Si bounce rate > 3%:** pausar campaña, revisar lista Lusha, re-verificar emails
- **Si spam complaints > 0.05%:** revisar warmup de dominios, reducir volumen 50%
- **Vertical con mejor respuesta histórica en B2B tech MX:** Financiero y Retail
- **Mejor día/hora de envío:** martes-miércoles, 9-11am hora CDMX (configurar en Instantly)
