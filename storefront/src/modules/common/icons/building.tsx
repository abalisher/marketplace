import React from "react"

import { IconProps } from "types/icon"

// Иконка «организация» для раздела «Компания» в аккаунте — та же сетка 20×20 и
// толщина линии 1.5, что у остальных иконок навигации (user, map-pin, package).
const Building: React.FC<IconProps> = ({
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
        d="M3.75 17.5V4.16667C3.75 3.24619 4.49619 2.5 5.41667 2.5H11.25C12.1705 2.5 12.9167 3.24619 12.9167 4.16667V17.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.9167 8.33333H14.5833C15.5038 8.33333 16.25 9.07953 16.25 10V17.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.5 17.5H17.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.66667 5.83333H10M6.66667 9.16667H10M6.66667 12.5H10"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default Building
