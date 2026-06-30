# EP4 — Alerta + contexto: los dos sistemas que hacen que ningún deal muera en silencio.

**Serie:** Automatización Comercial con IA en Bambu Tech Services
**Episodio:** 4 de 9 — Bloque Ventas
**Estado:** ✅ Publicado
**Publicado:** 2026-06-18
**URL:** https://www.linkedin.com/pulse/ep4-alerta-contexto-los-dos-sistemas-que-hacen-ning%C3%BAn-esparza-jzhtc/
**Workflows cubiertos:** WF-03 (Deal Stage Alerts) + WF-02 (Enrichment)

---

## Alerta + contexto: los dos sistemas que hacen que ningún deal muera en silencio.

*Construí el sistema de alertas y funcionó. Entonces descubrí que una alerta sin el expediente del prospecto es solo la mitad del trabajo.*

---

*Este es el cuarto artículo de la serie "Automatización Comercial con IA en Bambu Tech Services". Si llegaste aquí directo, empieza por el [EP1 — la arquitectura completa del sistema](https://www.linkedin.com/pulse/ep-1-constru%C3%AD-un-sistema-de-automatizaci%C3%B3n-comercial-roberto-esparza-nxdfc/), el [EP2 — Lead Scoring](https://www.linkedin.com/pulse/ep2-lead-scoring-c%C3%B3mo-dej%C3%A9-de-adivinar-y-empec%C3%A9-saber-roberto-esparza-m6u5c/) y el [EP3 — Coaching Digest](https://www.linkedin.com/pulse/ep3-coaching-autom%C3%A1tico-c%C3%B3mo-garantic%C3%A9-que-cada-rep-reciba-esparza-hwkhc/).*

---

El EP3 terminó con una promesa: construir un sistema que detecte cuándo un deal específico se está muriendo — antes de que sea tarde.

Eso lo resolví.

Pero aprendí algo que no anticipé.

La primera semana que WF-03 entró en producción, disparó una alerta a uno de mis BDRs: deal en Propuesta Enviada, 18 días sin respuesta, marcado en 🔴 urgente. El sistema tenía razón. El BDR abrió el deal en Pipedrive.

Y el deal card estaba casi vacío.

Sin cargo del decisor. Sin tamaño real de la empresa. Con el nombre de la organización y el correo genérico que dejó en el formulario cuando entró como lead meses atrás.

El BDR pasó 35 minutos investigando en Google y LinkedIn antes de poder levantar el teléfono.

No es un error del BDR. Es un error de diseño.

---

### La trampa que aparece cuando el sistema empieza a funcionar

El sistema de alertas funciona. Ese no es el problema.

El problema es lo que pasa después de la alerta: el rep recibe la notificación, va al deal, y si la información no está ahí, tiene que construirla desde cero. Google, LinkedIn, el sitio web de la empresa, búsqueda del decisor correcto.

Con 15 personas en el equipo y hasta 100 alertas por semana, ese tiempo acumulado no es trivial. Y genera una fricción silenciosa que hace que los reps prioricen los deals fáciles — los que ya conocen — sobre los deals correctos — los que el sistema marcó.

**La alerta es el trigger correcto. El contexto es lo que permite actuar.**

Esa distinción me llevó a entender que necesitaba construir dos módulos, no uno. WF-03 resuelve la detección: cuándo actuar. WF-02 resuelve el expediente: con quién estás hablando. Juntos cierran el ciclo.

---

### Módulo 1 — Detección: saber exactamente cuándo un deal se está muriendo

WF-03 corre tres veces por semana: lunes, miércoles y viernes a las 8am.

Cada ejecución revisa los **1,627 deals abiertos** en Pipedrive y evalúa cada uno contra un criterio concreto: ¿cuántos días lleva en esta etapa versus cuántos días tiene permitidos?

Cada etapa tiene su límite calibrado a la realidad del ciclo de Bambu:

| Etapa | Días máximos |
|---|---|
| MQL - Lead Frío | 5 |
| Lead In - BANT | 7 |
| Realizando Propuesta | 7 |
| Propuesta Enviada | 14 |
| Negociaciones | 15 |

El sistema genera cuatro tipos de alerta según el porcentaje del tiempo consumido y si hay actividad registrada en los últimos 7 días:

- **⚠️ Suave** — 60-99% del tiempo, deal con actividad reciente. "Revisa antes de que escale."
- **🔴 Urgente** — 100% del tiempo consumido, o 60-99% sin actividad. "Contacta hoy."
- **🚨 Escalación** — 120% del tiempo consumido. "El deal está en zona crítica."
- **💤 Inactividad** — Dentro del límite de tiempo pero 7+ días sin actividad registrada. "El deal existe. Nadie lo está tocando."

Las alertas críticas — urgente y escalación — llegan en cada run, sin excepción. Las suaves e inactividad rotan: cada deal se distribuye en un bucket por `deal_id % 3`, así cada rep recibe sus alertas no críticas exactamente una vez por semana, no tres.

Eso resuelve la fatiga de alertas sin sacrificar cobertura.

Cuando presenté el sistema al equipo, la primera pregunta fue: ¿por qué el CGO recibe copia de las urgentes y escalaciones? La respuesta corta: visibilidad sin micromanagement. Cuando un deal llega a escalación ya excedió el 120% de su tiempo en etapa — a esa altura necesito saberlo antes de que aparezca en el forecast sin contexto. Recibir esa copia me da 30 segundos de lectura el lunes a las 8am que valen más que 20 minutos de conversación sin datos. Las suaves van solo al rep — son señales tempranas que el rep debe resolver solo.

---

### Lo que el sistema descubrió sin que yo se lo pidiera

Cuando activé WF-03, encontré algo que nadie había mapeado.

El sistema cruza el rol de cada rep contra la etapa donde tiene deals asignados. Y detectó situaciones que existían silenciosamente: Pre Sales con deals en Negociaciones. BDRs con deals en MQL.

No es un error de nadie. El pipeline creció rápido y la asignación de deals no siempre siguió la estructura de roles que construimos. Pero el costo operativo era real: un Pre Sales en Negociaciones no tiene el entrenamiento ni el mandato para cerrar. Un BDR en MQL está usando tiempo de cierre en calificación.

El sistema genera una alerta de mismatch que llega **solo al CGO**, no al rep: "Este deal está en la etapa incorrecta para el rol del propietario. Evalúa si reasignar."

Sin drama. Sin acusación. Solo el flag.

**Eso no lo diseñé intencionalmente.** Fue el insight que emergió solo cuando pusiste estructura encima de un pipeline que había crecido sin ella durante meses.

---

### Módulo 2 — Contexto: el expediente que hace que la alerta valga algo

El enrichment resuelve la otra mitad del problema.

La idea es directa: cuando un deal entra al pipeline — o cuando sube de score en WF-01 — el sistema consulta automáticamente fuentes externas para construir un perfil del prospecto antes de que el rep tenga que hacerlo manualmente.

Lo que busca y escribe de vuelta a Pipedrive:
- Tamaño real de la empresa (empleados, ingresos estimados)
- Industria y vertical específica
- Cargo exacto del decisor con quien hay contacto registrado
- Perfil de LinkedIn del contacto principal
- Tecnologías que usa la empresa — señal de fit con los servicios de Bambu

Así, cuando WF-03 dispara una alerta, el rep no abre un deal vacío. Abre un deal con contexto suficiente para actuar en la primera llamada — sin 35 minutos de investigación previa.

WF-02 está en la fase final de construcción. Es el módulo más complejo del stack porque combina múltiples APIs externas con manejo de rate limits y deduplicación. La primera versión funcional llega en las próximas semanas. Pero la lógica ya está definida y el valor es claro: **la alerta correcta pierde la mitad de su fuerza si no va acompañada del expediente correcto**.

---

### Tres semanas después: lo que cambió en el piso de ventas

Tres cosas concretas:

**Las conversaciones del lunes empiezan diferente.**
Cuando pregunto por un deal en la junta, el rep ya recibió la alerta esa mañana a las 8am. No hay "lo veo bien" — hay "llegué el lunes con el deal marcado en rojo y ya lo contacté". El dato ya estaba antes de que yo abriera la boca.

**Ningún deal urgente pasa desapercibido más de 3 días.**
El schedule L/X/V garantiza que cualquier escalación se detecta y se notifica antes del siguiente corte. Con 1,627 deals en el pipeline, monitorear eso manualmente no es opción.

**El log de alertas reveló el cuello de botella real.**
El Google Sheet que registra cada alerta por etapa, rep y tipo se convirtió en el mapa que nunca tuvimos. Después de cuatro semanas de datos, el patrón fue claro: la etapa Propuesta Enviada concentra la mayor proporción de escalaciones. No porque los BDRs estén fallando — sino porque el tiempo máximo de 14 días es demasiado optimista para el ciclo real de decisión de nuestros clientes. Ese dato va a calibrar el sistema, no a penalizar al equipo.

---

### Los cuatro workflows que forman una sola capa de inteligencia

Si lo pongo en contexto con los módulos anteriores:

- **WF-01** — qué deals priorizar (score de 0 a 100)
- **WF-02** — con quién estás hablando (expediente del prospecto)
- **WF-03** — cuándo actuar (alertas en tiempo real)
- **WF-08** — cómo estuvo el rep esta semana (coaching digest del viernes)

Los cuatro forman una capa de inteligencia operativa completa. Sin ella, el CRM es un repositorio de datos. Con ella, el CRM es un sistema que genera acción.

---

### Lo que viene en EP5

WF-03 detecta deals activos en riesgo. WF-08 da coaching sobre la semana pasada. WF-01 prioriza qué trabajar hoy.

Pero ninguno de estos workflows toca una categoría específica de deals: los que técnicamente siguen abiertos en el CRM pero llevan semanas — o meses — sin interacción real. Los que no están muriendo. Ya están muertos, en silencio.

En Bambu teníamos más de **300 deals en esa situación**.

Escribirles como si el tiempo no hubiera pasado no funciona. Ignorarlos tampoco — representan pipeline real y relaciones que costó construir. Necesitaba un sistema que reconociera el gap y lo usara a favor de la conversación.

Eso es WF-11 — Re-engagement. Es el tema del próximo artículo.

---

*¿Cuántos deals en tu CRM están "abiertos" pero en realidad llevan meses sin movimiento real — y nadie lo sabe porque no hay sistema que lo detecte?*

*La guía visual con el mapa completo de los 12 módulos: **[bambu-sales-automatization.vercel.app](https://bambu-sales-automatization.vercel.app/)***

*El siguiente artículo: cómo escribirle a un prospecto que no te ha respondido en meses — sin parecer desesperado.*

---

**Roberto Esparza**
CGO · Bambu Tech Services
*Construyendo el área comercial del futuro, desde México.*

*[EP1 — La arquitectura completa →](https://www.linkedin.com/pulse/ep-1-constru%C3%AD-un-sistema-de-automatizaci%C3%B3n-comercial-roberto-esparza-nxdfc/)*
*[EP2 — Lead Scoring →](https://www.linkedin.com/pulse/ep2-lead-scoring-c%C3%B3mo-dej%C3%A9-de-adivinar-y-empec%C3%A9-saber-roberto-esparza-m6u5c/)*
*[EP3 — Coaching Digest →](https://www.linkedin.com/pulse/ep3-coaching-autom%C3%A1tico-c%C3%B3mo-garantic%C3%A9-que-cada-rep-reciba-esparza-hwkhc/)*
