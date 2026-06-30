# EP6 — Inteligencia + campaña: el ciclo completo que va de una noticia del mercado a 1,443 contactos en menos de 5 minutos.

**Serie:** Automatización Comercial con IA en Bambu Tech Services
**Episodio:** 6 de 7 — Bloque Inteligencia
**Estado:** ✅ Publicado
**URL:** https://www.linkedin.com/pulse/ep-6-inteligencia-campa%C3%B1a-el-ciclo-completo-que-va-de-esparza-fxz2c/
**Workflows cubiertos:** WF-10A (Intel Brief Generator) + WF-10B (Campaign Creator)

---

## Inteligencia + campaña: el ciclo completo que va de una noticia del mercado a 1,443 contactos en menos de 5 minutos.

*Inteligencia sin acción es solo lectura. Acción sin inteligencia es spam. Construí el ciclo completo.*

---

*Este es el sexto artículo de la serie "Automatización Comercial con IA en Bambu Tech Services". Si llegaste aquí directo, empieza por el [EP1 — la arquitectura completa](https://www.linkedin.com/pulse/ep-1-constru%C3%AD-un-sistema-de-automatizaci%C3%B3n-comercial-roberto-esparza-nxdfc/). Los episodios anteriores: [EP2](https://www.linkedin.com/pulse/ep2-lead-scoring-c%C3%B3mo-dej%C3%A9-de-adivinar-y-empec%C3%A9-saber-roberto-esparza-m6u5c/), [EP3](https://www.linkedin.com/pulse/ep3-coaching-autom%C3%A1tico-c%C3%B3mo-garantic%C3%A9-que-cada-rep-reciba-esparza-hwkhc/), [EP4](https://www.linkedin.com/pulse/ep4-alerta-contexto-los-dos-sistemas-que-hacen-ning%C3%BAn-esparza-jzhtc/), [EP5](https://www.linkedin.com/pulse/ep5-re-engagement-c%C3%B3mo-escribirle-un-prospecto-que-te-roberto-esparza-imidc/).*

---

El EP5 terminó con una observación: todos los workflows que había construido hasta ese punto — scoring, alertas, coaching, re-engagement — trabajan sobre lo que ya existe en el CRM.

Son sistemas reactivos. Buenos sistemas reactivos. Pero reactivos al fin.

El siguiente problema era diferente: **¿cómo genera el equipo demanda nueva — no gestionando el pipeline existente, sino llegando primero a los prospectos correctos con el mensaje correcto, antes de que ellos levanten la mano?**

La respuesta llega tres veces por semana, a las 6:30am.

---

### El error que separa a los equipos que hacen outbound de los que hacen ruido

Hay dos formas de hacer outbound. La mayoría de los equipos hace una o la otra. Muy pocos hacen las dos, conectadas.

**La primera:** investigar el mercado, entender qué está pasando en el sector del prospecto, construir un ángulo de conversación relevante. Inteligencia real. El problema es que sin ejecución eficiente termina en un documento compartido que nadie abre, o en conversaciones individuales del tipo "vi esta noticia, pensé en ti" — escala cero.

**La segunda:** segmentar la base de contactos y enviar campañas de email. Ejecución. El problema es que sin contexto el mensaje llega genérico, y un mensaje genérico a 1,400 personas no abre conversaciones — las cierra antes de empezar.

**La trampa real no es elegir entre inteligencia y ejecución. Es creer que son dos procesos separados.**

Lo que construí conecta los dos en un solo ciclo automatizado.

---

### Cómo funciona WF-10A: el brief que llega antes del desayuno

Los lunes, miércoles y viernes a las 6:30am, el sistema ejecuta una búsqueda simultánea en 8 verticales que coinciden con el ICP de Bambu: Manufactura y Nearshoring, Financiero y Fintech, Retail, Ciberseguridad y Cloud, Salud y Farmacias, Gobierno y Seguridad Pública, Logística, y Servicios.

Cada búsqueda usa Tavily — un motor optimizado para IA — consultando fuentes especializadas por sector. Nada de redes sociales. Solo medios con cobertura relevante para nivel C en México.

Los resultados pasan a Claude con un prompt específico. No le pido que resuma noticias. Le pido que actúe como analista comercial de Bambu: para cada noticia que pase el filtro de relevancia comercial, genera el resumen ejecutivo en dos oraciones, el cargo del decisor que debería leer esto, el ángulo de apertura que conecta la noticia con un servicio específico de Bambu, y el nivel de urgencia.

El brief resultante llega a los 18 miembros del equipo comercial antes de que empiece la mañana. Máximo 5-7 noticias — calidad sobre cantidad.

Hay un mecanismo de deduplicación: las URLs ya enviadas en los últimos 7 días quedan bloqueadas. El equipo no recibe la misma noticia dos veces en la misma semana.

Costo del sistema por semana: menos de $3 USD en búsquedas y tokens.

---

### La decisión más importante: dónde poner al humano en el loop

Cuando el brief llega a las 6:30am, yo lo reviso. Si hay una noticia con potencial de campaña — alta urgencia, vertical activo en el pipeline, ángulo que conecta bien con un segmento específico — cambio el estado del brief en Google Sheets de "generado" a "aprobado".

Ahí arranca WF-10B.

Podría haber automatizado completamente ese paso. No lo hice. Y la decisión fue deliberada.

No toda noticia relevante debe convertirse en campaña. Hay momentos donde el mercado está saturado de comunicaciones similares y agregar una más daña más de lo que ayuda. Hay semanas donde el equipo ya tiene suficiente actividad entrante y una campaña de salida crea fricción. Hay contexto competitivo que el sistema no conoce.

Ese juicio — ¿esto merece llegar a 1,443 contactos esta semana? — es mío. El sistema me da la información para tomarlo. La ejecución la hace solo.

Treinta segundos de decisión humana. Todo lo demás es automático.

---

### Cómo funciona WF-10B: de la noticia a la campaña en menos de 5 minutos

En cuanto el brief queda "aprobado" en el Sheet, WF-10B se activa.

El sistema toma el brief y le pide a Claude que genere el copy de la campaña de email. Con reglas específicas que aprendí a calibrar a lo largo de semanas: tono de thought leadership externo — no vendedor de servicios —, sin lenguaje corporativo, con un insight del sector como primera línea, con una sola llamada a acción.

El email que genera tiene un diseño deliberadamente diferente al outbound estándar: fondo oscuro, tipografía verde, estructura de newsletter de inteligencia, no de propuesta comercial. La razón es simple: si se ve como todos los demás emails de ventas que recibe el prospecto, se comporta como ellos.

Con el copy aprobado, el sistema crea la campaña directamente en Brevo, la segmenta con los **1,443 contactos campañables** identificados previamente en el CRM por vertical y etapa, y me envía un email con el link directo para revisar y activar el envío.

Desde que apruebo el brief en Sheets hasta que tengo la campaña lista para lanzar: menos de 5 minutos. Sin abrir ninguna herramienta de email marketing. Sin copiar texto. Sin configurar segmentos manualmente.

---

### El insight que no anticipaba

Cuando el sistema llevaba tres semanas activo, noté algo que cambió cómo pienso en outbound.

El bottleneck ya no era crear la campaña. Era decidir si crearla.

Antes de WF-10B, la decisión implícita era: *"¿vale la pena el trabajo de armar una campaña sobre esto?"* Y como el trabajo era real — redactar, diseñar, segmentar, enviar — la respuesta era frecuentemente no. La inercia ganaba.

Con el sistema activo, la decisión cambió: *"¿vale la pena que 1,443 personas reciban esto esta semana?"* Misma pregunta de fondo, pero sin la fricción operativa en el medio.

**Quitar el costo de ejecución hizo visible el costo de no ejecutar.**

Los briefs que no convierto en campaña ahora son una decisión consciente, no una omisión por falta de tiempo. Esa diferencia, sostenida en el tiempo, cambia completamente el ritmo de outbound del equipo.

---

### El sistema completo del pipeline ya estaba resuelto

Con WF-10A y WF-10B en producción, el sistema tiene cobertura completa del ciclo comercial de Bambu:

Generamos demanda desde inteligencia de mercado (WF-10A/B). Calificamos los leads que entran (WF-01). Alertamos cuando un deal activo se estanca (WF-03). Coacheamos al equipo semanalmente (WF-08). Reactivamos lo que estaba muerto (WF-11).

Lo que faltaba era la capa más temprana del ciclo: conocer mejor a la cuenta antes de que empiece cualquier conversación. Eso es lo que describe el último artículo.

---

### Lo que viene en EP7

Hay un momento en ventas B2B que define si la relación avanza o se queda en conversación de superficie: la primera junta de descubrimiento. Esa donde el prospecto decide si el interlocutor entiende su negocio o solo entiende su propio portafolio.

Preparar esa junta bien requiere investigación. Investigación toma tiempo. Tiempo es el recurso más escaso en un equipo comercial.

El último artículo cierra la serie con eso: los dos sistemas que hacen que ninguna conversación importante empiece desde cero.

---

*¿Tu outbound parte de inteligencia real del sector — o de una lista y un template?*

*La guía visual con el mapa completo del sistema: **[bambu-sales-automatization.vercel.app](https://bambu-sales-automatization.vercel.app/)***

*El siguiente artículo: el cierre de la serie — cómo ninguna conversación importante empieza ya desde cero.*

---

**Roberto Esparza**
CGO · Bambu Tech Services
*Construyendo el área comercial del futuro, desde México.*

*[EP1 — La arquitectura completa →](https://www.linkedin.com/pulse/ep-1-constru%C3%AD-un-sistema-de-automatizaci%C3%B3n-comercial-roberto-esparza-nxdfc/)*
*[EP2 — Lead Scoring →](https://www.linkedin.com/pulse/ep2-lead-scoring-c%C3%B3mo-dej%C3%A9-de-adivinar-y-empec%C3%A9-saber-roberto-esparza-m6u5c/)*
*[EP3 — Coaching Digest →](https://www.linkedin.com/pulse/ep3-coaching-autom%C3%A1tico-c%C3%B3mo-garantic%C3%A9-que-cada-rep-reciba-esparza-hwkhc/)*
*[EP4 — Deal Alerts + Enrichment →](https://www.linkedin.com/pulse/ep4-alerta-contexto-los-dos-sistemas-que-hacen-ning%C3%BAn-esparza-jzhtc/)*
*[EP5 — Re-engagement →](https://www.linkedin.com/pulse/ep5-re-engagement-c%C3%B3mo-escribirle-un-prospecto-que-te-roberto-esparza-imidc/)*
