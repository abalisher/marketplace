import React from "react"

import { IconProps } from "types/icon"

// Скрепка композера (T10.4b) — та же сетка 20×20 и толщина линии 1.5, что у
// микрофона и остальных иконок витрины.
const Paperclip: React.FC<IconProps> = ({
  size = "20",
  color = "currentColor",
  ...attributes
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...attributes}
    >
      <path
        d="M16.25 9.16667L10.2083 15.2083C8.82259 16.5941 6.5774 16.5941 5.19167 15.2083C3.80595 13.8226 3.80595 11.5774 5.19167 10.1917L11.2333 4.15C12.1572 3.22619 13.6553 3.22619 14.5792 4.15C15.503 5.07381 15.503 6.57191 14.5792 7.49572L8.72083 13.3542C8.25893 13.8161 7.50988 13.8161 7.04797 13.3542C6.58607 12.8923 6.58607 12.1432 7.04797 11.6813L12.5 6.22917"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default Paperclip
