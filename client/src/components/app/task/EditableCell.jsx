import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

const TEXT_LIMIT = 120;

function toDateInputValue(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function toDisplayValue(value, type) {
  if (value === null || value === undefined || value === "") return "-";

  if (type === "date") {
    const date = new Date(value);
    if (isNaN(date.getTime())) return "-";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  if (type === "text") {
    const str = String(value);
    return str.length > TEXT_LIMIT ? str.slice(0, TEXT_LIMIT) + "..." : str;
  }

  return String(value);
}

function EditableCell({ value, type = "text", options = [], onSave }) {
  const [editing, setEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value ?? "");
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    setLocalValue(value ?? "");
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!editing) return;

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setEditing(false);
        setLocalValue(value ?? "");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [editing, value]);

  const inputValue = useMemo(() => {
    if (type === "date") {
      return toDateInputValue(localValue);
    }
    return localValue;
  }, [localValue, type]);

  const save = () => {
    setEditing(false);

    const nextValue =
      type === "date" && localValue
        ? new Date(localValue).toISOString()
        : localValue;

    onSave(nextValue);
  };

  const cancel = () => {
    setLocalValue(value ?? "");
    setEditing(false);
  };

  const onKeyDown = (event) => {
    if (event.key === "Enter") save();
    if (event.key === "Escape") cancel();
  };

  const openDropdown = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();

    setDropdownPosition({
      top: rect.bottom + window.scrollY + 4,
      left: rect.left + window.scrollX,
    });

    setEditing(true);
  };

  // MEMBER TYPE
  if (type === "member") {
    const memberName = value?.name ?? null;

    return (
      <>
        <button
          ref={buttonRef}
          type="button"
          className="text-left w-full"
          onClick={openDropdown}
        >
          {memberName ? (
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-semibold uppercase shrink-0">
                {memberName[0]}
              </span>
              <span className="text-sm truncate">{memberName}</span>
            </div>
          ) : (
            <span className="text-gray-400 text-sm">Unassigned</span>
          )}
        </button>

        {editing &&
          createPortal(
            <div
              ref={dropdownRef}
              style={{
                position: "fixed",
                top: dropdownPosition.top,
                left: dropdownPosition.left,
              }}
              className="z-9999 bg-slate-800 border border-gray-600 rounded-md shadow-xl min-w-52 max-h-56 overflow-y-auto"
            >
              <button
                type="button"
                className="flex items-center gap-2 w-full px-3 py-2 hover:bg-slate-700 text-left text-sm text-gray-400 border-b border-gray-700"
                onClick={() => {
                  setEditing(false);
                  onSave(null);
                }}
              >
                Unassigned
              </button>

              {options.length === 0 && (
                <div className="px-3 py-2 text-sm text-gray-400">
                  No members available
                </div>
              )}

              {options.map((member) => (
                <button
                  key={member._id}
                  type="button"
                  className="flex items-center gap-2 w-full px-3 py-2 hover:bg-slate-700 text-left"
                  onClick={() => {
                    setEditing(false);
                    onSave(member);
                  }}
                >
                  <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-semibold uppercase shrink-0">
                    {member.name[0]}
                  </span>

                  <div className="min-w-0">
                    <div className="text-sm font-medium text-white truncate">
                      {member.name}
                    </div>

                    <div className="text-xs text-gray-400 truncate">
                      {member.email}
                    </div>
                  </div>
                </button>
              ))}
            </div>,
            document.body,
          )}
      </>
    );
  }

  if (editing) {
    if (type === "select") {
      return (
        <>
          <button
            ref={buttonRef}
            type="button"
            className="flex items-center justify-between w-full px-2 py-1 rounded-md bg-slate-800 border border-slate-600 text-sm text-gray-200 hover:bg-slate-700 transition"
            onClick={(e) => openDropdown(e)}
          >
            <span className="truncate">{localValue || "Select..."}</span>
            <span className="text-gray-400 text-xs">▾</span>
          </button>

          {editing &&
            createPortal(
              <div
                ref={dropdownRef}
                style={{
                  position: "fixed",
                  top: dropdownPosition.top,
                  left: dropdownPosition.left,
                }}
                className="z-9999 bg-slate-800 border border-slate-600 rounded-md shadow-xl min-w-40 overflow-hidden"
              >
                {options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-700 transition ${
                      option === localValue
                        ? "bg-slate-700 text-white"
                        : "text-gray-300"
                    }`}
                    onClick={() => {
                      setLocalValue(option);
                      setEditing(false);
                      onSave(option);
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>,
              document.body,
            )}
        </>
      );
    }

    if (type === "date") {
      return (
        <input
          type="date"
          value={inputValue}
          onChange={(event) => setLocalValue(event.target.value)}
          onBlur={save}
          onKeyDown={onKeyDown}
          autoFocus
          className="
        w-full
        bg-slate-800
        border border-slate-600
        rounded-md
        px-2 py-1
        text-sm text-gray-200
        focus:outline-none
        focus:ring-1 focus:ring-indigo-500
        hover:border-slate-500
        transition
      "
        />
      );
    }

    return (
      <input
        type="text"
        value={inputValue}
        maxLength={TEXT_LIMIT}
        onChange={(event) => setLocalValue(event.target.value)}
        onBlur={save}
        onKeyDown={onKeyDown}
        autoFocus
        placeholder="Enter text..."
        className="
      w-full
      bg-slate-800
      border border-slate-600
      rounded-md
      px-2 py-1
      text-sm text-gray-200
      placeholder-gray-400
      focus:outline-none
      focus:ring-1 focus:ring-indigo-500
      hover:border-slate-500
      transition
    "
      />
    );
  }

  return (
    <button
      type="button"
      title={value}
      className="text-left w-full truncate"
      onClick={(e) => {
        if (type === "select" || type === "member") {
          openDropdown(e);
        } else {
          setEditing(true);
        }
      }}
    >
      {toDisplayValue(value, type)}
    </button>
  );
}

export default EditableCell;
