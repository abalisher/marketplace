const checkEnvVariables = require("./check-env-variables")

checkEnvVariables()

/**
 * Medusa Cloud-related environment variables
 */
const S3_HOSTNAME = process.env.MEDUSA_CLOUD_S3_HOSTNAME
const S3_PATHNAME = process.env.MEDUSA_CLOUD_S3_PATHNAME

/**
 * Хост, с которого приходят фото товаров. Каталог хранит АБСОЛЮТНЫЕ ссылки на
 * `/media/:file` бэкенда (база — STATIC_BASE_URL при сиде), а next/image
 * загружает только разрешённые здесь хосты — на локальном стенде это
 * `localhost` ниже, на сервере адрес другой, и без этой записи витрина резала
 * бы все фото. Значение вшивается на сборке образа витрины.
 */
const mediaPattern = (() => {
  const raw = process.env.NEXT_PUBLIC_MEDIA_BASE_URL
  if (!raw) {
    return []
  }
  try {
    const url = new URL(raw)
    return [
      {
        protocol: url.protocol.replace(":", ""),
        hostname: url.hostname,
        ...(url.port ? { port: url.port } : {}),
      },
    ]
  } catch {
    return []
  }
})()

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Заявка юрлица отправляется server action'ом вместе с учредительными
    // документами (до 4 файлов по 3 МБ) — дефолтного лимита 1 МБ не хватает.
    // Бэкенд принимает те же файлы в base64 (backend/src/api/middlewares.ts).
    serverActions: { bodySizeLimit: "16mb" },
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      ...mediaPattern,
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "medusa-server-testing.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "medusa-server-testing.s3.us-east-1.amazonaws.com",
      },
      ...(S3_HOSTNAME && S3_PATHNAME
        ? [
            {
              protocol: "https",
              hostname: S3_HOSTNAME,
              pathname: S3_PATHNAME,
            },
          ]
        : []),
    ],
  },
}

module.exports = nextConfig
