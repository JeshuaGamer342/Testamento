import { useState, useRef, useEffect } from 'react';
import { type MensajeChat, type SessionChat } from '../../types';

interface ChatWindowProps {
  sesion: SessionChat;
  mensajes: MensajeChat[];
  esNotario: boolean;
  onEnviarMensaje: (texto: string, archivo: File | null) => Promise<void>;
  onCambiarEstadoSesion: (nuevoEstado: 'activo' | 'cerrado') => Promise<void>;
}

export function ChatWindow({ sesion, mensajes, esNotario, onEnviarMensaje, onCambiarEstadoSesion }: ChatWindowProps) {
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [subiendoArchivo, setSubiendoArchivo] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al recibir mensajes nuevos
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoMensaje.trim()) return;
    
    await onEnviarMensaje(nuevoMensaje, null);
    setNuevoMensaje('');
  };

  const manejarSubidaPDF = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Solo se permiten archivos en formato PDF.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // Límite de 5MB
      alert('El archivo supera el límite permitido de 5MB.');
      return;
    }

    setSubiendoArchivo(true);
    await onEnviarMensaje('', file);
    setSubiendoArchivo(false);
  };

  // 1. VISTA DE ESPERA PARA EL CLIENTE
  if (!esNotario && sesion.estado === 'solicitud') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-gray-50">
        <div className="animate-spin text-4xl mb-4">⌛</div>
        <h3 className="text-lg font-bold text-gray-700">Solicitud enviada a Notaría {sesion.notaria_numero}</h3>
        <p className="text-sm text-gray-500 max-w-sm mt-2">
          Por favor, no cierres esta ventana. En cuanto el notario revise tu petición, la conversación se activará automáticamente.
        </p>
      </div>
    );
  }

  // 2. VISTA DE PANEL DE ACEPTACIÓN PARA EL NOTARIO
  if (esNotario && sesion.estado === 'solicitud') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-gray-50">
        <div className="text-5xl mb-4">📥</div>
        <h3 className="text-lg font-bold text-gray-800">Nueva solicitud de chat</h3>
        <p className="text-sm text-gray-500 mb-6">
          El cliente <span className="font-semibold text-gray-700">"{sesion.cliente_nombre}"</span> quiere iniciar asesoría contigo.
        </p>
        <div className="flex gap-4">
          <button 
            onClick={() => onCambiarEstadoSesion('cerrado')}
            className="px-5 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-lg transition"
          >
            ❌ Rechazar
          </button>
          <button 
            onClick={() => onCambiarEstadoSesion('activo')}
            className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition shadow-md"
          >
            🟢 Aceptar y Conectar
          </button>
        </div>
      </div>
    );
  }

  // 3. VISTA DE CONVERSACIÓN ACTIVA (Para ambos)
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Cabecera del Chat */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-gray-800">
            {esNotario ? `👤 Cliente: ${sesion.cliente_nombre}` : `⚖️ Notaría ${sesion.notaria_numero}`}
          </h3>
          <p className="text-xs text-green-500 font-medium">● Chat de sesión temporal activo</p>
        </div>
        <button
          onClick={() => onCambiarEstadoSesion('cerrado')}
          className="text-xs bg-red-50 hover:bg-red-100 text-red-600 font-bold px-3 py-1.5 rounded-md border border-red-200 transition"
        >
          {esNotario ? 'Finalizar Asesoría' : 'Salir del Chat'}
        </button>
      </div>

      {/* Cuerpo de Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
        {mensajes.map((msg, index) => {
          // Determinar de quién es la burbuja
          const soyYo = (esNotario && msg.remitente === 'notario') || (!esNotario && msg.remitente === 'cliente');

          return (
            <div key={msg.id || index} className={`flex ${soyYo ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs md:max-w-md rounded-xl p-3 shadow-sm text-sm ${
                soyYo ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
              }`}>
                {msg.ruta_archivo_pdf ? (
                  <a 
                    href={msg.ruta_archivo_pdf} 
                    target="_blank" 
                    rel="noreferrer"
                    className={`flex items-center gap-3 p-2 rounded-lg transition ${
                      soyYo ? 'bg-blue-700 hover:bg-blue-800 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <span className="text-2xl">📄</span>
                    <div className="text-left">
                      <p className="text-xs font-bold truncate max-w-[150px]">Documento Adjunto.pdf</p>
                      <p className="text-[11px] underline opacity-80">Ver documento PDF</p>
                    </div>
                  </a>
                ) : (
                  <p className="whitespace-pre-line">{msg.mensaje}</p>
                )}
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* Barra de Entrada / Inputs */}
      <form onSubmit={manejarEnvio} className="p-3 border-t border-gray-200 bg-white flex items-center gap-2">
        <label className={`p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg cursor-pointer transition ${subiendoArchivo ? 'animate-pulse' : ''}`}>
          📎
          <input 
            type="file" 
            accept="application/pdf" 
            className="hidden" 
            onChange={manejarSubidaPDF}
            disabled={subiendoArchivo}
          />
        </label>

        <input
          type="text"
          value={nuevoMensaje}
          onChange={(e) => setNuevoMensaje(e.target.value)}
          placeholder="Escribe un mensaje aquí..."
          className="flex-1 border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-500"
        />

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition shadow-sm"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}