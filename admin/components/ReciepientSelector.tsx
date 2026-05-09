"use client";
import { useState, useRef, useEffect } from "react";
import { X, Check, User as UserIcon, Loader2, Search } from "lucide-react";
import { useGetUsersQuery } from "@/lib/redux/services/user.api";
import { useAppSelector } from "@/lib/redux/store";
import { selectCurrentUser } from "@/lib/redux/features/auth.slice";
import { useTranslations } from "next-intl";

interface RecipientSelectorProps {
  type: "single" | "multiple";
  onSelectionChange: (userIds: string[]) => void;
  selectedIds: string[];
}

const RecipientSelector = ({
  type,
  onSelectionChange,
  selectedIds,
}: RecipientSelectorProps) => {
  const t = useTranslations();
  const currentUser = useAppSelector(selectCurrentUser);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: users = [], isLoading } = useGetUsersQuery({ search: query });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleUser = (userId: string) => {
    if (type === "single") {
      onSelectionChange([userId]);
      setIsOpen(false);
    } else {
      const isSelected = selectedIds.includes(userId);
      if (isSelected) {
        onSelectionChange(selectedIds.filter((id) => id !== userId));
      } else {
        onSelectionChange([...selectedIds, userId]);
      }
    }
    setQuery("");
  };

  const selectedUserObjects = users.filter((u: any) =>
    selectedIds.includes(u.id),
  );

  return (
    <div className="flex flex-col gap-2 relative" ref={dropdownRef}>
      <label className="text-xs font-bold text-fg">
        {type === "single" ? t("TARGET_RECIPIENT") : t("SELECTED_RECIPIENTS")}
      </label>

      <div
        className="flex flex-wrap gap-2 p-2 bg-bg border border-slate-200 dark:border-slate-800 rounded-2xl min-h-13 transition-all focus-within:border-brand focus-within:ring-1 ring-brand/10 cursor-text"
        onClick={() => setIsOpen(true)}
      >
        {selectedUserObjects.map((user: any) => (
          <div
            key={user.id}
            className="flex items-center gap-1.5 pl-2 pr-1 py-1 bg-brand text-white rounded-lg animate-in zoom-in-95 duration-200"
          >
            <span className="text-[10px] font-black uppercase tracking-tight">
              {user.fullname || user.email}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleUser(user.id);
              }}
              className="hover:bg-white/20 rounded-md p-0.5 transition-colors"
            >
              <X size={10} />
            </button>
          </div>
        ))}
        <div className="flex-1 flex items-center gap-2 min-w-30">
          {isLoading ? (
            <Loader2 size={14} className="animate-spin text-slate-400" />
          ) : (
            <Search size={14} className="text-slate-400" />
          )}
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            placeholder={
              selectedIds.length === 0 ? t("SEARCH_USERS_PLACEHOLDER") : ""
            }
            className="w-full bg-transparent outline-none text-sm font-medium text-fg placeholder:text-slate-400"
          />
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 w-full z-50 bg-bg border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="max-h-60 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {users.length > 0 ? (
              users
                ?.filter(
                  (user: any) =>
                    user?.id !== currentUser?.id &&
                    user?.role?.name !== "superadmin",
                )
                .map((user: any) => (
                  <button
                    key={user.id}
                    onClick={() => toggleUser(user.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                      selectedIds.includes(user.id)
                        ? "bg-brand/10 text-brand"
                        : "hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3 text-left">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-[10px] ${
                          selectedIds.includes(user.id)
                            ? "bg-brand text-white"
                            : "bg-slate-100 dark:bg-slate-800"
                        }`}
                      >
                        {user.fullname?.charAt(0) || <UserIcon size={14} />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-black uppercase tracking-tight">
                          {user.fullname}
                        </span>
                        <span className="text-[10px] opacity-60 font-medium">
                          {user.email}
                        </span>
                      </div>
                    </div>
                    {selectedIds.includes(user.id) && (
                      <div className="bg-brand text-white rounded-full p-1">
                        <Check size={12} strokeWidth={4} />
                      </div>
                    )}
                  </button>
                ))
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                {t("NO_USERS_FOUND")}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipientSelector;
