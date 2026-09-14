import 'package:flutter/material.dart';

/// Цветовые токены дизайн-системы (светлая тема) — значения из макета владельца
/// 2026-07-24 (Claude design, общий пакет для приложений покупателя и водителя).
/// В приложениях НЕ использовать сырые [Color]: только токены.
///
/// Семантические имена (ink/accent/surface/…) — основной язык дизайна; исходные
/// имена ядра (primary/onSurface/…) сохранены как алиасы, чтобы не ломать уже
/// написанные экраны. Тёмные значения — в [AppColorsDark] (проводка тёмной темы —
/// отдельным срезом; палитра уже задизайнена).
abstract final class AppColors {
  // --- Семантические токены (макет) ---
  /// Основной текст/иконки.
  static const Color ink = Color(0xFF1B2128);

  /// Вторичный (приглушённый) текст.
  static const Color inkSecondary = Color(0xFF5C6672);

  /// Обводки и делители.
  static const Color border = Color(0xFFE1E5EA);

  /// Акцент — действия, статусы, ссылки.
  static const Color accent = Color(0xFF2563C4);

  /// Нажатый/тёмный акцент.
  static const Color accentPressed = Color(0xFF2058B4);

  /// Контейнер акцента — чипы, плашки, подложки статусов.
  static const Color accentContainer = Color(0xFFE8EFFB);

  /// Успех — оплачено, в наличии.
  static const Color success = Color(0xFF1E8A4C);

  /// Предупреждение — ожидание, под заказ.
  static const Color warning = Color(0xFFA66A0C);

  /// Ошибка — сбои, отмена, деструктив.
  static const Color error = Color(0xFFC0362C);

  /// Брендинг оплаты Kaspi (только для платёжного блока).
  static const Color kaspi = Color(0xFFF14635);

  /// Фон экрана.
  static const Color surfaceDim = Color(0xFFF6F7F8);

  /// Поверхности — карточки, пузыри, поля, шапки.
  static const Color surface = Color(0xFFFFFFFF);

  /// Скрим модальных/боковых панелей (50%).
  static const Color scrim = Color(0x80090C10);

  // --- Алиасы под уже написанные экраны (старые имена токенов) ---
  /// Алиас [accent].
  static const Color primary = accent;

  /// Алиас [accentPressed].
  static const Color primaryDark = accentPressed;

  /// Контент на акценте.
  static const Color onPrimary = Color(0xFFFFFFFF);

  /// Алиас [surfaceDim] (фон экранов).
  static const Color background = surfaceDim;

  /// Алиас [ink].
  static const Color onSurface = ink;

  /// Алиас [inkSecondary].
  static const Color onSurfaceMuted = inkSecondary;
}

/// Тёмная палитра дизайн-системы (значения из макета, спека токенов
/// «свет / тьма» в standalone-HTML «Ассистент»). Экраны читают её не напрямую,
/// а через `AppColorTokens.of(context)` (см. `app_color_tokens.dart`).
abstract final class AppColorsDark {
  static const Color ink = Color(0xFFE9EDF1);
  static const Color inkSecondary = Color(0xFF97A1AD);
  static const Color border = Color(0xFF323A44);
  static const Color accent = Color(0xFF82B1F7);

  /// Производный (нажатое состояние в тёмной спеке макета не задано):
  /// акцент, притемнённый на шаг — фидбек нажатия на светлой заливке.
  static const Color accentPressed = Color(0xFF6FA3F0);

  static const Color accentContainer = Color(0xFF223349);

  /// Контент на акценте: в тёмном макете иконки на заливке #82B1F7 —
  /// цветом фона экрана (галочки степпера в «Курьере»).
  static const Color onAccent = Color(0xFF15181C);

  static const Color success = Color(0xFF57C289);
  static const Color warning = Color(0xFFE0A64E);
  static const Color error = Color(0xFFEF7A70);
  static const Color kaspi = Color(0xFFF14635);
  static const Color surfaceDim = Color(0xFF15181C);
  static const Color surface = Color(0xFF1E232A);

  /// Скрим единый со светлой темой (глухая тень поверх любого фона).
  static const Color scrim = AppColors.scrim;
}
