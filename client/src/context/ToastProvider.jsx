import { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TbCheck, TbAlertCircle, TbInfoCircle, TbX } from "react-icons/tb";

const ToastContext = createContext();

export function useToast() {
  return useContext(ToastContext);
}

const ICONS = {
  success: TbCheck,
  error: TbAlertCircle,
  info: TbInfoCircle,
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message, type = "info") => {
      const id = Date.now();

      setToasts((prev) => [...prev, { id, message, type }]);

      setTimeout(() => removeToast(id), 4000);
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      <div className="fixed top-6 right-6 z-100 flex flex-col gap-3">
        <AnimatePresence>
          {toasts.map(({ id, message, type }) => {
            const Icon = ICONS[type];

            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="flex items-start gap-3 px-4 py-3.5 rounded-xl backdrop-blur-xl bg-[#0F172A]/70 border border-[#1E2535] shadow-lg text-sm text-[#E5E7EB]"
              >
                <Icon
                  className={`w-5 h-5 shrink-0 mt-0.5 ${
                    type === "success"
                      ? "text-emerald-400"
                      : type === "error"
                        ? "text-red-400"
                        : "text-indigo-400"
                  }`}
                />

                <span className="flex-1">{message}</span>

                <button
                  type="button"
                  onClick={() => removeToast(id)}
                  className="text-[#6B7280] hover:text-white transition"
                >
                  <TbX className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
