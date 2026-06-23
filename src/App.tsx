import React, { useState, useEffect } from 'react';
import { 
  FileCheck, 
  Truck, 
  MapPin, 
  Mail, 
  Phone, 
  Languages, 
  CheckCircle, 
  FileText, 
  ArrowRight, 
  Globe, 
  User, 
  Briefcase, 
  Check, 
  HelpCircle, 
  AlertCircle,
  Database,
  Trash2,
  ExternalLink,
  Clock
} from 'lucide-react';
import { COUNTRIES, TRANSLATIONS } from './data';
import { calculateCompliance } from './utils';
import { DriverCategory, ConsultingRequest, Language } from './types';

export default function App() {
  const [lang, setLang] = useState<Language>('es');
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('CO');
  const [selectedLicense, setSelectedLicense] = useState<DriverCategory>('CE');
  const [hasExperience, setHasExperience] = useState<boolean>(true);
  const [hasApostille, setHasApostille] = useState<boolean>(true);
  const [hasCleanRecord, setHasCleanRecord] = useState<boolean>(true);
  
  // Custom interactive log tracker (persisted in localStorage)
  const [requests, setRequests] = useState<ConsultingRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'info' | 'tracker'>('info');
  const [showCalculator, setShowCalculator] = useState<boolean>(false);
  const [showCatalog, setShowCatalog] = useState<boolean>(false);
  const [showFleetControl, setShowFleetControl] = useState<boolean>(false);

  const handleAsesorLoginClick = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (showFleetControl) {
      setShowFleetControl(false);
      return;
    }
    const entered = prompt(
      lang === 'es' 
        ? 'Acceso exclusivo para AR Asesores. Por favor, introduzca la contraseña de agente:' 
        : 'Exclusive access for AR Asesores. Please enter agent security password:'
    );
    if (entered === 'arasesores' || entered === '1234') {
      setShowFleetControl(true);
      setTimeout(() => {
        const target = document.getElementById('consult-tracker-parent');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else if (entered !== null) {
      alert(lang === 'es' ? 'Contraseña incorrecta' : 'Incorrect password');
    }
  };

  const handleOpenCalculator = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowCalculator(true);
    setShowCatalog(false);
    setTimeout(() => {
      const target = document.getElementById('diagnostico');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  const handleOpenCatalog = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowCatalog(true);
    setShowCalculator(false);
    setTimeout(() => {
      const target = document.getElementById('catalogo-tratados');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };
  
  // Contact Form Inputs
  const [formName, setFormName] = useState<string>('');
  const [formCompany, setFormCompany] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formMsg, setFormMsg] = useState<string>('');
  const [alertMsg, setAlertMsg] = useState<string>('');

  // Formspree Integration States
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formspreeId, setFormspreeId] = useState<string>(() => {
    return localStorage.getItem('formspree_id') || 'asesoriamaloan@gmail.com';
  });
  const [showFormspreeConfig, setShowFormspreeConfig] = useState<boolean>(false);

  const handleSaveFormspreeId = (newId: string) => {
    setFormspreeId(newId);
    localStorage.setItem('formspree_id', newId.trim());
  };

  // Sourcing filter tool state
  const [selectedTreatyFilter, setSelectedTreatyFilter] = useState<'all' | 'direct' | 'exam_required' | 'no_treaty'>('all');

  // Load registered requests from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('lex_requests_v1');
    if (saved) {
      try {
        setRequests(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse requests from storage', e);
      }
    } else {
      // Seed some beautiful demo corporate logs to demonstrate the feature's capability beautifully
      const demoLogs: ConsultingRequest[] = [
        {
          id: 'REQ-101',
          fullName: 'Diego Morales',
          companyName: 'TransGallego S.A.',
          email: 'd.morales@tgallego.com',
          message: 'Necesitamos canjear 10 licencias de choferes procedentes de Colombia para nuestra sede en Valencia.',
          candidateCountry: 'Colombia',
          candidateLicense: 'CE',
          calculatedScore: 95,
          status: 'pending',
          createdAt: new Date(Date.now() - 3600000 * 4).toLocaleString(lang === 'es' ? 'es-ES' : 'en-US')
        },
        {
          id: 'REQ-102',
          fullName: 'Marc Van Der Berg',
          companyName: 'Eurofreight Logistics Sl',
          email: 'compliance@eurofreight.es',
          message: 'Buscamos ruta extraordinaria para incorporar conductores ucranianos de manera inmediata.',
          candidateCountry: 'Ucrania',
          candidateLicense: 'C',
          calculatedScore: 100,
          status: 'approved',
          createdAt: new Date(Date.now() - 3600000 * 24).toLocaleString(lang === 'es' ? 'es-ES' : 'en-US')
        }
      ];
      setRequests(demoLogs);
      localStorage.setItem('lex_requests_v1', JSON.stringify(demoLogs));
    }
  }, []);

  // Sync back to local storage
  const saveRequests = (newReqs: ConsultingRequest[]) => {
    setRequests(newReqs);
    localStorage.setItem('lex_requests_v1', JSON.stringify(newReqs));
  };

  // Run dynamic calculation
  const currentCountry = COUNTRIES.find(c => c.code === selectedCountryCode) || COUNTRIES[0];
  const auditReport = calculateCompliance(
    currentCountry,
    selectedLicense,
    hasExperience,
    hasApostille,
    hasCleanRecord,
    lang
  );

  const t = TRANSLATIONS[lang];

  // Submission handler with native Formspree integration
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail) {
      setAlertMsg(lang === 'es' ? 'Por favor complete su nombre y correo.' : 'Please enter your name and email.');
      return;
    }

    setIsSubmitting(true);
    setAlertMsg('');

    const countryName = currentCountry[lang === 'es' ? 'nameEs' : 'nameEn'];

    const newRequest: ConsultingRequest = {
      id: `REQ-${Math.floor(100 + Math.random() * 900)}`,
      fullName: formName,
      companyName: formCompany || 'Particular',
      email: formEmail,
      message: formMsg || 'Solicitud de diagnóstico legal completo.',
      candidateCountry: countryName,
      candidateLicense: selectedLicense,
      calculatedScore: auditReport.score,
      status: 'pending',
      createdAt: new Date().toLocaleString(lang === 'es' ? 'es-ES' : 'en-US')
    };

    const updated = [newRequest, ...requests];
    saveRequests(updated);

    // Formulate prefilled email/message structure
    const emailSubject = lang === 'es'
      ? `[AR Asesores] Nueva Consulta de Homologación de ${formName}`
      : `[AR Asesores] New Homologation Inquiry from ${formName}`;

    const emailBody = 
      lang === 'es'
        ? `Hola AR Asesores,\n\nSe ha recibido una nueva solicitud a través del formulario de la web:\n\n` +
          `• Nombre/Candidato: ${formName}\n` +
          `• Empresa: ${formCompany || 'Particular'}\n` +
          `• Correo electrónico: ${formEmail}\n` +
          `• Origen del Conductor: ${countryName}\n` +
          `• Permiso solicitado: ${selectedLicense}\n` +
          `• Índice de Idoneidad: ${auditReport.score}%\n\n` +
          `Mensaje original:\n` +
          `"${formMsg || '-'}"\n\n` +
          `Cordialmente,\nFormulario Web`
        : `Hello AR Asesores,\n\nWe have received a new inquiry via the web form:\n\n` +
          `• Driver Name/Candidate: ${formName}\n` +
          `• Company: ${formCompany || 'Individual'}\n` +
          `• Email: ${formEmail}\n` +
          `• Driver Origin: ${countryName}\n` +
          `• Permit requested: ${selectedLicense}\n` +
          `• Compliance Score: ${auditReport.score}%\n\n` +
          `Original message:\n` +
          `"${formMsg || '-'}"\n\n` +
          `Best regards,\nWeb Form`;

    // Formulate payload for Formspree (as fallback or standard route)
    const payload = {
      name: formName,
      email: formEmail,
      company: formCompany || 'Particular',
      message: formMsg || 'Solicitud de diagnóstico legal completo.',
      candidateCountry: countryName,
      candidateLicense: selectedLicense,
      calculatedScore: `${auditReport.score}%`,
      systemTime: new Date().toISOString()
    };

    // Determine target Formspree URL and target email fallback dynamically
    const cleanId = formspreeId.trim();
    const targetEmail = cleanId.includes('@') ? cleanId : 'asesoriamaloan@gmail.com';
    
    let formspreeUrl = '';
    if (cleanId.startsWith('http://') || cleanId.startsWith('https://')) {
      formspreeUrl = cleanId;
    } else if (cleanId.includes('@')) {
      // Classic Formspree endpoint format for direct emails does not include /f/
      formspreeUrl = `https://formspree.io/${cleanId}`;
    } else {
      // Formspree Form ID format
      formspreeUrl = `https://formspree.io/f/${cleanId}`;
    }

    try {
      const response = await fetch(formspreeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        // Success
        setFormName('');
        setFormCompany('');
        setFormEmail('');
        setFormMsg('');

        const successMsg = lang === 'es'
          ? `¡Solicitud enviada con éxito! Los datos se han enviado automáticamente a través de Formspree.`
          : `Inquiry successfully submitted! Form details sent automatically via Formspree.`;
        setAlertMsg(successMsg);
      } else {
        // Fallback to mailto if Formspree endpoint returned non-200 (e.g. unconfirmed email or incorrect ID)
        console.warn('Formspree returned error status, falling back to mailto.');
        
        const mailtoUrl = `mailto:${targetEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        const tempLink = document.createElement('a');
        tempLink.href = mailtoUrl;
        tempLink.target = '_blank';
        document.body.appendChild(tempLink);
        tempLink.click();
        document.body.removeChild(tempLink);

        const fallbackMsg = lang === 'es'
          ? `Se ha abierto tu cliente de correo (${targetEmail}) para enviar la solicitud de forma directa.`
          : `Your mail application (${targetEmail}) has been opened to submit the inquiry directly.`;
        setAlertMsg(fallbackMsg);
      }
    } catch (error) {
      console.error('Error submitting form via Formspree:', error);

      // Connection error fallback to mailto
      const mailtoUrl = `mailto:${targetEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      const tempLink = document.createElement('a');
      tempLink.href = mailtoUrl;
      tempLink.target = '_blank';
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);

      const fallbackMsg = lang === 'es'
        ? `Error de conexión. Se ha abierto tu cliente de correo para enviar los datos directos a ${targetEmail}`
        : `Network error. Your mail application has opened to submit details directly to ${targetEmail}`;
      setAlertMsg(fallbackMsg);
    } finally {
      setIsSubmitting(false);
      // Fade out success notification after 7s
      setTimeout(() => {
        setAlertMsg('');
      }, 7000);
    }
  };

  // Convert current calculator values to form
  const handleApplyResult = () => {
    const defaultMsg = lang === 'es'
      ? `Solicito formalmente consultoría legal para un conductor de ${currentCountry.nameEs} con permiso clase ${selectedLicense}. Resultado del simulador de cumplimiento preliminar: Tasa de Viabilidad del ${auditReport.score}%.`
      : `I request formal legal consulting for a driver from ${currentCountry.nameEn} with permit class ${selectedLicense}. Calculated preliminary suitability score is ${auditReport.score}%.`;
    setFormMsg(defaultMsg);
    
    // Smooth scroll down to contact section
    const target = document.getElementById('contacto');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Delete logged request
  const handleDeleteRequest = (id: string) => {
    const filtered = requests.filter(r => r.id !== id);
    saveRequests(filtered);
  };

  // Filtered Treaty list
  const filteredCountries = COUNTRIES.filter(c => {
    if (selectedTreatyFilter === 'all') return true;
    return c.treatyStatus === selectedTreatyFilter;
  });

  return (
    <div className="absolute inset-0 overflow-y-auto bg-brand-dark selection:bg-gold selection:text-navy text-on-surface select-none pb-0">
      
      {/* 1. Header / Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-navy/95 backdrop-blur-md border-b border-white/[0.08] transition-all duration-300">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-3 flex justify-between items-center">
          
          {/* Brand/Logo Section */}
          <a href="#" className="flex items-center gap-3 group focus:outline-none">
            <div className="relative overflow-hidden bg-navy p-1 transition-all duration-300">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuASwlbp0IVmK9GeJx5pu2fUnJqHbmgJfW9USxf5B8g4B3o4TrSAZtXIXqLgzRX_B6nQldkMzjGKGWm04lmZLdkJNIIqUxLZj39b1d9wTjBQiLXufs9Gz742Cjx823dcGFeBBNqeIE_Boc_sdngYPLjpNqOGobyEuF1TH5MoL32gAY-iEH5CAzcW1XltFHA55931AMbMtmgQbva6StgYm1Cfy6-YsLEwF6LrunHzwvzWVnnQ9JLhFb6FbNAI1t5Hx2A7SilzQL5wCg" 
                alt="AR Asesores" 
                className="h-14 w-auto object-contain brightness-110 pointer-events-none group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg md:text-xl tracking-tight text-white/95">
                AR <span className="text-gold font-bold font-display">Asesores</span>
              </span>
              <span className="typography-label-sm uppercase tracking-wider text-white/40 scale-95 origin-left">
                EXTRANJERÍA | TRANSPORTES
              </span>
            </div>
          </a>

          {/* Core Navigation Items */}
          <nav className="hidden md:flex items-center gap-8">
            <a 
              href="#servicios" 
              className="typography-label-caps text-xs text-white/80 hover:text-gold transition-colors relative after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1px] after:bg-gold hover:after:w-full after:transition-all after:duration-300"
            >
              {lang === 'es' ? 'Servicios' : 'Services'}
            </a>
            <a 
              href="#metodologia" 
              className="typography-label-caps text-xs text-white/80 hover:text-gold transition-colors relative after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1px] after:bg-gold hover:after:w-full after:transition-all after:duration-300"
            >
              {lang === 'es' ? 'Metodología' : 'Methodology'}
            </a>
             {showCalculator && (
              <a 
                href="#diagnostico" 
                className="typography-label-caps text-xs text-white/80 hover:text-gold transition-colors relative after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1px] after:bg-gold hover:after:w-full after:transition-all after:duration-300"
              >
                {lang === 'es' ? 'Auditoría' : 'Audit'}
              </a>
            )}
            <a 
              href="#contacto" 
              className="typography-label-caps text-xs text-white/80 hover:text-gold transition-colors relative after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1px] after:bg-gold hover:after:w-full after:transition-all after:duration-300"
            >
              {lang === 'es' ? 'Contacto' : 'Contact'}
            </a>
          </nav>

          {/* Right Action Widgets: Language Switcher + Free Consultation */}
          <div className="flex items-center gap-4">
            
            {/* Lang Switcher Button */}
            <button 
              onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
              className="px-3 py-1.5 rounded-full border border-white/20 text-xs typography-label-caps flex items-center gap-1 hover:border-gold hover:text-gold text-white/90 transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-gold cursor-pointer"
              title={lang === 'es' ? 'Switch to English' : 'Cambiar a Español'}
              id="lang-selector-btn"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{lang === 'es' ? 'EN' : 'ES'}</span>
            </button>

            <a 
              href="#contacto" 
              className="hidden lg:block bg-gold text-navy typography-label-caps text-xs px-5 py-2.5 rounded-full font-bold hover:bg-white hover:text-navy transition-all duration-300 border border-gold focus:outline-none focus:ring-2 focus:ring-white"
              id="top-cta-consult"
            >
              {t.consultationTitle}
            </a>
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-20" />

      {/* 2. Hero Section: Elegant overlay with the specific White/Yellow Trucks image */}
      <section className="relative min-h-[580px] flex items-center justify-center overflow-hidden py-16 bg-navy/90" id="hero-section">
        {/* Absolute Background Container */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/95 to-transparent z-10" />
          <div className="absolute inset-0 bg-black/40 z-10" />
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0zE4YV7xH45r7sWV8urmRdz7K6LbC8MbTJuTiA8WgwqRTv0UZHPyPeR63TAzagsdfZhel3JOCIR45WZ5Pv7mXAIuvkVTdX3hKluW7uGkCqyl2jTvBtn409PjHfTScRQMrAzaYZEKp7r5NjQmCJV-EebENGYzA_SVAnEqgt11RiQD4uRkJP0n7yvNEgr9SpI4S6ppdE55eIMQHaZ59uhZrRz9mFbbCjlHSDDYsJXpondQrBMkO4pvkIuXRxDkyTLauomXaBE8xEw" 
            alt="AR Asesores Fleet Alignment" 
            className="w-full h-full object-cover object-center transform scale-102 hover:scale-105 transition-transform duration-10000"
          />
        </div>

        {/* Content Container */}
        <div className="relative z-20 max-w-[1280px] mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 flex flex-col justify-center text-left">
            
            {/* Accent tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/10 w-fit rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-gold" />
              <span className="typography-label-caps text-[10px] tracking-widest text-gold font-bold">
                {t.heroSubtitle}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="typography-display-lg text-white mb-6 select-text max-w-3xl">
              {lang === 'es' ? (
                <>
                  Soluciones legales para la <span className="text-gold font-semibold">movilidad global</span> de conductores
                </>
              ) : (
                <>
                  Legal solutions for the <span className="text-gold font-semibold">global mobility</span> of drivers
                </>
              )}
            </h1>

            {/* Supporting Copy */}
            <p className="typography-body-lg text-white/80 mb-10 select-text max-w-2xl leading-relaxed">
              {t.heroDesc}
            </p>

            {/* Actions Block */}
            <div className="flex flex-wrap gap-4 md:gap-6">
              <a 
                href="#diagnostico" 
                onClick={handleOpenCalculator}
                className="typography-label-caps text-xs px-8 py-4 bg-gold text-navy font-bold rounded-full hover:bg-white hover:text-navy hover:scale-[1.02] transform transition-all duration-300 shadow-lg text-center min-w-[180px] focus:outline-none focus:ring-2 focus:ring-gold"
                id="hero-diagnostic-cta"
              >
                {t.btnDiagnostic}
              </a>
              <a 
                href="#servicios" 
                className="typography-label-caps text-xs px-8 py-4 border-2 border-white/40 text-white rounded-full hover:bg-white/10 hover:border-white hover:scale-[1.02] transform transition-all duration-300 text-center min-w-[150px] focus:outline-none focus:ring-2 focus:ring-white"
                id="hero-services-cta"
              >
                {t.btnServices}
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Numerical Statistics Band: Styled with premium tone and negative borders */}
      <section className="bg-navy border-y border-white/[0.08]" id="stats-section">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12 divide-y md:divide-y-0 md:divide-x divide-white/[0.08] grid grid-cols-1 md:grid-cols-3 text-center">
          
          {/* Stat 1 */}
          <div className="py-12 px-6 flex flex-col justify-center items-center hover:bg-white/[0.01] transition-all duration-300">
            <span className="font-display font-medium text-4xl lg:text-5xl text-gold tracking-tight mb-2">
              20+
            </span>
            <span className="typography-label-caps text-[11px] text-white/50 tracking-widest mb-2 block">
              {t.stat1Title}
            </span>
            <p className="typography-body-md text-white/70 max-w-[280px]">
              {t.stat1Desc}
            </p>
          </div>

          {/* Stat 2 */}
          <div className="py-12 px-6 flex flex-col justify-center items-center hover:bg-white/[0.01] transition-all duration-300">
            <span className="font-display font-medium text-4xl lg:text-5xl text-gold tracking-tight mb-2">
              99%
            </span>
            <span className="typography-label-caps text-[11px] text-white/50 tracking-widest mb-2 block">
              {t.stat2Title}
            </span>
            <p className="typography-body-md text-white/70 max-w-[280px]">
              {t.stat2Desc}
            </p>
          </div>

          {/* Stat 3 */}
          <div className="py-12 px-6 flex flex-col justify-center items-center hover:bg-white/[0.01] transition-all duration-300">
            <span className="font-display font-medium text-4xl lg:text-5xl text-gold tracking-tight mb-2">
              1.000+
            </span>
            <span className="typography-label-caps text-[11px] text-white/50 tracking-widest mb-2 block">
              {t.stat3Title}
            </span>
            <p className="typography-body-md text-white/70 max-w-[280px]">
              {t.stat3Desc}
            </p>
          </div>

        </div>
      </section>

      {/* 4. Services Section: Deep Editorial Aged Cream Surface contrast to break dark grids */}
      <section className="bg-cream py-24 text-charcoal border-b border-navy/10" id="servicios">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12">
          
          {/* Subtitle & Title layout */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-8">
            <div className="max-w-xl">
              <span className="typography-label-caps text-xs font-semibold text-gold mb-3 block">
                {t.sectionServices}
              </span>
              <h2 className="typography-headline-md text-navy">
                {t.servicesTitle}
              </h2>
            </div>
            <p className="typography-body-lg text-charcoal/80 max-w-sm leading-relaxed border-l-2 border-gold/30 pl-4">
              {t.servicesSubtitle}
            </p>
          </div>

          {/* Service Cards Grid - Mix of sharp corners & high aesthetic border triggers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12" id="service-module-grid">
            
            {/* Service card 1: MÓDULO INTERNACIONAL */}
            <div className="group border border-navy/10 p-10 lg:p-12 bg-white flex flex-col justify-between hover:border-gold hover:-translate-y-1 transition-all duration-500 rounded-[2px] shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-navy group-hover:bg-gold transition-colors" />
              <div>
                <div className="mb-6 flex justify-between items-start">
                  <div className="p-3 bg-navy/5 rounded-full inline-block text-navy group-hover:text-gold transition-colors">
                    <Globe className="w-8 h-8" />
                  </div>
                  <span className="typography-label-caps text-[10px] bg-navy text-white px-3 py-1 rounded-full font-bold">
                    {t.modIntTitle}
                  </span>
                </div>
                
                <h3 className="font-display text-2xl text-navy mb-4 font-bold tracking-tight">
                  {t.modIntSubtitle}
                </h3>
                
                <p className="typography-body-md text-charcoal/80 mb-8 leading-relaxed">
                  {t.modIntDesc}
                </p>

                <div className="space-y-3.5 mb-8">
                  <div className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full mt-2" />
                    <span className="typography-label-caps text-xs text-charcoal/90 font-semibold">
                      {t.modIntBullet1}
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full mt-2" />
                    <span className="typography-label-caps text-xs text-charcoal/90 font-semibold">
                      {t.modIntBullet2}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-navy/5">
                <a 
                  href="#diagnostico" 
                  onClick={handleOpenCalculator}
                  className="inline-flex items-center gap-2 group-hover:text-gold text-navy typography-label-caps text-xs font-bold transition-all duration-300"
                >
                  <span>{lang === 'es' ? 'AUDITAR IDONEIDAD' : 'AUDIT CANDIDATES'}</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
                </a>
              </div>
            </div>

            {/* Service card 2: MÓDULO NACIONAL */}
            <div className="group border border-navy/10 p-10 lg:p-12 bg-white flex flex-col justify-between hover:border-gold hover:-translate-y-1 transition-all duration-500 rounded-[2px] shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-navy group-hover:bg-gold transition-colors" />
              <div>
                <div className="mb-6 flex justify-between items-start">
                  <div className="p-3 bg-navy/5 rounded-full inline-block text-navy group-hover:text-gold transition-colors">
                    <Truck className="w-8 h-8" />
                  </div>
                  <span className="typography-label-caps text-[10px] bg-gold text-navy px-3 py-1 rounded-full font-bold">
                    {t.modNacTitle}
                  </span>
                </div>

                <h3 className="font-display text-2xl text-navy mb-4 font-bold tracking-tight">
                  {t.modNacSubtitle}
                </h3>

                <p className="typography-body-md text-charcoal/80 mb-8 leading-relaxed">
                  {t.modNacDesc}
                </p>

                <div className="space-y-3.5 mb-8">
                  <div className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full mt-2" />
                    <span className="typography-label-caps text-xs text-charcoal/90 font-semibold">
                      {t.modNacBullet1}
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full mt-2" />
                    <span className="typography-label-caps text-xs text-charcoal/90 font-semibold">
                      {t.modNacBullet2}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-navy/5">
                <a 
                  href="#catalogo-tratados" 
                  onClick={handleOpenCatalog}
                  className="inline-flex items-center gap-2 group-hover:text-gold text-navy typography-label-caps text-xs font-bold transition-all duration-300"
                >
                  <span>{lang === 'es' ? 'VER CONVENIOS DE CANJE' : 'EXPLORE RECIPROCITIES'}</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
                </a>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 5. Methodology Section: Rigorous Dark Slate Design Layout */}
      <section className="py-24 bg-navy text-white overflow-hidden border-b border-white/[0.08]" id="metodologia">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-24 lg:gap-16 items-start">
            
            {/* Left anchor summary column */}
            <div className="lg:col-span-4 max-w-sm sticky top-24">
              <span className="typography-label-caps text-xs text-gold mb-3 block font-semibold">
                {t.sectionMethod}
              </span>
              <h2 className="typography-headline-md leading-tight mb-6">
                {t.methodTitle}
              </h2>
              <p className="typography-body-md text-white/70 leading-relaxed mb-12">
                {t.methodSubtitle}
              </p>
              
              <div className="p-6 bg-white/[0.03] border border-white/[0.07] rounded-[2px] hidden lg:block">
                <span className="typography-label-sm text-gold font-bold block mb-2">
                  {lang === 'es' ? 'TIEMPO MEDIO GLOBAL' : 'AVERAGE FLEET DEPLOYMENT'}
                </span>
                <p className="font-display text-lg text-white font-medium">
                  {lang === 'es' ? '90 días a operatividad plena' : '90 days to full operation'}
                </p>
              </div>
            </div>

            {/* Right step roadmap grid columns */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-12">
              
              {/* Step 1 */}
              <div className="pl-6 border-l border-white/20 hover:border-gold transition-colors duration-300">
                <span className="font-display text-primary-fixed text-lg text-gold font-bold mb-3 block">
                  {t.method1Title}
                </span>
                <p className="typography-body-md text-white/80 leading-relaxed">
                  {t.method1Desc}
                </p>
              </div>

              {/* Step 2 */}
              <div className="pl-6 border-l border-white/20 hover:border-gold transition-colors duration-300">
                <span className="font-display text-primary-fixed text-lg text-gold font-bold mb-3 block">
                  {t.method2Title}
                </span>
                <p className="typography-body-md text-white/80 leading-relaxed">
                  {t.method2Desc}
                </p>
              </div>

              {/* Step 3 */}
              <div className="pl-6 border-l border-white/20 hover:border-gold transition-colors duration-300">
                <span className="font-display text-primary-fixed text-lg text-gold font-bold mb-3 block">
                  {t.method3Title}
                </span>
                <p className="typography-body-md text-white/80 leading-relaxed">
                  {t.method3Desc}
                </p>
              </div>

              {/* Step 4 */}
              <div className="pl-6 border-l border-white/20 hover:border-gold transition-colors duration-300">
                <span className="font-display text-primary-fixed text-lg text-gold font-bold mb-3 block">
                  {t.method4Title}
                </span>
                <p className="typography-body-md text-white/80 leading-relaxed">
                  {t.method4Desc}
                </p>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 6. ADVANCED INTERACTIVE TOOL: Compliance & Dynamic Feasibility Calculator */}
      <section className={`${showCalculator ? 'block' : 'hidden'} bg-brand-dark py-24 border-b border-white/[0.08]`} id="diagnostico">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="typography-label-caps text-xs text-gold mb-3 block font-semibold">
              {t.sectionCalculator}
            </span>
            <h2 className="typography-headline-md text-white tracking-tight">
              {t.calculatorTitle}
            </h2>
            <p className="typography-body-md text-white/70 mt-3">
              {t.calculatorSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
            
            {/* Input Configuration Panel (Left side, 5 columns) */}
            <div className="lg:col-span-6 bg-navy/80 border border-white/[0.06] p-8 rounded-[4px] flex flex-col justify-between">
              <div>
                <h3 className="typography-label-caps text-gold text-xs font-bold mb-6 border-b border-white/10 pb-3 flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  <span>{lang === 'es' ? 'PARAMETROS DEL AUDITADO' : 'CANDIDATE COMPLIANCE STATE'}</span>
                </h3>

                {/* Country selection with actual regulation feedback */}
                <div className="mb-6 space-y-2">
                  <label className="typography-label-caps text-[11px] text-white/60 block">
                    {t.selectCountry}
                  </label>
                  <select 
                    value={selectedCountryCode}
                    onChange={(e) => setSelectedCountryCode(e.target.value)}
                    className="w-full bg-brand-dark/90 border border-white/[0.12] focus:border-gold text-white px-3 py-2.5 rounded-[2px] transition-colors font-body text-base outline-none cursor-pointer"
                  >
                    {COUNTRIES.map(c => (
                      <option key={c.code} value={c.code} className="bg-navy text-white text-base py-1">
                        {lang === 'es' ? c.nameEs : c.nameEn} {c.treatyStatus === 'direct' ? '🇪🇺' : '🌎'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Desired license category */}
                <div className="mb-6 space-y-2">
                  <label className="typography-label-caps text-[11px] text-white/60 block">
                    {t.selectLicense}
                  </label>
                  <select 
                    value={selectedLicense}
                    onChange={(e) => setSelectedLicense(e.target.value as DriverCategory)}
                    className="w-full bg-brand-dark/90 border border-white/[0.12] focus:border-gold text-white px-3 py-2.5 rounded-[2px] transition-colors font-body text-base outline-none cursor-pointer"
                  >
                    <option value="CE" className="bg-navy">{t.licenseCE}</option>
                    <option value="C" className="bg-navy">{t.licenseC}</option>
                    <option value="D" className="bg-navy">{t.licenseD}</option>
                    <option value="DE" className="bg-navy">{t.licenseDE}</option>
                    <option value="OTHER" className="bg-navy">{t.licenseOther}</option>
                  </select>
                </div>

                {/* Three safety checklist questions with bottom bordered styles */}
                <div className="mt-8 space-y-6">
                  
                  {/* Q1 */}
                  <div className="flex items-center justify-between gap-4 py-3 border-b border-white/[0.08]">
                    <span className="typography-body-md text-white/90 text-sm max-w-[80%]">
                      {t.questionExp}
                    </span>
                    <button 
                      onClick={() => setHasExperience(!hasExperience)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${hasExperience ? 'bg-gold' : 'bg-white/10'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-navy transition-transform ${hasExperience ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  {/* Q2 */}
                  <div className="flex items-center justify-between gap-4 py-3 border-b border-white/[0.08]">
                    <span className="typography-body-md text-white/90 text-sm max-w-[80%]">
                      {t.questionRecord}
                    </span>
                    <button 
                      onClick={() => setHasApostille(!hasApostille)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${hasApostille ? 'bg-gold' : 'bg-white/10'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-navy transition-transform ${hasApostille ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  {/* Q3 */}
                  <div className="flex items-center justify-between gap-4 py-3 border-b border-white/[0.08]">
                    <span className="typography-body-md text-white/90 text-sm max-w-[80%]">
                      {t.questionVisa}
                    </span>
                    <button 
                      onClick={() => setHasCleanRecord(!hasCleanRecord)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${hasCleanRecord ? 'bg-gold' : 'bg-white/10'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-navy transition-transform ${hasCleanRecord ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>

                </div>
              </div>

              {/* Informative advice snippet */}
              <div className="mt-8 p-3.5 bg-gold/5 border border-gold/15 flex items-start gap-2.5 rounded-[2px]">
                <AlertCircle className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <p className="typography-body-md text-white/80 text-xs leading-normal">
                  {lang === 'es'
                    ? 'AVISO DE RIGOR: Los estados de canje se validan con la base de datos de la DGT de España y convenios bilaterales vigentes ratificados en el BOE.'
                    : 'REGULATORY FORECAST: Exchanging status is verified against Spain\'s DGT transit database and bilateral agreements in force.'}
                </p>
              </div>

            </div>

            {/* Simulated Live Report (Right side, 7 columns) */}
            <div className="lg:col-span-6 bg-white text-charcoal p-8 rounded-[4px] border border-navy/10 flex flex-col justify-between shadow-xl">
              <div>
                
                {/* Score Indicator Header */}
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-navy/10">
                  <div>
                    <span className="typography-label-caps text-[10px] text-charcoal/50 block tracking-wider">
                      {t.reportTitle}
                    </span>
                    <h4 className="font-display font-medium text-lg text-navy">
                      {currentCountry[lang === 'es' ? 'nameEs' : 'nameEn']} ➔ Permiso {selectedLicense}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="typography-label-caps text-[10px] text-charcoal/50 block">
                      {lang === 'es' ? 'VIABILIDAD' : 'VIABILITY'}
                    </span>
                    <span className={`inline-block px-3 py-1 rounded-full typography-label-caps text-[11px] font-bold ${
                      auditReport.viable === 'high' ? 'bg-green-100 text-green-800' :
                      auditReport.viable === 'medium' ? 'bg-yellow-105 text-current opacity-90' : 'bg-red-100 text-red-800'
                    }`}>
                      {auditReport.viable === 'high' ? t.highViability :
                       auditReport.viable === 'medium' ? t.mediumViability : t.lowViability}
                    </span>
                  </div>
                </div>

                {/* Score Circle & Dynamic feedback */}
                <div className="flex items-center gap-6 mb-8 bg-navy/5 p-4 rounded-[2px] border border-navy/[0.04]">
                  <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-navy text-gold font-display text-2xl font-bold border-2 border-gold shrink-0">
                    {auditReport.score}%
                  </div>
                  <div>
                    <p className="typography-body-md text-charcoal font-semibold text-sm leading-snug">
                      {auditReport.notes}
                    </p>
                    <p className="typography-body-md text-charcoal/60 text-xs mt-1">
                      {t.reportTimeline} <strong className="text-navy">{auditReport.timeline}</strong>
                    </p>
                  </div>
                </div>

                {/* Dynamic Suggestion / Recommended Visa Channel */}
                <div className="mb-6">
                  <span className="typography-label-caps text-[10px] text-charcoal/50 block mb-1">
                    {t.reportRoute}
                  </span>
                  <p className="font-display font-bold text-navy text-base">
                    {auditReport.legalRoute}
                  </p>
                </div>

                {/* Dynamic roadmaps / requirements */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 pt-4 border-t border-navy/10">
                  
                  {/* Matched checklist */}
                  <div>
                    <span className="typography-label-caps text-[11px] text-green-700 font-bold block mb-2">
                      ✔ {t.reportMatch}
                    </span>
                    {auditReport.requirementsMatched.length > 0 ? (
                      <ul className="space-y-2 text-xs typography-body-md text-charcoal/80">
                        {auditReport.requirementsMatched.map((m, i) => (
                          <li key={i} className="flex gap-2 items-start">
                            <span className="text-green-600 mt-0.5">✔</span>
                            <span>{m}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs italic text-charcoal/40">None</p>
                    )}
                  </div>

                  {/* Requirements pending checklist */}
                  <div>
                    <span className="typography-label-caps text-[11px] text-red-700 font-bold block mb-2">
                      ⚠ {t.reportPending}
                    </span>
                    {auditReport.requirementsPending.length > 0 ? (
                      <ul className="space-y-2 text-xs typography-body-md text-charcoal/80">
                        {auditReport.requirementsPending.map((p, i) => (
                          <li key={i} className="flex gap-2 items-start">
                            <span className="text-red-500 font-bold mt-0.5">!</span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs italic text-green-700">All matched</p>
                    )}
                  </div>

                </div>

                {/* Structured Next Step Flow Roadmap list */}
                <div className="mb-4 bg-navy/5 p-4 rounded-[4px] border-l-4 border-navy">
                  <span className="typography-label-caps text-[11px] text-navy font-bold block mb-2.5">
                    {lang === 'es' ? 'PASOS DE IMPLEMENTACIÓN GENERAL' : 'CONCRETE DEPLOYMENT STEP FLOW'}
                  </span>
                  <ul className="space-y-2 text-xs typography-body-md text-charcoal/80">
                    {auditReport.roadmap.map((step, idx) => (
                      <li key={idx} className="font-medium">
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Instant Application Conversion Action */}
              <div className="pt-4 border-t border-navy/10 mt-6 flex justify-end">
                <button 
                  onClick={handleApplyResult}
                  className="w-full sm:w-auto typography-label-caps text-xs px-6 py-3.5 bg-navy text-white hover:bg-gold hover:text-navy transition-all duration-300 font-bold rounded-full flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-navy"
                  id="convert-audit-to-lead-btn"
                >
                  <FileText className="w-4 h-4" />
                  <span>{lang === 'es' ? 'CONVERTIR A CONSULTA' : 'SUBMIT ROADMAP APPLICATION'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 6.5 SOURCING CATALOGUE: Catálogo Estatal de Tratados y Tiempos de Homologación */}
      <section className={`${showCatalog ? 'block' : 'hidden'} bg-brand-dark py-24 border-b border-white/[0.08]`} id="catalogo-tratados">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12">

          {/* Additional database browser on treaties for fleet managers */}
          <div className="bg-navy/40 border border-white/[0.08] p-8 rounded-[4px]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h3 className="typography-label-caps text-white text-sm font-bold">
                  {lang === 'es' ? 'Catálogo Estatal de Tratados y Tiempos de Homologación' : 'State Catalog of Reciprocity Treaties'}
                </h3>
                <p className="typography-body-md text-white/50 text-xs mt-1">
                  {lang === 'es' 
                    ? 'Explore el listado oficial de convenios de canje vigentes regulados por el Ministerio de Asuntos Exteriores de España.'
                    : 'Explore our vetted database representing official reciprocity paths verified under Spain\'s transit regulations.'}
                </p>
              </div>
              
              {/* filter buttons */}
              <div className="flex flex-wrap gap-2">
                {(['all', 'direct', 'exam_required', 'no_treaty'] as const).map(f => (
                  <button 
                    key={f}
                    onClick={() => setSelectedTreatyFilter(f)}
                    className={`px-3 py-1.5 rounded-full text-[10px] typography-label-caps font-semibold border transition-all duration-300 focus:outline-none ${
                      selectedTreatyFilter === f 
                        ? 'bg-gold border-gold text-navy' 
                        : 'border-white/10 hover:border-white/30 text-white/70'
                    }`}
                  >
                    {f === 'all' && (lang === 'es' ? 'Todos' : 'All')}
                    {f === 'direct' && (lang === 'es' ? 'U.E. Directo' : 'Direct EU')}
                    {f === 'exam_required' && (lang === 'es' ? 'Con Examen' : 'Testing')}
                    {f === 'no_treaty' && (lang === 'es' ? 'Sin Convenio' : 'No Convenio')}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm typography-body-md">
                <thead>
                  <tr className="border-b border-white/[0.08] text-white/50 text-xs typography-label-caps">
                    <th className="py-3 px-4">{lang === 'es' ? 'País' : 'Country'}</th>
                    <th className="py-3 px-4">{lang === 'es' ? 'Estado del Convenio' : 'Treaty Status'}</th>
                    <th className="py-3 px-4">{lang === 'es' ? 'Tiempos Medios' : 'Average Duration'}</th>
                    <th className="py-3 px-4">{lang === 'es' ? 'Tasa Éxito' : 'Success %'}</th>
                    <th className="py-3 px-4 hidden md:table-cell">{lang === 'es' ? 'Detalle y Pruebas' : 'Detail'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] text-white/80 text-xs md:text-sm">
                  {filteredCountries.map(c => (
                    <tr 
                      key={c.code} 
                      onClick={() => {
                        setSelectedCountryCode(c.code);
                        setShowCalculator(true);
                        setShowCatalog(false);
                        // smooth scroll calculator up slightly
                        setTimeout(() => {
                          const calcEl = document.getElementById('diagnostico');
                          if (calcEl) calcEl.scrollIntoView({ behavior: 'smooth' });
                        }, 50);
                      }}
                      className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-body font-bold text-white group-hover:text-gold transition-colors">
                        {lang === 'es' ? c.nameEs : c.nameEn}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.0 py-0.5 rounded typography-label-sm text-[9px] font-bold ${
                          c.treatyStatus === 'direct' ? 'bg-green-950 text-green-300' :
                          c.treatyStatus === 'exam_required' ? 'bg-yellow-950 text-yellow-300' : 'bg-red-950 text-red-300'
                        }`}>
                          {c.treatyStatus === 'direct' ? (lang === 'es' ? 'DIRECTO' : 'DIRECT EU') :
                           c.treatyStatus === 'exam_required' ? (lang === 'es' ? 'EXAMEN' : 'EXAM') : (lang === 'es' ? 'CUPO' : 'ORDINARY')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono">{c.averageTimeline}</td>
                      <td className="py-3.5 px-4 text-gold font-bold">{c.successRate}</td>
                      <td className="py-3.5 px-4 hidden md:table-cell text-white/60 text-xs text-pretty max-w-sm">
                        {lang === 'es' ? c.canjeEs : c.canjeEn}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </section>

      {/* 7. Contact Info & Intake Portal Registration Form */}
      <section className="bg-cream py-24 text-charcoal" id="contacto">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            
            {/* Left Column: Direct office addresses and live communications buttons */}
            <div className="lg:col-span-6 space-y-12">
              <div>
                <h2 className="typography-display-lg text-navy mb-6 select-text">
                  {t.formTitle}
                </h2>
                <p className="typography-body-lg text-charcoal/80 max-w-lg select-text leading-relaxed">
                  {t.formSubtitle}
                </p>
              </div>

              {/* Multi Offices details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-navy/10">
                
                {/* Office 1 */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-navy">
                    <MapPin className="w-5 h-5 text-gold shrink-0" />
                    <h4 className="typography-label-caps text-xs font-bold font-sans">
                      {t.murciaOffice}
                    </h4>
                  </div>
                  <p className="typography-body-md text-charcoal/70 text-sm leading-relaxed pl-7">
                    C/ Canarias nº 13<br />
                    30500 Molina de Segura (Murcia, España)
                  </p>
                </div>

                {/* Office 2 */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-navy">
                    <MapPin className="w-5 h-5 text-gold shrink-0" />
                    <h4 className="typography-label-caps text-xs font-bold font-sans">
                      {t.almeriaOffice}
                    </h4>
                  </div>
                  <p className="typography-body-md text-charcoal/70 text-sm leading-relaxed pl-7">
                    Avda. América nº 17, Local F<br />
                    04008 Albox (Almería, España)
                  </p>
                </div>

              </div>

              {/* Direct Touch Communication buttons */}
              <div className="pt-8 border-t border-navy/10 space-y-4">
                <span className="typography-label-caps text-xs font-bold text-navy block">
                  {t.directContact}
                </span>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Phone CTA */}
                  <a 
                    href="tel:+34607953389"
                    className="flex-1 px-5 py-4 bg-navy text-white hover:bg-gold hover:text-navy transition-all duration-300 font-sans font-medium text-sm flex items-center justify-center gap-2 rounded-[2px] whitespace-nowrap"
                  >
                    <Phone className="w-4 h-4 text-gold shrink-0" />
                    <span className="whitespace-nowrap">Tlfno: +34 607 953 389</span>
                  </a>

                  {/* WhatsApp Link button */}
                  <a 
                    href="https://wa.me/3461031902"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 px-5 py-4 bg-[#25D366] text-white hover:opacity-95 transition-opacity font-sans font-medium text-sm flex items-center justify-center gap-2 rounded-[2px] whitespace-nowrap"
                  >
                    <Globe className="w-4 h-4 shrink-0" />
                    <span className="whitespace-nowrap">WhatsApp Chat</span>
                  </a>

                  {/* Mail directly */}
                  <a 
                    href={`mailto:${formspreeId.includes('@') ? formspreeId.trim() : 'asesoriamaloan@gmail.com'}`}
                    className="flex-1 px-5 py-4 bg-white border border-navy/20 text-navy hover:bg-navy/5 transition-colors font-sans font-medium text-sm flex items-center justify-center gap-2 rounded-[2px]"
                  >
                    <Mail className="w-4 h-4 text-gold shrink-0" />
                    <span>{formspreeId.includes('@') ? formspreeId.trim() : 'asesoriamaloan@gmail.com'}</span>
                  </a>
                </div>
              </div>

            </div>

            {/* Right Column: Dynamic submission form built with editorial styling principles */}
            <div className="lg:col-span-6 bg-white p-8 md:p-10 border border-navy/10 shadow-xl rounded-[2px]" id="leads-submit-card">
              
              <form onSubmit={handleContactSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full name input */}
                  <div className="space-y-1.5">
                    <label className="typography-label-caps text-[10px] text-charcoal/50 block font-bold">
                      {lang === 'es' ? 'Nombre Completo' : 'Your Full Name'}
                    </label>
                    <input 
                      type="text"
                      className="w-full bg-transparent border-b border-navy/20 focus:border-gold px-0 py-2.5 outline-none transition-colors text-charcoal text-base font-body"
                      placeholder={t.placeholderName}
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      required
                      id="input-name"
                    />
                  </div>

                  {/* Company input */}
                  <div className="space-y-1.5">
                    <label className="typography-label-caps text-[10px] text-charcoal/50 block font-bold">
                      {lang === 'es' ? 'Empresa' : 'Company / Fleet Name'}
                    </label>
                    <input 
                      type="text"
                      className="w-full bg-transparent border-b border-navy/20 focus:border-gold px-0 py-2.5 outline-none transition-colors text-charcoal text-base font-body"
                      placeholder={t.placeholderCompany}
                      value={formCompany}
                      onChange={(e) => setFormCompany(e.target.value)}
                      id="input-company"
                    />
                  </div>
                </div>

                {/* Email input */}
                <div className="space-y-1.5">
                  <label className="typography-label-caps text-[10px] text-charcoal/50 block font-bold">
                    {lang === 'es' ? 'Correo Electrónico' : 'Corporate Email Address'}
                  </label>
                  <input 
                    type="email"
                    className="w-full bg-transparent border-b border-navy/20 focus:border-gold px-0 py-2.5 outline-none transition-colors text-charcoal text-base font-body"
                    placeholder={t.placeholderEmail}
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    required
                    id="input-email"
                  />
                </div>

                {/* Text query input */}
                <div className="space-y-1.5">
                  <label className="typography-label-caps text-[10px] text-charcoal/50 block font-bold">
                    {lang === 'es' ? 'Mensaje / Consulta' : 'Describe your fleet or driver inquiry'}
                  </label>
                  <textarea 
                    rows={4}
                    className="w-full bg-transparent border-b border-navy/20 focus:border-gold px-0 py-2 transition-colors text-charcoal text-base resize-none font-body outline-none"
                    placeholder={t.placeholderMsg}
                    value={formMsg}
                    onChange={(e) => setFormMsg(e.target.value)}
                    id="input-msg"
                  />
                </div>

                {/* Active alert feedback container */}
                {alertMsg && (
                  <div className="p-4 bg-green-50 border border-green-200 text-green-800 text-sm flex gap-2 items-center rounded-[2px]" id="contact-success-alert">
                    <CheckCircle className="w-5 h-5 shrink-0" />
                    <span>{alertMsg}</span>
                  </div>
                )}

                {/* Contact Submit trigger */}
                <div className="pt-4 space-y-4">
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full bg-navy text-white hover:bg-gold hover:text-navy transition-all duration-300 font-sans font-bold py-5 px-6 rounded-full typography-label-caps text-xs tracking-wider cursor-pointer select-none border-none focus:outline-none focus:ring-2 focus:ring-gold flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-85 cursor-wait' : ''}`}
                    id="form-submit-trigger"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>{lang === 'es' ? 'Enviando...' : 'Sending...'}</span>
                      </>
                    ) : (
                      <span>{t.lblSubmit}</span>
                    )}
                  </button>

                  {/* Formspree Configuration Options */}
                  <div className="flex flex-col items-end">
                    <button
                      type="button"
                      onClick={() => setShowFormspreeConfig(!showFormspreeConfig)}
                      className="text-[10px] text-charcoal/40 hover:text-navy underline flex items-center gap-1 focus:outline-none"
                    >
                      <span>⚙️ {lang === 'es' ? 'Configurar endpoint Formspree' : 'Configure Formspree endpoint'}</span>
                    </button>
                    {showFormspreeConfig && (
                      <div className="w-full mt-3 p-3 bg-navy/5 border border-navy/10 rounded-[2px] space-y-2 text-left">
                        <p className="text-[10px] text-charcoal/70 leading-normal">
                          {lang === 'es'
                            ? 'Por defecto los datos se envían a asesoriamaloan@gmail.com a través de Formspree. Si prefiere usar un Form ID personalizado de Formspree (ej: xoqgkyld), introdúzcalo aquí:'
                            : 'By default, data is submitted to asesoriamaloan@gmail.com via Formspree. If you prefer to use a custom Formspree Form ID (e.g., xoqgkyld), enter it below:'}
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={formspreeId}
                            onChange={(e) => handleSaveFormspreeId(e.target.value)}
                            placeholder="asesoriamaloan@gmail.com"
                            className="flex-1 bg-white border border-navy/20 px-2.5 py-1 text-xs outline-none rounded-[2px]"
                          />
                          <button
                            type="button"
                            onClick={() => setShowFormspreeConfig(false)}
                            className="bg-navy text-white text-xs px-3 py-1 rounded-[2px] hover:bg-gold hover:text-navy font-sans transition-colors"
                          >
                            {lang === 'es' ? 'Guardar' : 'Save'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </form>

            </div>

          </div>

          {/* Interactive Live Submission Registry Tracker (Fleet Manager Dashboard Control) */}
          {showFleetControl && (
            <div className="mt-20 border-t border-navy/10 pt-16" id="consult-tracker-parent">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                  <h3 className="typography-label-caps text-navy text-sm font-bold flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    <span>{t.viewActiveLogs}</span>
                  </h3>
                  <p className="typography-body-md text-charcoal/60 text-xs mt-1">
                    {lang === 'es' 
                      ? 'Monitoree los expedientes y solicitudes registradas localmente en esta sesión.' 
                      : 'Monitor registered legal files and consulting submissions recorded locally.'}
                  </p>
                </div>

                {/* quick actions */}
                <button 
                  onClick={() => {
                    if (confirm(lang === 'es' ? '¿Vaciar base de datos local?' : 'Clear corporate database logs?')) {
                      saveRequests([]);
                      localStorage.removeItem('lex_requests_v1');
                    }
                  }}
                  className="typography-label-caps text-[10px] font-bold text-red-700 hover:text-red-950 flex items-center gap-1 focus:outline-none"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{lang === 'es' ? 'RESETEAR DATOS' : 'CLEAR DATABASES'}</span>
                </button>
              </div>

              {requests.length === 0 ? (
                <div className="p-8 bg-white border border-navy/10 rounded-[2px] text-center">
                  <p className="typography-body-lg text-charcoal/50 italic text-sm">
                    {t.noActiveRequests}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="consult-tracker-panel">
                  {requests.map((r) => (
                    <div key={r.id} className="p-6 bg-white border border-navy/10 rounded-[2px] shadow-sm relative hover:shadow-md transition-shadow">
                      
                      <div className="flex justify-between items-start gap-3 mb-4">
                        <div>
                          <span className="typography-label-sm text-gold font-bold bg-navy px-2.5 py-0.5 rounded-[2px]">
                            {r.id}
                          </span>
                          <h4 className="font-display font-medium text-navy text-base mt-2">
                            {r.fullName}
                          </h4>
                          <span className="typography-label-caps text-[9px] text-charcoal/50 block tracking-wider">
                            {r.companyName}
                          </span>
                        </div>
                        
                        <span className={`inline-block px-2.0 py-0.5 rounded typography-label-sm text-[9px] font-bold ${
                          r.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-105 text-current opacity-90'
                        }`}>
                          {r.status === 'approved' ? t.badgeApproved : t.badgePending}
                        </span>
                      </div>

                      <p className="typography-body-md text-charcoal/80 text-sm mb-4 bg-navy/5 p-3 rounded-[2px] italic leading-relaxed">
                        "{r.message}"
                      </p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-charcoal/60 border-t border-navy/5 pt-3">
                        <span>👤 {lang === 'es' ? 'Origen:' : 'Origin:'} <strong>{r.candidateCountry || 'N/A'}</strong></span>
                        <span>🪪 {lang === 'es' ? 'Licencia:' : 'License:'} <strong>{r.candidateLicense || 'N/A'}</strong></span>
                        <span>📊 {lang === 'es' ? 'Índice:' : 'Score:'} <strong className="text-navy">{r.calculatedScore ? `${r.calculatedScore}%` : 'N/A'}</strong></span>
                        <span className="ml-auto text-[10px] font-mono"><Clock className="w-3 h-3 inline mr-1" />{r.createdAt}</span>
                      </div>

                      {/* interactive action logic inside the logger */}
                      <div className="mt-4 flex justify-end gap-2">
                        <button 
                          onClick={() => {
                            alert(
                              lang === 'es' 
                                ? `Generando Dossier de Homologación para candidatura [${r.fullName}]...\nOrigen: ${r.candidateCountry}\nTipo: ${r.candidateLicense}\n\nCanales DGT activados para ${r.fullName}. Procederemos a requerir partida consular.`
                                : `Generating professional immigration dossier for candidate [${r.fullName}]...\nOrigin: ${r.candidateCountry}\nType: ${r.candidateLicense}\n\nDGT coordination queues enabled.`
                            );
                          }}
                          className="text-[10px] typography-label-caps text-navy hover:text-gold flex items-center gap-1 font-bold focus:outline-none"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{t.exportLabel}</span>
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </section>

      {/* 8. Fully compliant Brand footer matching AR Asesores structure */}
      <footer className="bg-navy border-t border-white/[0.08] py-16" id="footer">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
            
            {/* Logo placeholder/image & descriptive footer */}
            <div className="flex items-center gap-3">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuASwlbp0IVmK9GeJx5pu2fUnJqHbmgJfW9USxf5B8g4B3o4TrSAZtXIXqLgzRX_B6nQldkMzjGKGWm04lmZLdkJNIIqUxLZj39b1d9wTjBQiLXufs9Gz742Cjx823dcGFeBBNqeIE_Boc_sdngYPLjpNqOGobyEuF1TH5MoL32gAY-iEH5CAzcW1XltFHA55931AMbMtmgQbva6StgYm1Cfy6-YsLEwF6LrunHzwvzWVnnQ9JLhFb6FbNAI1t5Hx2A7SilzQL5wCg" 
                alt="AR Asesores" 
                className="h-10 w-auto opacity-80"
              />
              <div className="flex flex-col">
                <span className="font-display font-bold text-white tracking-tight">
                  AR <span className="text-gold font-normal">Asesores</span>
                </span>
                <span className="typography-label-sm uppercase tracking-widest text-white/30 scale-90 origin-left">
                  Lex Transport Executive
                </span>
              </div>
            </div>

            {/* Direct legal links of footer */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-white/50 text-[11px] typography-label-caps font-semibold items-center">
              <span className="hover:text-gold cursor-pointer transition-colors">{t.avisoLegal}</span>
              <span className="hover:text-gold cursor-pointer transition-colors">{t.politicaPrivacidad}</span>
              <span className="hover:text-gold cursor-pointer transition-colors">{t.terminosServicio}</span>
              <span className="hover:text-gold cursor-pointer transition-colors">{t.cookies}</span>
              <button 
                onClick={handleAsesorLoginClick}
                className="hover:text-gold cursor-pointer transition-all duration-300 text-white/30 border-l border-white/10 pl-6 focus:outline-none uppercase text-[11px] tracking-wider"
                title={lang === 'es' ? 'Acceso Exclusivo Personal AR Asesores' : 'AR Asesores Internal Access Only'}
              >
                {lang === 'es' ? '🔑 Acceso AR' : '🔑 AR Staff'}
              </button>
            </div>

          </div>

          <div className="pt-8 border-t border-white/[0.08] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-white/40 text-[11px] tracking-wide">
            <p className="max-w-2xl">
              © 2026 AR Asesores | Lex Transport Executive. {t.footerRights}
            </p>
            <p className="text-right shrink-0">
              {lang === 'es' ? 'Régimen de Movilidad de Trabajadores Extranjeros en el Transporte' : 'Immigration Scheme for Foreign Workers in Transit'}
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
}
