import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:ui_kit/app_color_tokens.dart';
import 'package:ui_kit/app_colors.dart';
import 'package:ui_kit/app_theme.dart';

void main() {
  // testWidgets (а не голый test): тема тянет шрифт через google_fonts, а в
  // тест-окружении его загрузка асинхронна — биндинг testWidgets гасит это
  // штатно. Проверяем токены темы (цвета/скругления от шрифта не зависят).
  testWidgets('buildAppTheme использует Material 3 и брендовые токены', (
    tester,
  ) async {
    final theme = buildAppTheme();

    expect(theme.useMaterial3, isTrue);
    expect(theme.colorScheme.primary, AppColors.primary);
    expect(theme.colorScheme.brightness, Brightness.light);
    expect(theme.scaffoldBackgroundColor, AppColors.background);
    expect(theme.extension<AppColorTokens>(), AppColorTokens.light);
  });

  testWidgets('buildAppTheme(dark) собирает тёмную тему из тёмной палитры', (
    tester,
  ) async {
    final theme = buildAppTheme(brightness: Brightness.dark);

    expect(theme.colorScheme.brightness, Brightness.dark);
    expect(theme.colorScheme.primary, AppColorsDark.accent);
    expect(theme.colorScheme.surface, AppColorsDark.surface);
    expect(theme.colorScheme.onSurface, AppColorsDark.ink);
    expect(theme.scaffoldBackgroundColor, AppColorsDark.surfaceDim);
    expect(theme.extension<AppColorTokens>(), AppColorTokens.dark);
  });

  testWidgets('тема настраивает ElevatedButton из токенов', (tester) async {
    final theme = buildAppTheme();

    expect(theme.elevatedButtonTheme.style, isNotNull);
  });

  testWidgets('AppColorTokens.of отдаёт токены тёмной темы', (tester) async {
    late AppColorTokens tokens;

    await tester.pumpWidget(
      MaterialApp(
        theme: buildAppTheme(brightness: Brightness.dark),
        home: Builder(
          builder: (context) {
            tokens = AppColorTokens.of(context);
            return const SizedBox.shrink();
          },
        ),
      ),
    );

    expect(tokens, AppColorTokens.dark);
  });

  testWidgets('AppColorTokens.of вне темы дизайн-системы отдаёт светлые', (
    tester,
  ) async {
    late AppColorTokens tokens;

    await tester.pumpWidget(
      MaterialApp(
        home: Builder(
          builder: (context) {
            tokens = AppColorTokens.of(context);
            return const SizedBox.shrink();
          },
        ),
      ),
    );

    expect(tokens, AppColorTokens.light);
  });
}
