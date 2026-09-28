import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleAlert,
  CircleCheck,
  CircleHelp,
  CircleX,
  Copy,
  Download,
  Edit,
  ExternalLink,
  Eye,
  EyeOff,
  File,
  Filter,
  Info,
  LoaderCircle,
  Menu,
  Minus,
  MoreHorizontal,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Trash2,
  Upload,
  User,
  X,
  BookOpenCheck,
  Lock,
  BarChart3,
  Calendar,
  Clock,
  MapPin,
  Home,
} from "lucide-react";

export const iconMap = {
  // Navigation
  "arrow-down": ArrowDown,
  "arrow-left": ArrowLeft,
  "arrow-right": ArrowRight,
  "arrow-up": ArrowUp,

  "chevron-down": ChevronDown,
  "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight,
  "chevron-up": ChevronUp,

  // Actions
  check: Check,
  close: X,
  delete: Trash2,
  edit: Edit,
  plus: Plus,
  minus: Minus,
  refresh: RefreshCw,
  copy: Copy,

  // Common
  search: Search,
  filter: Filter,
  settings: Settings,
  menu: Menu,
  user: User,

  // Visibility
  eye: Eye,
  "eye-off": EyeOff,

  // Files
  file: File,
  download: Download,
  upload: Upload,

  // External
  "external-link": ExternalLink,

  // Status
  info: Info,
  success: CircleCheck,
  warning: CircleAlert,
  error: CircleX,
  help: CircleHelp,

  // Misc
  "more-horizontal": MoreHorizontal,
  "more-vertical": MoreVertical,
  loading: LoaderCircle,

  book: BookOpenCheck,
  password: Lock,
  chart: BarChart3,
  calendar: Calendar,
  clock: Clock,
  "map-pin": MapPin,
  home: Home,
} as const;
