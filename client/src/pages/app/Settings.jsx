import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TbBell,
  TbDeviceDesktop,
  TbMoon,
  TbSun,
  TbShieldLock,
  TbClock,
  TbVolume,
  TbCheck,
  TbInfoCircle,
} from "react-icons/tb";

const STORAGE_KEY = "flowsync.settings";

const CONTAINER = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
};

const ITEM = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

const defaultSettings = {
  theme: "system",
  taskReminderMinutes: 10,
  appSounds: true,
  desktopNotifications: true,
  emailUpdates: true,
  voiceReply: true,
  autoLogoutMinutes: 120,
};

const cardClass = "rounded-2xl border border-[#1E2535] bg-[#0F172A] p-5";

const Toggle = ({ label, description, checked, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={onChange}
    className="flex w-full items-center justify-between gap-4 rounded-xl border border-[#1E2535] bg-[#111827] px-4 py-3 text-left transition-colors hover:border-indigo-500/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70"
  >
    <div>
      <p className="text-sm font-medium text-white">{label}</p>
      {description && (
        <p className="mt-0.5 text-xs text-gray-400">{description}</p>
      )}
    </div>
    <span
      aria-hidden="true"
      className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${
        checked ? "bg-indigo-500" : "bg-slate-600"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </span>
  </button>
);

const Settings = () => {
  const [settings, setSettings] = useState(defaultSettings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      setSettings((prev) => ({ ...prev, ...parsed }));
    } catch {
      // Ignore invalid settings storage and use defaults.
    }
  }, []);

  const completionScore = useMemo(() => {
    let score = 0;
    if (settings.desktopNotifications) score += 20;
    if (settings.emailUpdates) score += 20;
    if (settings.voiceReply) score += 20;
    if (settings.appSounds) score += 20;
    if (settings.theme !== "system") score += 20;
    return score;
  }, [settings]);

  const updateSetting = (key, value) => {
    setSaved(false);
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const saveSettings = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  const resetDefaults = () => {
    setSettings(defaultSettings);
    setSaved(false);
  };

  return (
    <motion.div
      variants={CONTAINER}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-4xl space-y-6 pb-8"
    >
      <motion.div
        variants={ITEM}
        className="rounded-2xl border border-indigo-500/20 bg-linear-to-r from-indigo-600/15 via-sky-600/10 to-transparent p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white">Settings</h1>
            <p className="mt-1 text-sm text-gray-400">
              Tune your FlowSync experience with notification, security, and
              interface preferences.
            </p>
          </div>
          <div className="rounded-xl border border-[#2D3A56] bg-[#0F172A] px-3 py-2 text-xs text-gray-300">
            Setup score:{" "}
            <span className="font-semibold text-indigo-300">
              {completionScore}%
            </span>
          </div>
        </div>
      </motion.div>

      <motion.section variants={ITEM} className={cardClass}>
        <div className="mb-4 flex items-center gap-2">
          <TbDeviceDesktop className="h-5 w-5 text-indigo-400" />
          <h2 className="text-base font-semibold text-white">Appearance</h2>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { key: "light", label: "Light", icon: TbSun },
            { key: "dark", label: "Dark", icon: TbMoon },
            { key: "system", label: "System", icon: TbDeviceDesktop },
          ].map(({ key, label, icon: Icon }) => {
            const active = settings.theme === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => updateSetting("theme", key)}
                className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                  active
                    ? "border-indigo-500/50 bg-indigo-500/10"
                    : "border-[#1E2535] bg-[#111827] hover:border-indigo-500/30"
                }`}
              >
                <Icon
                  className={`mb-2 h-5 w-5 ${active ? "text-indigo-300" : "text-gray-400"}`}
                />
                <p className="text-sm font-medium text-white">{label}</p>
              </button>
            );
          })}
        </div>
      </motion.section>

      <motion.section variants={ITEM} className={cardClass}>
        <div className="mb-4 flex items-center gap-2">
          <TbBell className="h-5 w-5 text-indigo-400" />
          <h2 className="text-base font-semibold text-white">Notifications</h2>
        </div>
        <div className="space-y-3">
          <Toggle
            label="Desktop Notifications"
            description="Show updates for due tasks and mentions"
            checked={settings.desktopNotifications}
            onChange={() =>
              updateSetting(
                "desktopNotifications",
                !settings.desktopNotifications,
              )
            }
          />
          <Toggle
            label="Email Updates"
            description="Receive daily project activity digest"
            checked={settings.emailUpdates}
            onChange={() =>
              updateSetting("emailUpdates", !settings.emailUpdates)
            }
          />
          <div className="rounded-xl border border-[#1E2535] bg-[#111827] px-4 py-3">
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
              <TbClock className="h-4 w-4 text-indigo-300" />
              Reminder Lead Time
            </label>
            <select
              value={settings.taskReminderMinutes}
              onChange={(e) =>
                updateSetting("taskReminderMinutes", Number(e.target.value))
              }
              className="w-full rounded-lg border border-[#1E2535] bg-[#0F172A] px-3 py-2 text-sm text-white focus:border-indigo-500/50 focus:outline-none"
            >
              <option value={5}>5 minutes before</option>
              <option value={10}>10 minutes before</option>
              <option value={15}>15 minutes before</option>
              <option value={30}>30 minutes before</option>
            </select>
          </div>
        </div>
      </motion.section>

      <motion.section variants={ITEM} className={cardClass}>
        <div className="mb-4 flex items-center gap-2">
          <TbShieldLock className="h-5 w-5 text-indigo-400" />
          <h2 className="text-base font-semibold text-white">
            Security & Voice
          </h2>
        </div>
        <div className="space-y-3">
          <Toggle
            label="Voice Replies"
            description="Play spoken response for voice assistant commands"
            checked={settings.voiceReply}
            onChange={() => updateSetting("voiceReply", !settings.voiceReply)}
          />
          <Toggle
            label="App Sounds"
            description="Play subtle sounds for key actions"
            checked={settings.appSounds}
            onChange={() => updateSetting("appSounds", !settings.appSounds)}
          />
          <div className="rounded-xl border border-[#1E2535] bg-[#111827] px-4 py-3">
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
              <TbVolume className="h-4 w-4 text-indigo-300" />
              Auto Logout
            </label>
            <select
              value={settings.autoLogoutMinutes}
              onChange={(e) =>
                updateSetting("autoLogoutMinutes", Number(e.target.value))
              }
              className="w-full rounded-lg border border-[#1E2535] bg-[#0F172A] px-3 py-2 text-sm text-white focus:border-indigo-500/50 focus:outline-none"
            >
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={120}>2 hours</option>
              <option value={240}>4 hours</option>
            </select>
          </div>
        </div>
      </motion.section>

      <motion.div variants={ITEM} className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={saveSettings}
          className="rounded-xl bg-linear-to-r from-indigo-600 to-sky-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:from-indigo-500 hover:to-sky-500"
        >
          Save Preferences
        </button>
        <button
          type="button"
          onClick={resetDefaults}
          className="rounded-xl border border-[#1E2535] px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-[#1E2535]"
        >
          Reset to Defaults
        </button>
        <AnimatePresence>
          {saved && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300"
            >
              <TbCheck className="h-4 w-4" />
              Settings saved
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div
        variants={ITEM}
        className="flex items-start gap-2 rounded-xl border border-[#1E2535] bg-[#0F172A] px-4 py-3 text-xs text-gray-400"
      >
        <TbInfoCircle className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
        Preferences are stored in your browser for now. You can wire these to
        backend profile settings later.
      </motion.div>
    </motion.div>
  );
};

export default Settings;
