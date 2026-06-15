# EP3 — El manager que nunca tiene tiempo de dar retroalimentación. Y cómo lo resolví.

**Serie:** Automatización Comercial con IA en Bambu Tech Services
**Episodio:** 3 de 9 — Bloque Ventas
**Estado:** ✅ Listo para publicar
**Publicar:** [fecha a definir]

---

## El manager que nunca tiene tiempo de dar retroalimentación. Y cómo lo resolví.

*Cada viernes a las 5pm, 10 personas en el equipo comercial reciben coaching estructurado sobre su semana. Yo no escribo una sola línea.*

---

*Este es el tercer artículo de la serie "Automatización Comercial con IA en Bambu Tech Services". Si llegaste aquí directo, empieza por el EP1 con la arquitectura completa del sistema [aquí](https://www.linkedin.com/pulse/ep-1-constru%C3%AD-un-sistema-de-automatizaci%C3%B3n-comercial-roberto-esparza-nxdfc/).*

---

Hay una verdad incómoda en los equipos comerciales que crecen rápido:

El manager nunca tiene tiempo suficiente para dar retroalimentación individual. Y el equipo lo sabe.

No es falta de intención. Es que entre atender las escalaciones de la semana, hacer forecast, avanzar tus propios clientes, y apagar los fuegos del día — el tiempo para sentarte a dar coaching de calidad simplemente desaparece.

Y el coaching que se da en esas condiciones es reactivo y superficial. "¿Cómo vas con tus deals?" "Bien, lo veo bien." "Oye, mueve ese deal de Fulano que ya lleva 40 días." Conversaciones útiles en el momento, pero que no construyen hábito ni cambian comportamiento.

Me hice una pregunta: ¿puede la retroalimentación semanal existir sin depender de que yo encuentre el tiempo?

---

### El problema de escala que nadie te avisa

Cuando el área comercial éramos el CEO, dos vendedores y yo, el coaching era informal pero frecuente. Cuatro personas. Conversaciones cotidianas. Fácil.

Cuando el equipo llegó a 11 personas — 5 Pre Sales, 6 BDRs, y yo cubriendo CGO, Ventas y Marketing simultáneamente — el modelo informal se rompió.

No tenía tiempo para hacer coaching individual de calidad a cada rep cada semana. Y no quería hacer lo que hacen muchos managers en esa situación: priorizar al top performer y al que tiene un problema urgente, y dejar al 80% sin retroalimentación estructurada.

La solución no era contratar un Sales Manager todavía.

Era construir el sistema que lo haría por mí.

---

### WF-08: Pipeline Pulse Semanal — qué hace y cómo funciona

Cada viernes a las 5pm (`cron: 0 17 * * 5`, timezone: America/Mexico_City), el workflow se activa solo y ejecuta este flujo en minutos:

**Nodo 1 — HTTP Request + Consolidate Deals**
El primer paso es traer todos los deals de Pipedrive — activos, ganados y perdidos — via API con paginación de 500 deals por llamada. Un nodo Code intermedio llamado `Consolidate Deals` convierte ese stream paginado en un solo array:

```js
return [{ json: { deals: allDeals, count: allDeals.length } }];
```

¿Por qué existe ese nodo? Porque el siguiente paso (leer el Sheet de alertas) necesita ejecutarse exactamente una vez, no una vez por página de resultados. Sin este consolidador, el workflow se ramifica y procesa datos duplicados.

**Nodo 2 — Read WF-03 Alerts (Google Sheets)**
En vez de recalcular las alertas desde cero, WF-08 lee directamente el Sheet `WF-03 Alert Log - Bambu` que WF-03 ya escribe cada lunes, miércoles y viernes. Reutilizar esa data fue una decisión de diseño deliberada: una sola fuente de verdad. Si WF-03 ajusta sus reglas, WF-08 hereda automáticamente los cambios.

El Code filtra solo las filas con `timestamp >= lunes de la semana en curso` — no los últimos 7 días, sino la semana ISO. Esto garantiza que el reporte del viernes siempre sea "esta semana", no una ventana móvil que incluye el fin de semana anterior.

**Nodo 3 — Build Coaching Digest (el nodo principal)**
Aquí ocurre todo. Para cada rep del equipo, el código agrega:

- Deals abiertos y valor total de su pipeline
- Cuántos deals avanzó de etapa esta semana (`stage_change_time >= lunes`)
- Cuántos llevan sin actividad toda la semana
- Breakdown de alertas: escalaciones 🚨, urgentes 🔴, suaves ⚠️, inactividad 💤
- Top 3 deals en mayor riesgo — ordenados por un score simple: `días_en_etapa × valor_del_deal`

Con eso, aplica 10 reglas de coaching en orden de prioridad. La primera que aplica define el semáforo y el mensaje:

| Flag | Condición |
|---|---|
| 🔴 | Sin pipeline asignado |
| 🔴 | ≥ 3 escalaciones en la semana |
| 🔴 | 0 deals avanzados con ≥ 3 abiertos |
| 🟠 | ≥ 5 deals urgentes acumulados |
| 🟠 | ≥ 2 mismatches de rol/etapa |
| 🟡 | > 50% de deals sin actividad |
| 🟢 | ≥ 3 avanzados, 0 escalaciones |
| 🟢 | ≥ 1 deal ganado |
| 🟡 | Fallback: semana estable |

Sin subjetividad. Sin interpretación. El rep abre el email y en 3 segundos sabe en qué zona está.

**Nodo 4 — Send Email (× 11)**
El nodo de envío recibe 11 ítems en un solo run: 10 coaching cards individuales (una por rep) + 1 resumen ejecutivo global para el CGO. Cada ítem trae su `recipients`, `subject` y `body` generados dinámicamente. El nodo simplemente los envía en loop.

En paralelo al envío, un nodo `Append CoachingLog` registra cada card en una tab del mismo Sheet — tracking longitudinal que eventualmente permitirá ver tendencias por rep semana a semana.

---

### La decisión de diseño que más me costó

La parte que más me costó definir no fue técnica — fue de criterio de management.

¿Qué pone el mensaje de coaching?

La tentación obvia era un párrafo generado por Claude con retroalimentación personalizada. Suena poderoso. En la práctica, decidí no hacerlo en v1.

La razón: si el sistema genera retroalimentación genérica — "sigue así" cuando el rep sabe que tuvo una semana terrible — pierde credibilidad más rápido de lo que la gana. Y sin credibilidad, el equipo deja de leer el email.

Lo que decidí: el mensaje de v1 es corto, directo, y accionable para el lunes. No analiza — instruye.

Ejemplos reales que genera el sistema:

> 🔴 *"Bloquea 2 horas el lunes a primera hora para revisar y mover al menos 2 deals de etapa. Sin movimiento no hay pipeline."*

> 🟢 *"Excelente ritmo: 4 deals avanzados y pipeline sano. Enfócate en cerrar los de Negociaciones/Calientes."*

> 🟠 *"Tienes deals en etapas que no corresponden a tu rol. Coordina con CGO para reasignar antes del martes."*

Concreto. Verificable. Accionable. Eso es lo que buscaba.

El análisis con Claude llega en v2, cuando tengamos transcripciones de llamadas via Fireflies. Pero v1 ya genera valor desde el primer viernes.

---

### El CC al CGO — diseño, no vigilancia

Cada coaching card individual llega con copia a mí. Los 10.

Esto lo decidí conscientemente y lo hice explícito con el equipo desde el principio.

No es control. Es contexto.

Cuando el viernes a las 5pm llegan 10 emails a mi bandeja, en 2 minutos tengo una radiografía de la semana: quién está en rojo, quién avanzó, qué deals están en riesgo. Sin pedir reportes. Sin esperar al lunes.

El email 11 — el resumen ejecutivo — me da el panorama completo del equipo: deals abiertos, pipeline en valor, deals avanzados vs. sin movimiento, ranking por semáforo. 30 segundos y ya sé el estado del equipo antes del fin de semana.

Si alguien está en 🔴 el viernes, ya sé exactamente qué decirle en el 1:1 del lunes antes de que él abra la boca.

---

### Lo que cambió en el equipo

La primera semana, el sistema marcó más de 400 deals en rojo.

El equipo se abrumó. De repente tenían en su bandeja notificaciones sobre todos los deals que llevaban semanas — o meses — sin seguimiento. Fue incómodo. Y era exactamente lo que necesitaba pasar.

Paulatinamente el número fue bajando. No porque el sistema se suavizara — sino porque el equipo empezó a mover los deals. La presión de ver tu semáforo en 🔴 el viernes es motivación suficiente para hacer algo el lunes.

Hoy el sistema hace énfasis en tres señales que más predicen un deal que se está muriendo en silencio: **deals sin movimiento, escalaciones acumuladas y mismatches de rol/etapa**. Cuando las tres se juntan en el mismo rep la misma semana, la conversación del 1:1 ya está escrita.

Antes: la retroalimentación era esporádica, dependía de mi agenda, y solo llegaba a quien la pedía o al que tenía un problema urgente.

Después: cada viernes a las 5pm, los 10 reps reciben retroalimentación estructurada sobre su semana. Sin excepción. Sin importar si yo tuve un viernes cargado o si estuve en reuniones todo el día.

Algunos lo leen el viernes en la tarde. Otros el domingo en la noche. Otros el lunes temprano. Pero lo leen. Y llegan al inicio de la semana con contexto sobre lo que dejaron pendiente.

Eso es exactamente lo que buscaba: no sustituir el coaching humano, sino garantizar que la retroalimentación estructurada existiera independientemente de mi disponibilidad.

---

### Dónde encaja en el sistema

Si lo veo en el contexto del sistema completo:

- **WF-01** resuelve la priorización: qué deals trabajar y en qué orden
- **WF-03** resuelve la detección en tiempo real: cuándo un deal específico está en riesgo (lo cubro en el próximo episodio)
- **WF-08** resuelve la reflexión semanal: cómo está el rep en su conjunto, no deal por deal

Los tres juntos forman un ciclo de retroalimentación completo — sin que yo tenga que operar ninguno manualmente.

---

### Lo que viene en EP4

El coaching semanal resuelve el problema de visibilidad hacia atrás: qué pasó esta semana.

Pero hay un problema que este workflow — y ninguno de los anteriores — resuelve directamente: los deals que llevan meses sin contacto y que ya nadie persigue activamente. Los que el CRM sigue mostrando como "activos" pero que en realidad están muertos.

Eso es lo que construí en WF-11 — el sistema de reactivación de deals dormidos. Y es el tema del próximo artículo.

---

*¿Tu equipo recibe retroalimentación estructurada cada semana — o solo cuando algo sale mal?*

*La diferencia entre los dos escenarios no es talento. Es sistema.*

*La guía visual del sistema completo: **[bambu-sales-automatization.vercel.app](https://bambu-sales-automatization.vercel.app/)***

*El siguiente artículo: deals que llevan 6 meses sin contacto. Cómo no dejarlos morir.*

---

**Roberto Esparza**
CGO · Bambu Tech Services
*Construyendo el área comercial del futuro, desde México.*

*[EP1 — La arquitectura completa del sistema →](https://www.linkedin.com/pulse/ep-1-constru%C3%AD-un-sistema-de-automatizaci%C3%B3n-comercial-roberto-esparza-nxdfc/)*
