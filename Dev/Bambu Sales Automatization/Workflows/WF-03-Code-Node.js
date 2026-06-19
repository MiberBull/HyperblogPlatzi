// ============================================
// WF-03: DEAL STAGE ALERTS & STALL DETECTION
// Bambu Tech Services - Automatizacion Comercial con IA
// ============================================
// Este codigo va en el nodo "Code" de n8n (modo: Run Once for All Items)
// Recibe TODOS los deals (ya paginados por el nodo anterior)
// y genera alertas por email
// ============================================

// ============================================
// SECCION 1: CONFIGURACION
// ============================================

// Stage IDs reales de Pipedrive Bambu (pipeline_id: 1)
// Verificado via API el 2026-04-09
// Campo `roles`: que roles reciben alertas para esa etapa
//   - 'pre_sales': Pre Sales team (MQL -> Taller)
//   - 'bdr': BDR team (Taller -> Calientes)
//   - Stage 3 (Taller Requerimientos) es el punto de traspaso: ambos roles lo cubren
const STAGE_CONFIG = {
  7:  { name: 'Re-contactar / Re-intentar', maxDays: 30, roles: ['pre_sales'] },
  8:  { name: 'MQL - Lead Frio',            maxDays: 5,  roles: ['pre_sales'] },
  1:  { name: 'Lead In - BANT',             maxDays: 7,  roles: ['pre_sales'] },
  2:  { name: 'Presentar Credenciales',     maxDays: 10, roles: ['pre_sales'] },
  3:  { name: 'Taller Requerimientos',      maxDays: 10, roles: ['pre_sales', 'bdr'] },
  4:  { name: 'Realizando Propuesta',       maxDays: 7,  roles: ['bdr'] },
  16: { name: 'Propuesta Enviada',          maxDays: 14, roles: ['bdr'] },
  5:  { name: 'Negociaciones',              maxDays: 15, roles: ['bdr'] },
  9:  { name: 'Calientes',                  maxDays: 10, roles: ['bdr'] },
};

// CGO - Roberto Esparza (user_id: 14406657)
const CGO_EMAIL = 'roberto.esparza@bambu-techservices.com';
const CGO_NAME = 'Roberto Esparza';

// Equipo comercial de Pipedrive Bambu
// Verificado via API el 2026-04-09
// Dominio unificado a bambu-techservices.com el 2026-04-10
// Roles asignados el 2026-04-10:
//   - 'pre_sales': cubre etapas MQL -> Taller Requerimientos (4 personas)
//   - 'bdr': cubre etapas Taller Requerimientos -> Calientes (4 personas)
//   - 'cgo': Roberto, recibe copias de escalaciones y mismatches
//   - 'unassigned': usuarios sin rol formal; sus alertas se envian SOLO al CGO
const SALES_TEAM = {
  // Pre Sales (MQL -> Taller)
  24060159: { name: 'Samantha Rivas',        email: 'samantha.rivas@bambu-techservices.com',  role: 'pre_sales' },
  25431089: { name: 'Vicente Varela',        email: 'vicente.varela@bambu-techservices.com',  role: 'pre_sales' },
  25752795: { name: 'Emilio Mendoza',        email: 'emilio.mendoza@bambu-techservices.com',  role: 'pre_sales' },
  11865784: { name: 'Sofia Santiago',        email: 'sofia@bambu-techservices.com',           role: 'pre_sales' },

  // BDRs (Taller -> Calientes)
  16167654: { name: 'Cecia Lozano',          email: 'cecia.lozano@bambu-techservices.com',     role: 'bdr' },
  23975173: { name: 'Itzel Arias',           email: 'itzel.arias@bambu-techservices.com',      role: 'bdr' },
  25224993: { name: 'Luis Fernando Castro',  email: 'luis.castro@bambu-techservices.com',      role: 'bdr' },
  26082729: { name: 'Victor Villafane',      email: 'victor.villafane@bambu-techservices.com', role: 'bdr' },
  26148685: { name: 'Gabriela Rivero',       email: 'gabriela.rivero@bambu-techservices.com',  role: 'bdr' },
  25898347: { name: 'Nayeli Gomez',          email: 'nayeli.gomez@bambu-techservices.com',     role: 'bdr' },

  // CGO
  14406657: { name: 'Roberto Esparza',       email: 'roberto.esparza@bambu-techservices.com', role: 'cgo' },

  // Pre Sales adicionales
  26438238: { name: 'Harold Bautista',       email: 'harold.bautista@bambu-techservices.com', role: 'pre_sales' },

  // Sin rol formal - alertas se envian solo al CGO como fallback
  1819933:  { name: 'Alonso Santiago',       email: 'alonso@bambu-techservices.com',          role: 'unassigned' },
  24992387: { name: 'Daniel Sanchez',        email: 'daniel.sanchez@bambu-techservices.com',  role: 'unassigned' },
  24699644: { name: 'Jonathan Luna',         email: 'jonathan.luna@bambu-techservices.com',   role: 'unassigned' },
  23841490: { name: 'Jose Mendez',           email: 'jose.mendez@bambu-techservices.com',     role: 'unassigned' },
  23269567: { name: 'Omar',                  email: 'omar@bambu-techservices.com',            role: 'unassigned' },
};

// Dias sin actividad para considerar "inactivo"
// Ajustado de 5 a 7 dias (2026-06-05) para reducir falsos positivos en etapas activas
const INACTIVITY_DAYS = 7;

// Dias en Taller de Requerimientos con owner BDR antes de disparar alerta de traspaso.
// Si un BDR tiene un deal en Stage 3 por mas de este numero de dias,
// se genera alerta de traspaso al BDR + CGO para coordinar el cambio de propietario.
const TALLER_TRASPASO_DAYS = 5;

// Subdominio de Pipedrive
const PIPEDRIVE_DOMAIN = 'bambumobile';

// Limitar alertas para evitar flood de emails
// En la primera ejecucion con 1,600+ deals, la mayoria estara en alerta.
// Este limite previene enviar cientos de emails de golpe.
// Ajustar a 0 para desactivar el limite.
// ROLLOUT: 1 (prueba) -> 10 (semana 1) -> 30 (semana 2) -> 50 (semana 3) -> 100 (full)
const MAX_ALERTS_PER_RUN = 100;

// Excluir etapa "Re-contactar" de alertas?
// Recomendado: true en la primera fase (son deals dormidos que necesitan limpieza manual)
const EXCLUDE_RECONTACTAR = true;

// Rotacion L/X/V de alertas no-criticas para reducir fatiga
// Cuando esta activo:
//   - Escalaciones, urgentes y mismatches: SIEMPRE se envian (en cada run)
//   - Suaves e inactividad: se reparten en 3 buckets por `deal.id % 3`
//       * Bucket 0 -> Lunes
//       * Bucket 1 -> Miercoles
//       * Bucket 2 -> Viernes
//   - Cada deal no-critico se ve 1 vez por semana en lugar de 3
// Sin estado externo: determinista por ID de deal.
// Si un deal sube de prioridad (suave -> urgente), se envia inmediatamente en el siguiente run.
const ROTATION_MODE = true;


// ============================================
// SECCION 2: ESTILOS Y TEMPLATES
// ============================================

const ALERT_CONFIG = {
  suave: {
    emoji: '⚠️',
    label: 'ATENCION',
    bgColor: '#f39c12',
    textColor: '#e67e22',
    action: 'Revisa este deal y toma accion para avanzarlo a la siguiente etapa.',
    sendToCGO: false,
  },
  urgente: {
    emoji: '🔴',
    label: 'URGENTE',
    bgColor: '#e74c3c',
    textColor: '#c0392b',
    action: 'Este deal excedio su tiempo maximo en esta etapa. Contacta al prospecto HOY.',
    sendToCGO: true,
  },
  escalacion: {
    emoji: '🚨',
    label: 'ESCALACION',
    bgColor: '#8e1600',
    textColor: '#8e1600',
    action: 'Atencion CGO requerida. Evaluar si mantener, reasignar o cerrar este deal.',
    sendToCGO: true,
  },
  inactividad: {
    emoji: '💤',
    label: 'SIN ACTIVIDAD',
    bgColor: '#7f8c8d',
    textColor: '#636e72',
    action: 'No hay actividad registrada en este deal. Contacta al prospecto o registra una actividad en Pipedrive.',
    sendToCGO: true,
  },
  traspaso: {
    emoji: '🔄',
    label: 'TRASPASO PENDIENTE',
    bgColor: '#8e44ad',
    textColor: '#6c3483',
    action: 'Este deal lleva más de ' + TALLER_TRASPASO_DAYS + ' días en Taller de Requerimientos con un BDR como propietario. Coordina el cambio de propietario a Pre Sales en Pipedrive.',
    sendToCGO: true,
  },
};


// ============================================
// SECCION 3: LOGICA DE PROCESAMIENTO
// ============================================

const now = new Date();
const alerts = [];

// El nodo anterior (Loop + HTTP Request) acumula todos los deals
// y los pasa como multiples items. Cada item tiene .json.data (array de deals)
// o bien un solo array consolidado.
// Soportamos ambos formatos:
let allDeals = [];
for (const item of $input.all()) {
  const data = item.json.data;
  if (Array.isArray(data)) {
    allDeals = allDeals.concat(data);
  } else if (item.json.id && item.json.stage_id) {
    // Si el item ES un deal directamente
    allDeals.push(item.json);
  }
}

// Helper: Pipedrive a veces devuelve user_id/stage_id como objeto {id, name, ...}
// y a veces como numero. Esta funcion normaliza ambos casos.
function extractId(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'object') return value.id;
  return value;
}

for (const deal of allDeals) {
  const stageId = extractId(deal.stage_id);
  const userId = extractId(deal.user_id);
  const stageConfig = STAGE_CONFIG[stageId];

  // Si el stage no esta en config, lo saltamos
  if (!stageConfig) continue;

  // Excluir "Re-contactar" si esta configurado
  if (EXCLUDE_RECONTACTAR && stageId === 7) continue;

  // --- Calcular dias en etapa actual ---
  const stageChangeTime = new Date(deal.stage_change_time);
  const daysInStage = Math.floor((now - stageChangeTime) / (1000 * 60 * 60 * 24));
  const percentUsed = Math.round((daysInStage / stageConfig.maxDays) * 100);

  // --- Calcular inactividad ---
  // Usamos max(last_activity_date, stage_change_time) como fecha de referencia.
  // Si un deal nunca tuvo actividad registrada pero fue movido recientemente de etapa,
  // no lo penalizamos con daysSinceActivity=999. El movimiento de etapa cuenta.
  const lastActivityDate = deal.last_activity_date
    ? new Date(deal.last_activity_date)
    : null;
  const lastRelevantEvent = lastActivityDate
    ? (lastActivityDate > stageChangeTime ? lastActivityDate : stageChangeTime)
    : stageChangeTime;
  const daysSinceActivity = Math.floor((now - lastRelevantEvent) / (1000 * 60 * 60 * 24));
  const isInactive = daysSinceActivity >= INACTIVITY_DAYS;

  // --- Determinar tipo de alerta ---
  let alertType = 'none';

  if (percentUsed >= 120) {
    alertType = 'escalacion';
  } else if (percentUsed >= 100) {
    alertType = isInactive ? 'escalacion' : 'urgente';
  } else if (percentUsed >= 60) {
    alertType = isInactive ? 'urgente' : 'suave';
  } else if (isInactive) {
    alertType = 'inactividad';
  }

  if (alertType === 'none') continue;

  // --- Preparar datos de la alerta ---
  const ownerInfo = SALES_TEAM[userId] || {
    name: 'Usuario no configurado (ID: ' + userId + ')',
    email: CGO_EMAIL,
    role: 'unknown',
  };
  const dealUrl = `https://${PIPEDRIVE_DOMAIN}.pipedrive.com/deal/${deal.id}`;

  // --- Filtro por rol/etapa ---
  // Reglas:
  //   1. Si el owner es pre_sales o bdr Y su rol esta permitido para la etapa
  //      -> alerta normal al owner (+ CGO si urgente/escalacion/inactividad)
  //   2. Si el owner es pre_sales o bdr pero su rol NO aplica a la etapa
  //      -> mismatch: alerta SOLO al CGO para flag de deal mal ruteado
  //   3. Si el owner es unassigned, cgo, o unknown
  //      -> alerta SOLO al CGO
  const stageRoles = stageConfig.roles || [];
  const isPrimaryRole = ownerInfo.role === 'pre_sales' || ownerInfo.role === 'bdr';
  const roleMatchesStage = isPrimaryRole && stageRoles.includes(ownerInfo.role);

  // --- Regla especial: BDR en Taller > TALLER_TRASPASO_DAYS = traspaso pendiente ---
  // Stage 3 acepta ambos roles, pero si el BDR tiene el deal por mas de N dias
  // es senal de que el taller ya termino y el deal debe pasar a Pre Sales.
  let traspasoFlag = false;
  if (stageId === 3 && ownerInfo.role === 'bdr' && daysInStage >= TALLER_TRASPASO_DAYS) {
    alertType = 'traspaso';
    traspasoFlag = true;
  }

  // Re-obtener config tras posible cambio de alertType
  const config = ALERT_CONFIG[alertType];

  let recipients;
  let mismatchFlag = false;

  if (traspasoFlag) {
    // Traspaso: siempre al BDR + CGO
    recipients = ownerInfo.email !== CGO_EMAIL
      ? `${ownerInfo.email},${CGO_EMAIL}`
      : CGO_EMAIL;
  } else if (roleMatchesStage) {
    // Caso 1: alerta normal
    recipients = config.sendToCGO && ownerInfo.email !== CGO_EMAIL
      ? `${ownerInfo.email},${CGO_EMAIL}`
      : ownerInfo.email;
  } else if (isPrimaryRole) {
    // Caso 2: mismatch rol/etapa
    recipients = CGO_EMAIL;
    mismatchFlag = true;
  } else {
    // Caso 3: unassigned/cgo/unknown
    recipients = CGO_EMAIL;
  }

  const dealValue = deal.value
    ? '$' + Number(deal.value).toLocaleString('es-MX') + ' ' + (deal.currency || 'MXN')
    : 'Sin valor asignado';

  const alertReason =
    alertType === 'inactividad'
      ? `${daysSinceActivity} dias sin actividad registrada`
      : `${daysInStage} de ${stageConfig.maxDays} dias en etapa (${percentUsed}%)` +
        (isInactive ? ` + ${daysSinceActivity} dias sin actividad` : '');

  const roleLabel = {
    pre_sales: 'Pre Sales',
    bdr: 'BDR',
    cgo: 'CGO',
    unassigned: 'Sin rol asignado',
    unknown: 'Desconocido',
  }[ownerInfo.role] || ownerInfo.role;

  const emailSubject = traspasoFlag
    ? `🔄 TRASPASO: ${deal.title || 'Deal sin titulo'} | ${ownerInfo.name} → Pre Sales | ${daysInStage} días en Taller`
    : mismatchFlag
      ? `⚠️ MISMATCH: ${deal.title || 'Deal sin titulo'} | ${ownerInfo.name} (${roleLabel}) en ${stageConfig.name}`
      : `${config.emoji} ${config.label}: ${deal.title || 'Deal sin titulo'} | ${stageConfig.name} | ${daysInStage} dias`;

  // --- Email HTML ---
  const emailBody = `
<div style="font-family:Arial,Helvetica,sans-serif;max-width:620px;margin:0 auto;background:#ffffff">
  <div style="background:${config.bgColor};padding:18px 24px;border-radius:8px 8px 0 0">
    <h2 style="color:#ffffff;margin:0;font-size:18px;font-weight:600">
      ${config.emoji} Alerta de Pipeline: ${config.label}
    </h2>
  </div>
  <div style="border:1px solid #e0e0e0;border-top:none;padding:24px;border-radius:0 0 8px 8px">
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr>
        <td style="padding:10px 8px;color:#888;width:150px;border-bottom:1px solid #f0f0f0">Deal</td>
        <td style="padding:10px 8px;font-weight:700;border-bottom:1px solid #f0f0f0">
          <a href="${dealUrl}" style="color:#0073ea;text-decoration:none">${deal.title || 'Sin titulo'}</a>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 8px;color:#888;border-bottom:1px solid #f0f0f0">Empresa</td>
        <td style="padding:10px 8px;border-bottom:1px solid #f0f0f0">${deal.org_name || 'Sin organizacion'}</td>
      </tr>
      <tr>
        <td style="padding:10px 8px;color:#888;border-bottom:1px solid #f0f0f0">Valor del deal</td>
        <td style="padding:10px 8px;border-bottom:1px solid #f0f0f0">${dealValue}</td>
      </tr>
      <tr>
        <td style="padding:10px 8px;color:#888;border-bottom:1px solid #f0f0f0">Etapa actual</td>
        <td style="padding:10px 8px;border-bottom:1px solid #f0f0f0;font-weight:600">${stageConfig.name}</td>
      </tr>
      <tr>
        <td style="padding:10px 8px;color:#888;border-bottom:1px solid #f0f0f0">Tiempo en etapa</td>
        <td style="padding:10px 8px;border-bottom:1px solid #f0f0f0;font-weight:700;color:${config.textColor}">
          ${daysInStage} dias de ${stageConfig.maxDays} permitidos (${percentUsed}%)
        </td>
      </tr>
      <tr>
        <td style="padding:10px 8px;color:#888;border-bottom:1px solid #f0f0f0">Ultima actividad</td>
        <td style="padding:10px 8px;border-bottom:1px solid #f0f0f0">
          ${lastActivityDate ? 'Hace ' + daysSinceActivity + ' dias (' + lastActivityDate.toLocaleDateString('es-MX') + ')' : 'Nunca registrada'}
        </td>
      </tr>
      <tr>
        <td style="padding:10px 8px;color:#888;border-bottom:1px solid #f0f0f0">Propietario</td>
        <td style="padding:10px 8px;border-bottom:1px solid #f0f0f0">${ownerInfo.name}</td>
      </tr>
      <tr>
        <td style="padding:10px 8px;color:#888">Rol</td>
        <td style="padding:10px 8px">${roleLabel}</td>
      </tr>
    </table>
    ${mismatchFlag ? `
    <div style="margin:20px 0;padding:16px;background:#ffe8e8;border-left:4px solid #c0392b;border-radius:0 4px 4px 0">
      <strong style="color:#c0392b">⚠️ Mismatch rol/etapa detectado:</strong>
      <span style="color:#555"> ${ownerInfo.name} (${roleLabel}) es propietario de un deal en la etapa "${stageConfig.name}", que no corresponde a su rol. Evalua si reasignar el deal o actualizar el rol del usuario.</span>
    </div>` : ''}
    ${traspasoFlag ? `
    <div style="margin:20px 0;padding:16px;background:#f3e5f5;border-left:4px solid #8e44ad;border-radius:0 4px 4px 0">
      <strong style="color:#6c3483">🔄 Traspaso a Pre Sales requerido:</strong>
      <span style="color:#555"> Este deal lleva <strong>${daysInStage} días</strong> en Taller de Requerimientos. El taller ha concluido — el deal debe cambiar de propietario a un Pre Sales para continuar el proceso de propuesta.</span>
      <br><br>
      <strong style="color:#333">Pasos a seguir:</strong>
      <ol style="color:#555;margin:8px 0;padding-left:20px">
        <li>Abre el deal en Pipedrive</li>
        <li>Haz clic en el nombre del propietario actual</li>
        <li>Asigna a uno de los siguientes Pre Sales:</li>
      </ol>
      <table style="width:100%;font-size:13px;margin-top:4px">
        ${Object.values(SALES_TEAM).filter(m => m.role === 'pre_sales').map(m =>
          `<tr><td style="padding:3px 0;color:#555;">· ${m.name}</td><td style="padding:3px 0;color:#888;">${m.email}</td></tr>`
        ).join('')}
      </table>
    </div>` : ''}
    <div style="margin:20px 0;padding:16px;background:#fff8e1;border-left:4px solid ${config.bgColor};border-radius:0 4px 4px 0">
      <strong style="color:#333">Accion requerida:</strong>
      <span style="color:#555"> ${config.action}</span>
    </div>
    <div style="text-align:center;margin:24px 0 8px">
      <a href="${dealUrl}" style="background:#0073ea;color:#ffffff;padding:12px 32px;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;display:inline-block">
        Ver Deal en Pipedrive
      </a>
    </div>
  </div>
  <div style="padding:12px;text-align:center;color:#bbb;font-size:11px">
    WF-03 Deal Stage Alerts | Bambu Tech Services |
    ${now.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
    ${now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
  </div>
</div>`;

  alerts.push({
    deal_id: deal.id,
    deal_title: deal.title || 'Sin titulo',
    org_name: deal.org_name || 'Sin organizacion',
    value: deal.value || 0,
    currency: deal.currency || 'MXN',
    deal_url: dealUrl,
    stage_name: stageConfig.name,
    stage_max_days: stageConfig.maxDays,
    days_in_stage: daysInStage,
    percent_used: percentUsed,
    is_inactive: isInactive,
    days_since_activity: daysSinceActivity,
    alert_type: alertType,
    alert_reason: alertReason,
    owner_name: ownerInfo.name,
    owner_email: ownerInfo.email,
    owner_role: ownerInfo.role,
    role_label: roleLabel,
    mismatch_flag: mismatchFlag,
    traspaso_flag: traspasoFlag,
    recipients: recipients,
    email_subject: emailSubject,
    email_body: emailBody,
    timestamp: now.toISOString(),
  });
}

// Ordenar: escalaciones primero, luego urgentes, luego suaves, luego inactividad
// Tiebreaker por deal.id para orden determinista entre runs
const priority = { escalacion: 0, urgente: 1, suave: 2, inactividad: 3 };
alerts.sort((a, b) => {
  const p = (priority[a.alert_type] || 99) - (priority[b.alert_type] || 99);
  return p !== 0 ? p : Number(a.deal_id) - Number(b.deal_id);
});

// --- Rotacion L/X/V para alertas no-criticas ---
// Criticas (escalacion, urgente, mismatch) siempre pasan.
// Suaves e inactividad se reparten por `deal_id % 3` y solo se envian en su dia.
let rotatedAlerts = alerts;
let rotationInfo = { enabled: false };

if (ROTATION_MODE) {
  const dayOfWeek = now.getDay(); // 0=Dom, 1=Lun, 2=Mar, 3=Mie, 4=Jue, 5=Vie, 6=Sab
  const dayBucket = dayOfWeek === 1 ? 0 : dayOfWeek === 3 ? 1 : dayOfWeek === 5 ? 2 : 0;
  const dayLabel = dayOfWeek === 1 ? 'Lunes' : dayOfWeek === 3 ? 'Miercoles' : dayOfWeek === 5 ? 'Viernes' : 'Dia fuera de L/X/V (fallback: bucket 0)';

  const criticalAlerts = alerts.filter(a =>
    a.alert_type === 'escalacion' || a.alert_type === 'urgente' || a.mismatch_flag || a.traspaso_flag
  );
  const rotatableAlerts = alerts.filter(a =>
    (a.alert_type === 'suave' || a.alert_type === 'inactividad') && !a.mismatch_flag
  );
  const rotatedSubset = rotatableAlerts.filter(a => (Number(a.deal_id) % 3) === dayBucket);

  // Mantener orden de prioridad: criticas primero, luego rotadas
  rotatedAlerts = [...criticalAlerts, ...rotatedSubset];

  rotationInfo = {
    enabled: true,
    day: dayLabel,
    bucket: dayBucket,
    criticas_siempre: criticalAlerts.length,
    rotables_totales: rotatableAlerts.length,
    rotables_hoy: rotatedSubset.length,
    filtradas_por_rotacion: rotatableAlerts.length - rotatedSubset.length,
  };
}

// Aplicar limite de alertas por ejecucion (despues de rotacion)
const limitedAlerts = MAX_ALERTS_PER_RUN > 0
  ? rotatedAlerts.slice(0, MAX_ALERTS_PER_RUN)
  : rotatedAlerts;

// Log resumen
if (alerts.length > 0) {
  const summary = {
    total_deals_procesados: allDeals.length,
    total_alertas_generadas: alerts.length,
    alertas_post_rotacion: rotatedAlerts.length,
    alertas_enviadas: limitedAlerts.length,
    por_tipo: {
      escalacion: alerts.filter(a => a.alert_type === 'escalacion').length,
      urgente: alerts.filter(a => a.alert_type === 'urgente').length,
      suave: alerts.filter(a => a.alert_type === 'suave').length,
      inactividad: alerts.filter(a => a.alert_type === 'inactividad').length,
    },
    por_rol: {
      pre_sales: alerts.filter(a => a.owner_role === 'pre_sales').length,
      bdr: alerts.filter(a => a.owner_role === 'bdr').length,
      unassigned: alerts.filter(a => a.owner_role === 'unassigned').length,
      cgo: alerts.filter(a => a.owner_role === 'cgo').length,
      unknown: alerts.filter(a => a.owner_role === 'unknown').length,
    },
    mismatches_rol_etapa: alerts.filter(a => a.mismatch_flag).length,
    traspasos_pendientes: alerts.filter(a => a.traspaso_flag).length,
    rotacion: rotationInfo,
  };
  console.log('WF-03 Resumen:', JSON.stringify(summary, null, 2));
}

return limitedAlerts.map((a) => ({ json: a }));
