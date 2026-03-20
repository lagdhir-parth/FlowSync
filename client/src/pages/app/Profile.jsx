import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TbUser,
  TbMail,
  TbAt,
  TbCalendar,
  TbEdit,
  TbCheck,
  TbX,
  TbLock,
  TbChecklist,
  TbProgress,
  TbCircleCheck,
  TbClipboardList,
} from "react-icons/tb";
import { RiImageEditFill } from "react-icons/ri";
import { useAuth } from "../../context/AuthContext";
import {
  fetchAllTasks,
  updateProfile,
  updatePassword,
} from "../../api/dataApi";

const CONTAINER = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const ITEM = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    gender: "",
    avatarUrl: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
  });
  const [passwordSaving, setPasswordSaving] = useState(false);

  const inputClassName =
    "w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#151A2B] border border-[#1E2535] text-white text-sm placeholder-gray-500 focus:border-indigo-500/50 focus:bg-indigo-500/5 focus:outline-none transition-all";
  const plainInputClassName =
    "w-full px-4 py-2.5 rounded-xl bg-[#151A2B] border border-[#1E2535] text-white text-sm placeholder-gray-500 focus:border-indigo-500/50 focus:outline-none transition-all";

  useEffect(() => {
    fetchAllTasks()
      .then((data) => setTasks(data || []))
      .catch(() => setTasks([]));
  }, []);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        username: user.username || "",
        gender: user.gender || "",
        avatarUrl: user.avatarUrl || "",
      });
    }
  }, [user]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "done").length;
    const inProgress = tasks.filter((t) => t.status === "in progress").length;
    const pending = tasks.filter(
      (t) => t.status === "todo" || t.status === "review",
    ).length;
    return { total, completed, inProgress, pending };
  }, [tasks]);

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const handleSave = async () => {
    setSaving(true);
    setMessage({ text: "", type: "" });
    try {
      const trimmedAvatarUrl = form.avatarUrl.trim();
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        username: form.username.trim(),
        gender: form.gender || null,
        avatarUrl: trimmedAvatarUrl || null,
      };

      if (
        trimmedAvatarUrl &&
        !/^https?:\/\//i.test(trimmedAvatarUrl) &&
        !/^data:image\//i.test(trimmedAvatarUrl)
      ) {
        throw new Error(
          "Avatar URL must start with http://, https://, or data:image/",
        );
      }

      await updateProfile(payload);
      await refreshUser();
      setEditing(false);
      setMessage({ text: "Profile updated!", type: "success" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } catch (err) {
      setMessage({
        text: err.message || "Failed to update profile",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordForm.oldPassword || !passwordForm.newPassword) return;
    setPasswordSaving(true);
    setMessage({ text: "", type: "" });
    try {
      await updatePassword(passwordForm);
      setShowPasswordForm(false);
      setPasswordForm({ oldPassword: "", newPassword: "" });
      setMessage({ text: "Password changed!", type: "success" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } catch (err) {
      setMessage({
        text: err.message || "Failed to change password",
        type: "error",
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  const statCards = [
    {
      label: "Total Tasks",
      value: stats.total,
      icon: TbChecklist,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: TbCircleCheck,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      icon: TbProgress,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: TbClipboardList,
      color: "text-rose-400",
      bg: "bg-rose-500/10",
    },
  ];

  return (
    <motion.div
      variants={CONTAINER}
      initial="hidden"
      animate="visible"
      className="max-w-3xl mx-auto space-y-6 pb-8"
    >
      {/* Message Banner */}
      <AnimatePresence>
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`rounded-xl px-4 py-3 text-sm flex items-center gap-2 ${
              message.type === "success"
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                : "bg-red-500/10 border border-red-500/20 text-red-400"
            }`}
          >
            {message.type === "success" ? (
              <TbCheck className="w-4 h-4" />
            ) : (
              <TbX className="w-4 h-4" />
            )}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Card */}
      <motion.div
        variants={ITEM}
        className="rounded-2xl bg-[#0F172A] border border-[#1E2535] p-6"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar */}
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-500/30"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-indigo-500 to-sky-600 flex items-center justify-center text-2xl font-bold text-white">
              {initials}
            </div>
          )}

          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">{user?.name}</h1>
            <p className="text-sm text-gray-400">@{user?.username}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <TbMail className="w-3.5 h-3.5" />
                {user?.email}
              </span>
              <span className="flex items-center gap-1">
                <TbCalendar className="w-3.5 h-3.5" />
                Joined {joinDate}
              </span>
            </div>
            {user?.gender && (
              <span className="mt-1.5 inline-block text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {user.gender}
              </span>
            )}
            {user?.authProvider === "google" && (
              <span className="mt-1.5 ml-2 inline-block text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Google Account
              </span>
            )}
          </div>

          <button
            onClick={() => setEditing(!editing)}
            className="p-2 rounded-lg hover:bg-[#1E2535] text-gray-400 hover:text-indigo-400 transition-colors cursor-pointer"
          >
            <TbEdit className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      {/* Edit Form */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl bg-[#0F172A] border border-[#1E2535] p-6 space-y-4">
              <h2 className="text-base font-semibold text-white">
                Edit Profile
              </h2>
              {[
                { label: "Name", name: "name", icon: TbUser },
                { label: "Email", name: "email", icon: TbMail },
                { label: "Username", name: "username", icon: TbAt },
              ].map(({ label, name, icon: Icon }) => (
                <div key={name}>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                    {label}
                  </label>
                  <div className="relative">
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={form[name]}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, [name]: e.target.value }))
                      }
                      className={inputClassName}
                    />
                  </div>
                </div>
              ))}

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                  Gender
                </label>
                <div className="relative">
                  <TbUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <select
                    value={form.gender}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, gender: e.target.value }))
                    }
                    className={`${inputClassName} appearance-none`}
                  >
                    <option value="" className="bg-[#151A2B] text-gray-400">
                      Select gender
                    </option>
                    <option value="Male" className="bg-[#151A2B] text-white">
                      Male
                    </option>
                    <option value="Female" className="bg-[#151A2B] text-white">
                      Female
                    </option>
                    <option value="Other" className="bg-[#151A2B] text-white">
                      Other
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                  Avatar URL
                </label>
                <div className="relative">
                  <RiImageEditFill className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="url"
                    value={form.avatarUrl}
                    placeholder="https://example.com/avatar.png"
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        avatarUrl: e.target.value,
                      }))
                    }
                    className={inputClassName}
                  />
                </div>
                {form.avatarUrl.trim() && (
                  <div className="mt-3 flex items-center gap-3 rounded-xl border border-[#1E2535] bg-[#111827] px-3 py-2">
                    <img
                      src={form.avatarUrl}
                      alt="Avatar preview"
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                    <span className="text-xs text-gray-400">
                      Avatar preview
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-linear-to-r from-indigo-600 to-sky-600 text-white text-sm font-semibold hover:from-indigo-500 hover:to-sky-500 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {saving ? "Saving…" : "Save Changes"}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 rounded-xl border border-[#1E2535] text-gray-400 text-sm hover:bg-[#1E2535] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task Stats */}
      <motion.div variants={ITEM}>
        <h2 className="text-base font-semibold text-white mb-3">
          Task Statistics
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="rounded-xl bg-[#0F172A] border border-[#1E2535] p-4"
            >
              <div className={`p-1.5 rounded-lg ${card.bg} w-fit mb-2`}>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <p className="text-2xl font-bold text-white">{card.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Change Password */}
      {user?.authProvider !== "google" && (
        <motion.div
          variants={ITEM}
          className="rounded-2xl bg-[#0F172A] border border-[#1E2535] p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TbLock className="w-5 h-5 text-gray-400" />
              <h2 className="text-base font-semibold text-white">Password</h2>
            </div>
            <button
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
            >
              {showPasswordForm ? "Cancel" : "Change Password"}
            </button>
          </div>

          <AnimatePresence>
            {showPasswordForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 space-y-3">
                  <input
                    type="password"
                    placeholder="Current password"
                    value={passwordForm.oldPassword}
                    onChange={(e) =>
                      setPasswordForm((p) => ({
                        ...p,
                        oldPassword: e.target.value,
                      }))
                    }
                    className={plainInputClassName}
                  />
                  <input
                    type="password"
                    placeholder="New password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((p) => ({
                        ...p,
                        newPassword: e.target.value,
                      }))
                    }
                    className={plainInputClassName}
                  />
                  <button
                    onClick={handlePasswordChange}
                    disabled={passwordSaving}
                    className="px-4 py-2 rounded-xl bg-linear-to-r from-indigo-600 to-sky-600 text-white text-sm font-semibold disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {passwordSaving ? "Updating…" : "Update Password"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
}
