import 'package:flutter/material.dart';

import 'app_color_tokens.dart';
import 'app_spacing.dart';
import 'app_typography.dart';

/// Состояние ошибки дизайн-системы: иконка, сообщение и опциональная кнопка
/// повтора. Тексты передаются снаружи (локализуются в приложении).
class AppErrorView extends StatelessWidget {
  const AppErrorView({
    required this.message,
    this.onRetry,
    this.retryLabel,
    super.key,
  });

  /// Сообщение об ошибке (уже локализованное).
  final String message;

  /// Обработчик повтора; если null — кнопка не показывается.
  final VoidCallback? onRetry;

  /// Подпись кнопки повтора (уже локализованная).
  final String? retryLabel;

  @override
  Widget build(BuildContext context) {
    final colors = AppColorTokens.of(context);
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.error_outline, color: colors.error, size: 48),
            const SizedBox(height: AppSpacing.md),
            Text(
              message,
              textAlign: TextAlign.center,
              style: AppTypography.bodyMedium,
            ),
            if (onRetry != null) ...[
              const SizedBox(height: AppSpacing.lg),
              ElevatedButton(onPressed: onRetry, child: Text(retryLabel ?? '')),
            ],
          ],
        ),
      ),
    );
  }
}
