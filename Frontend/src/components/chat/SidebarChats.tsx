    import {type SessionChat } from '../../types';

interface SidebarProps {
  sesiones: SessionChat[];
  onSeleccionar: (notarioId: number) => void;
  idActivo: number | null;
  esNotario?: boolean;
}

export function SidebarChats({ sesiones, onSeleccionar, idActivo, esNotario = false }: SidebarProps) {
  return (
    <div className="w-1/3 border-r border-gray-200 bg-white h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="font-bold text-gray-700 text-lg">💬 Conversaciones</h2>
        <p className="text-xs text-gray-400">Actualizado en tiempo real</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {sesiones.length === 0 ? (
          <p className="text-sm text-center text-gray-400 mt-6">No hay chats activos</p>
        ) : (
          sesiones.map((sesion) => {
            const idTarget = esNotario ? sesion.id : sesion.notario_id;
            const esSeleccionado = idActivo === idTarget;

            return (
              <button
                key={sesion.id}
                onClick={() => idTarget && onSeleccionar(idTarget)}
                className={`w-full text-left p-3 rounded-lg transition-all flex flex-col border ${
                  esSeleccionado 
                    ? 'bg-blue-50 border-blue-200 shadow-sm' 
                    : 'border-transparent hover:bg-gray-50'
                }`}
              >
                <span className="font-semibold text-sm text-gray-800">
                  {esNotario ? `👤 ${sesion.cliente_nombre}` : `⚖️ Notaría ${sesion.notaria_numero}`}
                </span>
                {!esNotario && (
                  <span className="text-xs text-gray-500 truncate">{sesion.nombre_oficial}</span>
                )}
                
                {/* Badge de estado */}
                <span className={`text-[10px] font-bold mt-2 px-2 py-0.5 rounded-full w-max ${
                  sesion.estado === 'solicitud' ? 'bg-amber-100 text-amber-700' :
                  sesion.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {sesion.estado === 'solicitud' ? '⌛ Esperando Aceptación' : '🟢 En Línea'}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}