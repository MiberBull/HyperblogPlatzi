# EP5 — Re-engagement: cómo escribirle a un prospecto que no te ha respondido en meses — sin parecer desesperado.

**Serie:** Automatización Comercial con IA en Bambu Tech Services
**Episodio:** 5 de 7 — Bloque Ventas
**Estado:** ✅ Listo para publicar
**Workflow cubierto:** WF-11 (Re-engagement Engine)

---

## Re-engagement: cómo escribirle a un prospecto que no te ha respondido en meses — sin parecer desesperado.

*300 deals "abiertos" en el CRM. Ninguno había tenido actividad en más de un mes. El sistema los contaba como oportunidades. En la práctica, ya estaban muertos.*

---

*Este es el quinto artículo de la serie "Automatización Comercial con IA en Bambu Tech Services". Si llegaste aquí directo, empieza por el [EP1 — la arquitectura completa](https://www.linkedin.com/pulse/ep-1-constru%C3%AD-un-sistema-de-automatizaci%C3%B3n-comercial-roberto-esparza-nxdfc/). Los episodios anteriores: [EP2](https://www.linkedin.com/pulse/ep2-lead-scoring-c%C3%B3mo-dej%C3%A9-de-adivinar-y-empec%C3%A9-saber-roberto-esparza-m6u5c/), [EP3](https://www.linkedin.com/pulse/ep3-coaching-autom%C3%A1tico-c%C3%B3mo-garantic%C3%A9-que-cada-rep-reciba-esparza-hwkhc/), [EP4](https://www.linkedin.com/pulse/ep4-alerta-contexto-los-dos-sistemas-que-hacen-ning%C3%BAn-esparza-jzhtc/).*

---

El EP4 terminó hablando de deals activos en riesgo — los que el sistema detecta antes de que mueran.

Este artículo es sobre los que ya murieron.

Cuando construí WF-03 y empecé a ver el pipeline con claridad, encontré una categoría de deals que ninguno de los workflows anteriores tocaba: deals técnicamente abiertos en Pipedrive, con propietario asignado, contando en el forecast — pero sin ninguna actividad registrada en 30, 60, o incluso 90 días.

No estaban muriendo. Ya estaban muertos. En silencio.

En Bambu teníamos más de **300 de esos deals**.

---

### El error que comete casi todo el mundo con los prospectos dormidos

La reacción instintiva cuando un prospecto lleva meses sin responder es escribirle como si el tiempo no hubiera pasado.

"Espero que estés bien. Me permito escribirte de nuevo para dar seguimiento a nuestra conversación anterior..."

Ese email destruye la credibilidad antes del segundo párrafo. El prospecto sabe que llevan meses sin hablar. Tú sabes que llevan meses sin hablar. Pretender que no pasó nada no genera confianza — genera incomodidad.

El segundo error es el opuesto: ignorar los deals dormidos porque "si no respondieron, no les interesa". Ese razonamiento tira al piso pipeline real y relaciones que costó meses construir.

**La pregunta correcta no es "¿les escribo o no les escribo?"**

Es: ¿cuáles de estos 300 deals merecen el esfuerzo de re-engagement, con qué mensaje, y quién toma esa decisión?

---

### La decisión más importante del sistema: mantener al humano en el loop

Antes de explicar cómo funciona WF-11, quiero explicar por qué no lo automaticé completamente.

Tenía todos los elementos para hacerlo: el deal, el contacto, el email generado por Claude. Podría haberlo configurado para que el email saliera automáticamente cada lunes.

No lo hice. Y fue una decisión consciente.

El re-engagement no es una alerta de pipeline. Es una conversación que reinicia. El tono, el momento, el ángulo — eso tiene implicaciones comerciales que van más allá de si un deal cumple un criterio de tiempo.

¿Está ese prospecto en un proceso de compra activo con otro proveedor? ¿Hubo una conversación offline que el CRM no capturó? ¿Es un cliente que ya cerró con nosotros en otro deal y está mapeado en otra parte del sistema?

El sistema no sabe eso. Yo sí.

Lo que construí fue un sistema que hace el trabajo pesado — detectar, priorizar, redactar — y me entrega una cola de decisiones el lunes en la mañana. Yo apruebo o descarto. El email sale solo cuando yo digo que sí.

---

### Cómo funciona WF-11 en dos fases

**Fase 1 — Descubrimiento (lunes 8am)**

El workflow revisa los 1,627 deals abiertos en Pipedrive y filtra los elegibles para re-engagement con cuatro criterios:

1. Estar en una etapa temprana del funnel (MQL, Lead In-BANT, Presentar Credenciales, Re-contactar)
2. Tener un email de contacto registrado
3. Llevar al menos **30 días sin actividad**
4. No haber sido re-contactado en los últimos **60 días** (cooldown)

Los deals que pasan el filtro se priorizan por lead score descendente y valor del deal — los que más valen y mejor califican van primero.

Para cada deal elegible, el sistema llama a Claude y le pide que genere un email de re-engagement. Con reglas muy específicas.

**Fase 2 — Aprobación y envío (trigger manual)**

Los emails generados llegan a un Google Sheet con estado "pendiente". Yo los reviso, descarto los que no aplican, y cambio a "aprobado" los que sí.

En cuanto aparece un "aprobado", el sistema dispara automáticamente: envía el email al contacto, manda copia al rep asignado (con Reply-To al rep para que la respuesta llegue a quien corresponde), registra la actividad en Pipedrive, y actualiza el campo de fecha de último re-engagement en el deal.

El loop completo: sistema detecta, Claude redacta, yo decido, sistema ejecuta.

---

### Las 6 reglas que le di a Claude para escribir el email

Esta fue la parte que más tardé en calibrar.

El modelo por default tiende a escribir emails corporativos — educados, largos, llenos de frases que suenan a plantilla. Eso era exactamente lo que quería evitar.

Las reglas que quedaron en el prompt son estas:

1. Asunto: máximo 8 palabras, sin signos de exclamación
2. Cuerpo: máximo 100 palabras
3. Tono: directo, colega-a-colega, sin floritura corporativa
4. Primera línea: menciona la empresa o el cargo del contacto
5. Cierre: una sola pregunta abierta y concreta
6. Prohibido usar: "espero que estés bien", "me permito escribirte", "soluciones innovadoras", "potenciar", "sinergia"

La regla 6 existe porque esas frases son señales inmediatas de un email masivo. Si el prospecto las lee, sabe que no le escribieron a él — le escribieron a una lista. Y tiene razón.

Un email que llega con el nombre de la empresa en la primera línea, con 80 palabras, sin exclamaciones, con una pregunta que requiere respuesta de una sola oración — eso no parece automatizado. Aunque lo sea.

---

### Lo que la priorización reveló sobre los 300 deals

Cuando el sistema corrió por primera vez y ordenó los deals por score y valor, el resultado fue incómodo.

De los 300+ deals dormidos, menos de 70 tenían un lead score suficiente y un valor de deal que justificara el esfuerzo de re-engagement. El resto — más de 200 deals — eran leads que nunca calificaron realmente, que entraron al pipeline por volumen y nunca tuvieron señales de intención real.

No es que el equipo haya fallado con esos 200. Es que nunca debieron estar ahí como oportunidades activas.

**El sistema no solo me dio una cola de re-engagement. Me dio un mapa de limpieza del pipeline.**

Los 70 que sí calificaron fueron a la cola. Los 200+ restantes son candidatos a cerrar como "perdido" — una decisión que requiere criterio humano pero que el sistema ahora hace visible en lugar de invisible.

---

### Tres semanas con WF-11 activo

La primera semana, aprobé 22 de los 50 deals en cola. Los 28 descartados tenían contexto que el sistema no conocía — clientes que ya habían cerrado por otra vía, prospectos con los que hubo una conversación offline que nunca se registró, deals duplicados.

Esos 28 descartados solos justificaron tener la aprobación humana.

De los 22 enviados, 6 respondieron en los primeros 3 días. No cerraron inmediatamente — el re-engagement no es magia. Pero 6 conversaciones reiniciadas en una semana, sobre deals que llevaban meses muertos, con cero tiempo de redacción de mi parte, es un resultado que antes simplemente no existía.

El costo del sistema por semana: menos de 9 pesos en tokens de Claude para 50 emails generados.

---

### Dónde encaja en el sistema completo

WF-03 detecta los deals activos que se están muriendo.
WF-11 revive los que ya murieron.

Los dos juntos cubren el ciclo completo del pipeline existente: nada se pierde en silencio porque el sistema no lo ve, y nada se escapa por inactividad porque el sistema no actúa.

Lo que ninguno de los dos hace: generar inteligencia sobre lo que está pasando en el mercado de mis prospectos — antes de que ellos lo mencionen. Para eso construí algo diferente.

---

### Lo que viene en EP6

El re-engagement y las alertas son reactivos. Responden a señales que ya existen en el CRM.

El siguiente problema era diferente: **¿cómo llega el equipo comercial a una junta con contexto fresco del sector del prospecto — sin que nadie haya pasado tiempo investigando?**

La respuesta llega los lunes, miércoles y viernes a las 6:30am. Son dos sistemas que trabajan juntos: uno que convierte noticias del mercado en inteligencia comercial accionable, y otro que usa esa inteligencia para lanzar campañas sin intervención manual.

Eso es lo que cubro en el próximo artículo.

---

*¿Tienes deals dormidos en tu CRM que técnicamente siguen "abiertos" — y nadie sabe si seguirlos o cerrarlos?*

*La guía visual con el mapa completo de los 12 módulos: **[bambu-sales-automatization.vercel.app](https://bambu-sales-automatization.vercel.app/)***

*El siguiente artículo: inteligencia de mercado automática + campañas sin intervención manual.*

---

**Roberto Esparza**
CGO · Bambu Tech Services
*Construyendo el área comercial del futuro, desde México.*

*[EP1 — La arquitectura completa →](https://www.linkedin.com/pulse/ep-1-constru%C3%AD-un-sistema-de-automatizaci%C3%B3n-comercial-roberto-esparza-nxdfc/)*
*[EP2 — Lead Scoring →](https://www.linkedin.com/pulse/ep2-lead-scoring-c%C3%B3mo-dej%C3%A9-de-adivinar-y-empec%C3%A9-saber-roberto-esparza-m6u5c/)*
*[EP3 — Coaching Digest →](https://www.linkedin.com/pulse/ep3-coaching-autom%C3%A1tico-c%C3%B3mo-garantic%C3%A9-que-cada-rep-reciba-esparza-hwkhc/)*
*[EP4 — Deal Alerts + Enrichment →](https://www.linkedin.com/pulse/ep4-alerta-contexto-los-dos-sistemas-que-hacen-ning%C3%BAn-esparza-jzhtc/)*
