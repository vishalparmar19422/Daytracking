import { initials, colorFor } from '../lib/avatar'

const SIZES = {
  sm: 'w-6 h-6 text-[10px]',
  md: 'w-9 h-9 text-xs',
  lg: 'w-11 h-11 text-sm',
}

// A colored circle with a person's initials. Color is derived from the name.
export default function Avatar({ name, size = 'md', ring = false, className = '' }) {
  return (
    <span
      title={name}
      className={`inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold text-white ${colorFor(
        name,
      )} ${SIZES[size]} ${ring ? 'ring-2 ring-slate-950' : ''} ${className}`}
    >
      {initials(name)}
    </span>
  )
}
