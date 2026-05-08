// ============================================================
// adminMenu.ts — Single source of truth for admin navigation
// Applies: DRY, Open/Closed Principle
// Add/remove menu items here ONCE — all pages reflect it.
// ============================================================

import {
  LayoutDashboard,
  Users,
  BookOpen,
  MessageSquare,
  FileText,
  Bell,
  User,
  Settings,
  LucideIcon,
} from "lucide-react";

export interface MenuItem {
  icon: LucideIcon;
  label: string;
  page: string;
  active?: boolean;
}

// Base menu items (no active state)
const BASE_MENU_ITEMS: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard",    page: "/admin/dashboard"    },
  { icon: Users,           label: "Users",        page: "/admin/users"        },
  { icon: BookOpen,        label: "Courses",      page: "/admin/courses"      },
  { icon: MessageSquare,   label: "Communities",  page: "/admin/communities"  },
  { icon: FileText,        label: "Reports",      page: "/admin/reports"      },
  { icon: Bell,            label: "Notifications",page: "/admin/notifications"},
  { icon: User,            label: "Profile",      page: "/admin/profile"      },
  { icon: Settings,        label: "Settings",     page: "/admin/settings"     },
];

/**
 * Returns the menu items with the correct `active` flag set
 * based on the current page path.
 *
 * Usage: const items = getAdminMenuItems("/admin/courses");
 */
export const getAdminMenuItems = (activePage: string): MenuItem[] =>
  BASE_MENU_ITEMS.map((item) => ({
    ...item,
    active: item.page === activePage,
  }));