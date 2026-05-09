// ============================================================
// studentMenu.ts — Single source of truth for student navigation
// Applies: DRY, Open/Closed Principle
// ============================================================

import {
  LayoutDashboard, BookOpen, FileText, Award, Users,
  Code, Map, Bell, User, Settings, MessageSquare,
  LucideIcon,
  GraduationCap,
} from "lucide-react";

export interface MenuItem {
  icon: LucideIcon;
  label: string;
  page: string;
  active?: boolean;
}

const BASE_MENU_ITEMS: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard",    page: "/student/dashboard"    },
  { icon: BookOpen,        label: "Courses",      page: "/student/courses"      },
  { icon: GraduationCap,        label: "Assessments",  page: "/student/assignments"  },
  { icon: Award,           label: "Certificates", page: "/student/certificates" },
  { icon: Users,           label: "Community",    page: "/student/community"    },
  { icon: Map,             label: "Roadmaps",     page: "/student/roadmaps"     },
  { icon: Code,            label: "Compiler",     page: "/student/compiler"     },
  { icon: Bell,            label: "Notifications",page: "/student/notifications"},
  { icon: User,            label: "Profile",      page: "/student/profile"      },
  { icon: Settings,        label: "Settings",     page: "/student/settings"     },
  { icon: MessageSquare,   label: "Contact Us",   page: "/student/contact"      },
];

export const getStudentMenuItems = (activePage: string): MenuItem[] =>
  BASE_MENU_ITEMS.map((item) => ({
    ...item,
    active: item.page === activePage,
  }));