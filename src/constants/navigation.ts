import {
  BriefcaseBusiness,
  Clock3,
  Gauge,
  Star,
  UserRound
} from "lucide-react";

export const navigationItems = [
  { label: "Dashboard", href: "/", icon: Gauge },
  { label: "Workspaces", href: "/workspaces", icon: BriefcaseBusiness },
  { label: "My Tasks", href: "/tasks/my", icon: UserRound },
  { label: "Recent Tasks", href: "/tasks/recent", icon: Clock3 },
  { label: "Marked Tasks", href: "/tasks/marked", icon: Star }
] as const;
