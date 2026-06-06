# WF-02: Outbound Automatizado — Setup Guide
## Bambu Tech Services · Automatización Comercial con IA
### Versión 1.0 · Junio 2026

---

## Objetivo

Motor de outbound predecible: **Lusha → Claude → Instantly → Pipedrive**

- 2,500+ emails/mes a contactos calificados por vertical
- 25-40 meetings/mes de fuente outbound (canal nuevo)
- 8-15 deals nuevos en pipeline/mes

---

## Stack definitivo

| Herramienta | Función | Estado |
|-------------|---------|--------|
| **Lusha** | Listas de contactos + enrichment firmográfico | ✅ Activo (créditos bajos — recargar antes de escalar) |
| **Instantly** | Warmup de dominios + envío de secuencias + reply detection | ⏳ Contratar |
| **Claude API** | Generación de copy A/B personalizado por vertical | ✅ Activo |
| **Pipedrive API** | Crear deal cuando hay respuesta positiva | ✅ Activo |
| **n8n** | Orquestación completa del flujo | ✅ Activo |

**Inversión incremental mensual:** ~$37 USD (solo Instantly)

---

## Métricas de éxito

| KPI | Meta mes 1 (piloto) | Meta mes 2+ (escala) |
|-----|---------------------|----------------------|
| Emails enviados | 200 | 2,500+ |
| Bounce rate | <3% | <3% |
| Reply rate | ≥1% | ≥3% |
| Meetings agendados | 2-5 | 25-40 |
| Deals nuevos en pipeline | 1-3 | 8-15 |
| Spam complaint rate | <0.1% | <0.1% |

---

## Arquitectura del flujo

```
[Cron semanal - lunes 7am]
        │
        ▼
[Lusha prospecting_contact_search]
   filtros: vertical + seniority + tamaño empresa
        │
        ▼
[Lusha prospecting_contact_enrich]
   obtiene: email, teléfono, cargo actual
        │
        ▼
[Code Node: segmentación + dedup]
   elimina: ya en Pipedrive, ya contactados, emails inválidos
        │
        ▼
[Claude API: genera copy A/B]
   input: datos del contacto + vertical
   output: email variante A + email variante B
        │
        ▼
[Instantly API: crea campaña + agrega contactos]
   secuencia 7 emails / 21 días
        │
  [webhook respuesta recibida]
        │
        ▼
[Claude API: clasifica respuesta]
   positiva / negativa / OOO / no_apto
        │
    ┌───┴──────────────┐
    ▼                  ▼
[Positiva]         [Negativa/OOO]
Crear deal         Marcar en Sheet
Pipedrive          para reactivar
Etapa: MQL         en 30/60 días
Notificar BDR
```

---

## PASO 1 — Contratar Instantly

### Por qué Instantly y no otra herramienta
- **Warmup automático** de dominios secundarios (crítico para deliverability)
- **Reply detection** vía webhook (trigger para clasificación con Claude)
- **Rotación de cuentas** (distribuye envíos entre varios emails)
- Integración nativa con n8n vía API REST

### Plan recomendado
**Growth ($37 USD/mes):**
- 5,000 emails activos/mes
- Warmup ilimitado
- Analytics y A/B testing

URL: [instantly.ai](https://instantly.ai)

---

## PASO 2 — Registrar dominios secundarios

**NUNCA enviar outbound desde `bambu-techservices.com`** — protege la reputación del dominio principal.

### Dominios sugeridos (registrar 2-3)
En GoDaddy / Namecheap (~$12-15 USD/año c/u):
- `bambu-tech.mx`
- `bambudigital.mx`
- `bambusoluciones.mx`

### Configuración DNS por dominio

**SPF (TXT record)**
```
Nombre:  @
Tipo:    TXT
Valor:   v=spf1 include:spf.instantlycloud.com ~all
TTL:     3600
```

**DKIM** — Instantly lo genera automáticamente al agregar el dominio en `Settings → Email Accounts`.

**DMARC (TXT record)**
```
Nombre:  _dmarc
Tipo:    TXT
Valor:   v=DMARC1; p=none; rua=mailto:dmarc@bambu-techservices.com; fo=1
TTL:     3600
```

---

## PASO 3 — Crear cuentas de email por dominio

En Google Workspace ($6/cuenta/mes), crear 3 cuentas por dominio:

```
roberto.esparza@bambu-tech.mx       ← para outbound Financiero/Enterprise
samantha.rivas@bambu-tech.mx        ← para outbound Retail/Consumo
cecia.lozano@bambu-tech.mx          ← para outbound Manufactura/Gobierno
```

Conectar cada cuenta en Instantly vía OAuth.

---

## PASO 4 — Warmup (3 semanas mínimo antes de enviar)

En Instantly → `Settings → Email Accounts → [cuenta] → Warmup`:

```
Semana 1: 10 emails/día por cuenta, reply rate 30%, mark as important ON
Semana 2: 20 emails/día por cuenta
Semana 3: 30 emails/día por cuenta
```

**No enviar campañas reales hasta completar las 3 semanas de warmup.**

Capacidad post-warmup: 3 cuentas × 3 dominios = 9 cuentas → ~270-360 emails/día → ~5,400-7,200/mes.

---

## PASO 5 — Configurar listas en Lusha

### Filtros por vertical (ICP de Bambu)

**Financiero / Seguros**
```javascript
departments: ["IT & Information Systems"]
seniority:   [Director, VP, C-Level]
companySize: [{ min: 200, max: 5000 }]
industry:    Financial Services, Insurance, Banking
countries:   ["MX"]
jobTitles:   ["CTO", "Director TI", "Director Tecnología", "VP Tecnología", "Gerente TI"]
```

**Retail / eCommerce**
```javascript
departments: ["IT & Information Systems", "Operations"]
seniority:   [Director, VP, C-Level]
companySize: [{ min: 500, max: 10000 }]
industry:    Retail, Consumer Goods
countries:   ["MX"]
jobTitles:   ["CTO", "Director Digital", "CDO", "Director Transformación Digital"]
```

**Manufactura / Industrial**
```javascript
departments: ["IT & Information Systems", "Operations"]
seniority:   [Director, VP, C-Level]
companySize: [{ min: 300, max: 5000 }]
industry:    Manufacturing, Industrial Machinery, Automotive
countries:   ["MX"]
jobTitles:   ["CTO", "Director TI", "Director Operaciones", "COO"]
```

**Salud**
```javascript
departments: ["IT & Information Systems"]
seniority:   [Director, VP, C-Level]
companySize: [{ min: 200, max: 3000 }]
industry:    Healthcare, Hospital & Health Care
countries:   ["MX"]
jobTitles:   ["Director TI", "CTO", "Director Transformación Digital"]
```

### Volumen de búsqueda
- **Piloto (semana 4):** 200 contactos, 1 vertical
- **Escala (mes 2+):** 600 contactos/mes, 3 verticales

---

## PASO 6 — Secuencia de 7 emails en Instantly

Crear en `Campaigns → New Campaign → Sequence`:

| Email | Día | Framework | Objetivo |
|-------|-----|-----------|----------|
| E1 | 1 | Case Study (Gayosso) | Captar atención con caso real |
| E2 | 4 | AIDA / Valor | Mostrar beneficio específico al vertical |
| E3 | 8 | PAS | Pain point + agitación + solución |
| E4 | 12 | Pregunta directa | Descubrir si hay proyecto activo |
| E5 | 15 | Prueba social | Testimonio o resultado concreto |
| E6 | 18 | Breakup email | "¿No es prioridad ahora?" |
| E7 | 21 | Último recurso | Compartir recurso de valor sin pedir nada |

El copy de cada email lo genera Claude automáticamente (ver `WF-02-Claude-Prompts.md`).

---

## PASO 7 — Configurar credenciales en n8n

Una vez activos todos los servicios:

1. **Instantly API Key**
   - Instantly → `Settings → API → Generate API Key`
   - n8n → `Settings → Credentials → Header Auth`
   - Name: `Instantly API`, Header: `Authorization`, Value: `Bearer {api_key}`

2. **Lusha** — ya configurado en WF-01, reusar credencial existente

3. **Importar workflow**
   - n8n → `Workflows → Import → seleccionar WF-02-n8n.json`
   - Asignar credenciales en cada nodo
   - Ejecutar test con 3 contactos ficticios

---

## PASO 8 — Piloto (Semana 4, tras warmup)

1. Ejecutar Lusha search: 200 contactos, vertical Retail o Financiero
2. n8n genera copy con Claude y carga en Instantly
3. Monitorear diariamente: bounces, spam complaints, replies
4. Claude clasifica respuestas → deals positivos a Pipedrive

**Criterios para escalar a mes 2:**
- ✅ Bounce rate < 3%
- ✅ Spam complaints < 0.1%
- ✅ Al menos 2 respuestas positivas en los 200

---

## Checklist de activación

### Semana 1
- [ ] Contratar Instantly (Growth $37/mes)
- [ ] Registrar 2-3 dominios secundarios
- [ ] Configurar DNS (SPF, DKIM, DMARC) en cada dominio
- [ ] Crear cuentas Google Workspace por dominio
- [ ] Agregar cuentas en Instantly y activar warmup

### Semana 2
- [ ] Verificar Lusha: revisar saldo de créditos disponibles
- [ ] Ejecutar búsqueda Lusha piloto (200 contactos, 1 vertical)
- [ ] Revisar y aprobar lista antes de cargar a Instantly
- [ ] Configurar secuencia base en Instantly (7 emails)

### Semana 3
- [ ] Confirmar warmup progress (>20 emails/día por cuenta)
- [ ] Importar WF-02-n8n.json en n8n
- [ ] Configurar credenciales Instantly en n8n
- [ ] Probar flujo completo con 3 contactos de prueba

### Semana 4
- [ ] Lanzar piloto: 200 contactos
- [ ] Monitorear métricas diariamente
- [ ] Revisar respuestas clasificadas por Claude
- [ ] Confirmar que deals positivos llegan a Pipedrive etapa MQL

### Mes 2+
- [ ] Recargar créditos Lusha para escala completa
- [ ] Activar Cron semanal automático
- [ ] Escalar a 600 contactos/mes (3 verticales)
- [ ] Revisar métricas en WF-08 Coaching Digest cada viernes

---

## Archivos relacionados

- `WF-02-n8n.json` — Workflow importable para n8n
- `WF-02-Claude-Prompts.md` — Prompts de copy por vertical
- `WF-01-Code-Node-Score.js` — Score engine (WF-02 alimenta con leads nuevos)
- `Workflows-n8n-Especificacion-Tecnica-v0.1.md` — Spec técnica completa
