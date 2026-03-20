import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  TbUser,
  TbAt,
  TbMail,
  TbLock,
  TbGenderBigender,
  TbLink,
  TbArrowRight,
  TbSparkles,
  TbCheck,
} from "react-icons/tb";
import { GoogleLogin } from "@react-oauth/google";
import AuthLayout from "../components/auth/AuthLayout";
import {
  InputField,
  SelectField,
  ErrorBanner,
  SubmitButton,
} from "../components/auth/InputField";
import { useAuth } from "../context/AuthContext";

const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
];

const INITIAL = {
  name: "",
  username: "",
  email: "",
  password: "",
  gender: "",
  avatarUrl: "",
};

const FIELD_VARIANTS = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.065, delayChildren: 0.22 } },
};
const FIELD_ITEM = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
  },
};

function PasswordStrength({ password }) {
  const checks = [
    { label: "At least 8 characters", pass: password.length >= 8 },
    { label: "Uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "Number", pass: /\d/.test(password) },
    { label: "Special character", pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const barColor =
    score <= 1
      ? "bg-red-500"
      : score === 2
        ? "bg-amber-500"
        : score === 3
          ? "bg-yellow-400"
          : "bg-emerald-500";
  const textColor =
    score <= 1
      ? "text-red-400"
      : score === 2
        ? "text-amber-400"
        : score === 3
          ? "text-yellow-400"
          : "text-emerald-400";
  const label =
    score <= 1
      ? "Weak"
      : score === 2
        ? "Fair"
        : score === 3
          ? "Good"
          : "Strong";

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="mt-2 space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-[#1E2535] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(score / 4) * 100}%` }}
              transition={{ duration: 0.3 }}
              className={`h-full rounded-full transition-all ${barColor}`}
            />
          </div>
          <span className={`text-[10px] font-semibold ${textColor}`}>
            {label}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          {checks.map(({ label: l, pass }) => (
            <div key={l} className="flex items-center gap-1.5">
              <TbCheck
                className={`w-3 h-3 ${pass ? "text-emerald-400" : "text-[#374151]"}`}
              />
              <span
                className={`text-[10px] ${pass ? "text-[#9CA3AF]" : "text-[#374151]"}`}
              >
                {l}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const { registerUser, googleLogin } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError("");
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Full name is required";
    if (!form.username.trim()) errs.username = "Username is required";
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(form.username))
      errs.username = "Username: 3–20 chars, letters / numbers / underscore";
    if (!form.email.trim()) errs.email = "Email is required";
    if (!/\S+@\S+\.\S+/.test(form.email))
      errs.email = "Enter a valid email address";
    if (!form.password) errs.password = "Password is required";
    if (form.password.length < 8)
      errs.password = "Password must be at least 8 characters";
    if (!form.gender) errs.gender = "Please select your gender";
    return errs;
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError("");
    try {
      await googleLogin(credentialResponse.credential);
      setSuccess(true);
      setTimeout(() => navigate("/app", { replace: true }), 800);
    } catch (err) {
      setError(err.message || "Google sign-up failed");
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }
    setLoading(true);
    setError("");
    try {
      await registerUser(form);
      setSuccess(true);
      setTimeout(
        () => navigate("/login", { state: { registered: true } }),
        1200,
      );
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create account"
      subtitle="Join 2,400+ teams already on FlowCraft"
    >
      <motion.form
        variants={FIELD_VARIANTS}
        initial="hidden"
        animate="visible"
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
        noValidate
      >
        <AnimatePresence>
          {error && (
            <motion.div variants={FIELD_ITEM} key="err">
              <ErrorBanner message={error} onDismiss={() => setError("")} />
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
              <span>Account created! Redirecting to login…</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Name + Username row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.div variants={FIELD_ITEM}>
            <InputField
              label="Full Name"
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Jane Smith"
              icon={TbUser}
              error={fieldErrors.name}
              required
              autoComplete="name"
              disabled={loading || success}
            />
          </motion.div>
          <motion.div variants={FIELD_ITEM}>
            <InputField
              label="Username"
              id="username"
              name="username"
              type="text"
              value={form.username}
              onChange={handleChange}
              placeholder="jane_smith"
              icon={TbAt}
              error={fieldErrors.username}
              required
              autoComplete="username"
              disabled={loading || success}
            />
          </motion.div>
        </div>

        <motion.div variants={FIELD_ITEM}>
          <InputField
            label="Email Address"
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="jane@company.com"
            icon={TbMail}
            error={fieldErrors.email}
            required
            autoComplete="email"
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
            placeholder="Create a strong password"
            icon={TbLock}
            error={fieldErrors.password}
            required
            autoComplete="new-password"
            disabled={loading || success}
          />
          <AnimatePresence>
            {form.password && <PasswordStrength password={form.password} />}
          </AnimatePresence>
        </motion.div>

        <motion.div variants={FIELD_ITEM}>
          <SelectField
            label="Gender"
            id="gender"
            name="gender"
            value={form.gender}
            onChange={handleChange}
            options={GENDER_OPTIONS}
            icon={TbGenderBigender}
            error={fieldErrors.gender}
            required
            placeholder="Select gender"
            disabled={loading || success}
          />
        </motion.div>

        <motion.div variants={FIELD_ITEM}>
          <InputField
            label="Avatar URL (optional)"
            id="avatarUrl"
            name="avatarUrl"
            type="url"
            value={form.avatarUrl}
            onChange={handleChange}
            placeholder="https://example.com/avatar.png"
            icon={TbLink}
            disabled={loading || success}
          />
        </motion.div>

        <motion.div variants={FIELD_ITEM} className="mt-1 group">
          <SubmitButton loading={loading} disabled={success}>
            <span>Create account</span>
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

        <motion.div variants={FIELD_ITEM} className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google sign-up failed. Please try again.")}
            theme="filled_black"
            shape="pill"
            size="large"
            text="signup_with"
            width="100%"
          />
        </motion.div>

        <motion.p
          variants={FIELD_ITEM}
          className="text-center text-sm text-[#6B7280]"
        >
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors duration-200 hover:underline underline-offset-2"
          >
            Sign in
          </Link>
        </motion.p>
      </motion.form>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="mt-5 text-center text-[10px] text-[#374151] leading-relaxed"
      >
        By creating an account you agree to our{" "}
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
