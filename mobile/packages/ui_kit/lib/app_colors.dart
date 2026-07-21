import 'package:flutter/material.dart';

/// Цветовые токены дизайн-системы. Значения провизорные — уточняются после
/// дизайн-хэндоффа. В приложениях НЕ использовать сырые [Color]: только токены.
abstract final class AppColors {
  /// Основной (брендовый) цвет.
  static const Color primary = Color(0xFF2563EB);

  /// Затемнённый вариант основного (нажатия, акценты).
  static const Color primaryDark = Color(0xFF1D4ED8);

  /// Контент на основном цвете.
  static const Color onPrimary = Color(0xFFFFFFFF);

  /// Поверхности (карточки, поля, шапки).
  static const Color surface = Color(0xFFFFFFFF);

  /// Фон экранов.
  static const Color background = Color(0xFFF7F8FA);

  /// Основной текст/иконки на поверхности.
  static const Color onSurface = Color(0xFF111827);

  /// Второстепенный (приглушённый) текст.
  static const Color onSurfaceMuted = Color(0xFF6B7280);

  /// Границы и разделители.
  static const Color border = Color(0xFFE5E7EB);

  /// Ошибка / деструктивное действие.
  static const Color error = Color(0xFFDC2626);

  /// Успех.
  static const Color success = Color(0xFF16A34A);

  /// Предупреждение / бонусы.
  static const Color warning = Color(0xFFF59E0B);
}
