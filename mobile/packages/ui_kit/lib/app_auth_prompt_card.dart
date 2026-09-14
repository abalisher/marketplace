import 'package:flutter/material.dart';

import 'app_color_tokens.dart';
import 'app_primary_button.dart';
import 'app_radius.dart';
import 'app_spacing.dart';
import 'app_typography.dart';

/// Карточка «войдите, чтобы оформить» в ленте чата (T10.8). Появляется, когда
/// покупатель дошёл до оформления гостем: подбор и корзина работают без входа,
/// а заказ, оплата и документы принадлежат учётной записи.
///
/// Единственная вставка ленты с действием: вход живёт на отдельном экране, и
/// репликой в чат его не сделать (остальные вставки остаются read-only).
class AppAuthPromptCard extends StatelessWidget {
  const AppAuthPromptCard({
    required this.title,
    required this.description,
    required this.actionLabel,
    this.onAction,
    super.key,
  });

  /// Заголовок: «Войдите, чтобы оформить заказ».
  final String title;

  /// Пояснение: что вход по номеру и что корзина сохранится.
  final String description;

  /// Подпись кнопки: «Войти по номеру».
  final String actionLabel;

  /// Переход на экран входа. null — кнопка неактивна.
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    final colors = AppColorTokens.of(context);
    return Container(
      margin: const EdgeInsets.symmetric(vertical: AppSpacing.xs),
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: BorderRadius.circular(AppRadius.card),
        border: Border.all(color: colors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(
                Icons.lock_outline,
                size: AppSpacing.lg,
                color: colors.inkSecondary,
              ),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: Text(
                  title,
                  style: AppTypography.titleMedium.copyWith(color: colors.ink),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.xs),
          Text(
            description,
            style: AppTypography.bodyMedium.copyWith(
              color: colors.inkSecondary,
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          AppPrimaryButton(
            label: actionLabel,
            icon: Icons.phone_iphone,
            onPressed: onAction,
          ),
        ],
      ),
    );
  }
}
