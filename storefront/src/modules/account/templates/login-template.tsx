"use client"

import { useState } from "react"

import Register from "@modules/account/components/register"
import Login from "@modules/account/components/login"
import PhoneLogin from "@modules/account/components/phone-login"

export enum LOGIN_VIEW {
  PHONE = "phone",
  SIGN_IN = "sign-in",
  REGISTER = "register",
}

// Основной вход покупателя — по номеру телефона (T10.7, решение владельца
// 2026-08-25). Вход по email оставлен второй ссылкой: под ним работают учётки,
// заведённые раньше.
const LoginTemplate = () => {
  const [currentView, setCurrentView] = useState<LOGIN_VIEW>(LOGIN_VIEW.PHONE)

  return (
    <div className="w-full flex justify-start px-8 py-8">
      {currentView === LOGIN_VIEW.PHONE && (
        <PhoneLogin setCurrentView={setCurrentView} />
      )}
      {currentView === LOGIN_VIEW.SIGN_IN && (
        <Login setCurrentView={setCurrentView} />
      )}
      {currentView === LOGIN_VIEW.REGISTER && (
        <Register setCurrentView={setCurrentView} />
      )}
    </div>
  )
}

export default LoginTemplate
