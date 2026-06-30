# EP7 — El cierre: nueve meses, nueve workflows, y la verdad que cambió cómo pienso en liderazgo comercial.

**Serie:** Automatización Comercial con IA en Bambu Tech Services
**Episodio:** 7 de 7 — Cierre de serie
**Estado:** ✅ Publicado
**URL:** https://www.linkedin.com/pulse/ep7-el-cierre-nueve-meses-workflows-y-la-verdad-que-cambi%C3%B3-esparza-f5yff/
**Workflows cubiertos:** Retrospectiva completa + WF-12 (Pre-Meeting Intel) + WF-02 (Enrichment)

---

## El cierre: nueve meses, nueve workflows, y la verdad que cambió cómo pienso en liderazgo comercial.

*Construí el sistema para resolver un problema de pipeline. El sistema me reveló algo diferente.*

---

*Este es el séptimo y último artículo de la serie "Automatización Comercial con IA en Bambu Tech Services". Si llegaste aquí directo, empieza por el [EP1](https://www.linkedin.com/pulse/ep-1-constru%C3%AD-un-sistema-de-automatizaci%C3%B3n-comercial-roberto-esparza-nxdfc/). Los episodios anteriores: [EP2](https://www.linkedin.com/pulse/ep2-lead-scoring-c%C3%B3mo-dej%C3%A9-de-adivinar-y-empec%C3%A9-saber-roberto-esparza-m6u5c/), [EP3](https://www.linkedin.com/pulse/ep3-coaching-autom%C3%A1tico-c%C3%B3mo-garantic%C3%A9-que-cada-rep-reciba-esparza-hwkhc/), [EP4](https://www.linkedin.com/pulse/ep4-alerta-contexto-los-dos-sistemas-que-hacen-ning%C3%BAn-esparza-jzhtc/), [EP5](https://www.linkedin.com/pulse/ep5-re-engagement-c%C3%B3mo-escribirle-un-prospecto-que-te-roberto-esparza-imidc/), [EP6](https://www.linkedin.com/pulse/ep-6-inteligencia-campa%C3%B1a-el-ciclo-completo-que-va-de-esparza-fxz2c/).*

---

Empecé esta serie con un problema concreto: **1,627 deals abiertos en el CRM, win rate del 13%, ciclo de 92 días, y ninguna visibilidad real sobre qué estaba pasando en el pipeline**.

Nueve meses después, el número que más me importa no es ninguno de esos. Son dos: **$65 USD** y **$650 USD**.

El primero es el costo mensual de toda la infraestructura de automatización que hoy opera el sistema comercial — n8n, Claude, Lusha, Tavily, Brevo. El segundo es ese mismo número más el CRM de 15 usuarios que ya teníamos antes de empezar.

No el costo del proyecto. El costo mensual recurrente de nueve sistemas que trabajan mientras el equipo trabaja en lo que importa.

Sin esos números no hay perspectiva real para lo que viene.

---

### El mapa completo: qué hace cada pieza del sistema

**WF-01** califica cada lead que entra en tiempo real — score de 0 a 100, clasificación en cuatro niveles, enriquecimiento automático de datos firmográficos con Lusha. El decay diario ajusta el score cuando un lead deja de responder.

**WF-03** monitorea lunes, miércoles y viernes si hay deals que se están estancando — alerta al rep dueño con contexto del deal, no solo con el nombre de la empresa.

**WF-08** genera diez coaching cards individuales cada viernes a las 5pm — una por rep, con sus métricas reales de la semana y una recomendación accionable. Un resumen ejecutivo llega al CGO.

**WF-10A** envía inteligencia de ocho verticales al equipo completo tres veces por semana, a las 6:30am, antes de que empiece la mañana. Máximo 7 noticias. Costo semanal: menos de $3 USD.

**WF-10B** convierte un brief aprobado en campaña de email lista para lanzar a 1,443 contactos en menos de 5 minutos — sin abrir ninguna herramienta de email marketing.

**WF-10C** captura y califica leads inbound desde formulario web y WhatsApp, sin intervención humana.

**WF-11** identifica cada lunes los deals dormidos que valen la pena reactivar, genera los emails personalizados, y los envía cuando los apruebo. Primer batch: 174 emails, cero fallos.

Más los sub-workflows que operan en paralelo: el decay diario de WF-01, el engagement handler de WF-10B que escucha hot signals en tiempo real.

El costo mensual de toda la infraestructura de automatización — n8n, Claude API, Lusha, Tavily, Brevo — es **menos de $65 USD al mes**. Sobre un CRM de 15 usuarios que ya existía.

El stack completo, CRM incluido: **menos de $650 USD al mes**.

El equivalente en headcount para ejecutar manualmente lo que estos sistemas hacen: entre dos y tres personas de tiempo completo. Entre $40,000 y $70,000 MXN al mes.

---

### Tres cosas que haría diferente si empezara hoy

**1. Empezar por el enriquecimiento.**

WF-02 — la capa de datos firmográficos con Apollo.io y Clay — debió ser el primer workflow, no uno de los últimos. Construí el scoring antes de tener los campos limpios. La calificación es tan buena como la calidad de los datos que la alimentan. Todo lo que vino después hubiera funcionado mejor con esa base desde el inicio.

**2. Lanzar pronto, sin esperar el caso edge perfecto.**

Tardé semanas en activar WF-03 porque quería cubrir todos los escenarios posibles. La primera semana en producción me enseñó más que dos meses de diseño en papel. Los casos edge que me preocupaban no ocurrieron. Los problemas reales que surgieron no los había anticipado. Siempre conviene aprender con datos reales antes que con suposiciones.

**3. Documentar las decisiones de diseño desde el inicio.**

Por qué BANT vale 40 puntos y no 30. Por qué el re-engagement tiene cooldown de 60 días. Por qué el brief de WF-10A tiene máximo 7 noticias. Tomé esas decisiones con contexto — seis meses después son difíciles de reconstruir. Esta serie existe en parte porque necesitaba documentarlas antes de olvidarlas.

---

### Lo que el sistema reveló que no busqué

Cuando WF-03 llevaba tres semanas activo, algo pasó que no anticipaba: pude ver, con nombres y números, cuáles deals estaban dormidos — no porque los reps fueran ineficientes, sino porque nadie les había dicho cuáles seguir.

Cuando WF-08 empezó a entregar coaching cards semanales, las conversaciones de desempeño dejaron de ser sobre percepciones. Se volvieron sobre datos específicos.

Cuando WF-11 generó la primera lista de re-engagement, vi deals con $2.4M MXN en valor que llevaban más de 80 días sin contacto. No porque el rep hubiera decidido abandonarlos — sino porque nada los hacía visibles.

**El 80% de los problemas comerciales que creía que eran de personas eran en realidad problemas de información.**

Los reps no seguían los deals porque no sabían cuáles seguir — no porque no quisieran. Los deals no avanzaban porque nadie detectaba cuándo se estancaban — no porque el equipo fuera ineficiente. Las campañas no salían porque armarlas tomaba tiempo que no existía — no porque no hubiera qué decir.

Esa es la verdad que tardé más en aceptar, y la que más cambió cómo pienso en liderazgo comercial.

Un sistema que hace visible lo que antes era invisible no reemplaza el juicio comercial. Lo libera para ejercerse donde importa.

---

### Lo que sigue construyendo

Hay dos sistemas más en diseño.

**WF-12** revisa los calendarios de los Pre Sales cada tarde y genera un brief de inteligencia de cuenta para cada reunión del día siguiente: perfil de la empresa, noticias relevantes de esa semana, ángulos de venta que conectan el contexto con los servicios de Bambu, tres preguntas de apertura calibradas para ese prospecto. El brief llega por email a las 6pm. Costo por brief: menos de $0.10 USD. El tiempo que toma preparar esa misma información manualmente: entre 30 y 45 minutos por cuenta.

**WF-02** completa los campos vacíos del CRM — industria, tamaño de empresa, tecnología, cargo del contacto — conectando con Apollo.io y Clay. No tiene un insight narrativo atractivo. Pero es la infraestructura que hace que todos los workflows anteriores funcionen mejor — y que debió existir desde el día uno.

Después: análisis de win/loss con IA, un router de WhatsApp que califica leads en conversación, un sistema de referidos automatizado.

Y eventualmente — cuando el sistema tenga suficiente historia — los datos del pipeline van a entrenar algo más interesante que un score de 0 a 100.

Pero eso es otro capítulo.

---

### Lo que cuesta, en números reales

El CRM de 15 usuarios — Pipedrive, que usábamos antes de escribir una sola línea de código — cuesta $585 USD al mes.

La automatización completa que construí encima: **$65 USD adicionales al mes**. n8n para orquestar los nueve workflows. Claude para generar inteligencia, campañas y emails. Lusha para enriquecer cada lead que entra. Tavily y Brevo en plan gratuito.

Stack completo, todo incluido: **menos de $650 USD al mes**.

El headcount para hacer manualmente lo que esos nueve sistemas hacen: entre dos y tres personas de tiempo completo. Entre $40,000 y $70,000 MXN al mes.

La automatización cuesta menos del 3% de la alternativa humana. No es una proyección. Es el recibo de este mes.

---

No soy ingeniero. No escribo software de producción. Aprendí lo suficiente de JavaScript y JSON para que n8n hiciera lo que necesitaba, y usé Claude para lo que no sabía cómo resolver solo.

Construí esto porque el problema era mío.

El equipo que tengo es bueno. El sistema hace que ese equipo trabaje con más información, más contexto, y menos fricción operativa.

El CRM ya costaba $585. La diferencia que cambió el sistema comercial completo costó $65 más.

Eso es todo lo que tuve que decidir.

---

*¿Hay un problema de información detrás de algún problema de personas en tu equipo comercial?*

*La guía visual con el mapa completo del sistema: **[bambu-sales-automatization.vercel.app](https://bambu-sales-automatization.vercel.app/)***

---

**Roberto Esparza**
CGO · Bambu Tech Services
*Construyendo el área comercial del futuro, desde México.*

*[EP1 — La arquitectura completa →](https://www.linkedin.com/pulse/ep-1-constru%C3%AD-un-sistema-de-automatizaci%C3%B3n-comercial-roberto-esparza-nxdfc/)*
*[EP2 — Lead Scoring →](https://www.linkedin.com/pulse/ep2-lead-scoring-c%C3%B3mo-dej%C3%A9-de-adivinar-y-empec%C3%A9-saber-roberto-esparza-m6u5c/)*
*[EP3 — Coaching Digest →](https://www.linkedin.com/pulse/ep3-coaching-autom%C3%A1tico-c%C3%B3mo-garantic%C3%A9-que-cada-rep-reciba-esparza-hwkhc/)*
*[EP4 — Deal Alerts →](https://www.linkedin.com/pulse/ep4-alerta-contexto-los-dos-sistemas-que-hacen-ning%C3%BAn-esparza-jzhtc/)*
*[EP5 — Re-engagement →](https://www.linkedin.com/pulse/ep5-re-engagement-c%C3%B3mo-escribirle-un-prospecto-que-te-roberto-esparza-imidc/)*
*[EP6 — Intel Brief + Campañas →](https://www.linkedin.com/pulse/ep-6-inteligencia-campa%C3%B1a-el-ciclo-completo-que-va-de-esparza-fxz2c/)*
