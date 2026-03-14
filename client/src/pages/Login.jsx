import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { TbUser, TbLock, TbArrowRight, TbSparkles } from "react-icons/tb";
import AuthLayout from "../components/auth/AuthLayout";
import {
  InputField,
  ErrorBanner,
  SubmitButton,
} from "../components/auth/InputField";
import { useAuth } from "../context/AuthContext";

const FIELD_VARIANTS = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.28 } },
};
const FIELD_ITEM = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { loginUser } = useAuth();

  const navigate = useNavigate();

  const handleChange = (e) => {
    setError("");
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await loginUser(form);
      setSuccess(true);
      setTimeout(() => {
        navigate("/app");
      }, 800);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your FlowSync workspace"
    >
      <motion.form
        variants={FIELD_VARIANTS}
        initial="hidden"
        animate="visible"
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
        noValidate
      >
        <AnimatePresence mode="wait">
          {error && (
            <motion.div variants={FIELD_ITEM} key="err">
              <ErrorBanner
                message={error}
                onDismiss={() => {
                  setLoading(false);
                  setError("");
                }}
              />
            </motion.div>
          )}
          {success && (
            <motion.div
              key="ok"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2.5 px-4 py-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400"
            >
              <TbSparkles className="w-4 h-4 shrink-0" />
              <span>Login successful! Redirecting…</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div variants={FIELD_ITEM}>
          <InputField
            label="Username"
            id="username"
            name="username"
            type="text"
            value={form.username}
            onChange={handleChange}
            placeholder="your_username"
            icon={TbUser}
            required
            autoComplete="username"
            disabled={loading || success}
          />
        </motion.div>

        <motion.div variants={FIELD_ITEM}>
          <InputField
            label="Password"
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••••••"
            icon={TbLock}
            required
            autoComplete="current-password"
            disabled={loading || success}
          />
        </motion.div>

        <motion.div variants={FIELD_ITEM} className="flex justify-end -mt-1">
          <a
            href="#"
            className="text-xs text-[#6B7280] hover:text-indigo-400 transition-colors duration-200"
          >
            Forgot password?
          </a>
        </motion.div>

        <motion.div variants={FIELD_ITEM} className="mt-1 group">
          <SubmitButton loading={loading} disabled={loading || success}>
            <span>Sign in</span>
            {!loading && (
              <TbArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            )}
          </SubmitButton>
        </motion.div>

        <motion.div
          variants={FIELD_ITEM}
          className="relative flex items-center gap-3 my-1"
        >
          <div className="flex-1 h-px bg-[#1E2535]" />
          <span className="text-xs text-[#374151]">OR</span>
          <div className="flex-1 h-px bg-[#1E2535]" />
        </motion.div>

        <motion.p
          variants={FIELD_ITEM}
          className="text-center text-sm text-[#6B7280]"
        >
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors duration-200 hover:underline underline-offset-2"
          >
            Create one free
          </Link>
        </motion.p>
      </motion.form>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="mt-5 text-center text-[10px] text-[#374151] leading-relaxed"
      >
        By signing in you agree to our{" "}
        <a href="#" className="hover:text-[#6B7280] transition-colors">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="hover:text-[#6B7280] transition-colors">
          Privacy Policy
        </a>
        .
      </motion.p>
    </AuthLayout>
  );
}
