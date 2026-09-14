import React from "react"

import { IconProps } from "types/icon"

// Иконка микрофона для голосового ввода в композере (T10.3) — та же сетка 20×20
// и толщина линии 1.5, что у остальных иконок витрины.
const Microphone: React.FC<IconProps> = ({
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
        d="M10 2.5C8.96447 2.5 8.125 3.33947 8.125 4.375V10C8.125 11.0355 8.96447 11.875 10 11.875C11.0355 11.875 11.875 11.0355 11.875 10V4.375C11.875 3.33947 11.0355 2.5 10 2.5Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 9.16667V10C15 12.7614 12.7614 15 10 15C7.23858 15 5 12.7614 5 10V9.16667"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 15V17.5M7.5 17.5H12.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default Microphone
