"use client"

import { useEffect } from "react"

// Автообновление вкладки после выкладки. HTML витрины приходит с `no-store`, а
// чанки — с хэшем в имени, так что свежий заход всегда получает новую сборку.
// Ломается другое: мобильный браузер поднимает вкладку из памяти (или из
// bfcache) без запроса к серверу, и страница продолжает работать на старом
// бандле, пока её не открыть заново — на практике «только через инкогнито».
//
// Поэтому вкладка сама сверяет вшитую метку сборки с `/api/build-id`: при
// открытии, при возврате на вкладку и раз в несколько минут. Разошлись —
// перезагрузка. Пока покупатель смотрит на страницу, её не дёргаем (идёт ход
// ассистента, набирается реплика): расхождение, найденное по таймеру,
// откладывается до следующего возврата на вкладку.

const CURRENT_BUILD_ID = process.env.STOREFRONT_BUILD_ID
const CHECK_INTERVAL_MS = 5 * 60 * 1000
// Метка, ради которой уже перезагружались. Защита от цикла: если после
// перезагрузки пришёл всё тот же старый бандл (промежуточный кэш), второй раз
// ради той же метки не перезагружаемся.
const RELOADED_FOR_KEY = "sm_reloaded_for_build"

const fetchDeployedBuildId = async (): Promise<string | null> => {
  try {
    const response = await fetch("/api/build-id", { cache: "no-store" })
    if (!response.ok) {
      return null
    }
    const body = (await response.json()) as { buildId?: string | null }
    return body.buildId ?? null
  } catch {
    return null
  }
}

const reloadFor = (buildId: string) => {
  try {
    if (sessionStorage.getItem(RELOADED_FOR_KEY) === buildId) {
      return
    }
    sessionStorage.setItem(RELOADED_FOR_KEY, buildId)
  } catch {
    // Хранилище недоступно (приватный режим) — перезагружаемся без защиты:
    // свежий HTML идёт с `no-store`, цикл тут маловероятен.
  }
  window.location.reload()
}

const DeployRefresh = () => {
  useEffect(() => {
    if (!CURRENT_BUILD_ID) {
      return
    }

    let pendingBuildId: string | null = null
    let checking = false

    const check = async (reloadNow: boolean) => {
      if (checking) {
        return
      }
      checking = true
      const deployed = await fetchDeployedBuildId()
      checking = false
      if (!deployed || deployed === CURRENT_BUILD_ID) {
        return
      }
      if (reloadNow) {
        reloadFor(deployed)
      } else {
        pendingBuildId = deployed
      }
    }

    const onVisibilityChange = () => {
      if (document.visibilityState !== "visible") {
        return
      }
      if (pendingBuildId) {
        reloadFor(pendingBuildId)
        return
      }
      void check(true)
    }

    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        void check(true)
      }
    }

    void check(true)
    const timer = window.setInterval(() => void check(false), CHECK_INTERVAL_MS)
    document.addEventListener("visibilitychange", onVisibilityChange)
    window.addEventListener("pageshow", onPageShow)

    return () => {
      window.clearInterval(timer)
      document.removeEventListener("visibilitychange", onVisibilityChange)
      window.removeEventListener("pageshow", onPageShow)
    }
  }, [])

  return null
}

export default DeployRefresh
