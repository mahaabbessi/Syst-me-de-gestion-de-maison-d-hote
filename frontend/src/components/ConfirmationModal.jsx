import { X } from "lucide-react";

export default function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, type = "danger" }) {
  if (!isOpen) return null;
  
  const colors = {
    danger: {
      bg: "bg-red-100",
      icon: "text-red-600",
      button: "bg-red-600 hover:bg-red-700"
    },
    warning: {
      bg: "bg-yellow-100",
      icon: "text-yellow-600",
      button: "bg-yellow-600 hover:bg-yellow-700"
    }
  };
  
  const color = colors[type] || colors.danger;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6">
          <div className={`w-16 h-16 ${color.bg} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <svg className={`w-8 h-8 ${color.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <p className="text-center text-gray-600 mb-2">{message}</p>
          <p className="text-center text-red-500 text-sm font-semibold">
            ⚠️ Cette action est irréversible !
          </p>
        </div>
        
        <div className="flex gap-3 p-4 border-t">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Annuler
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-4 py-2 ${color.button} text-white rounded-lg transition`}
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}