import 'package:flutter/material.dart';

import 'app_colors.dart';

/// Типографические токены дизайн-системы. В приложениях использовать эти стили
/// (или тему), а не задавать [TextStyle] вручную.
abstract final class AppTypography {
  /// Семейство шрифта по умолчанию.
  static const String fontFamily = 'Roboto';

  /// Крупный заголовок экрана.
  static const TextStyle headingLarge = TextStyle(
    fontSize: 28,
    height: 1.2,
    fontWeight: FontWeight.w700,
    color: AppColors.onSurface,
  );

  /// Средний заголовок раздела.
  static const TextStyle headingMedium = TextStyle(
    fontSize: 22,
    height: 1.25,
    fontWeight: FontWeight.w600,
    color: AppColors.onSurface,
  );

  /// Заголовок карточки/строки.
  static const TextStyle titleMedium = TextStyle(
    fontSize: 16,
    height: 1.3,
    fontWeight: FontWeight.w600,
    color: AppColors.onSurface,
  );

  /// Основной текст.
  static const TextStyle bodyLarge = TextStyle(
    fontSize: 16,
    height: 1.4,
    fontWeight: FontWeight.w400,
    color: AppColors.onSurface,
  );

  /// Второстепенный текст.
  static const TextStyle bodyMedium = TextStyle(
    fontSize: 14,
    height: 1.4,
    fontWeight: FontWeight.w400,
    color: AppColors.onSurface,
  );

  /// Подписи, вспомогательные пометки.
  static const TextStyle caption = TextStyle(
    fontSize: 12,
    height: 1.35,
    fontWeight: FontWeight.w400,
    color: AppColors.onSurfaceMuted,
  );

  /// Текст кнопок.
  static const TextStyle button = TextStyle(
    fontSize: 15,
    height: 1.2,
    fontWeight: FontWeight.w600,
  );
}
