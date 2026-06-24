# EP2 — Lead Scoring: cómo dejé de adivinar y empecé a saber qué deals valían la pena.

**Serie:** Automatización Comercial con IA en Bambu Tech Services
**Episodio:** 2 de 9 — Bloque Ventas
**Estado:** ✅ Publicado
**Publicado:** 2026-06-15
**URL:** https://www.linkedin.com/pulse/ep2-lead-scoring-c%C3%B3mo-dej%C3%A9-de-adivinar-y-empec%C3%A9-saber-roberto-esparza-m6u5c/

---

## Lead Scoring: cómo dejé de adivinar y empecé a saber qué deals valían la pena.

*Con 1,600 deals "activos" y un win rate del 13%, el problema no era conseguir más leads. Era saber cuáles valían la pena — y construir un sistema que lo dijera solo.*

---

*Este es el segundo artículo de la serie "Automatización Comercial con IA en Bambu Tech Services". Si llegaste aquí directo, el EP0 con la arquitectura completa del sistema está [aquí](https://www.linkedin.com/pulse/ep-1-constru%C3%AD-un-sistema-de-automatizaci%C3%B3n-comercial-roberto-esparza-nxdfc/).*

---

Cuando llegué a Bambu en noviembre de 2024, heredé un CRM con más de 1,600 deals activos.

Suena bien. No lo era.

Un pipeline con 1,600 oportunidades abiertas, sin sistema de priorización, es básicamente ruido. El equipo —que en ese momento era el CEO, dos vendedores, y yo— tomaba decisiones de dónde enfocarse basadas en intuición, relaciones personales, o simplemente en quién había contactado último.

El resultado: **win rate del 13%**. De cada 100 deals que trabajábamos, cerrábamos 13.

La pregunta que me hice desde el primer día no fue "¿cómo consigo más leads?". Fue una diferente:

**¿Cómo sé cuáles de estos 1,600 deals merecen atención hoy?**

---

### El error más caro en ventas B2B: confundir cantidad con oportunidad

Hay una trampa en la que caen casi todos los equipos comerciales que están creciendo: construir el pipeline más grande posible.

Más leads = más oportunidades = más ventas. La lógica parece sólida.

No lo es.

Un pipeline inflado cuesta tiempo, distorsiona el forecast, y —lo más peligroso— da una falsa sensación de seguridad. Cuando tienes 1,600 deals "activos" y cierras 13 de cada 100, el problema no es el volumen. Es que no estás trabajando los correctos.

La verdad que tuve que aceptar: **en Bambu no necesitábamos más leads. Necesitábamos saber cuáles valían la pena.**

La diferencia entre un equipo comercial mediocre y uno de alto rendimiento no está en cuántos prospects tienen — está en qué tan bien califica cada uno.

---

### La segmentación que lo cambió todo: Pre Sales vs BDR

Antes de hablar del sistema de scoring, necesito hablar del equipo — porque el modelo de calificación no funciona si el equipo no está organizado para usarlo.

Una de las primeras decisiones que tomé al construir el área comercial fue segmentar los roles por especialización en la etapa del ciclo, no por jerarquía.

El resultado es este:

**Los Pre Sales — el filtro del pipeline (5 personas)**
Su trabajo es convertir ruido en señal. Toman los leads que entran al CRM y determinan si hay una oportunidad real antes de que el equipo de cierre invierta tiempo en ellos:

- **MQL → Lead In BANT:** Primer contacto, investigación del prospecto, validación inicial de fit
- **Lead In BANT → Taller de Requerimientos:** Ejecución del proceso BANT para calificar si el deal merece ir al siguiente nivel

Un Pre Sales no cierra. Un Pre Sales decide qué merece llegar a la mesa de cierre.

**Los BDR — los consultores y cerradores (6 personas)**
Toman el deal cuando ya tiene BANT calificado y lo llevan hasta el contrato firmado:

- **Taller de Requerimientos:** Discovery profundo, entendimiento real del problema del cliente
- **Realizando Propuesta → Propuesta Enviada:** Construcción técnica y económica de la solución
- **Negociaciones → Calientes:** Manejo de objeciones, gestión de stakeholders, firma

¿Por qué importa esta distinción para el scoring?

Porque el componente BANT del modelo — que vale 40 de 100 puntos — solo lo puede llenar alguien que ha hablado con el prospecto. Ese alguien es el Pre Sales.

Cuando el Pre Sales califica y llena el BANT, el score puede cruzar de 50 a 71+. Ese cruce es la señal para el BDR de que hay un deal real sobre la mesa.

La arquitectura del equipo y la arquitectura del modelo se diseñaron juntas. No es coincidencia.

---

### El modelo: 30 / 30 / 40

Cada deal en Pipedrive recibe automáticamente una puntuación de **0 a 100** que indica qué tan probable es que cierre. El score se compone de tres dimensiones:

**Firmográfico — 30 puntos (automático)**
Datos duros de la empresa: industria, tamaño, revenue estimado, ubicación geográfica, stack tecnológico visible, y nivel de seniority del contacto. Este componente lo calcula el sistema solo, usando datos de Lusha en el momento en que entra el deal. El Pre Sales no tiene que hacer nada.

Los sectores que más puntúan son Financiero/Seguros (10 pts) y Retail (8 pts) — no porque sean los más fáciles de vender, sino porque históricamente son los que más invierten en los servicios que ofrecemos. Empresas en CDMX, Monterrey y Guadalajara con más de 500 empleados arrancan ya con ventaja firmográfica.

**Comportamiento — 30 puntos (automático)**
Actividades registradas en los últimos 30 días, emails intercambiados, reuniones realizadas, velocidad de respuesta del prospecto, cuántos stakeholders de la empresa están involucrados, y el canal de origen del lead. También automático — el sistema lo lee directamente de Pipedrive.

Este componente tiene una característica importante: **decae con la inactividad**. Si un deal lleva 15 días sin actividad registrada, pierde 5 puntos. A los 30 días, pierde 10. A los 90 días, el sistema lo marca como dormido.

Esto fue uno de los cambios más poderosos en el pipeline: los deals "activos" que llevaban meses sin movimiento empezaron a mostrar su score real. Deals que antes parecían oportunidades resultaron ser ruido con fecha de creación antigua.

**BANT — 40 puntos (manual, post-discovery)**
Este es el componente humano — y es deliberadamente el más pesado del modelo.

BANT es un framework de calificación clásico en ventas B2B: **B**udget (Presupuesto), **A**uthority (Autoridad), **N**eed (Necesidad), **T**imeline (Tiempo de cierre). La premisa es simple: un prospecto solo es una oportunidad real si tiene dinero para comprarte, la persona con quien hablas puede tomar la decisión, existe un problema genuino que resolver, y hay un plazo definido para hacerlo. Sin los cuatro, no hay deal — solo una conversación.

El Pre Sales llena estos 4 campos en Pipedrive después del primer discovery call. No antes. ¿Por qué? Porque la única forma de saber si un prospecto tiene presupuesto real, si la persona con quien hablas tiene autoridad para decidir, si la necesidad es genuina o cosmética, y si el timing tiene sentido — es conversando con ellos.

Los puntos se distribuyen así:
- **Presupuesto:** Desde 0 (sin budget) hasta 12 (presupuesto superior a $1M MXN confirmado)
- **Autoridad:** Desde 0 (tu contacto no influye en la decisión) hasta 12 (C-Level firmante)
- **Necesidad:** Desde 0 (sin dolor claro) hasta 8 (urgente, tienen un problema crítico que resolver ya)
- **Tiempo:** Desde 0 (proyecto a más de 12 meses) hasta 8 (necesitan proveedor en menos de un mes)

**Un deal sin BANT tiene un máximo de 60/100.** No puede ser Hot. Nunca. Sin importar qué tan grande sea la empresa o cuántas actividades haya en Pipedrive.

Esa restricción fue una decisión de diseño deliberada. Quería que el equipo entendiera que un deal sin BANT es un deal sin calificar — y un deal sin calificar no merece recursos prioritarios.

---

### Las cuatro categorías y lo que implica cada una

| Score | Clasificación | Qué hacer |
|---|---|---|
| 71-100 | 🔥 Hot | Deal prioritario. Contacto en menos de 1 hora. |
| 51-70 | 🟠 Caliente | BDR o Pre Sales con prioridad. Menos de 4 horas. |
| 26-50 | 🟡 Tibio | Seguimiento normal. Menos de 24 horas. |
| 0-25 | 🔵 Frío | Nurturing automatizado. Sin tiempo activo del equipo. |

La clasificación no es solo informativa — es operativa. Cuando un deal sube a Hot, el BDR responsable recibe una notificación inmediata. Yo recibo una copia. El acuerdo implícito con el equipo: un deal Hot sin contacto en menos de una hora requiere explicación.

---

### El insight de liderazgo que no esperaba

Implementar este sistema cambió algo que no anticipé: **la calidad de las conversaciones de pipeline**.

Antes, cuando preguntaba sobre un deal específico, la respuesta era subjetiva: "lo veo bien", "el cliente está interesado", "creo que va a cerrar pronto". Opiniones. Intuiciones. Difíciles de cuestionar y difíciles de actuar.

Ahora la conversación es diferente: "el deal tiene score 48, comportamiento cayó porque no hubo actividad en 3 semanas, y el BANT dice que no tienen budget confirmado".

Eso es información. Con información se pueden tomar decisiones.

El scoring no reemplaza el juicio humano — lo ancla. El BDR sigue siendo quien entiende el contexto real de cada prospecto. Pero ahora tiene un número respaldado en datos que hace la conversación más honesta.

Los mejores vendedores del equipo adoptaron el modelo rápido. No porque les pidiera que lo hicieran — sino porque les daba claridad sobre dónde poner su tiempo.

---

### El resultado: el pipeline se limpió solo

Tres semanas después de activar el sistema, el pipeline de 1,627 deals se veía diferente.

No porque hubiera menos deals — sino porque por primera vez podíamos ver cuántos eran reales.

Los Fríos eran la mayoría. Deals de 2023 y 2024 que seguían "activos" en el CRM porque nadie los había cerrado formalmente. Deals sin BANT, sin actividad reciente, sin señal de vida. El decay los fue marcando automáticamente. El equipo los movió a nurturing o los cerró como perdidos.

Lo que quedó era un pipeline más pequeño — y considerablemente más honesto.

Y con un pipeline honesto, el forecast empieza a tener sentido. El equipo sabe dónde está parado. Y yo, como CGO cubriendo también Ventas y Marketing, puedo tomar decisiones con información real en lugar de con wishful thinking.

---

### Lo que viene en EP2

El scoring resuelve el problema de priorización: saber en qué deals enfocarse.

Pero hay otro problema que el scoring solo no resuelve: **saber cuándo un deal que debería estar avanzando, se está muriendo en silencio**.

Eso es lo que construí en WF-03 — el sistema de alertas de pipeline. Y es el tema del próximo artículo.

---

*¿Tu equipo tiene un sistema de calificación o trabaja por intuición?*

*La diferencia en eficiencia operativa es enorme. Si quieres ver el sistema completo documentado — incluyendo el mapa de procesos, los flujos de cada workflow y los resultados de la campaña de junio — está disponible en la guía visual: **[bambu-sales-automatization.vercel.app](https://bambu-sales-automatization.vercel.app/)***

*El siguiente artículo: cómo saber cuándo un deal está muriendo en silencio — antes de que sea demasiado tarde.*

---

**Roberto Esparza**
CGO · Bambu Tech Services
*Construyendo el área comercial del futuro, desde México.*

*[EP0 — La arquitectura completa del sistema →](https://www.linkedin.com/pulse/ep-1-constru%C3%AD-un-sistema-de-automatizaci%C3%B3n-comercial-roberto-esparza-nxdfc/)*
