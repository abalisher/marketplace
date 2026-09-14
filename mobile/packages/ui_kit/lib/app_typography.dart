import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Типографические токены дизайн-системы — шрифт IBM Plex Sans (полная казахская
/// кириллица), шкала из макета владельца 2026-07-24. В приложениях использовать
/// эти стили (или тему), а не задавать [TextStyle] вручную.
///
/// Стили НЕ несут цвета (иначе сломается тёмная тема): основной цвет текста
/// приходит из темы (textTheme собирается в `buildAppTheme` из токенов), а
/// приглушённый/акцентный задаётся в месте применения через
/// `copyWith(color: AppColorTokens.of(context).…)`.
///
/// КОНВЕНЦИЯ: НЕ менять вес через `copyWith(fontWeight:)` — google_fonts
/// регистрирует каждый вес отдельным семейством (`IBMPlexSans_regular`,
/// `IBMPlexSans_medium`, …), поэтому copyWith оставляет файл исходного веса и
/// вес визуально не применяется. Нужен другой вес — берите готовый весовой
/// вариант ниже (`bodyLargeMedium`, `captionSemibold`, `titleMediumBold`, …)
/// или добавьте новый через `GoogleFonts.ibmPlexSans(fontWeight:)`.
///
/// Стили не `const` (шрифт тянется через google_fonts в рантайме) — это `final`.
abstract final class AppTypography {
  /// Семейство шрифта по умолчанию (для темы).
  static final String? fontFamily = GoogleFonts.ibmPlexSans().fontFamily;

  /// Все веса, используемые стилями ниже, — для явной предзагрузки вариантов
  /// шрифта в голден-тестах (google_fonts грузит файл каждого веса лениво,
  /// по первому обращению к стилю).
  static const List<FontWeight> fontWeights = [
    FontWeight.w400,
    FontWeight.w500,
    FontWeight.w600,
    FontWeight.w700,
  ];

  /// Крупный заголовок (редкие акцентные экраны).
  static final TextStyle headingLarge = GoogleFonts.ibmPlexSans(
    fontSize: 28,
    height: 34 / 28,
    fontWeight: FontWeight.w600,
  );

  /// Заголовок экрана (22/28 · 600).
  static final TextStyle headingMedium = GoogleFonts.ibmPlexSans(
    fontSize: 22,
    height: 28 / 22,
    fontWeight: FontWeight.w600,
  );

  /// Заголовок блока/карточки (17/24 · 600).
  static final TextStyle titleMedium = GoogleFonts.ibmPlexSans(
    fontSize: 17,
    height: 24 / 17,
    fontWeight: FontWeight.w600,
  );

  /// Жирный вариант [titleMedium] (17/24 · 700) — литеры-логотипы («СМ», «K»).
  static final TextStyle titleMediumBold = GoogleFonts.ibmPlexSans(
    fontSize: 17,
    height: 24 / 17,
    fontWeight: FontWeight.w700,
  );

  /// Текст диалога и длинные ответы (15/22 · 400).
  static final TextStyle bodyLarge = GoogleFonts.ibmPlexSans(
    fontSize: 15,
    height: 22 / 15,
    fontWeight: FontWeight.w400,
  );

  /// Средний вариант [bodyLarge] (15/22 · 500) — заголовки строк списков,
  /// текст чипов-подсказок.
  static final TextStyle bodyLargeMedium = GoogleFonts.ibmPlexSans(
    fontSize: 15,
    height: 22 / 15,
    fontWeight: FontWeight.w500,
  );

  /// Полужирный вариант [bodyLarge] (15/22 · 600) — акцентные строки-действия.
  static final TextStyle bodyLargeSemibold = GoogleFonts.ibmPlexSans(
    fontSize: 15,
    height: 22 / 15,
    fontWeight: FontWeight.w600,
  );

  /// Вторичный текст (13/18 · 400).
  static final TextStyle bodyMedium = GoogleFonts.ibmPlexSans(
    fontSize: 13,
    height: 18 / 13,
    fontWeight: FontWeight.w400,
  );

  /// Полужирный вариант [bodyMedium] (13/18 · 600) — компактные метки-кнопки
  /// (чип переключателя языка).
  static final TextStyle bodyMediumSemibold = GoogleFonts.ibmPlexSans(
    fontSize: 13,
    height: 18 / 13,
    fontWeight: FontWeight.w600,
  );

  /// Подписи/вспомогательные пометки (13/18 · 400) — по макету приглушённые:
  /// в месте применения задавать `color: tokens.inkSecondary`.
  static final TextStyle caption = GoogleFonts.ibmPlexSans(
    fontSize: 13,
    height: 18 / 13,
    fontWeight: FontWeight.w400,
  );

  /// Полужирный вариант [caption] (13/18 · 600) — метки статусов (бейджи,
  /// активный этап заказа).
  static final TextStyle captionSemibold = GoogleFonts.ibmPlexSans(
    fontSize: 13,
    height: 18 / 13,
    fontWeight: FontWeight.w600,
  );

  /// Метка/overline (11/16 · 600, капсом — регистр задаётся в месте применения);
  /// по макету приглушённая: `color: tokens.inkSecondary` в месте применения.
  static final TextStyle overline = GoogleFonts.ibmPlexSans(
    fontSize: 11,
    height: 16 / 11,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.5,
  );

  /// Обычный вариант [overline] (11/16 · 400, без разрядки) — тихие подписи
  /// мелким кеглем (подзаголовок бренда в шапке).
  static final TextStyle overlineRegular = GoogleFonts.ibmPlexSans(
    fontSize: 11,
    height: 16 / 11,
    fontWeight: FontWeight.w400,
  );

  /// Цены — 15/20 · 600, моноширинные цифры (tabular) для ровных колонок.
  static final TextStyle price = GoogleFonts.ibmPlexSans(
    fontSize: 15,
    height: 20 / 15,
    fontWeight: FontWeight.w600,
    fontFeatures: const [FontFeature.tabularFigures()],
  );

  /// Текст кнопок (15/20 · 600).
  static final TextStyle button = GoogleFonts.ibmPlexSans(
    fontSize: 15,
    height: 20 / 15,
    fontWeight: FontWeight.w600,
  );
}
