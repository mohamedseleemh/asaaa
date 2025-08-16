import { Wallet, Bitcoin } from "lucide-react"

interface ServiceIconProps {
  className?: string
}

// PayPal Icon
export function PayPalIcon({ className = "h-8 w-8" }: ServiceIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#0070ba" />
      <path d="M7.5 6h4.5c2.5 0 4 1.5 4 3.5s-1.5 3.5-4 3.5H9l-.5 3h-2L7.5 6z" fill="white" />
      <path d="M9 13h2.5c1.5 0 2.5-1 2.5-2.5S13 8 11.5 8H9.5l-.5 5z" fill="#0070ba" />
    </svg>
  )
}

// Payoneer Icon
export function PayoneerIcon({ className = "h-8 w-8" }: ServiceIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#ff6600" />
      <path d="M6 8h4c2 0 3.5 1 3.5 2.5S12 13 10 13H8l-.5 3H6L6 8z" fill="white" />
      <circle cx="16" cy="12" r="2" fill="white" />
    </svg>
  )
}

// Wise Icon
export function WiseIcon({ className = "h-8 w-8" }: ServiceIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#00b9ff" />
      <path d="M8 7l8 10M16 7l-8 10" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

// Skrill Icon
export function SkrillIcon({ className = "h-8 w-8" }: ServiceIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#862165" />
      <path d="M7 8h3c1.5 0 2.5.5 2.5 1.5S11.5 11 10 11H8.5l-.5 2H7V8z" fill="white" />
      <path d="M10 13h3c1.5 0 2.5.5 2.5 1.5S14.5 16 13 16h-1.5l-.5 2H10v-5z" fill="white" />
    </svg>
  )
}

// Neteller Icon
export function NetellerIcon({ className = "h-8 w-8" }: ServiceIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#689f38" />
      <path d="M6 8h2l4 8h-2l-4-8z" fill="white" />
      <path d="M10 8h2l4 8h-2l-4-8z" fill="white" />
    </svg>
  )
}

// Bitcoin Icon
export function BitcoinIcon({ className = "h-8 w-8" }: ServiceIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#f7931a" />
      <path d="M9.5 8.5h3c1 0 1.5.5 1.5 1.5s-.5 1.5-1.5 1.5h-3v-3z" fill="white" />
      <path d="M9.5 11.5h3.5c1 0 1.5.5 1.5 1.5s-.5 1.5-1.5 1.5h-3.5v-3z" fill="white" />
      <path d="M11 7v2M11 15v2M13 7v2M13 15v2" stroke="white" strokeWidth="1" />
    </svg>
  )
}

// Ethereum Icon
export function EthereumIcon({ className = "h-8 w-8" }: ServiceIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#627eea" />
      <path d="M12 3l5 8.5-5 3-5-3L12 3z" fill="white" fillOpacity="0.8" />
      <path d="M12 14.5l5-3-5 8.5-5-8.5 5 3z" fill="white" />
    </svg>
  )
}

// Binance Icon
export function BinanceIcon({ className = "h-8 w-8" }: ServiceIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#f3ba2f" />
      <path d="M8 12l2-2 2 2 2-2 2 2-2 2-2-2-2 2-2-2z" fill="white" />
      <path d="M12 8l2 2-2 2-2-2 2-2z" fill="white" />
      <path d="M12 16l2-2-2-2-2 2 2 2z" fill="white" />
    </svg>
  )
}

// Legacy ServiceIcon component for backward compatibility
interface LegacyServiceIconProps {
  name: string
  className?: string
}

export function ServiceIcon({ name, className = "h-8 w-8" }: LegacyServiceIconProps) {
  const iconMap = {
    paypal: PayPalIcon,
    payoneer: PayoneerIcon,
    wise: WiseIcon,
    skrill: SkrillIcon,
    neteller: NetellerIcon,
    bitcoin: BitcoinIcon,
    ethereum: EthereumIcon,
    binance: BinanceIcon,
    crypto: () => (
      <div className={`${className} bg-yellow-500 text-white rounded-lg flex items-center justify-center`}>
        <Bitcoin className="h-5 w-5" />
      </div>
    ),
    default: () => (
      <div className={`${className} bg-gray-500 text-white rounded-lg flex items-center justify-center`}>
        <Wallet className="h-5 w-5" />
      </div>
    ),
  }

  const IconComponent = iconMap[name as keyof typeof iconMap] || iconMap.default
  return <IconComponent className={className} />
}
