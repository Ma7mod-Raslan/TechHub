// ============================================================
// instructorMenu.ts — Single source of truth for instructor navigation
// Applies: DRY, Open/Closed Principle
// ============================================================

import {
  LayoutDashboard, BookOpen, BarChart3, Users,
  Bell, User, Settings, MessageSquare, LucideIcon,
} from "lucide-react";

export interface MenuItem {
  icon: LucideIcon;
  label: string;
  page: string;
  active?: boolean;
}

const BASE_MENU_ITEMS: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard",    page: "/instructor/dashboard"    },
  { icon: BookOpen,        label: "My Courses",   page: "/instructor/courses"      },
  { icon: BarChart3,       label: "Assessments",  page: "/instructor/assignments"  },
  { icon: Users,           label: "Community",    page: "/instructor/community"    },
  { icon: Bell,            label: "Notifications",page: "/instructor/notifications"},
  { icon: User,            label: "Profile",      page: "/instructor/profile"      },
  { icon: Settings,        label: "Settings",     page: "/instructor/settings"     },
  { icon: MessageSquare,   label: "Contact Us",   page: "/instructor/contact"      },
];

export const getInstructorMenuItems = (activePage: string): MenuItem[] =>
  BASE_MENU_ITEMS.map((item) => ({
    ...item,
    active: item.page === activePage,
  }));