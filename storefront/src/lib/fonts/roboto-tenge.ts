import localFont from "next/font/local"

/**
 * Знак тенге (₸) для Roboto. В самом Roboto этого символа НЕТ — без своей
 * гарнитуры браузер рисует ₸ шрифтом системы, и в ценах (а это главный текст
 * витрины: «312 000 ₸») он выпадал из строки: другой наклон, другая толщина,
 * на каждой платформе свой.
 *
 * Файл — вырезка ровно из одного глифа Roboto Flex (тот же рисунок, что и
 * Roboto, но ₸ в нём есть): 1 КБ, ось веса сохранена, поэтому в жирной строке
 * знак тоже жирный. Стоит в стеке `font-sans` сразу за основным Roboto —
 * браузер подставляет его по недостающему символу и только по нему.
 *
 * Как пересобрать (нужен fonttools):
 *   fonttools varLib.instancer RobotoFlex.ttf <все оси кроме wght по умолчанию>
 *   python -m fontTools.subset RobotoFlex-wght.ttf --unicodes=U+20B8 \
 *     --flavor=woff2 --layout-features='' --name-IDs='' --no-hinting
 */
export const robotoTenge = localFont({
  src: "../../fonts/Roboto-Tenge.woff2",
  weight: "100 900",
  style: "normal",
  variable: "--font-roboto-tenge",
  display: "swap",
  adjustFontFallback: false,
})
