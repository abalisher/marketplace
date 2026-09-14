import 'package:flutter/material.dart';

import 'app_color_tokens.dart';
import 'app_radius.dart';
import 'app_typography.dart';

/// Собирает [ThemeData] приложения (Material 3) из токенов дизайн-системы —
/// светлую или тёмную по [brightness]. Все приложения marketplace используют
/// эту тему, а не задают стили локально:
///
/// ```dart
/// MaterialApp(
///   theme: buildAppTheme(),
///   darkTheme: buildAppTheme(brightness: Brightness.dark),
///   // themeMode по умолчанию system — переключение за ОС
/// )
/// ```
///
/// Компоненты читают цвета через `AppColorTokens.of(context)` — токены
/// прописаны в тему как [ThemeExtension].
ThemeData buildAppTheme({Brightness brightness = Brightness.light}) {
  final tokens = brightness == Brightness.dark
      ? AppColorTokens.dark
      : AppColorTokens.light;

  final colorScheme =
      ColorScheme.fromSeed(
        seedColor: tokens.accent,
        brightness: brightness,
      ).copyWith(
        primary: tokens.accent,
        onPrimary: tokens.onAccent,
        primaryContainer: tokens.accentContainer,
        error: tokens.error,
        surface: tokens.surface,
        onSurface: tokens.ink,
        onSurfaceVariant: tokens.inkSecondary,
        outline: tokens.border,
        scrim: tokens.scrim,
      );

  return ThemeData(
    useMaterial3: true,
    colorScheme: colorScheme,
    extensions: [tokens],
    scaffoldBackgroundColor: tokens.surfaceDim,
    fontFamily: AppTypography.fontFamily,
    textTheme: TextTheme(
      headlineLarge: AppTypography.headingLarge.copyWith(color: tokens.ink),
      headlineMedium: AppTypography.headingMedium.copyWith(color: tokens.ink),
      titleMedium: AppTypography.titleMedium.copyWith(color: tokens.ink),
      bodyLarge: AppTypography.bodyLarge.copyWith(color: tokens.ink),
      bodyMedium: AppTypography.bodyMedium.copyWith(color: tokens.ink),
      labelSmall: AppTypography.overline.copyWith(color: tokens.inkSecondary),
      bodySmall: AppTypography.caption.copyWith(color: tokens.inkSecondary),
      // labelLarge задаём явно: дефолт Material — w500 поверх fontFamily
      // regular-веса, а google_fonts вес через fontWeight не переключает
      // (см. конвенцию в AppTypography) — текст кнопок рендерился бы w400.
      labelLarge: AppTypography.button.copyWith(color: tokens.ink),
    ),
    appBarTheme: AppBarTheme(
      backgroundColor: tokens.surface,
      foregroundColor: tokens.ink,
      surfaceTintColor: Colors.transparent,
      elevation: 0,
      scrolledUnderElevation: 1,
      titleTextStyle: AppTypography.titleMedium.copyWith(color: tokens.ink),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style:
          ElevatedButton.styleFrom(
            foregroundColor: tokens.onAccent,
            disabledForegroundColor: tokens.inkSecondary,
            textStyle: AppTypography.button,
            minimumSize: const Size.fromHeight(48),
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppRadius.card),
            ),
          ).copyWith(
            // Заливка с состояниями: нажатие — accentPressed из токенов.
            backgroundColor: WidgetStateProperty.resolveWith((states) {
              if (states.contains(WidgetState.disabled)) return tokens.border;
              if (states.contains(WidgetState.pressed)) {
                return tokens.accentPressed;
              }
              return tokens.accent;
            }),
          ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: tokens.surface,
      hintStyle: AppTypography.bodyLarge.copyWith(color: tokens.inkSecondary),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppRadius.field),
        borderSide: BorderSide(color: tokens.border),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppRadius.field),
        borderSide: BorderSide(color: tokens.border),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppRadius.field),
        borderSide: BorderSide(color: tokens.accent, width: 1.5),
      ),
    ),
    progressIndicatorTheme: ProgressIndicatorThemeData(color: tokens.accent),
    dividerTheme: DividerThemeData(color: tokens.border, thickness: 1),
    // Диалоги подтверждения, меню строк и тосты — на токенах, а не на
    // производных ColorScheme от seed (иначе в тёмной теме уезжает подложка).
    dialogTheme: DialogThemeData(
      backgroundColor: tokens.surface,
      surfaceTintColor: Colors.transparent,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppRadius.bubble),
      ),
      titleTextStyle: AppTypography.titleMedium.copyWith(color: tokens.ink),
      contentTextStyle: AppTypography.bodyMedium.copyWith(
        color: tokens.inkSecondary,
      ),
    ),
    popupMenuTheme: PopupMenuThemeData(
      color: tokens.surface,
      surfaceTintColor: Colors.transparent,
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppRadius.card),
        side: BorderSide(color: tokens.border),
      ),
      textStyle: AppTypography.bodyMedium.copyWith(color: tokens.ink),
    ),
    snackBarTheme: SnackBarThemeData(
      backgroundColor: tokens.ink,
      contentTextStyle: AppTypography.bodyMedium.copyWith(
        color: tokens.surface,
      ),
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppRadius.chip),
      ),
    ),
  );
}
