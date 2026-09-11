import { useState, useEffect, useCallback, useRef } from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

// Global imperative API — call toast() from any component
let _addToast = null;

export function toast(message, type = "info", duration = 3200) {
  if (_addToast) _addToast({ message, type, duration });
}

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

function ToastItem({ id, message, type, onRemove }) {
  const [visible, setVisible] = useState(false);

  // Fade in
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const Icon = ICONS[type] || Info;

  return (
    <div
      className={`toast toast-${type} ${visible ? "toast-show" : ""}`}
      role="alert"
      aria-live="polite"
    >
      <Icon size={15} className="toast-icon" />
      <span className="toast-msg">{message}</span>
      <button
        className="toast-close-btn"
        onClick={() => onRemove(id)}
        aria-label="Dismiss notification"
      >
        <X size={12} />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timersRef.current[id]);
    delete timersRef.current[id];
  }, []);

  const addToast = useCallback(
    ({ message, type = "info", duration = 3200 }) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev.slice(-4), { id, message, type }]); // Max 5 toasts
      timersRef.current[id] = setTimeout(() => removeToast(id), duration);
    },
    [removeToast]
  );

  useEffect(() => {
    _addToast = addToast;
    return () => {
      _addToast = null;
      Object.values(timersRef.current).forEach(clearTimeout);
    };
  }, [addToast]);

  return (
    <div className="toast-container" aria-label="Notifications">
      {toasts.map((t) => (
        <ToastItem key={t.id} {...t} onRemove={removeToast} />
      ))}
    </div>
  );
}
