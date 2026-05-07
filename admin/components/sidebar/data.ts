import {
  LayoutDashboard,
  Users,
  TrendingUp,
  Settings,
  Activity,
  ShieldCheck,
  CreditCard,
  Bell,
  Wallet,
  GanttChartSquare,
  Mail,
  MessageSquare,
  Image as ImageIcon,
  UserCheck,
  Zap,
  PersonStanding,
} from "lucide-react";

export const navlinks = [
  {
    label: "ANALYTICS",
    items: [{ name: "OVERVIEW", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "USER_MANAGEMENT",
    items: [
      { name: "USERS", href: "/dashboard/users", icon: Users },
      { name: "KYC_VERIFICATIONS", href: "/dashboard/kyc", icon: UserCheck },
    ],
  },

  {
    label: "COMMUNICATION",
    items: [
      { name: "LIVE_CHAT", href: "/dashboard/chat", icon: MessageSquare },
      { name: "EMAIL_TEMPLATES", href: "/dashboard/email", icon: Mail },
      { name: "BANNERS", href: "/dashboard/banners", icon: ImageIcon },
    ],
  },
  {
    label: "SYSTEM_SECURITY",
    items: [
      { name: "PROFILE", href: "/dashboard/profile", icon: PersonStanding },
      {
        name: "ACCESS_CONTROL",
        href: "/dashboard/access-control",
        icon: ShieldCheck,
      },
      { name: "PAYMENTS_CONTROL", href: "/dashboard/payments", icon: Wallet },
    ],
  },
  {
    label: "MARKET_ENGINE",
    items: [
      { name: "LOT_SETTINGS", href: "/dashboard/lots", icon: GanttChartSquare },
      { name: "SPREAD_ENGINE", href: "/dashboard/spread", icon: Zap },
    ],
  },
];
