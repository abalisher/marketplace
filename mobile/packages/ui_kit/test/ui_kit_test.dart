import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:ui_kit/app_colors.dart';
import 'package:ui_kit/app_theme.dart';

void main() {
  test('buildAppTheme использует Material 3 и брендовые токены', () {
    final theme = buildAppTheme();

    expect(theme.useMaterial3, isTrue);
    expect(theme.colorScheme.primary, AppColors.primary);
    expect(theme.colorScheme.brightness, Brightness.light);
    expect(theme.scaffoldBackgroundColor, AppColors.background);
  });

  test('тема настраивает ElevatedButton из токенов', () {
    final theme = buildAppTheme();

    expect(theme.elevatedButtonTheme.style, isNotNull);
  });
}
