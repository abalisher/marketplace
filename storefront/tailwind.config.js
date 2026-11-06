const path = require("path")

module.exports = {
  darkMode: "class",
  presets: [require("@medusajs/ui-preset")],
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/modules/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@medusajs/ui/dist/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      transitionProperty: {
        width: "width margin",
        height: "height",
        bg: "background-color",
        display: "display opacity",
        visibility: "visibility",
        padding: "padding-top padding-right padding-bottom padding-left",
      },
      // Токены бренда «СтройМаркет» (зеркало ui_kit). Значения — CSS-переменные
      // из src/styles/tokens.css, каналами: работают модификаторы прозрачности
      // (bg-accent/10) и обе темы. Палитра стартера (grey) снята — цвета только
      // из дизайн-системы.
      colors: {
        ink: {
          DEFAULT: "rgb(var(--sm-ink) / <alpha-value>)",
          secondary: "rgb(var(--sm-ink-secondary) / <alpha-value>)",
        },
        // `line` — токен `border` дизайн-системы (обводки и делители);
        // имя не `border`, чтобы не путать с утилитой толщины рамки.
        line: "rgb(var(--sm-border) / <alpha-value>)",
        accent: {
          DEFAULT: "rgb(var(--sm-accent) / <alpha-value>)",
          pressed: "rgb(var(--sm-accent-pressed) / <alpha-value>)",
          container: "rgb(var(--sm-accent-container) / <alpha-value>)",
        },
        "on-accent": "rgb(var(--sm-on-accent) / <alpha-value>)",
        success: "rgb(var(--sm-success) / <alpha-value>)",
        warning: "rgb(var(--sm-warning) / <alpha-value>)",
        error: "rgb(var(--sm-error) / <alpha-value>)",
        info: "rgb(var(--sm-info) / <alpha-value>)",
        kaspi: "rgb(var(--sm-kaspi) / <alpha-value>)",
        "on-kaspi": "rgb(var(--sm-on-kaspi) / <alpha-value>)",
        surface: {
          DEFAULT: "rgb(var(--sm-surface) / <alpha-value>)",
          dim: "rgb(var(--sm-surface-dim) / <alpha-value>)",
        },
        scrim: "rgb(var(--sm-scrim) / <alpha-value>)",
      },
      // Скругления дизайн-системы (chip/card/bubble/field) + значения стартера,
      // на которых ещё держатся непереведённые экраны.
      borderRadius: {
        none: "0px",
        soft: "2px",
        base: "4px",
        rounded: "8px",
        large: "16px",
        circle: "9999px",
        chip: "8px",
        card: "14px",
        bubble: "16px",
        field: "25px",
        // Композер чата по эталону Gemini (бриф T10.1a раздел 5).
        composer: "28px",
      },
      maxWidth: {
        "8xl": "100rem",
      },
      screens: {
        "2xsmall": "320px",
        xsmall: "512px",
        small: "1024px",
        medium: "1280px",
        large: "1440px",
        xlarge: "1680px",
        "2xlarge": "1920px",
      },
      // Типошкала дизайн-системы (макет 2026-07-24, зеркало AppTypography
      // ui_kit) — рядом с дефолтной шкалой Tailwind, на которой ещё держатся
      // непереведённые экраны стартера.
      fontSize: {
        "3xl": "2rem",
        "heading-large": ["28px", { lineHeight: "34px", fontWeight: "600" }],
        "heading-medium": ["22px", { lineHeight: "28px", fontWeight: "600" }],
        "title-medium": ["17px", { lineHeight: "24px", fontWeight: "600" }],
        "body-large": ["15px", { lineHeight: "22px", fontWeight: "400" }],
        "body-medium": ["13px", { lineHeight: "18px", fontWeight: "400" }],
        overline: [
          "11px",
          { lineHeight: "16px", fontWeight: "600", letterSpacing: "0.5px" },
        ],
        price: ["15px", { lineHeight: "20px", fontWeight: "600" }],
        button: ["15px", { lineHeight: "20px", fontWeight: "600" }],
        // Разговорный экран покупателя: размеры сняты с эталона Gemini
        // (решение владельца 2026-09-14 — «вид и особенно шрифт как у
        // Gemini»). Общая шкала витрины мельче на шаг, и в чате это читалось
        // как «мелкий текст в крупной оболочке»: реплики 15px против 16px
        // эталона, приветствие жирным 28px против обычного веса 40px.
        "assistant-greeting": [
          "28px",
          { lineHeight: "36px", fontWeight: "400" },
        ],
        "assistant-greeting-large": [
          "32px",
          { lineHeight: "40px", fontWeight: "400" },
        ],
        // Строки рельса истории на десктопе — кегль и шаг эталона (замер по
        // живым скриншотам 2026-09-14: пункты Gemini 14px с шагом ~32–36px,
        // наши были 15px с шагом 44px — «шрифт конского размера»).
        rail: ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "assistant-body": ["16px", { lineHeight: "26px", fontWeight: "400" }],
        "assistant-chip": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "assistant-caption": [
          "12px",
          { lineHeight: "16px", fontWeight: "400" },
        ],
      },
      fontFamily: {
        sans: [
          "var(--font-roboto)",
          // Знак тенге: в Roboto его нет, поэтому сразу за ним стоит вырезка
          // ровно с этим символом (src/lib/fonts/roboto-tenge.ts).
          "var(--font-roboto-tenge)",
          "Roboto",
          "system-ui",
          "Segoe UI",
          "sans-serif",
        ],
      },
      keyframes: {
        ring: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "fade-in-right": {
          "0%": {
            opacity: "0",
            transform: "translateX(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        "fade-in-top": {
          "0%": {
            opacity: "0",
            transform: "translateY(-10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "fade-out-top": {
          "0%": {
            height: "100%",
          },
          "99%": {
            height: "0",
          },
          "100%": {
            visibility: "hidden",
          },
        },
        "accordion-slide-up": {
          "0%": {
            height: "var(--radix-accordion-content-height)",
            opacity: "1",
          },
          "100%": {
            height: "0",
            opacity: "0",
          },
        },
        "accordion-slide-down": {
          "0%": {
            "min-height": "0",
            "max-height": "0",
            opacity: "0",
          },
          "100%": {
            "min-height": "var(--radix-accordion-content-height)",
            "max-height": "none",
            opacity: "1",
          },
        },
        enter: {
          "0%": { transform: "scale(0.9)", opacity: 0 },
          "100%": { transform: "scale(1)", opacity: 1 },
        },
        leave: {
          "0%": { transform: "scale(1)", opacity: 1 },
          "100%": { transform: "scale(0.9)", opacity: 0 },
        },
        "slide-in": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(0)" },
        },
        // Индикатор «печатает…» ассистента: три точки каскадом (зеркало
        // AppTypingBubble из ui_kit).
        "typing-dot": {
          "0%, 60%, 100%": { opacity: "0.25", transform: "translateY(0)" },
          "30%": { opacity: "1", transform: "translateY(-2px)" },
        },
        // Мягкое появление блока (мобильное меню, ответ FAQ, плавающая
        // кнопка лендинга).
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        ring: "ring 2.2s cubic-bezier(0.5, 0, 0.5, 1) infinite",
        "fade-in-right":
          "fade-in-right 0.3s cubic-bezier(0.5, 0, 0.5, 1) forwards",
        "fade-in-top": "fade-in-top 0.2s cubic-bezier(0.5, 0, 0.5, 1) forwards",
        "fade-out-top":
          "fade-out-top 0.2s cubic-bezier(0.5, 0, 0.5, 1) forwards",
        "accordion-open":
          "accordion-slide-down 300ms cubic-bezier(0.87, 0, 0.13, 1) forwards",
        "accordion-close":
          "accordion-slide-up 300ms cubic-bezier(0.87, 0, 0.13, 1) forwards",
        enter: "enter 200ms ease-out",
        "slide-in": "slide-in 1.2s cubic-bezier(.41,.73,.51,1.02)",
        leave: "leave 150ms ease-in forwards",
        "typing-dot": "typing-dot 1.2s ease-in-out infinite",
        "fade-in": "fade-in 200ms ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-radix")()],
}
