/**
 * icon-map, Shared lucide icon-name -> component resolution.
 *
 * Extracted verbatim from app/(tabs)/_layout.tsx so BOTH the NavigatorSwitch
 * (tab/drawer/hub navigators) and HubLayout (spoke grid) resolve icon-name
 * strings the same way. The DevAgent writes icon names as strings in
 * gasConfig.navigation.tabs; this map turns them into React components.
 *
 * Add additional icons here as needed for new apps.
 */

import {
  Home,
  Compass,
  Settings,
  Search,
  Bell,
  User,
  Heart,
  Star,
  BookMarked,
  TrendingUp,
  BarChart3,
  Calendar,
  MessageCircle,
  ShoppingCart,
  Folder,
  Map,
  Music,
  Camera,
  Image,
  Film,
  Zap,
  Award,
  Target,
  Layers,
  Grid,
  List,
  Clock,
  Shield,
  Globe,
  Smartphone,
  LayoutDashboard,
  Users,
  PieChart,
  Activity,
  Briefcase,
  Coffee,
  Dumbbell,
  Brain,
  Wallet,
  CircleDollarSign,
  Flame,
  Leaf,
  Lightbulb,
  Sparkles,
  Trophy,
  type LucideIcon,
} from 'lucide-react-native';

export type { LucideIcon };

// --- Icon name -> component mapping ---
// The DevAgent writes icon names as strings in gasConfig.navigation.tabs.
// This map resolves those strings to actual React components at runtime.
// Add additional icons here as needed for new apps.
export const ICON_MAP: Record<string, LucideIcon> = {
  Home,
  Compass,
  Settings,
  Search,
  Bell,
  User,
  Heart,
  Star,
  BookMarked,
  TrendingUp,
  BarChart3,
  Calendar,
  MessageCircle,
  ShoppingCart,
  Folder,
  Map,
  Music,
  Camera,
  Image,
  Film,
  Zap,
  Award,
  Target,
  Layers,
  Grid,
  List,
  Clock,
  Shield,
  Globe,
  Smartphone,
  LayoutDashboard,
  Users,
  PieChart,
  Activity,
  Briefcase,
  Coffee,
  Dumbbell,
  Brain,
  Wallet,
  CircleDollarSign,
  Flame,
  Leaf,
  Lightbulb,
  Sparkles,
  Trophy,
};

/**
 * Resolve an icon name string to a lucide component.
 * Falls back to Home if the icon name is not found in the map.
 */
export function resolveIcon(iconName: string): LucideIcon {
  return ICON_MAP[iconName] ?? Home;
}
