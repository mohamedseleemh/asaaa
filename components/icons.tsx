import {
  Shield,
  Headphones,
  Zap,
  DollarSign,
  Star,
  Users,
  Clock,
  Award,
  CheckCircle,
  ArrowRight,
  MessageCircle,
  Phone,
  Mail,
  Globe,
  Heart,
  TrendingUp,
  Lock,
  Smartphone,
  CreditCard,
  Banknote,
  Wallet,
  Building,
  Target,
  Briefcase,
  type LucideIcon,
} from "lucide-react"

export const iconMap: Record<string, LucideIcon> = {
  shield: Shield,
  headphones: Headphones,
  zap: Zap,
  "dollar-sign": DollarSign,
  star: Star,
  users: Users,
  clock: Clock,
  award: Award,
  "check-circle": CheckCircle,
  "arrow-right": ArrowRight,
  "message-circle": MessageCircle,
  phone: Phone,
  mail: Mail,
  globe: Globe,
  heart: Heart,
  "trending-up": TrendingUp,
  lock: Lock,
  smartphone: Smartphone,
  "credit-card": CreditCard,
  banknote: Banknote,
  wallet: Wallet,
  building: Building,
  target: Target,
  briefcase: Briefcase,
}

export function getIcon(name: string): LucideIcon {
  return iconMap[name] || Shield
}

export interface IconProps {
  name: string
  className?: string
  size?: number
}

export function Icon({ name, className = "w-6 h-6", size }: IconProps) {
  const IconComponent = getIcon(name)
  return <IconComponent className={className} size={size} />
}

// FeatureIcon component for features block
export function FeatureIcon({ name, className = "w-6 h-6" }: { name: string; className?: string }) {
  const IconComponent = getIcon(name)
  return <IconComponent className={className} />
}
