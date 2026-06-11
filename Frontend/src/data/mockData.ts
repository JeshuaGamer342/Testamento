export type NotaryCard = {
  name: string
  office: string
  id: string
  city: string
  mail: string
}

export type DashboardSummaryCard = {
  label: string
  value: string
  icon: string
  badge?: string
}

export type DashboardInboxItem = {
  id: string
  name: string
  preview: string
  expId: string
  date: string
}

export type DashboardCaseFile = {
  id: string
  name: string
  email: string
  process: string
  legalStatus: string
  legalTone: 'info' | 'muted' | 'success'
  lastUpdate: string
}

export const topNavLinks = [
  { to: '/', label: 'Inicio' },
  { to: '/mi-testamento', label: 'Mi testamento' },
  { to: '/notarios-disponibles', label: 'Notarios disponibles' },
  { to: '/nuevo-notario', label: 'Nuevo notario' },
]

export const processCards = [
  {
    title: 'Responde 5 preguntas',
    text: 'Nuestro asistente recopila la informacion esencial para tu voluntad en pocos minutos.',
  },
  {
    title: 'Genera tu documento base',
    text: 'Creamos un borrador legal en PDF alineado con estructuras notariales actuales.',
  },
  {
    title: 'Elige un notario',
    text: 'Conecta con notarios colegiados y priorizados por validacion y membresia activa.',
  },
  {
    title: 'Comunicate por chat',
    text: 'Resuelve ajustes finales y agenda la firma presencial de forma segura.',
  },
]

export const securityPoints = [
  {
    title: 'Encripcion privada',
    text: 'Protocolos de seguridad de nivel legal para proteger informacion sensible.',
  },
  {
    title: 'Validez estructural',
    text: 'Plantillas revisadas para facilitar la formalizacion notarial del tramite.',
  },
  {
    title: 'Soporte continuo',
    text: 'Acompanamiento de nuestro equipo durante todo el proceso digital.',
  },
]

export const metricCards = [
  {
    title: '98%',
    subtitle: 'Eficiencia notarial',
    text: 'Menos tiempo de preparacion documental.',
  },
  {
    title: 'Colegiados',
    subtitle: 'Red validada',
    text: 'Mas de 150 notarios verificados.',
  },
  {
    title: '15 minutos',
    subtitle: 'Tiempo promedio',
    text: 'Para generar un primer borrador.',
  },
  {
    title: 'Nube segura',
    subtitle: 'Acceso continuo',
    text: 'Gestiona archivos desde cualquier dispositivo.',
  },
]

export const notaryCards: NotaryCard[] = [
  {
    name: 'Lic. Alejandro Villarreal',
    office: 'Notaria No. 124',
    id: 'PROF-9923841',
    city: 'Ciudad de Mexico, CDMX',
    mail: 'a.villarreal@notaria124.mx',
  },
  {
    name: 'Dra. Beatriz Elena Rosales',
    office: 'Notaria No. 42',
    id: 'PROF-8231054',
    city: 'Monterrey, Nuevo Leon',
    mail: 'b.rosales@notaria42mty.com',
  },
  {
    name: 'Lic. Carlos Eduardo Meza',
    office: 'Notaria No. 15',
    id: 'PROF-1120034',
    city: 'Guadalajara, Jalisco',
    mail: 'cmeza@legalservices.mx',
  },
  {
    name: 'Mtra. Sofia Altamirano',
    office: 'Notaria No. 5',
    id: 'PROF-7744120',
    city: 'Queretaro, QRO',
    mail: 'saltamirano@qro-notaria5.com',
  },
  {
    name: 'Lic. Roberto Mancilla',
    office: 'Notaria No. 88',
    id: 'PROF-6651233',
    city: 'Puebla, Puebla',
    mail: 'rmancilla@notariosunidos.mx',
  },
  {
    name: 'Lic. Elena Garrido',
    office: 'Notaria No. 201',
    id: 'PROF-4422998',
    city: 'Merida, Yucatan',
    mail: 'egarrido@legalyuc.mx',
  },
]

export const dashboardSummaryCards: DashboardSummaryCard[] = [
  { label: 'Nuevos Mensajes', value: '12', icon: 'M', badge: '+3 hoy' },
  { label: 'Dias de Membresia', value: '24', icon: 'D' },
]

export const dashboardInboxItems: DashboardInboxItem[] = [
  {
    id: 'TL-9823',
    name: 'Carlos Mendoza',
    preview: 'Recibido, Sr. Mendoza. Procedere...',
    expId: 'Exp: TL-9823',
    date: '10:45 AM',
  },
  {
    id: 'TL-9750',
    name: 'Elena Rodriguez',
    preview: 'Que documentos necesito para...',
    expId: 'Exp: TL-9750',
    date: 'Ayer',
  },
  {
    id: 'TL-9742',
    name: 'Santiago Bernal',
    preview: 'Gracias por la atencion.',
    expId: 'Exp: TL-9742',
    date: '2 oct',
  },
]

export const dashboardCaseFiles: DashboardCaseFile[] = [
  {
    id: 'TL-9823',
    name: 'Carlos Mendoza',
    email: 'mendoza.c@email.com',
    process: 'Testamento abierto',
    legalStatus: 'Revision juridica',
    legalTone: 'info',
    lastUpdate: 'Hoy 10:45 AM',
  },
  {
    id: 'TL-9750',
    name: 'Elena Rodriguez',
    email: 'elena.rod@email.com',
    process: 'Poder notarial',
    legalStatus: 'Faltan documentos',
    legalTone: 'muted',
    lastUpdate: 'Ayer 4:30 PM',
  },
  {
    id: 'TL-9742',
    name: 'Santiago Bernal',
    email: 's.bernal@email.com',
    process: 'Testamento vital',
    legalStatus: 'Listo para firma',
    legalTone: 'success',
    lastUpdate: '2 oct 9:15 AM',
  },
]
