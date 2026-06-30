import { cn } from "@/lib/utils"

export interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string
  filled?: boolean
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700
  size?: number | string
}

export function Icon({
  name,
  className,
  filled = false,
  weight = 400,
  size,
  style,
  ...props
}: IconProps) {
  const customStyle = {
    fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' ${weight}, 'GRAD' 0, 'opsz' 24`,
    ...(size ? { fontSize: typeof size === 'number' ? `${size}px` : size } : {}),
    ...style,
  }

  return (
    <span
      className={cn("material-symbols-outlined", className)}
      style={customStyle}
      {...props}
    >
      {name}
    </span>
  )
}
