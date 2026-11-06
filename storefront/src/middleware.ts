import { HttpTypes } from "@medusajs/types"
import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "us"

const regionMapCache = {
  regionMap: new Map<string, HttpTypes.StoreRegion>(),
  regionMapUpdated: Date.now(),
}

async function getRegionMap(cacheId: string) {
  const { regionMap, regionMapUpdated } = regionMapCache

  if (!BACKEND_URL) {
    throw new Error(
      "Middleware.ts: Error fetching regions. Did you set up regions in your Medusa Admin and define a MEDUSA_BACKEND_URL environment variable? Note that the variable is no longer named NEXT_PUBLIC_MEDUSA_BACKEND_URL."
    )
  }

  if (
    !regionMap.keys().next().value ||
    regionMapUpdated < Date.now() - 3600 * 1000
  ) {
    // Fetch regions from Medusa. We can't use the JS client here because middleware is running on Edge and the client needs a Node environment.
    const { regions } = await fetch(`${BACKEND_URL}/store/regions`, {
      headers: {
        "x-publishable-api-key": PUBLISHABLE_API_KEY!,
      },
      next: {
        revalidate: 3600,
        tags: [`regions-${cacheId}`],
      },
      cache: "force-cache",
    }).then(async (response) => {
      const json = await response.json()

      if (!response.ok) {
        throw new Error(json.message)
      }

      return json
    })

    if (!regions?.length) {
      throw new Error(
        "No regions found. Please set up regions in your Medusa Admin."
      )
    }

    // Create a map of country codes to regions.
    regions.forEach((region: HttpTypes.StoreRegion) => {
      region.countries?.forEach((c) => {
        regionMapCache.regionMap.set(c.iso_2 ?? "", region)
      })
    })

    regionMapCache.regionMapUpdated = Date.now()
  }

  return regionMapCache.regionMap
}

/**
 * Fetches regions from Medusa and sets the region cookie.
 * @param request
 * @param response
 */
async function getCountryCode(
  request: NextRequest,
  regionMap: Map<string, HttpTypes.StoreRegion | number>
) {
  try {
    let countryCode

    const vercelCountryCode = request.headers
      .get("x-vercel-ip-country")
      ?.toLowerCase()

    const urlCountryCode = request.nextUrl.pathname.split("/")[1]?.toLowerCase()

    if (urlCountryCode && regionMap.has(urlCountryCode)) {
      countryCode = urlCountryCode
    } else if (vercelCountryCode && regionMap.has(vercelCountryCode)) {
      countryCode = vercelCountryCode
    } else if (regionMap.has(DEFAULT_REGION)) {
      countryCode = DEFAULT_REGION
    } else if (regionMap.keys().next().value) {
      countryCode = regionMap.keys().next().value
    }

    return countryCode
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "Middleware.ts: Error getting the country code. Did you set up regions in your Medusa Admin and define a MEDUSA_BACKEND_URL environment variable? Note that the variable is no longer named NEXT_PUBLIC_MEDUSA_BACKEND_URL."
      )
    }
  }
}

// После пивота 2026-07-22 путь покупателя — только чат: классический каталог не
// нужен (решение владельца 2026-08-03). Эти пути и корень региона ведут в чат;
// страницы аккаунта и заказов остаются доступными по прямым ссылкам.
// `/cart` здесь же (T3.10): корзину ведёт ассистент в диалоге, а cookie-корзина
// стартера после пивота не наполняется — страница показывала «пусто» даже при
// полной корзине и уводила в каталог, который возвращает обратно в чат.
const CHAT_ONLY_PREFIXES = [
  "/store",
  "/categories",
  "/collections",
  "/products",
  "/cart",
]

const chatRedirect = (request: NextRequest, countryCode: string) => {
  const rest = request.nextUrl.pathname.replace(`/${countryCode}`, "") || "/"
  const isChatOnly = CHAT_ONLY_PREFIXES.some(
    (prefix) => rest === prefix || rest.startsWith(`${prefix}/`)
  )

  if (rest !== "/" && !isChatOnly) {
    return null
  }

  return NextResponse.redirect(
    `${request.nextUrl.origin}/${countryCode}/chat`,
    307
  )
}

// Витрина компании-продавца (мультипродавец): адрес /<cc>/t/<slug>. Компания
// запоминается на сессию httpOnly cookie — чат и кабинет после лендинга
// продолжают работать от её имени; читает cookie только сервер
// (lib/data/tenant.ts), существование компании проверяет он же. Лендинг
// площадки возвращает покупателя на витрину площадки.
const TENANT_COOKIE = "_sm_tenant"
const TENANT_PATH = /^\/t\/([a-z0-9-]{1,64})\/?$/
// Адреса первой версии (до 2026-10-01) — на постоянные. «Компания А» с
// 2026-10-08 — ИП ORGSTROY (slug orgstroy), «Компания Б» с 2026-11-04 —
// ИП NUR-STROI (slug nurstroi).
const LEGACY_TENANT_PATH = /^\/(companya|companyb)\/?$/
const LEGACY_TENANT_SLUG: Record<string, string> = {
  companya: "orgstroy",
  companyb: "nurstroi",
}
const RENAMED_TENANT_PATH = /^\/t\/(companya|companyb)\/?$/

const withTenant = (
  request: NextRequest,
  countryCode: string,
  response: NextResponse
): NextResponse => {
  const rest = request.nextUrl.pathname.replace(`/${countryCode}`, "") || "/"
  const slug = TENANT_PATH.exec(rest)?.[1]
  if (slug) {
    response.cookies.set(TENANT_COOKIE, slug, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    })
  } else if (rest === "/landing") {
    response.cookies.delete(TENANT_COOKIE)
  }
  return response
}

const legacyTenantRedirect = (request: NextRequest, countryCode: string) => {
  const rest = request.nextUrl.pathname.replace(`/${countryCode}`, "") || "/"
  const slug =
    LEGACY_TENANT_PATH.exec(rest)?.[1] ?? RENAMED_TENANT_PATH.exec(rest)?.[1]
  return slug
    ? NextResponse.redirect(
        `${request.nextUrl.origin}/${countryCode}/t/${LEGACY_TENANT_SLUG[slug] ?? slug}`,
        308
      )
    : null
}

/**
 * Middleware to handle region selection and onboarding status.
 */
export async function middleware(request: NextRequest) {
  let redirectUrl = request.nextUrl.href

  let response = NextResponse.redirect(redirectUrl, 307)

  let cacheIdCookie = request.cookies.get("_medusa_cache_id")

  let cacheId = cacheIdCookie?.value || crypto.randomUUID()

  const regionMap = await getRegionMap(cacheId)

  const countryCode = regionMap && (await getCountryCode(request, regionMap))

  const urlHasCountryCode =
    countryCode && request.nextUrl.pathname.split("/")[1].includes(countryCode)

  // if one of the country codes is in the url and the cache id is set, return next
  if (urlHasCountryCode && cacheIdCookie) {
    return withTenant(
      request,
      countryCode,
      legacyTenantRedirect(request, countryCode) ??
        chatRedirect(request, countryCode) ??
        NextResponse.next()
    )
  }

  // if one of the country codes is in the url and the cache id is not set, set the cache id and redirect
  if (urlHasCountryCode && !cacheIdCookie) {
    const toChat = chatRedirect(request, countryCode)
    const withCookie = toChat ?? response
    withCookie.cookies.set("_medusa_cache_id", cacheId, {
      maxAge: 60 * 60 * 24,
    })

    return withTenant(request, countryCode, withCookie)
  }

  // check if the url is a static asset
  if (request.nextUrl.pathname.includes(".")) {
    return NextResponse.next()
  }

  const redirectPath =
    request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname

  const queryString = request.nextUrl.search ? request.nextUrl.search : ""

  // If no country code is set, we redirect to the relevant region.
  if (!urlHasCountryCode && countryCode) {
    redirectUrl = `${request.nextUrl.origin}/${countryCode}${redirectPath}${queryString}`
    response = NextResponse.redirect(`${redirectUrl}`, 307)
  } else if (!urlHasCountryCode && !countryCode) {
    // Handle case where no valid country code exists (empty regions)
    return new NextResponse(
      "No valid regions configured. Please set up regions with countries in your Medusa Admin.",
      { status: 500 }
    )
  }

  return response
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp).*)",
  ],
}
