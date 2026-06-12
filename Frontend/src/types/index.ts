export interface SessionChat {
  id?: number;
  cliente_anonimo_id: string;
  cliente_nombre: string;
  notario_id: number;
  estado: 'solicitud' | 'activo' | 'cerrado';
  nombre_oficial?: string; // Para el JOIN con el nombre del notario
  notaria_numero?: number;
}

export interface MensajeChat {
  id?: number;
  sesion_id: number;
  remitente: 'cliente' | 'notario';
  mensaje: string | null;
  ruta_archivo_pdf: string | null;
  enviado_en?: string;
}

export interface RecommendedNotary {
  id: number;
  nombreOficial: string;
  notariaNumero: number;
  contactoEmail: string;
  ubicacion: string;
  membresiaActiva: number | boolean;
}