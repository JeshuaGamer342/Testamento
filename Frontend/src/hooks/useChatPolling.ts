import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { type MensajeChat, type SessionChat } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function useChatPolling(notarioIdSeleccionado: number | null, esNotario = false) {
  const [sesionesActivas, setSesionesActivas] = useState<SessionChat[]>([]);
  const [mensajes, setMensajes] = useState<MensajeChat[]>([]);
  const [sesionActual, setSesionActual] = useState<SessionChat | null>(null);

  // 1. OBTENER O GENERAR COOKIE DEL CLIENTE
  const obtenerTokenCliente = (nombreCliente?: string) => {
    let token = Cookies.get('legacy_client_token');
    if (!token && nombreCliente) {
      token = crypto.randomUUID();
      Cookies.set('legacy_client_token', token, { expires: 1 }); // Expira en 1 día
      Cookies.set('legacy_client_name', nombreCliente, { expires: 1 });
    }
    return token;
  };

  // 2. POLLING: Cargar las conversaciones de la barra lateral (Sidebar)
  useEffect(() => {
    const cargarBarraLateral = async () => {
      const token = Cookies.get('legacy_client_token');
      if (!token && !esNotario) return;

      try {
        // Si es notario busca por su ID de login, si es cliente busca por su cookie token
        const url = esNotario 
          ? `${API_URL}/api/chat/notario/sesiones` 
          : `${API_URL}/api/chat/cliente/sesiones?clienteId=${token}`;
        
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setSesionesActivas(data);
        }
      } catch (err) {
        console.error("Error en la barra lateral:", err);
      }
    };

    cargarBarraLateral();
    const interval = setInterval(cargarBarraLateral, 4000); // Barra lateral cada 4s
    return () => clearInterval(interval);
  }, [esNotario]);

  // 3. POLLING: Cargar el "reflejo" de los mensajes del chat seleccionado
  useEffect(() => {
    if (!notarioIdSeleccionado) {
      setMensajes([]);
      setSesionActual(null);
      return;
    }

    const cargarMensajesYEstado = async () => {
      const token = Cookies.get('legacy_client_token');
      try {
        // Consultar el estado de la sesión y sus mensajes
        const urlChat = `${API_URL}/api/chat/conversacion?notarioId=${notarioIdSeleccionado}&clienteId=${token}`;
        const res = await fetch(urlChat);
        
        if (res.status === 404) {
          // Si el servidor borró la sesión (Notario rechazó o cerró), limpiamos la pantalla
          setSesionActual(null);
          setMensajes([]);
          if (!esNotario) {
            // Si eres el cliente, te limpia las cookies para poder iniciar otro chat
            Cookies.remove('legacy_client_token');
            Cookies.remove('legacy_client_name');
          }
          return;
        }

        if (res.ok) {
          const data = await res.json(); // Trae { sesion: {...}, mensajes: [...] }
          setSesionActual(data.sesion);
          setMensajes(data.mensajes);
        }
      } catch (err) {
        console.error("Error en mensajes:", err);
      }
    };

    cargarMensajesYEstado();
    const interval = setInterval(cargarMensajesYEstado, 2500); // Mensajes más rápido (2.5s)
    return () => clearInterval(interval);
  }, [notarioIdSeleccionado, esNotario]);

  return {
    sesionesActivas,
    mensajes,
    sesionActual,
    obtenerTokenCliente
  };
}