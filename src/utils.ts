import { DriverCategory, AuditResult, CountryInfo } from './types';

export function calculateCompliance(
  country: CountryInfo,
  license: DriverCategory,
  hasExperience: boolean,
  hasApostille: boolean,
  hasCleanRecord: boolean,
  lang: 'es' | 'en'
): AuditResult {
  let score = 100;
  const roadmap: string[] = [];
  const requirementsMatched: string[] = [];
  const requirementsPending: string[] = [];

  // Match core prerequisites
  if (hasExperience) {
    requirementsMatched.push(
      lang === 'es'
        ? 'Experiencia profesional demostrada certificable para vehículos de gran tonelaje.'
        : 'Certified professional driving history for heavy vehicles.'
    );
  } else {
    score -= 25;
    requirementsPending.push(
      lang === 'es'
        ? 'Acreditación de experiencia previa. Deberá certificar contratos o cotizaciones de la Seguridad Social del país de origen.'
        : 'Proof of previous driving records or Social Security logbooks in country of origin.'
    );
  }

  if (hasApostille) {
    requirementsMatched.push(
      lang === 'es'
        ? 'Antecedentes penales apostillados en origen vigentes.'
        : 'Apostilled original criminal record checks in force.'
    );
  } else {
    score -= 30;
    requirementsPending.push(
      lang === 'es'
        ? 'Obtención y legalización/apostilla de antecedentes penales de los últimos 5 años.'
        : 'Securing, translation and Apostille of clean records for the past 5 years.'
    );
  }

  if (hasCleanRecord) {
    requirementsMatched.push(
      lang === 'es'
        ? 'Pasaporte vigente y sin prohibiciones de entrada vigentes en el espacio Schengen.'
        : 'Valid passport and no current Schengen immigration entry bans.'
    );
  } else {
    score -= 25;
    requirementsPending.push(
      lang === 'es'
        ? 'Verificación y renovación del pasaporte en origen. Debe tener al menos 12 meses de validez.'
        : 'Vetting status of passport. Must hold at least 12 months validity prior to embassy filing.'
    );
  }

  // Treaties-based scoring adjustment & roadmap steps
  let legalRoute = '';
  let timeline = country.averageTimeline;

  if (country.treatyStatus === 'direct') {
    legalRoute = lang === 'es' ? 'Canje Directo por Reciprocidad Comunitaria / Especial UE' : 'Direct EU Community Transfer Route';
    roadmap.push(
      lang === 'es' ? '1. Recopilación de documentación de identidad y licencia original.' : '1. Compilation of identification credentials and original driving permit.',
      lang === 'es' ? '2. Solicitud electrónica y pago de la Tasa de la DGT de canje.' : '2. E-filing and payment of the corresponding DGT administrative fee.',
      lang === 'es' ? '3. Emisión inmediata del permiso provisional apto para circulación.' : '3. Immediate issuance of provisional heavy permit allowing active operations.'
    );
  } else if (country.treatyStatus === 'exam_required') {
    legalRoute = lang === 'es' ? 'Canje de Convenio de Reciprocidad con Examen Simplificado' : 'Bilateral Reciprocity Exchange with Simplified Assessment';
    roadmap.push(
      lang === 'es' ? '1. Solicitud de visado de trabajo por cuenta ajena y autorización de residencia en España.' : '1. Sourcing employment authorization and consulate work visa.',
      lang === 'es' ? '2. Apertura del expediente de canje coordinando DGT con el organismo homólogo de origen.' : '2. Initializing exchange file across DGT and corresponding native transit bureau.',
      lang === 'es' ? '3. Superación de pruebas psicotécnicas e inscripción inmediata para examen práctico en pista (DGT).' : '3. Medical/psychotechnical checkout and registry for simplified maneuvers testing.',
      lang === 'es' ? '4. Matriculación prioritaria en curso de CAP de Promoción (35 horas en lugar de 140).' : '4. Fasttrack CAP Professional accreditation certificate (35-hour transition course).'
    );
  } else {
    legalRoute = lang === 'es' ? 'Vía General de Contratación en Origen (Arraigo para la Formación / Cupo)' : 'General Origin Recruitment Campaign (SEPE Shortage Register)';
    score -= 15;
    roadmap.push(
      lang === 'es' ? '1. Publicación de oferta en el portal estatal SEPE para justificar insuficiencia de candidatos locales.' : '1. Registering vacancy before the state agency to justify foreign hires quota.',
      lang === 'es' ? '2. Solicitud de autorización de residencia inicial en la Delegación de Gobierno.' : '2. Direct representation and local filing at the Spanish Delegation of Government.',
      lang === 'es' ? '3. Agendado de cita consular en consulado de origen para inserción de visado.' : '3. Consular appointment coordination for physical work visa placement.',
      lang === 'es' ? '4. Formación integral y superación del permiso de conducir español y examen CAP desde cero.' : '4. Attending Spanish driving academy and passing full theoretical & practical CAP exams.'
    );
  }

  let viable: 'high' | 'medium' | 'low' = 'high';
  if (score >= 80) {
    viable = 'high';
  } else if (score >= 55) {
    viable = 'medium';
  } else {
    viable = 'low';
  }

  const notes = lang === 'es' 
    ? `Análisis ejecutado para ${country.nameEs} bajo código de permiso ${license}. Su tasa prevista de aprobación jurídica considerando antecedentes es del ${country.successRate}.`
    : `Compliance analysis executed for ${country.nameEn} with required class ${license}. Anticipated legal feasibility rate is evaluated at ${country.successRate}.`;

  return {
    score,
    viable,
    timeline,
    roadmap,
    requirementsMatched,
    requirementsPending,
    legalRoute,
    notes
  };
}
