# EP3 — Coaching automático: cómo garanticé que cada rep recibe retroalimentación semanal sin importar qué tan cargado esté mi viernes.

**Serie:** Automatización Comercial con IA en Bambu Tech Services
**Episodio:** 3 de 9 — Bloque Ventas
**Estado:** ✅ Publicado
**Publicado:** 2026-06-16
**URL:** https://www.linkedin.com/pulse/ep3-coaching-autom%C3%A1tico-c%C3%B3mo-garantic%C3%A9-que-cada-rep-reciba-esparza-hwkhc/

---

## Coaching automático: cómo garanticé que cada rep recibe retroalimentación semanal sin importar qué tan cargado esté mi viernes.

*Cada viernes a las 5pm, 10 personas en mi equipo comercial reciben coaching estructurado sobre su semana. Yo no escribo una sola línea.*

---

*Este es el tercer artículo de la serie "Automatización Comercial con IA en Bambu Tech Services". Si llegaste aquí directo, empieza por el [EP1 — la arquitectura completa del sistema](https://www.linkedin.com/pulse/ep-1-constru%C3%AD-un-sistema-de-automatizaci%C3%B3n-comercial-roberto-esparza-nxdfc/) y el [EP2 — Lead Scoring](https://www.linkedin.com/pulse/ep2-lead-scoring-c%C3%B3mo-dej%C3%A9-de-adivinar-y-empec%C3%A9-saber-roberto-esparza-m6u5c/).*

---

Cuando llegué a Bambu en noviembre de 2024, éramos cuatro personas en el área comercial: el CEO, dos vendedores, y yo.

En ese contexto, el coaching era natural. Cuatro personas. Conversaciones cotidianas. Feedback inmediato. Fácil.

Cinco meses después, el equipo había crecido a **15 personas** — 5 Pre Sales, 6 BDRs, y yo cubriendo CGO, Ventas y Marketing al mismo tiempo. Y algo que antes funcionaba solo dejó de funcionar: la retroalimentación.

No porque nadie quisiera darla. Sino porque el tiempo para darla bien simplemente ya no existía.

---

### La trampa en la que caen casi todos los managers comerciales

Hay un patrón silencioso en los equipos que crecen rápido.

Al principio, el manager tiene tiempo para todos. Coaching informal, conversaciones frecuentes, feedback en tiempo real. El equipo lo percibe y funciona.

Cuando el equipo escala, el manager optimiza por urgencia: atiende al top performer y al que tiene un problema crítico. El 80% restante recibe atención esporádica — o ninguna.

Lo perverso es que esto se vuelve invisible. Nadie lo dice. El manager asume que si no hay problema urgente, todo va bien. El rep asume que si el manager no dice nada, está haciendo las cosas bien.

Los dos están equivocados. Y el pipeline lo resiente antes de que alguien lo note.

La pregunta que me hice cuando llegamos a 11 personas fue: **¿puede la retroalimentación semanal existir sin depender de que yo encuentre el tiempo?**

---

### La decisión: no contratar un Sales Manager todavía

La respuesta obvia cuando el equipo crece es contratar una capa de management intermedia.

Tiene sentido. A cierta escala, es la respuesta correcta.

Pero en este momento, con un área comercial que acababa de formarse, con métricas de pipeline que apenas estábamos empezando a entender, y con un presupuesto que hay que justificar deal a deal — contratar un Sales Manager para resolver el problema del coaching sería la solución cara a un problema que primero hay que definir bien.

Decidí construirlo antes de contratarlo.

Y lo que construí se llama **WF-08 · Coaching Digest Semanal**.

---

### Cómo funciona el sistema

Cada viernes a las 5pm, sin intervención mía, el workflow hace tres cosas:

**Primero: consolida la semana de cada rep.**
Toma todos los deals de Pipedrive, cruza esa información con el registro de alertas que ya genera WF-03 durante la semana (lunes, miércoles y viernes), y arma un perfil de la semana para cada persona del equipo: cuántos deals tiene abiertos, cuántos avanzó de etapa, cuántos llevan toda la semana sin actividad, y qué tipo de alertas acumuló.

**Segundo: aplica 10 reglas de coaching en orden de prioridad.**
El sistema evalúa el perfil de cada rep contra condiciones concretas y asigna un semáforo:

| Condición | Semáforo |
|---|---|
| Sin pipeline asignado | 🔴 |
| ≥ 3 escalaciones en la semana | 🔴 |
| 0 deals avanzados con ≥ 3 abiertos | 🔴 |
| ≥ 5 deals urgentes acumulados | 🟠 |
| ≥ 2 mismatches de rol/etapa | 🟠 |
| > 50% de deals sin actividad | 🟡 |
| ≥ 3 avanzados, 0 escalaciones | 🟢 |
| ≥ 1 deal ganado | 🟢 |

Sin subjetividad. Sin interpretación. La primera regla que aplica define el semáforo y el mensaje para ese rep.

**Tercero: envía 11 emails.**
Diez coaching cards individuales — una por rep, con copia a mí — y un resumen ejecutivo global para el CGO. En cada card: el semáforo de la semana, los números clave, el top 3 de deals en mayor riesgo ordenados por días sin movimiento multiplicado por valor, y una instrucción concreta para el lunes.

---

### La decisión de diseño que más me costó

La parte que más tardé en definir no fue técnica. Fue de criterio de management.

¿Qué pone el mensaje de coaching?

La opción obvia era un párrafo generado por Claude con análisis personalizado por rep. Suena poderoso. Decidí no hacerlo en la primera versión.

La razón: si el sistema genera retroalimentación genérica — "sigue así, buen trabajo" cuando el rep sabe que tuvo una semana terrible — pierde credibilidad más rápido de lo que la gana. Y sin credibilidad, el equipo deja de abrir el email.

Lo que decidí: el mensaje de v1 es corto, directo, y accionable para el lunes. No analiza. Instruye.

Ejemplos reales de lo que genera:

> 🔴 *"Bloquea 2 horas el lunes a primera hora para revisar y mover al menos 2 deals de etapa. Sin movimiento no hay pipeline."*

> 🟢 *"Excelente ritmo: 4 deals avanzados y pipeline sano. Enfócate en cerrar los de Negociaciones/Calientes."*

> 🟠 *"Tienes deals en etapas que no corresponden a tu rol. Coordina con CGO para reasignar antes del martes."*

Concreto. Verificable. Accionable.

El análisis profundo con Claude llega en v2, cuando tengamos transcripciones de llamadas via Fireflies. Pero v1 ya genera valor desde el primer viernes — sin esperar a que el stack sea perfecto.

---

### El CC al CGO — diseño, no vigilancia

Cada coaching card individual llega con copia a mí. Los 10.

Esto lo decidí conscientemente y lo hice explícito con el equipo desde el principio.

No es control. Es contexto.

Cuando el viernes a las 5pm llegan 10 emails a mi bandeja, en 2 minutos tengo una radiografía de la semana: quién está en rojo, quién avanzó, qué deals están en riesgo. Sin pedir reportes. Sin esperar al lunes.

El email 11 — el resumen ejecutivo — me da el panorama completo: deals abiertos, pipeline en valor, ranking por semáforo. 30 segundos y ya sé el estado del equipo antes del fin de semana.

Si alguien está en 🔴 el viernes, ya sé exactamente qué decirle en el 1:1 del lunes antes de que él abra la boca.

---

### Lo que no anticipé que pasaría

La primera semana que el sistema se activó en producción, marcó más de 400 deals en rojo.

El equipo se abrumó. De repente tenían en su bandeja notificaciones sobre todos los deals que llevaban semanas — o meses — sin seguimiento. Fue incómodo.

Era exactamente lo que necesitaba pasar.

Las semanas siguientes, el número fue bajando. No porque el sistema se suavizara — sino porque el equipo empezó a mover los deals. La presión de ver tu semáforo en 🔴 el viernes es motivación suficiente para hacer algo el lunes.

Lo que no anticipé: el sistema no solo generó retroalimentación. **Generó urgencia sin que yo tuviera que crearla.**

Antes, cuando un deal llevaba 6 semanas sin actividad, nadie lo sabía hasta que el forecast no cuadraba. Ahora el rep lo sabe el viernes anterior. Y tiene un lunes completo para corregirlo antes de que yo llegue al 1:1.

---

### Lo que cambió en las conversaciones de equipo

Antes del sistema, cuando preguntaba sobre el pipeline en una junta, las respuestas eran: "lo veo bien", "el cliente está interesado", "creo que cierra pronto". Opiniones. Difíciles de cuestionar y difíciles de actuar.

Ahora la conversación del lunes empieza diferente: "tuve 3 escalaciones esta semana, el sistema me marcó en rojo, y el deal de Fulano está en el top 3 de riesgo con 40 días sin movimiento".

Eso no es lo que yo le enseñé a decir. Es lo que el sistema le dio el viernes y llegó con ello procesado al lunes.

El coaching no fue reemplazado. Fue ancla con datos antes de que empiece la conversación.

---

### Dónde encaja en el sistema completo

Si lo veo en contexto:

- **WF-01** resuelve la priorización: qué deals trabajar y en qué orden
- **WF-08** resuelve la reflexión semanal: cómo está el rep en su conjunto, no deal por deal
- **WF-03** resuelve la detección en tiempo real: cuándo un deal específico está en riesgo — que es exactamente lo que cubro en el próximo artículo

Los tres forman un ciclo de retroalimentación completo. Sin que yo tenga que operar ninguno manualmente.

---

### Lo que viene en EP4

El coaching semanal resuelve la visibilidad hacia atrás: qué pasó esta semana, quién avanzó, quién se quedó parado.

Pero hay un problema que ninguno de estos workflows resuelve directamente: **saber cuándo un deal específico está muriendo en silencio** — antes de que sea demasiado tarde para rescatarlo.

Eso es lo que construí en WF-03 — el sistema de alertas de pipeline. Y es el tema del próximo artículo.

---

*¿Tu equipo recibe retroalimentación estructurada cada semana — o solo cuando algo sale mal?*

*La diferencia entre los dos escenarios no es talento. Es sistema.*

*La guía visual con el mapa completo de los 12 módulos: **[bambu-sales-automatization.vercel.app](https://bambu-sales-automatization.vercel.app/)***

*El siguiente artículo: cómo saber cuándo un deal específico se está muriendo — y recibir la alerta antes de que sea tarde.*

---

**Roberto Esparza**
CGO · Bambu Tech Services
*Construyendo el área comercial del futuro, desde México.*

*[EP1 — La arquitectura completa →](https://www.linkedin.com/pulse/ep-1-constru%C3%AD-un-sistema-de-automatizaci%C3%B3n-comercial-roberto-esparza-nxdfc/)*
*[EP2 — Lead Scoring →](https://www.linkedin.com/pulse/ep2-lead-scoring-c%C3%B3mo-dej%C3%A9-de-adivinar-y-empec%C3%A9-saber-roberto-esparza-m6u5c/)*
