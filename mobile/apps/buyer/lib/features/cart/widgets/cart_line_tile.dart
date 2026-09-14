import 'package:flutter/material.dart';
import 'package:ui_kit/app_card.dart';
import 'package:ui_kit/app_color_tokens.dart';
import 'package:ui_kit/app_quantity_stepper.dart';
import 'package:ui_kit/app_spacing.dart';
import 'package:ui_kit/app_thumbnail.dart';
import 'package:ui_kit/app_typography.dart';

import '../../../shared/price_label.dart';
import '../domain/cart_line.dart';

/// Строка корзины: миниатюра, название/вариант, цена за единицу, счётчик
/// количества и кнопка удаления. Собрана из примитивов `ui_kit`; тексты и
/// действия передаются снаружи (изменение количества/удаление — в контроллере).
class CartLineTile extends StatelessWidget {
  const CartLineTile({
    required this.line,
    required this.priceUnavailableLabel,
    required this.onIncrement,
    required this.onDecrement,
    required this.onRemove,
    super.key,
  });

  /// Отображаемая строка корзины.
  final CartLine line;

  /// Подпись при отсутствии цены (уже локализованная).
  final String priceUnavailableLabel;

  /// Увеличить количество на единицу.
  final VoidCallback onIncrement;

  /// Уменьшить количество на единицу (при 1 → удаление на стороне контроллера).
  final VoidCallback onDecrement;

  /// Удалить строку из корзины.
  final VoidCallback onRemove;

  @override
  Widget build(BuildContext context) {
    final colors = AppColorTokens.of(context);
    final variantTitle = line.variantTitle;
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              AppThumbnail(url: line.thumbnailUrl),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      line.title,
                      style: AppTypography.titleMedium,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    if (variantTitle != null) ...[
                      const SizedBox(height: AppSpacing.xs),
                      Text(
                        variantTitle,
                        style: AppTypography.caption.copyWith(
                          color: colors.inkSecondary,
                        ),
                      ),
                    ],
                    const SizedBox(height: AppSpacing.xs),
                    Text(
                      formatPriceLabel(
                        amount: line.unitPrice,
                        currencyCode: line.currencyCode,
                        unavailableLabel: priceUnavailableLabel,
                      ),
                      style: AppTypography.bodyMedium,
                    ),
                  ],
                ),
              ),
              IconButton(
                onPressed: onRemove,
                icon: const Icon(Icons.delete_outline),
                color: colors.inkSecondary,
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          Align(
            alignment: Alignment.centerRight,
            child: AppQuantityStepper(
              value: line.quantity,
              onDecrement: onDecrement,
              onIncrement: onIncrement,
            ),
          ),
        ],
      ),
    );
  }
}
