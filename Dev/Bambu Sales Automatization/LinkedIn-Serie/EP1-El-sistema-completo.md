# EP1 — Construí un sistema de automatización comercial con IA desde cero. Así quedó.

**Serie:** Automatización Comercial con IA en Bambu Tech Services
**Episodio:** 1 de 9 — Introducción / Arquitectura general
**Estado:** ✅ Publicado
**Publicado:** 2026-06-13
**URL:** https://www.linkedin.com/pulse/ep-1-constru%C3%AD-un-sistema-de-automatizaci%C3%B3n-comercial-roberto-esparza-nxdfc/

---

## Construí un sistema de automatización comercial con IA desde cero. Así quedó.

*Llegué a Bambu en el momento justo para no desperdiciar la mayor ola tecnológica de nuestra generación.*

---

En noviembre de 2024 entré a Bambu Tech Services como CGO.

El área comercial en ese momento: **el CEO y Founder, dos vendedores, y yo**. Eso era todo.

No había un equipo estructurado. No había procesos documentados. No había sistema de alertas, ni scoring de leads, ni inteligencia comercial. Había energía, un producto sólido, y $113 millones de pesos en ventas cerradas en 2025 — construidos básicamente a pulso y con relaciones personales.

Mi trabajo era claro: construir el área comercial que necesitaba la empresa para escalar.

Pero había algo más en el contexto que no podía ignorar.

Llegué justo en el momento en que la inteligencia artificial dejó de ser una promesa y se convirtió en una herramienta real de trabajo. Modelos de lenguaje accesibles, herramientas de automatización sin código, APIs que cualquiera puede conectar en horas. La ola más relevante de tecnología en décadas — y me estaba tocando vivirla exactamente mientras construía un área comercial desde cero.

Sería un error no aprovecharla.

Así que tomé una decisión desde el principio: **no iba a construir un equipo de ventas tradicional**. Iba a construir un equipo pequeño, muy bien seleccionado, multiplicado por sistemas inteligentes.

---

### Dónde estamos hoy

Hoy tenemos **15 personas en el equipo comercial** — Pre Sales, BDRs, y yo cubriendo CGO, Ventas y Marketing simultáneamente. Cerramos 2025 con $113 millones de pesos y la meta de 2026 es $117.5 millones.

Pero los números de diagnóstico que encontré al construir el área me pusieron a trabajar de inmediato: **win rate del 13%** y ciclo de venta promedio de **92 días**. Con 1,627 deals abiertos en Pipedrive y un equipo que acababa de formarse, la única forma de tener visibilidad real sobre el pipeline era automatizarla.

No por falta de talento en el equipo. Por ausencia de sistemas — y construir esos sistemas era mi responsabilidad.

---

### La decisión: hacerlo yo mismo

Hay dos caminos cuando decides automatizar el área comercial.

El primero es comprar una solución empaquetada — un CRM más sofisticado, herramientas de Sales Engagement, software de forecasting. Soluciones que cuestan entre $3,000 y $15,000 USD al mes y que usarías al 30%.

El segundo es construir exactamente lo que necesitas, con las herramientas que ya tienes.

Elegí el segundo. Y lo construí yo solo, en paralelo mientras formaba el equipo.

El stack de partida: **Pipedrive** como CRM, **Gmail**, **Google Workspace**. Lo que añadí fue sencillo en costo, pero transformador en operación:

- **n8n Cloud** — motor de automatización y orquestación
- **Claude AI (Anthropic)** — razonamiento, síntesis, generación de contenido
- **Tavily** — búsqueda e inteligencia web en tiempo real
- **Google Sheets** — logging y control de ejecución

Costo mensual total del stack nuevo: menos de **$200 USD**.

---

### La arquitectura: 12 módulos, una red comercial que nunca duerme

Lo que construí no es un workflow. Es una red de 12 módulos automatizados que operan en paralelo, cada uno resolviendo un problema específico del ciclo comercial.

Los organizo en dos bloques:

#### VENTAS — 6 módulos

**WF-01 · Lead Scoring Engine**
Cada vez que un lead entra o se actualiza en Pipedrive, un modelo que diseñé asigna automáticamente una puntuación de 0 a 100 basada en tres dimensiones: datos firmográficos (30%), comportamiento (30%) y BANT (40%). El resultado: el equipo sabe en segundos qué leads merecen atención inmediata y cuáles están fríos.

**WF-01 Decay · Decaimiento de Score**
Los scores no son estáticos. Un lead sin actividad pierde puntos progresivamente. Este módulo corre cada mañana a las 7am. El pipeline se autoordena solo.

**WF-03 · Deal Stage Alerts & Stall Detection**
Lunes, miércoles y viernes a las 8am, el sistema revisa cada deal activo. Si detecta uno que lleva demasiado tiempo sin avanzar, envía una alerta personalizada al rep responsable. Distingue entre urgente, crítico y escalación. Sin ruido. Sin falsos positivos.

**WF-08 · Coaching Digest Semanal**
Cada viernes a las 5pm, cada rep recibe una tarjeta de coaching con su semana: deals avanzados, deals en riesgo, actividad registrada, y un análisis de Claude sobre su momento en el pipeline. Yo recibo el resumen ejecutivo de los 10 reps. 11 emails. Cero trabajo manual de mi parte.

**WF-11 · Re-engagement de Deals Dormidos**
Los deals con 30+ días sin actividad no desaparecen solos — se acumulan y distorsionan el pipeline. Este módulo los detecta, genera un email de reactivación personalizado con Claude, y me pide aprobación antes de enviarlo. Control mío, ejecución automática.

**WF-01B · Batch Score Engine**
Para los miles de deals históricos que entraron al CRM antes de tener scoring en tiempo real, este módulo los procesó en lote y normalizó el pipeline completo.

---

#### MARKETING / OUTBOUND — 6 módulos

**WF-10A · Intel Brief Diario**
Cada mañana de lunes a viernes a las 6:30am, 18 personas del equipo reciben un brief de inteligencia generado por Claude + Tavily: noticias de los sectores donde operamos, señales de mercado, movimientos de clientes potenciales, y ángulos de conversación para el día. El equivalente a tener un analista de inteligencia en el equipo — sin contratar a nadie.

**WF-10B · Campaign Creator**
Cuando apruebo una campaña outbound en Google Sheets, el sistema genera los emails personalizados, los segmenta por industria y comportamiento, y los programa. De la aprobación al primer email enviado: menos de 15 minutos.

**WF-10C · Inbound Lead Router**
Cuando llega un lead por Cliengo o WhatsApp, el sistema lo captura, lo enriquece, lo asigna al Pre Sales adecuado, y dispara la secuencia de bienvenida. Tiempo de respuesta: inmediato.

**WF-10 ANALYSIS · Segmentación CRM**
Antes de cualquier campaña, este módulo analiza el CRM completo y segmenta contactos según comportamiento, industria, etapa y tiempo de inactividad. En la última ejecución: **1,443 contactos campañables** identificados en una sola corrida.

**Campaña Outbound MQL — Junio 2026**
710 deals en etapa MQL con meses sin contacto. Los califiqué en batch, identifiqué los elegibles, personalicé cada email según la industria (8 variantes), y los envié desde mi cuenta con copia al rep asignado. Resultado: **174 emails enviados, 0 fallos, menos de 15 minutos de ejecución total**. Yo no escribí un solo email manualmente.

**WF-12 · Pre-Meeting Intelligence Brief** *(en construcción)*
Antes de cada reunión con un prospecto, el sistema generará un brief con noticias recientes de la empresa, perfil de LinkedIn, actividad en redes, ángulos de venta sugeridos y tres preguntas para abrir la reunión. Para que el equipo llegue preparado, siempre.

---

### Lo que esto no es

No es magia. No es "el bot que cierra solo".

Cada módulo me costó decisiones de diseño reales, bugs frustrantes, y ajustes basados en cómo el equipo realmente trabaja — no en cómo yo creía que trabajaba. Hubo workflows que tardé días en hacer funcionar. Hubo lógica de negocio que descubrí estaba mal documentada solo cuando el sistema la ejecutó en producción.

Y eso es exactamente lo que voy a compartir en esta serie: **el proceso real, con los errores incluidos**.

Porque llegar a un rol como este en 2024 — con la IA al alcance de cualquiera que quiera aprender a usarla — es una ventaja que no se puede desaprovechar. Y quiero documentar cómo la estoy usando.

---

### Lo que viene

Durante las próximas semanas publicaré un artículo detallado por cada módulo, divididos en dos bloques:

**Bloque Ventas:**
- Lead Scoring: cómo asigné prioridad a 1,627 deals sin tocarlos uno a uno
- Alertas de pipeline: cómo eliminé los deals muertos que nadie veía
- Coaching semanal automático: retroalimentación que llega sin que el manager tenga que escribirla
- Reactivar deals dormidos: el arte de hacer que un prospecto que olvidó que existías vuelva a contestar

**Bloque Marketing:**
- Intel Brief diario: por qué el equipo necesita inteligencia antes de las 7am
- Campañas outbound: 174 emails, 0 trabajo manual
- Pre-Meeting Brief: llegar a cada reunión sabiendo más de lo que el prospecto espera
- Enrichment: cómo llené los datos que el CRM no tenía

---

### La arquitectura completa, documentada

Documenté todo el sistema en una guía visual disponible aquí:

**→ [bambu-sales-automatization.vercel.app](https://bambu-sales-automatization.vercel.app/)**

Incluye el mapa de procesos completo, el estado de cada módulo, la cadencia semanal de automatizaciones y los resultados de la campaña de junio 2026.

---

*¿Cuál es el mayor cuello de botella en tu pipeline hoy?*

*Lo más probable es que ya exista una forma de automatizarlo. Eso es lo que vamos a explorar juntos en esta serie.*

---

**Roberto Esparza**
CGO · Bambu Tech Services
*Construyendo el área comercial del futuro, desde México.*
