import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TbEye, TbEyeOff, TbAlertCircle, TbChevronDown } from "react-icons/tb";
import { RiCloseLine } from "react-icons/ri";

/* ── Text / Password Input ─────────────────────────────────────── */
export function InputField({
  label,
  id,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  icon: Icon,
  error,
  required,
  autoComplete,
  disabled,
}) {
  const [showPw, setShowPw] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPw ? "text" : "password") : type;

  return (
    <div className="input-wrapper flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
          {required && <span className="text-indigo-400 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10">
            <Icon
              className={`w-4 h-4 transition-colors duration-200 ${error ? "text-red-400" : "text-[#4B5563]"}`}
            />
          </div>
        )}
        <input
          id={id}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          disabled={disabled}
          className={[
            "glass-input w-full rounded-xl px-4 py-3 text-sm text-[#E5E7EB] placeholder-[#374151] font-sans",
            Icon ? "pl-10" : "",
            isPassword ? "pr-10" : "",
            error
              ? "border-red-500/50 bg-red-500/5 focus:border-red-500/60 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]"
              : "",
            disabled ? "opacity-50 cursor-not-allowed" : "",
          ].join(" ")}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#4B5563] hover:text-[#9CA3AF] transition-colors duration-200 focus:outline-none"
          >
            {showPw ? (
              <TbEyeOff className="w-4 h-4" />
            ) : (
              <TbEye className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-1.5 overflow-hidden"
          >
            <TbAlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span className="text-xs text-red-400">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Select / Dropdown ─────────────────────────────────────────── */
export function SelectField({
  label,
  id,
  name,
  value,
  onChange,
  options,
  icon: Icon,
  error,
  required,
  disabled,
  placeholder,
}) {
  return (
    <div className="input-wrapper flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
          {required && <span className="text-indigo-400 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10">
            <Icon
              className={`w-4 h-4 transition-colors duration-200 ${error ? "text-red-400" : "text-[#4B5563]"}`}
            />
          </div>
        )}
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={[
            "select-glass w-full rounded-xl px-4 py-3 text-sm text-[#E5E7EB] cursor-pointer font-sans",
            Icon ? "pl-10" : "",
            "pr-10",
            !value ? "text-[#374151]" : "",
            error ? "border-red-500/50 bg-red-500/5" : "",
            disabled ? "opacity-50 cursor-not-allowed" : "",
          ].join(" ")}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map(({ value: v, label: l }) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
          <TbChevronDown className="w-4 h-4 text-[#4B5563]" />
        </div>
      </div>
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-1.5 overflow-hidden"
          >
            <TbAlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span className="text-xs text-red-400">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Error Banner ──────────────────────────────────────────────── */
export function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.25 }}
      className="error-shake flex items-start gap-3 px-4 py-3.5 rounded-xl bg-red-500/8 border border-red-500/20 text-sm text-red-400"
    >
      <TbAlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
      <span className="flex-1 leading-snug">{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-red-400/60 hover:text-red-400 transition-colors text-lg leading-none shrink-0 mt-0.5"
        >
          <RiCloseLine className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
}

/* ── Submit Button ─────────────────────────────────────────────── */
export function SubmitButton({ loading, children, disabled }) {
  return (
    <motion.button
      type="submit"
      disabled={loading || disabled}
      whileHover={!loading && !disabled ? { scale: 1.015, y: -1 } : {}}
      whileTap={!loading && !disabled ? { scale: 0.985 } : {}}
      transition={{ duration: 0.15 }}
      className="btn-primary w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 focus:ring-offset-transparent"
    >
      {loading ? (
        <>
          <svg
            className="animate-spin w-4 h-4 text-white/80"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span className="relative z-10">Processing…</span>
        </>
      ) : (
        <span className="relative z-10 flex gap-1 items-center">
          {children}
        </span>
      )}
    </motion.button>
  );
}
