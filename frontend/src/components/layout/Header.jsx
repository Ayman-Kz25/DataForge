import { useEffect, useRef, useState } from "react";
import {
  Menu,
  User,
  Settings,
  Shield,
  LogOut,
  ChevronDown,
  Database,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/api";
import ThemeToggle from "@/components/ThemeToggle";

export function Header({ onToggleSidebar }) {
  const { user, logout, isAdmin } = useAuthStore();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const menuRef = useRef(null);
  const profileButtonRef = useRef(null);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        profileButtonRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleLogout = async () => {
    if (loggingOut) return;

    try {
      setLoggingOut(true);

      await authService.logout();
    } catch {
      // Local auth state should still be cleared
      // even if the server logout request fails.
    } finally {
      logout();
      navigate("/login", { replace: true });
    }
  };

  const navigateFromMenu = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  const initials = getInitials(user?.name);

  return (
    <header className="flex h-16 w-full items-center border-b border-border bg-surface/90 px-3 backdrop-blur-xl sm:px-4">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {/* Navigation toggle */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-lg
            text-muted-foreground
            transition-colors
            hover:bg-surface-secondary
            hover:text-foreground
          "
          aria-label="Toggle navigation"
        >
          <Menu className="h-[18px] w-[18px]" />
        </button>

        {/* Brand */}
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="
            group
            flex
            min-w-0
            items-center
            gap-2.5
            rounded-lg
            px-1.5
            py-1
            text-left
          "
          aria-label="Go to dashboard"
        >
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary text-white shadow-sm">
            <Database className="h-4 w-4" />

            <span className="absolute inset-0 rounded-lg ring-1 ring-inset ring-white/15" />
          </div>

          <div className="hidden min-w-0 sm:block">
            <div className="text-sm font-bold tracking-[-0.02em] text-foreground">
              DataForge
            </div>

            <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-muted">
              Data workspace
            </div>
          </div>
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        {/* Existing global theme control */}
        <ThemeToggle />

        <div className="mx-1 hidden h-5 w-px bg-border sm:block" />

        {/* Account menu */}
        <div ref={menuRef} className="relative">
          <button
            ref={profileButtonRef}
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            className="
              flex
              items-center
              gap-2
              rounded-xl
              p-1
              pr-1.5
              transition-colors
              hover:bg-surface-secondary
            "
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-xs font-bold text-primary">
              {initials}
            </div>

            <div className="hidden min-w-0 text-left md:block">
              <p className="max-w-[140px] truncate text-xs font-semibold">
                {user?.name || "User"}
              </p>

              <p className="max-w-[140px] truncate text-[10px] text-muted-foreground">
                {user?.role === "admin" ? "Administrator" : "Member"}
              </p>
            </div>

            <ChevronDown
              className={`hidden h-3.5 w-3.5 text-muted-foreground transition-transform md:block ${
                menuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {menuOpen && (
            <div
              role="menu"
              aria-label="Account menu"
              className="
                absolute
                right-0
                top-full
                z-50
                mt-2
                w-[280px]
                overflow-hidden
                rounded-xl
                border
                border-border
                bg-surface
                shadow-xl
                shadow-black/10
              "
            >
              {/* Account identity */}
              <div className="border-b border-border bg-surface-secondary/40 px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white">
                    {initials}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {user?.name || "User"}
                    </p>

                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {user?.email || "No email available"}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                    Account
                  </span>

                  <span className="flex items-center gap-1.5 text-[10px] font-semibold text-success">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    Active
                  </span>
                </div>
              </div>

              {/* Navigation */}
              <div className="p-1.5">
                <AccountMenuItem
                  icon={User}
                  label="Profile"
                  description="Manage your account"
                  onClick={() => navigateFromMenu("/settings")}
                />

                <AccountMenuItem
                  icon={Settings}
                  label="Settings"
                  description="Preferences and security"
                  onClick={() => navigateFromMenu("/settings")}
                />

                {isAdmin() && (
                  <AccountMenuItem
                    icon={Shield}
                    label="Admin panel"
                    description="Manage DataForge"
                    onClick={() => navigateFromMenu("/admin")}
                  />
                )}
              </div>

              {/* Sign out */}
              <div className="border-t border-border p-1.5">
                <button
                  type="button"
                  role="menuitem"
                  disabled={loggingOut}
                  onClick={handleLogout}
                  className="
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-lg
                    px-3
                    py-2.5
                    text-left
                    text-danger
                    transition-colors
                    hover:bg-danger/10
                    disabled:opacity-60
                  "
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-danger/10">
                    {loggingOut ? (
                      <LogOut className="h-3.5 w-3.5 animate-pulse" />
                    ) : (
                      <LogOut className="h-3.5 w-3.5" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold">
                      {loggingOut ? "Signing out..." : "Sign out"}
                    </p>

                    <p className="mt-0.5 text-[10px] text-danger/70">
                      End this session
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function AccountMenuItem({ icon: Icon, label, description, onClick }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="
        group
        flex
        w-full
        items-center
        gap-3
        rounded-lg
        px-3
        py-2.5
        text-left
        transition-colors
        hover:bg-surface-secondary
      "
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-secondary text-muted-foreground transition-colors group-hover:bg-primary-soft group-hover:text-primary">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-foreground">{label}</p>

        <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
          {description}
        </p>
      </div>
    </button>
  );
}

function getInitials(name) {
  if (!name) return "DF";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
