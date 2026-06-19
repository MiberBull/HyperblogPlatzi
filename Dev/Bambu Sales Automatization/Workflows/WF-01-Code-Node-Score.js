// ============================================
// WF-01: LEAD SCORING ENGINE (Score Node)
// Bambu Tech Services - Automatizacion Comercial con IA
// ============================================
// Este codigo va en el nodo "Code" de n8n (modo: Run Once for All Items)
// Recibe el deal completo (con activities y participants) del nodo HTTP anterior
// y calcula los 3 componentes del score: Firmografico + Comportamiento + BANT
// ============================================
// PREREQUISITOS:
//   - Nodo anterior: HTTP Request que trae el deal completo de Pipedrive
//   - Nodo anterior (opcional): HTTP Request a Lusha para enrichment
//   - Campos custom de Pipedrive creados (ver Setup Guide)
// ============================================

// ============================================
// SECCION 1: CONFIGURACION
// ============================================

// --- Pipedrive ---
const PIPEDRIVE_DOMAIN = 'bambumobile';
const PIPEDRIVE_API_TOKEN = '15d2afeee1bdddcce498b9459d2bbf8b0075914c';

// --- Lusha ---
const LUSHA_API_KEY = 'e6a3693f-c1b4-41ef-a3ee-c7eb13792faf';
const LUSHA_API_BASE = 'https://api.lusha.com/v2';

// --- CGO ---
const CGO_EMAIL = 'roberto.esparza@bambu-techservices.com';
const CGO_NAME = 'Roberto Esparza';

// --- Equipo comercial (sincronizado con WF-03) ---
const SALES_TEAM = {
  // Pre Sales (MQL -> Taller)
  24060159: { name: 'Samantha Rivas',        email: 'samantha.rivas@bambu-techservices.com',  role: 'pre_sales' },
  25431089: { name: 'Vicente Varela',        email: 'vicente.varela@bambu-techservices.com',  role: 'pre_sales' },
  25752795: { name: 'Emilio Mendoza',        email: 'emilio.mendoza@bambu-techservices.com',  role: 'pre_sales' },
  11865784: { name: 'Sofia Santiago',        email: 'sofia@bambu-techservices.com',           role: 'pre_sales' },
  26438238: { name: 'Harold Bautista',       email: 'harold.bautista@bambu-techservices.com', role: 'pre_sales' },

  // BDRs (Taller -> Calientes)
  16167654: { name: 'Cecia Lozano',          email: 'cecia.lozano@bambu-techservices.com',    role: 'bdr' },
  23975173: { name: 'Itzel Arias',           email: 'itzel.arias@bambu-techservices.com',     role: 'bdr' },
  25224993: { name: 'Luis Fernando Castro',  email: 'luis.castro@bambu-techservices.com',     role: 'bdr' },
  26082729: { name: 'Victor Villafane',      email: 'victor.villafane@bambu-techservices.com', role: 'bdr' },
  26148685: { name: 'Gabriela Rivero',       email: 'gabriela.rivero@bambu-techservices.com', role: 'bdr' },
  25898347: { name: 'Nayeli Gomez',          email: 'nayeli.gomez@bambu-techservices.com',    role: 'bdr' },

  // CGO
  14406657: { name: 'Roberto Esparza',       email: 'roberto.esparza@bambu-techservices.com', role: 'cgo' },

  // Sin rol formal
  1819933:  { name: 'Alonso Santiago',       email: 'alonso@bambu-techservices.com',          role: 'unassigned' },
  24992387: { name: 'Daniel Sanchez',        email: 'daniel.sanchez@bambu-techservices.com',  role: 'unassigned' },
  23841490: { name: 'Jose Mendez',           email: 'jose.mendez@bambu-techservices.com',     role: 'unassigned' },
  23269567: { name: 'Omar Ramirez',          email: 'omar@bambu-techservices.com',            role: 'unassigned' },
};

// ============================================
// SECCION 2: MODELO DE SCORING
// ============================================
// Distribucion: Firmografico 30 + Comportamiento 30 + BANT 40 = 100
// BANT tiene mayor peso porque implica que ya conociste al prospecto
// y confirmaste interes real en tu servicio.

const SCORING_MODEL = {

  // ------------------------------------------
  // COMPONENTE 1: FIRMOGRAFICO (30 pts) — Lusha
  // ------------------------------------------
  firmographic: {
    maxPoints: 30,

    // Industria (0-10 pts)
    // Verticales core de Bambu: Financiero, Retail, Manufactura
    industry: {
      'Financial Services': 10, 'Financiero': 10, 'Insurance': 10, 'Seguros': 10,
      'Banking': 10, 'Banca': 10, 'Fintech': 10,
      'Retail': 8, 'CPG': 8, 'Consumo': 8, 'Consumer Goods': 8, 'E-Commerce': 8,
      'Manufacturing': 7, 'Manufactura': 7, 'Industrial': 7, 'Automotive': 7,
      'Technology': 5, 'Tech': 5, 'Software': 5, 'Information Technology': 5, 'SaaS': 5,
      'Government': 4, 'Gobierno': 4, 'Public Sector': 4,
      'Healthcare': 4, 'Salud': 4, 'Pharma': 4,
      'Education': 3, 'Educacion': 3,
      'Logistics': 3, 'Logistica': 3, 'Transportation': 3,
      'Real Estate': 2, 'Inmobiliaria': 2,
      'Energy': 3, 'Energia': 3, 'Oil & Gas': 3,
      '_default': 2,
    },

    // Tamaño empresa por empleados (0-7 pts)
    companySize: [
      { min: 500,  max: Infinity, points: 7 },
      { min: 200,  max: 499,      points: 6 },
      { min: 50,   max: 199,      points: 4 },
      { min: 10,   max: 49,       points: 3 },
      { min: 0,    max: 9,        points: 1 },
    ],

    // Revenue anual USD (0-4 pts)
    revenue: [
      { min: 500_000_000, max: Infinity,    points: 4 },
      { min: 100_000_000, max: 499_999_999, points: 3 },
      { min: 10_000_000,  max: 99_999_999,  points: 2 },
      { min: 0,           max: 9_999_999,   points: 1 },
    ],

    // Ubicacion (0-3 pts) — ciudades principales de Mexico
    location: {
      tier1: { cities: ['Ciudad de Mexico', 'CDMX', 'Mexico City', 'Monterrey', 'Guadalajara'], points: 3 },
      tier2: { cities: ['Puebla', 'Queretaro', 'Leon', 'Merida', 'Tijuana', 'Cancun', 'Aguascalientes', 'San Luis Potosi', 'Chihuahua', 'Saltillo', 'Toluca'], points: 2 },
      international: { points: 3 }, // empresas internacionales = oportunidad grande
      _default: 1,
    },

    // Tech Stack (0-3 pts) — nivel de adopcion cloud
    techStack: {
      high: { keywords: ['AWS', 'Azure', 'GCP', 'Google Cloud', 'Kubernetes', 'Docker', 'Terraform', 'Microservices', 'CI/CD', 'DevOps', 'Salesforce', 'SAP'], points: 3 },
      medium: { keywords: ['Cloud', 'SaaS', 'API', 'Linux', 'SQL Server', 'Oracle', 'VMware', 'Citrix'], points: 2 },
      low: { points: 1 },
    },

    // Seniority del contacto (0-3 pts)
    seniority: {
      'C-Level': 3, 'CEO': 3, 'CTO': 3, 'CFO': 3, 'CIO': 3, 'COO': 3, 'CISO': 3,
      'VP': 2, 'Vice President': 2, 'Director': 2, 'SVP': 2, 'Head of': 2,
      'Manager': 1, 'Gerente': 1, 'Coordinator': 1, 'Coordinador': 1,
      'Jefe': 1, 'Lead': 1, 'Supervisor': 1,
      '_default': 0,
    },
  },

  // ------------------------------------------
  // COMPONENTE 2: COMPORTAMIENTO (30 pts) — Pipedrive activities
  // ------------------------------------------
  // Proxy de engagement usando datos de Pipedrive
  // Cuando se active ActiveCampaign, se agrega como fuente adicional
  behavioral: {
    maxPoints: 30,

    // Actividades totales en ultimos 30 dias (0-6 pts)
    activityCount: [
      { min: 6, max: Infinity, points: 6 },
      { min: 3, max: 5,        points: 4 },
      { min: 1, max: 2,        points: 2 },
      { min: 0, max: 0,        points: 0 },
    ],

    // Emails intercambiados (0-6 pts)
    emailCount: [
      { min: 6, max: Infinity, points: 6 },
      { min: 3, max: 5,        points: 4 },
      { min: 1, max: 2,        points: 2 },
      { min: 0, max: 0,        points: 0 },
    ],

    // Reuniones realizadas (0-6 pts)
    meetingCount: [
      { min: 3, max: Infinity, points: 6 },
      { min: 2, max: 2,        points: 4 },
      { min: 1, max: 1,        points: 3 },
      { min: 0, max: 0,        points: 0 },
    ],

    // Velocidad de respuesta del prospecto (0-4 pts)
    // Se mide como promedio de dias entre actividades consecutivas
    responseVelocity: [
      { min: 0, max: 1,   points: 4 },  // responde en <1 dia
      { min: 1, max: 3,   points: 3 },  // 1-3 dias
      { min: 3, max: 7,   points: 2 },  // 3-7 dias
      { min: 7, max: 14,  points: 1 },  // 1-2 semanas
      { min: 14, max: Infinity, points: 0 },
    ],

    // Multi-stakeholder: personas de la org involucradas (0-4 pts)
    multiStakeholder: [
      { min: 3, max: Infinity, points: 4 },
      { min: 2, max: 2,        points: 3 },
      { min: 1, max: 1,        points: 1 },
      { min: 0, max: 0,        points: 0 },
    ],

    // Fuente del lead (0-4 pts)
    // Usa campo existente "Canal de origen" de Pipedrive (key: channel)
    // Mapeo por option ID (numero) y por label (string) para robustez
    leadSource: {
      // Por label (string)
      'Formulario Sitio WEB': 4,  // Inbound puro — mayor interes
      'Campañas Digitales': 3,    // Marketing activo
      'Marking Business': 3,      // Marketing/branding
      'AWS': 3,                    // Partner referral
      'Programa Impulsores': 3,   // Partner/referral program
      'Lenovo': 3,                 // Partner referral
      'Ingram': 3,                 // Partner referral
      'Fiserv': 3,                 // Partner referral
      'MIT': 3,                    // Partner referral
      'Whatsapp': 2,              // Inbound pero menos calificado
      'Pre Sales': 2,             // Prospeccion interna
      'ConProspección': 1,        // Outbound frio
      // Por option ID (Pipedrive a veces devuelve ID en lugar de label)
      '56': 4, '57': 3, '121': 3, '58': 3, '114': 3,
      '122': 3, '123': 3, '124': 3, '125': 3,
      '55': 2, '115': 2, '116': 1,
      '_default': 1,
    },
  },

  // ------------------------------------------
  // COMPONENTE 3: BANT (40 pts) — Campos custom Pipedrive
  // ------------------------------------------
  // Mayor peso: si ya hiciste discovery y confirmaste BANT, el lead es real.
  // Los reps llenan estos campos despues del discovery call.
  bant: {
    maxPoints: 40,

    // Budget (0-12 pts)
    budget: {
      'Sin budget':       0,
      'Budget indefinido': 4,
      'Budget asignado':   8,
      'Budget >$1M':      12,
    },

    // Authority (0-12 pts)
    authority: {
      'No es decision maker': 0,
      'Influencer':           4,
      'Decision maker':       8,
      'C-Level firmante':    12,
    },

    // Need (0-8 pts)
    need: {
      'No pain claro':  0,
      'Nice to have':   3,
      'Must have':      6,
      'Urgente':        8,
    },

    // Timeline (0-8 pts)
    timeline: {
      '>12 meses':  0,
      '6-12 meses': 2,
      '3-6 meses':  4,
      '1-3 meses':  6,
      '<1 mes':     8,
    },
  },

  // ------------------------------------------
  // CLASIFICACION POR SCORE TOTAL
  // ------------------------------------------
  classification: [
    { min: 71, max: 100, label: 'Hot',       emoji: '🔥', color: '#e74c3c', action: 'AE senior, contacto <1hr',       sla: '1 hora' },
    { min: 51, max: 70,  label: 'Caliente',  emoji: '🟠', color: '#e67e22', action: 'BDR prioritario, contacto <4hrs', sla: '4 horas' },
    { min: 26, max: 50,  label: 'Tibio',     emoji: '🟡', color: '#f39c12', action: 'BDR standard, contacto <24hrs',   sla: '24 horas' },
    { min: 0,  max: 25,  label: 'Frio',      emoji: '🔵', color: '#3498db', action: 'Nurturing bucket',                sla: 'No aplica' },
  ],

  // ------------------------------------------
  // REGLAS DE DECAY (para Code Node Decay)
  // ------------------------------------------
  decay: [
    { days: 90, action: 'dormant',  label: 'Deal dormido — sale de pipeline activo' },
    { days: 60, penalty: -15,       label: '-15 pts comportamiento' },
    { days: 30, penalty: -10,       label: '-10 pts comportamiento' },
    { days: 15, penalty: -5,        label: '-5 pts comportamiento' },
  ],
};


// ============================================
// SECCION 3: CAMPOS CUSTOM DE PIPEDRIVE
// ============================================
// Reemplazar estos hashes con los IDs reales de tus campos custom.
// Para obtenerlos: GET https://api.pipedrive.com/v1/dealFields?api_token=TOKEN
// y busca por name.

const PIPEDRIVE_FIELDS = {
  // Scores (tipo: numeric)
  lead_score:            '741cf97b779ffd23bcd09af9a2c4cf16d11110db',
  score_firmografico:    'b2bc3143e2047c5dc2dbe4e4eb538bfbf52eefe7',
  score_comportamiento:  '98d7b29397c2213ed0508953aacc61d03ea50eae',
  score_bant:            '5ef7f68a15cf57fec58c8eb33bb71f0419f4d34b',

  // Clasificacion (tipo: single option)
  lead_classification:   '3ee31448c7d970c757ecf8331ebb8ffb151cfcb2',  // Frio, Tibio, Caliente, Hot

  // BANT (tipo: single option cada uno)
  bant_budget:           'a76f37cb464190dbd4cded3ceeddb83d3a609dea',  // Sin budget, Budget indefinido, Budget asignado, Budget >$1M
  bant_authority:        'aab0da9b93ff48f18839f5e97683bcf35c82ef0f',  // No es decision maker, Influencer, Decision maker, C-Level firmante
  bant_need:             '9ce3308086db373653bb70c408c765cb2db1b126',  // No pain claro, Nice to have, Must have, Urgente
  bant_timeline:         '68438eadeb5f68646ac6214459e5b082e21e665b',  // >12 meses, 6-12 meses, 3-6 meses, 1-3 meses, <1 mes

  // Metadata
  canal_de_origen:       'channel',                                    // YA EXISTIA en Pipedrive — key nativa
  fecha_scoring:         'de9adff73765c7b671933bcc4a1c4ecdedc6545d',
  lusha_enriched:        'e8acdc0b10dc9214b57a0522c7991f2ae9b8eec7',  // Si, No
};

// Option IDs de Pipedrive (para escribir valores enum via API)
// Pipedrive requiere el ID numerico, no el label, al hacer PUT/POST
const PIPEDRIVE_OPTION_IDS = {
  lead_classification: { 'Frio': 132, 'Tibio': 133, 'Caliente': 134, 'Hot': 135 },
  lusha_enriched:      { 'Si': 153, 'No': 154 },
  // BANT: no se escriben desde el workflow (los reps los llenan manual)
  // pero los incluimos para referencia
  bant_budget:    { 'Sin budget': 136, 'Budget indefinido': 137, 'Budget asignado': 138, 'Budget >$1M': 139 },
  bant_authority: { 'No es decision maker': 140, 'Influencer': 141, 'Decision maker': 142, 'C-Level firmante': 143 },
  bant_need:      { 'No pain claro': 144, 'Nice to have': 145, 'Must have': 146, 'Urgente': 147 },
  bant_timeline:  { '>12 meses': 148, '6-12 meses': 149, '3-6 meses': 150, '1-3 meses': 151, '<1 mes': 152 },
};


// ============================================
// SECCION 4: FUNCIONES DE SCORING
// ============================================

/**
 * Normaliza la respuesta de Lusha a un formato estandar.
 * Facilita cambiar proveedor (Apollo, Clearbit, etc.) en el futuro.
 */
function normalizeLushaResponse(lushaCompany, lushaPerson) {
  // Parsear empleados de string "51 - 200" a numero
  let employeeCount = lushaCompany?.employeesInLinkedin || null;
  if (!employeeCount && lushaCompany?.employees) {
    const parts = String(lushaCompany.employees).match(/(\d+)/g);
    if (parts && parts.length >= 2) {
      employeeCount = Math.round((parseInt(parts[0]) + parseInt(parts[1])) / 2);
    } else if (parts) {
      employeeCount = parseInt(parts[0]);
    }
  }

  // Revenue: Lusha devuelve revenueRange como [min, max]
  let revenue = null;
  if (lushaCompany?.revenueRange && Array.isArray(lushaCompany.revenueRange)) {
    revenue = lushaCompany.revenueRange[0];
  }

  return {
    industry: lushaCompany?.mainIndustry || lushaCompany?.subIndustry || lushaCompany?.industry || null,
    employeeCount,
    revenue,
    location: lushaCompany?.location?.city || lushaCompany?.location?.rawLocation || null,
    country: lushaCompany?.location?.country || lushaCompany?.location?.countryIso2 || null,
    technologies: lushaCompany?.specialities || lushaCompany?.technologies || [],
    seniority: lushaPerson?.jobTitle?.seniority || lushaPerson?.seniority || null,
    jobTitle: lushaPerson?.jobTitle?.title || lushaPerson?.fullName || null,
  };
}

/**
 * Calcula score firmografico (0-30 pts)
 */
function scoreFirmographic(enrichment) {
  const model = SCORING_MODEL.firmographic;
  let score = 0;
  const breakdown = {};

  // 1. Industria (0-10)
  const industry = enrichment.industry || '';
  const industryScore = model.industry[industry] || model.industry._default;
  score += industryScore;
  breakdown.industry = { value: industry || 'Desconocida', points: industryScore, max: 10 };

  // 2. Tamaño empresa (0-7)
  const employees = enrichment.employeeCount || 0;
  const sizeRule = model.companySize.find(r => employees >= r.min && employees <= r.max);
  const sizeScore = sizeRule ? sizeRule.points : 1;
  score += sizeScore;
  breakdown.companySize = { value: employees, points: sizeScore, max: 7 };

  // 3. Revenue (0-4)
  const revenue = enrichment.revenue || 0;
  const revenueRule = model.revenue.find(r => revenue >= r.min && revenue <= r.max);
  const revenueScore = revenueRule ? revenueRule.points : 1;
  score += revenueScore;
  breakdown.revenue = { value: revenue, points: revenueScore, max: 4 };

  // 4. Ubicacion (0-3)
  const location = (enrichment.location || '').toLowerCase();
  const country = (enrichment.country || '').toLowerCase();
  let locationScore = model.location._default;
  if (model.location.tier1.cities.some(c => location.includes(c.toLowerCase()))) {
    locationScore = model.location.tier1.points;
  } else if (model.location.tier2.cities.some(c => location.includes(c.toLowerCase()))) {
    locationScore = model.location.tier2.points;
  } else if (country && country !== 'mexico' && country !== 'mx') {
    locationScore = model.location.international.points;
  }
  score += locationScore;
  breakdown.location = { value: enrichment.location || 'Desconocida', points: locationScore, max: 3 };

  // 5. Tech Stack (0-3)
  const techs = (enrichment.technologies || []).join(' ').toUpperCase();
  let techScore = model.techStack.low.points;
  if (model.techStack.high.keywords.some(kw => techs.includes(kw.toUpperCase()))) {
    techScore = model.techStack.high.points;
  } else if (model.techStack.medium.keywords.some(kw => techs.includes(kw.toUpperCase()))) {
    techScore = model.techStack.medium.points;
  }
  score += techScore;
  breakdown.techStack = { value: enrichment.technologies?.slice(0, 5)?.join(', ') || 'No disponible', points: techScore, max: 3 };

  // 6. Seniority (0-3)
  const title = enrichment.jobTitle || enrichment.seniority || '';
  let seniorityScore = model.seniority._default;
  for (const [key, pts] of Object.entries(model.seniority)) {
    if (key === '_default') continue;
    if (title.toUpperCase().includes(key.toUpperCase())) {
      seniorityScore = Math.max(seniorityScore, pts);
    }
  }
  score += seniorityScore;
  breakdown.seniority = { value: title || 'Desconocido', points: seniorityScore, max: 3 };

  return { score: Math.min(score, model.maxPoints), breakdown };
}

/**
 * Calcula score de comportamiento (0-30 pts) usando actividades de Pipedrive.
 * @param {Array} activities - Actividades del deal (ultimos 30 dias)
 * @param {Array} participants - Personas asociadas al deal
 * @param {string} leadSource - Fuente del lead (campo custom)
 */
function scoreBehavioral(activities, participants, leadSource) {
  const model = SCORING_MODEL.behavioral;
  let score = 0;
  const breakdown = {};
  const now = new Date();
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

  // Filtrar actividades de los ultimos 30 dias
  const recentActivities = (activities || []).filter(a => {
    const date = new Date(a.done_time || a.due_date || a.add_time);
    return date >= thirtyDaysAgo;
  });

  // 1. Actividades totales 30d (0-6): tareas, notas, deadlines, etc.
  //    Excluye email, meeting, lunch y call para evitar double-counting
  //    (calls y meetings van al bucket meetingCount)
  const totalActivities = recentActivities.filter(a =>
    !['email', 'meeting', 'lunch', 'call'].includes(a.type)
  ).length;
  const actRule = model.activityCount.find(r => totalActivities >= r.min && totalActivities <= r.max);
  const actScore = actRule ? actRule.points : 0;
  score += actScore;
  breakdown.activityCount = { value: totalActivities, points: actScore, max: 6 };

  // 2. Emails intercambiados (0-6)
  const emails = recentActivities.filter(a => a.type === 'email').length;
  const emailRule = model.emailCount.find(r => emails >= r.min && emails <= r.max);
  const emailScore = emailRule ? emailRule.points : 0;
  score += emailScore;
  breakdown.emailCount = { value: emails, points: emailScore, max: 6 };

  // 3. Reuniones realizadas (0-6): contacto directo — meetings, lunches y calls
  //    Cada tipo de actividad va a exactamente un bucket
  const meetings = recentActivities.filter(a =>
    ['meeting', 'lunch', 'call'].includes(a.type)
  ).length;
  const meetRule = model.meetingCount.find(r => meetings >= r.min && meetings <= r.max);
  const meetScore = meetRule ? meetRule.points : 0;
  score += meetScore;
  breakdown.meetingCount = { value: meetings, points: meetScore, max: 6 };

  // 4. Velocidad de respuesta (0-4)
  // Calculamos promedio de dias entre actividades consecutivas
  let velocityScore = 0;
  if (recentActivities.length >= 2) {
    const sorted = recentActivities
      .map(a => new Date(a.done_time || a.due_date || a.add_time).getTime())
      .sort((a, b) => a - b);
    const gaps = [];
    for (let i = 1; i < sorted.length; i++) {
      gaps.push((sorted[i] - sorted[i - 1]) / (1000 * 60 * 60 * 24));
    }
    const avgGap = gaps.reduce((sum, g) => sum + g, 0) / gaps.length;
    const velRule = model.responseVelocity.find(r => avgGap >= r.min && avgGap < r.max);
    velocityScore = velRule ? velRule.points : 0;
  }
  score += velocityScore;
  breakdown.responseVelocity = {
    value: recentActivities.length >= 2 ? `${recentActivities.length} interacciones` : 'Insuficiente data',
    points: velocityScore, max: 4,
  };

  // 5. Multi-stakeholder (0-4)
  const stakeholders = (participants || []).length;
  const stakeRule = model.multiStakeholder.find(r => stakeholders >= r.min && stakeholders <= r.max);
  const stakeScore = stakeRule ? stakeRule.points : 0;
  score += stakeScore;
  breakdown.multiStakeholder = { value: stakeholders, points: stakeScore, max: 4 };

  // 6. Fuente del lead (0-4)
  const source = leadSource || '';
  const sourceScore = model.leadSource[source] || model.leadSource._default;
  score += sourceScore;
  breakdown.leadSource = { value: source || 'No definida', points: sourceScore, max: 4 };

  return { score: Math.min(score, model.maxPoints), breakdown };
}

/**
 * Calcula score BANT (0-40 pts) desde campos custom de Pipedrive.
 * Los reps llenan estos campos despues del discovery call.
 */
function scoreBANT(deal) {
  const model = SCORING_MODEL.bant;
  let score = 0;
  const breakdown = {};

  // Helper: leer valor del campo custom
  // Pipedrive puede devolver option_id (number) o label (string).
  // Si viene como ID, lo convertimos a label para buscar en SCORING_MODEL.
  function getFieldValue(deal, fieldKey, optionMap) {
    const val = deal[fieldKey];
    if (val === null || val === undefined || val === '') return null;
    // Si es numero, buscar el label correspondiente en el mapa inverso
    if (typeof val === 'number' && optionMap) {
      const inverseMap = Object.fromEntries(Object.entries(optionMap).map(([k, v]) => [v, k]));
      return inverseMap[val] || String(val);
    }
    return String(val);
  }

  // 1. Budget (0-12)
  const budgetVal = getFieldValue(deal, PIPEDRIVE_FIELDS.bant_budget, PIPEDRIVE_OPTION_IDS.bant_budget);
  const budgetScore = budgetVal ? (model.budget[budgetVal] ?? 0) : 0;
  score += budgetScore;
  breakdown.budget = { value: budgetVal || 'Sin evaluar', points: budgetScore, max: 12 };

  // 2. Authority (0-12)
  const authVal = getFieldValue(deal, PIPEDRIVE_FIELDS.bant_authority, PIPEDRIVE_OPTION_IDS.bant_authority);
  const authScore = authVal ? (model.authority[authVal] ?? 0) : 0;
  score += authScore;
  breakdown.authority = { value: authVal || 'Sin evaluar', points: authScore, max: 12 };

  // 3. Need (0-8)
  const needVal = getFieldValue(deal, PIPEDRIVE_FIELDS.bant_need, PIPEDRIVE_OPTION_IDS.bant_need);
  const needScore = needVal ? (model.need[needVal] ?? 0) : 0;
  score += needScore;
  breakdown.need = { value: needVal || 'Sin evaluar', points: needScore, max: 8 };

  // 4. Timeline (0-8)
  const timeVal = getFieldValue(deal, PIPEDRIVE_FIELDS.bant_timeline, PIPEDRIVE_OPTION_IDS.bant_timeline);
  const timeScore = timeVal ? (model.timeline[timeVal] ?? 0) : 0;
  score += timeScore;
  breakdown.timeline = { value: timeVal || 'Sin evaluar', points: timeScore, max: 8 };

  return { score: Math.min(score, model.maxPoints), breakdown };
}

/**
 * Clasifica el deal segun score total
 */
function classify(totalScore) {
  return SCORING_MODEL.classification.find(c => totalScore >= c.min && totalScore <= c.max)
    || SCORING_MODEL.classification[SCORING_MODEL.classification.length - 1];
}


// ============================================
// SECCION 5: HELPERS
// ============================================

function extractId(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'object') return value.id;
  return value;
}

function getRepInfo(userId) {
  return SALES_TEAM[userId] || { name: `User ${userId}`, email: CGO_EMAIL, role: 'unassigned' };
}

/**
 * Genera URL del deal en Pipedrive
 */
function dealUrl(dealId) {
  return `https://${PIPEDRIVE_DOMAIN}.pipedrive.com/deal/${dealId}`;
}

/**
 * Formatea numero como moneda MXN
 */
function formatCurrency(amount) {
  if (!amount) return '$0';
  return '$' + Number(amount).toLocaleString('es-MX', { maximumFractionDigits: 0 });
}

/**
 * Genera el body del email de notificacion al rep
 */
function buildNotificationEmail(deal, scores, classification, repInfo, isNew, sigScoreChange = false, scoreDelta = 0, classifChanged = false) {
  const { firmographic, behavioral, bant, total } = scores;
  const orgName = deal.org_name || deal.org_id?.name || 'Sin empresa';
  const personName = deal.person_name || deal.person_id?.name || 'Sin contacto';
  const value = formatCurrency(deal.value);

  let action;
  if (isNew) {
    action = 'NUEVO LEAD ASIGNADO';
  } else if (classifChanged) {
    action = 'NUEVA CLASIFICACIÓN';
  } else if (sigScoreChange) {
    const sign = scoreDelta > 0 ? '+' : '';
    action = `SCORE ${sign}${scoreDelta} pts`;
  } else {
    action = 'SCORE ACTUALIZADO';
  }

  const scoreBar = (score, max) => {
    const pct = Math.round((score / max) * 100);
    const filled = Math.round(pct / 5);
    return '█'.repeat(filled) + '░'.repeat(20 - filled) + ` ${score}/${max}`;
  };

  const deltaTag = (sigScoreChange && scoreDelta !== 0)
    ? ` (${scoreDelta > 0 ? '+' : ''}${scoreDelta} pts)`
    : '';

  const subject = `${classification.emoji} [${action}] ${orgName} — Score ${total}/100${deltaTag} (${classification.label})`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #2d3436;">

<!-- Header -->
<div style="background: ${classification.color}; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
  <h1 style="margin: 0; font-size: 22px;">${classification.emoji} ${action}</h1>
  <p style="margin: 8px 0 0; font-size: 16px; opacity: 0.9;">${orgName} — ${classification.label}</p>
</div>

<!-- Delta Banner (solo cuando hay cambio significativo sin cambio de clasificación) -->
${sigScoreChange && !isNew ? `
<div style="background: #e8f4fd; padding: 12px 20px; border: 1px solid #bee5fd; border-bottom: none; font-size: 14px; text-align: center;">
  Score anterior: <strong>${total - scoreDelta}/100</strong> → Score actual: <strong>${total}/100</strong>
  &nbsp;|&nbsp; Cambio: <strong style="color: ${scoreDelta > 0 ? '#27ae60' : '#e74c3c'}">${scoreDelta > 0 ? '+' : ''}${scoreDelta} pts</strong>
</div>
` : ''}

<!-- Score Summary -->
<div style="background: #f8f9fa; padding: 20px; border: 1px solid #dee2e6;">
  <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
    <tr>
      <td style="padding: 8px 0;"><strong>Score Total</strong></td>
      <td style="padding: 8px 0; text-align: right; font-size: 28px; font-weight: bold; color: ${classification.color};">${total}/100</td>
    </tr>
    <tr>
      <td style="padding: 4px 0; color: #636e72;">Firmografico</td>
      <td style="padding: 4px 0; text-align: right; font-family: monospace; font-size: 12px;">${scoreBar(firmographic.score, 30)}</td>
    </tr>
    <tr>
      <td style="padding: 4px 0; color: #636e72;">Comportamiento</td>
      <td style="padding: 4px 0; text-align: right; font-family: monospace; font-size: 12px;">${scoreBar(behavioral.score, 30)}</td>
    </tr>
    <tr>
      <td style="padding: 4px 0; color: #636e72;">BANT</td>
      <td style="padding: 4px 0; text-align: right; font-family: monospace; font-size: 12px;">${scoreBar(bant.score, 40)}</td>
    </tr>
  </table>
</div>

<!-- Deal Info -->
<div style="padding: 20px; border: 1px solid #dee2e6; border-top: none;">
  <h3 style="margin: 0 0 12px; color: #2d3436;">Datos del Deal</h3>
  <table style="width: 100%; font-size: 14px;">
    <tr><td style="padding: 4px 0; color: #636e72; width: 120px;">Deal</td><td>${deal.title || 'Sin titulo'}</td></tr>
    <tr><td style="padding: 4px 0; color: #636e72;">Empresa</td><td>${orgName}</td></tr>
    <tr><td style="padding: 4px 0; color: #636e72;">Contacto</td><td>${personName}</td></tr>
    <tr><td style="padding: 4px 0; color: #636e72;">Valor</td><td>${value} ${deal.currency || 'MXN'}</td></tr>
    <tr><td style="padding: 4px 0; color: #636e72;">Asignado a</td><td>${repInfo.name}</td></tr>
  </table>
</div>

<!-- BANT Breakdown (si hay datos) -->
${bant.score > 0 ? `
<div style="padding: 20px; border: 1px solid #dee2e6; border-top: none; background: #fff3cd;">
  <h3 style="margin: 0 0 12px; color: #856404;">BANT (${bant.score}/40)</h3>
  <table style="width: 100%; font-size: 14px;">
    <tr><td style="padding: 4px 0; width: 120px;">Budget</td><td>${bant.breakdown.budget.value} (${bant.breakdown.budget.points}/${bant.breakdown.budget.max})</td></tr>
    <tr><td style="padding: 4px 0;">Authority</td><td>${bant.breakdown.authority.value} (${bant.breakdown.authority.points}/${bant.breakdown.authority.max})</td></tr>
    <tr><td style="padding: 4px 0;">Need</td><td>${bant.breakdown.need.value} (${bant.breakdown.need.points}/${bant.breakdown.need.max})</td></tr>
    <tr><td style="padding: 4px 0;">Timeline</td><td>${bant.breakdown.timeline.value} (${bant.breakdown.timeline.points}/${bant.breakdown.timeline.max})</td></tr>
  </table>
</div>
` : ''}

<!-- Firmographic Breakdown -->
<div style="padding: 20px; border: 1px solid #dee2e6; border-top: none;">
  <h3 style="margin: 0 0 12px; color: #2d3436;">Firmografico (${firmographic.score}/30)</h3>
  <table style="width: 100%; font-size: 13px;">
    <tr><td style="padding: 3px 0; color: #636e72; width: 120px;">Industria</td><td>${firmographic.breakdown.industry.value} (${firmographic.breakdown.industry.points}/${firmographic.breakdown.industry.max})</td></tr>
    <tr><td style="padding: 3px 0; color: #636e72;">Empleados</td><td>${firmographic.breakdown.companySize.value} (${firmographic.breakdown.companySize.points}/${firmographic.breakdown.companySize.max})</td></tr>
    <tr><td style="padding: 3px 0; color: #636e72;">Revenue</td><td>${formatCurrency(firmographic.breakdown.revenue.value)} (${firmographic.breakdown.revenue.points}/${firmographic.breakdown.revenue.max})</td></tr>
    <tr><td style="padding: 3px 0; color: #636e72;">Ubicacion</td><td>${firmographic.breakdown.location.value} (${firmographic.breakdown.location.points}/${firmographic.breakdown.location.max})</td></tr>
    <tr><td style="padding: 3px 0; color: #636e72;">Tech Stack</td><td>${firmographic.breakdown.techStack.value} (${firmographic.breakdown.techStack.points}/${firmographic.breakdown.techStack.max})</td></tr>
    <tr><td style="padding: 3px 0; color: #636e72;">Seniority</td><td>${firmographic.breakdown.seniority.value} (${firmographic.breakdown.seniority.points}/${firmographic.breakdown.seniority.max})</td></tr>
  </table>
</div>

<!-- CTA -->
<div style="padding: 20px; text-align: center; border: 1px solid #dee2e6; border-top: none;">
  <a href="${dealUrl(deal.id)}" style="display: inline-block; padding: 12px 32px; background: ${classification.color}; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Ver Deal en Pipedrive</a>
  <p style="margin: 12px 0 0; font-size: 12px; color: #b2bec3;">
    SLA: contactar en <strong>${classification.sla}</strong> | Generado por WF-01 Lead Scoring
  </p>
</div>

<!-- Referencia del Modelo de Scoring -->
<div style="margin-top: 12px; padding: 16px; background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 0 0 8px 8px; font-size: 12px; color: #636e72;">
  <p style="margin: 0 0 10px; font-weight: bold; color: #2d3436; font-size: 13px;">📊 Referencia: Modelo de Scoring (0–100 pts)</p>

  <!-- Clasificaciones -->
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px;">
    <tr>
      <td style="padding: 3px 6px; background: #e74c3c; color: white; border-radius: 3px; text-align: center; width: 25%;">🔥 Hot 71–100</td>
      <td style="padding: 3px 6px; background: #e67e22; color: white; border-radius: 3px; text-align: center; width: 25%;">🟠 Caliente 51–70</td>
      <td style="padding: 3px 6px; background: #f39c12; color: white; border-radius: 3px; text-align: center; width: 25%;">🟡 Tibio 26–50</td>
      <td style="padding: 3px 6px; background: #3498db; color: white; border-radius: 3px; text-align: center; width: 25%;">🔵 Frío 0–25</td>
    </tr>
  </table>

  <!-- Componentes -->
  <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
    <tr style="border-bottom: 1px solid #dee2e6;">
      <td style="padding: 4px 0; font-weight: bold; color: #2d3436; width: 35%;">Firmográfico /30</td>
      <td style="padding: 4px 0; color: #636e72;">Industria (10) · Empleados (7) · Revenue (7) · Ubicación (3) · Tech (2) · Seniority (1)</td>
    </tr>
    <tr style="border-bottom: 1px solid #dee2e6;">
      <td style="padding: 4px 0; font-weight: bold; color: #2d3436;">Comportamiento /30</td>
      <td style="padding: 4px 0; color: #636e72;">Actividades (10) · Emails respondidos (8) · Velocidad (7) · Canal origen (5)</td>
    </tr>
    <tr>
      <td style="padding: 4px 0; font-weight: bold; color: #2d3436;">BANT /40</td>
      <td style="padding: 4px 0; color: #636e72;">
        Budget /12: Sin(0) · Indefinido(4) · Asignado(8) · &gt;$1M(12)<br>
        Authority /12: No DM(0) · Influencer(4) · DM(8) · C-Level(12)<br>
        Need /8: Sin pain(0) · Nice to have(3) · Must have(6) · Urgente(8)<br>
        Timeline /8: &gt;12m(0) · 6-12m(2) · 3-6m(4) · 1-3m(6) · &lt;1m(8)
      </td>
    </tr>
  </table>
</div>

</body></html>`;

  return { subject, html };
}


// ============================================
// SECCION 6: EJECUCION PRINCIPAL
// ============================================

const now = new Date();
const outputs = [];

// El nodo anterior entrega el deal completo + actividades + participants
// Soportamos dos formatos:
//   a) Webhook: item.json.current = deal completo (webhook Pipedrive)
//   b) Schedule/Manual: item.json = deal completo (HTTP Request directo)
const items = $input.all();

for (const item of items) {
  const deal = item.json.current || item.json;
  if (!deal || !deal.id) continue;

  const dealId = deal.id;
  const userId = extractId(deal.user_id);
  const repInfo = getRepInfo(userId);

  // --- Determinar si necesita enrichment Lusha ---
  const lushaEnriched = deal[PIPEDRIVE_FIELDS.lusha_enriched];
  const needsLusha = !lushaEnriched || lushaEnriched === 'No';

  // --- Datos de enrichment ---
  // Si el nodo anterior ya hizo la llamada a Lusha, los datos vienen en item.json.lusha
  // Si no, usamos lo que tengamos del deal/org
  let enrichment = {};
  if (item.json.lushaCompany || item.json.lushaPerson) {
    enrichment = normalizeLushaResponse(item.json.lushaCompany, item.json.lushaPerson);
  } else {
    // Fallback: datos basicos del deal y org en Pipedrive
    const orgName = deal.org_name || deal.org_id?.name || '';
    enrichment = {
      industry: null,
      employeeCount: null,
      revenue: null,
      location: null,
      country: null,
      technologies: [],
      seniority: null,
      jobTitle: deal.person_id?.name || null,
    };
  }

  // --- Calcular los 3 componentes ---
  const firmographic = scoreFirmographic(enrichment);
  const behavioral = scoreBehavioral(
    item.json.activities || [],
    item.json.participants || [],
    deal[PIPEDRIVE_FIELDS.canal_de_origen] || ''
  );
  const bant = scoreBANT(deal);

  const totalScore = firmographic.score + behavioral.score + bant.score;
  const classification = classify(totalScore);

  // --- Detectar cambio de clasificacion ---
  const previousScore = deal[PIPEDRIVE_FIELDS.lead_score] || null;
  const previousClassification = previousScore !== null ? classify(previousScore).label : null;
  const classificationChanged = previousClassification !== null && previousClassification !== classification.label;
  const isNewDeal = previousScore === null;
  const scoreDelta = previousScore !== null ? (totalScore - previousScore) : 0;
  const significantScoreChange = !isNewDeal && previousScore !== null && Math.abs(scoreDelta) >= 10;

  // --- Preparar update para Pipedrive ---
  // Pipedrive enum fields requieren option ID numerico, no label string
  const pipedriveUpdate = {
    [PIPEDRIVE_FIELDS.lead_score]: totalScore,
    [PIPEDRIVE_FIELDS.score_firmografico]: firmographic.score,
    [PIPEDRIVE_FIELDS.score_comportamiento]: behavioral.score,
    [PIPEDRIVE_FIELDS.score_bant]: bant.score,
    [PIPEDRIVE_FIELDS.lead_classification]: PIPEDRIVE_OPTION_IDS.lead_classification[classification.label],
    [PIPEDRIVE_FIELDS.fecha_scoring]: now.toISOString().split('T')[0],
  };

  // Si se hizo enrichment, marcamos como enriched
  if (item.json.lushaCompany) {
    pipedriveUpdate[PIPEDRIVE_FIELDS.lusha_enriched] = PIPEDRIVE_OPTION_IDS.lusha_enriched['Si'];
  }

  // --- Preparar data para Google Sheets (Auto-Map) ---
  const sheetData = {
    'Timestamp': now.toISOString(),
    'Deal ID': dealId,
    'Deal Title': deal.title || '',
    'Empresa': deal.org_name || deal.org_id?.name || '',
    'Contacto': deal.person_name || deal.person_id?.name || '',
    'Valor': formatCurrency(deal.value),
    'Moneda': deal.currency || 'MXN',
    'Score Total': totalScore,
    'Firmografico': firmographic.score,
    'Comportamiento': behavioral.score,
    'BANT': bant.score,
    'Clasificacion': classification.label,
    'Emoji': classification.emoji,
    'Rep Asignado': repInfo.name,
    'Rep Email': repInfo.email,
    'Tipo': isNewDeal ? 'Nuevo' : 'Rescore',
    'Score Anterior': previousScore !== null ? previousScore : '',
    'Clasif Anterior': previousClassification || '',
    'Cambio Clasif': classificationChanged ? 'Si' : 'No',
    'Pipedrive URL': dealUrl(dealId),
    'Industria': enrichment.industry || '',
    'Empleados': enrichment.employeeCount || '',
    'Canal de Origen': deal[PIPEDRIVE_FIELDS.canal_de_origen] || '',
  };

  // --- Preparar email de notificacion ---
  const shouldNotify = isNewDeal || classificationChanged || significantScoreChange;
  let emailData = null;
  if (shouldNotify) {
    const scores = { firmographic, behavioral, bant, total: totalScore };
    const { subject, html } = buildNotificationEmail(deal, scores, classification, repInfo, isNewDeal, significantScoreChange, scoreDelta, classificationChanged);
    emailData = {
      to: repInfo.email,
      cc: classification.label === 'Hot' ? CGO_EMAIL : '', // CC a CGO si es Hot
      subject,
      html,
    };
  }

  // --- Output item ---
  outputs.push({
    json: {
      dealId,
      dealTitle: deal.title,
      orgName: deal.org_name || deal.org_id?.name || '',
      totalScore,
      classification: classification.label,
      classificationEmoji: classification.emoji,
      isNewDeal,
      classificationChanged,
      significantScoreChange,
      scoreDelta,
      previousScore,
      previousClassification,

      // Para nodo downstream: HTTP Request Pipedrive PUT
      pipedriveUpdate,
      pipedriveUrl: `https://api.pipedrive.com/v1/deals/${dealId}?api_token=${PIPEDRIVE_API_TOKEN}`,

      // Para nodo downstream: Google Sheets Append (Auto-Map)
      sheetData,

      // Para nodo downstream: Send Email (null si no hay que notificar)
      shouldNotify,
      emailData,

      // Para nodo downstream: IF necesita Lusha (primera vez)
      needsLusha,
      lushaLookupDomain: deal.org_id?.cc_email?.split('@')[1] || '',
      lushaLookupEmail: deal.person_id?.email?.[0]?.value || '',

      // Debug / log
      breakdown: {
        firmographic: firmographic.breakdown,
        behavioral: behavioral.breakdown,
        bant: bant.breakdown,
      },
    },
  });
}

// Si no hubo deals que procesar
if (outputs.length === 0) {
  outputs.push({
    json: {
      message: 'No deals to score',
      timestamp: now.toISOString(),
      emailData: null,
      shouldNotify: false,
      sheetData: null,
      pipedriveUpdate: null,
      pipedriveUrl: null,
    },
  });
}

return outputs;
