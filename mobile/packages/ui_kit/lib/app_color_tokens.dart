import 'package:flutter/material.dart';

import 'app_colors.dart';

/// Семантические цветовые токены как [ThemeExtension] — единая точка чтения
/// цветов в компонентах и экранах: `AppColorTokens.of(context)`. Значения
/// светлой/тёмной палитры — [AppColorTokens.light] / [AppColorTokens.dark]
/// (исходники — [AppColors] / [AppColorsDark], из макета владельца).
///
/// Компоненты НЕ читают статику [AppColors] напрямую — только токены из
/// контекста, иначе тёмная тема не подхватится.
class AppColorTokens extends ThemeExtension<AppColorTokens> {
  const AppColorTokens({
    required this.ink,
    required this.inkSecondary,
    required this.border,
    required this.accent,
    required this.accentPressed,
    required this.accentContainer,
    required this.onAccent,
    required this.success,
    required this.warning,
    required this.error,
    required this.kaspi,
    required this.surfaceDim,
    required this.surface,
    required this.scrim,
  });

  /// Основной текст/иконки.
  final Color ink;

  /// Вторичный (приглушённый) текст.
  final Color inkSecondary;

  /// Обводки и делители.
  final Color border;

  /// Акцент — действия, статусы, ссылки.
  final Color accent;

  /// Нажатое состояние акцента.
  final Color accentPressed;

  /// Контейнер акцента — чипы, плашки, подложки статусов.
  final Color accentContainer;

  /// Контент (текст/иконки) на акцентной заливке.
  final Color onAccent;

  /// Успех — оплачено, в наличии.
  final Color success;

  /// Предупреждение — ожидание, под заказ.
  final Color warning;

  /// Ошибка — сбои, отмена, деструктив.
  final Color error;

  /// Брендинг оплаты Kaspi (только платёжный блок).
  final Color kaspi;

  /// Фон экрана.
  final Color surfaceDim;

  /// Поверхности — карточки, пузыри, поля, шапки.
  final Color surface;

  /// Скрим модальных/боковых панелей.
  final Color scrim;

  /// Светлая палитра (макет, спека токенов «свет»).
  static const AppColorTokens light = AppColorTokens(
    ink: AppColors.ink,
    inkSecondary: AppColors.inkSecondary,
    border: AppColors.border,
    accent: AppColors.accent,
    accentPressed: AppColors.accentPressed,
    accentContainer: AppColors.accentContainer,
    onAccent: AppColors.onPrimary,
    success: AppColors.success,
    warning: AppColors.warning,
    error: AppColors.error,
    kaspi: AppColors.kaspi,
    surfaceDim: AppColors.surfaceDim,
    surface: AppColors.surface,
    scrim: AppColors.scrim,
  );

  /// Тёмная палитра (макет, спека токенов «тьма»).
  static const AppColorTokens dark = AppColorTokens(
    ink: AppColorsDark.ink,
    inkSecondary: AppColorsDark.inkSecondary,
    border: AppColorsDark.border,
    accent: AppColorsDark.accent,
    accentPressed: AppColorsDark.accentPressed,
    accentContainer: AppColorsDark.accentContainer,
    onAccent: AppColorsDark.onAccent,
    success: AppColorsDark.success,
    warning: AppColorsDark.warning,
    error: AppColorsDark.error,
    kaspi: AppColorsDark.kaspi,
    surfaceDim: AppColorsDark.surfaceDim,
    surface: AppColorsDark.surface,
    scrim: AppColorsDark.scrim,
  );

  /// Токены текущей темы. Вне темы дизайн-системы (например, «голый»
  /// MaterialApp в тестах) — светлая палитра.
  static AppColorTokens of(BuildContext context) =>
      Theme.of(context).extension<AppColorTokens>() ?? light;

  @override
  AppColorTokens copyWith({
    Color? ink,
    Color? inkSecondary,
    Color? border,
    Color? accent,
    Color? accentPressed,
    Color? accentContainer,
    Color? onAccent,
    Color? success,
    Color? warning,
    Color? error,
    Color? kaspi,
    Color? surfaceDim,
    Color? surface,
    Color? scrim,
  }) {
    return AppColorTokens(
      ink: ink ?? this.ink,
      inkSecondary: inkSecondary ?? this.inkSecondary,
      border: border ?? this.border,
      accent: accent ?? this.accent,
      accentPressed: accentPressed ?? this.accentPressed,
      accentContainer: accentContainer ?? this.accentContainer,
      onAccent: onAccent ?? this.onAccent,
      success: success ?? this.success,
      warning: warning ?? this.warning,
      error: error ?? this.error,
      kaspi: kaspi ?? this.kaspi,
      surfaceDim: surfaceDim ?? this.surfaceDim,
      surface: surface ?? this.surface,
      scrim: scrim ?? this.scrim,
    );
  }

  // Сравнение по значениям: AnimatedTheme лерпит extensions в новые
  // экземпляры — без == палитры «одинаковые, но не равны».
  @override
  bool operator ==(Object other) {
    return other is AppColorTokens &&
        other.ink == ink &&
        other.inkSecondary == inkSecondary &&
        other.border == border &&
        other.accent == accent &&
        other.accentPressed == accentPressed &&
        other.accentContainer == accentContainer &&
        other.onAccent == onAccent &&
        other.success == success &&
        other.warning == warning &&
        other.error == error &&
        other.kaspi == kaspi &&
        other.surfaceDim == surfaceDim &&
        other.surface == surface &&
        other.scrim == scrim;
  }

  @override
  int get hashCode => Object.hashAll([
    ink,
    inkSecondary,
    border,
    accent,
    accentPressed,
    accentContainer,
    onAccent,
    success,
    warning,
    error,
    kaspi,
    surfaceDim,
    surface,
    scrim,
  ]);

  @override
  AppColorTokens lerp(ThemeExtension<AppColorTokens>? other, double t) {
    if (other is! AppColorTokens) return this;
    return AppColorTokens(
      ink: Color.lerp(ink, other.ink, t)!,
      inkSecondary: Color.lerp(inkSecondary, other.inkSecondary, t)!,
      border: Color.lerp(border, other.border, t)!,
      accent: Color.lerp(accent, other.accent, t)!,
      accentPressed: Color.lerp(accentPressed, other.accentPressed, t)!,
      accentContainer: Color.lerp(accentContainer, other.accentContainer, t)!,
      onAccent: Color.lerp(onAccent, other.onAccent, t)!,
      success: Color.lerp(success, other.success, t)!,
      warning: Color.lerp(warning, other.warning, t)!,
      error: Color.lerp(error, other.error, t)!,
      kaspi: Color.lerp(kaspi, other.kaspi, t)!,
      surfaceDim: Color.lerp(surfaceDim, other.surfaceDim, t)!,
      surface: Color.lerp(surface, other.surface, t)!,
      scrim: Color.lerp(scrim, other.scrim, t)!,
    );
  }
}
