import 'package:flutter/material.dart';
import 'package:ui_kit/app_card.dart';
import 'package:ui_kit/app_color_tokens.dart';
import 'package:ui_kit/app_spacing.dart';
import 'package:ui_kit/app_typography.dart';

import '../../../l10n/messages.dart';
import '../../../shared/price_label.dart';
import '../domain/estimate_item.dart';
import '../domain/estimate_option.dart';

/// Карточка позиции расчёта: вид материала, требуемое количество и подобранные
/// товары по сегментам (цена за единицу, итог, наличие). Собрана поверх
/// [AppCard]; тексты — из [Messages], суммы форматирует общий помощник.
class EstimateItemCard extends StatelessWidget {
  const EstimateItemCard({
    required this.item,
    required this.currencyCode,
    required this.messages,
    super.key,
  });

  final EstimateItem item;
  final String currencyCode;
  final Messages messages;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  item.materialKind,
                  style: AppTypography.titleMedium,
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Text(
                '${_formatQuantity(item.quantity)} ${item.unit}',
                style: AppTypography.titleMedium,
              ),
            ],
          ),
          if (item.options.isEmpty) ...[
            const SizedBox(height: AppSpacing.sm),
            Text(
              messages.estimatorNoOptions,
              style: AppTypography.bodyMedium.copyWith(
                color: AppColorTokens.of(context).inkSecondary,
              ),
            ),
          ] else
            for (final option in item.options) ...[
              const SizedBox(height: AppSpacing.md),
              _OptionRow(
                option: option,
                currencyCode: currencyCode,
                messages: messages,
              ),
            ],
        ],
      ),
    );
  }

  /// Отбрасывает дробный ноль количества (2.0 → «2»).
  static String _formatQuantity(num quantity) {
    return quantity == quantity.roundToDouble()
        ? quantity.toInt().toString()
        : quantity.toString();
  }
}

/// Строка варианта товара: сегмент + название, итог и наличие.
class _OptionRow extends StatelessWidget {
  const _OptionRow({
    required this.option,
    required this.currencyCode,
    required this.messages,
  });

  final EstimateOption option;
  final String currencyCode;
  final Messages messages;

  @override
  Widget build(BuildContext context) {
    final colors = AppColorTokens.of(context);
    final title = option.productTitle;
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                messages.segmentLabel(option.segment),
                style: AppTypography.caption.copyWith(
                  color: colors.inkSecondary,
                ),
              ),
              if (title != null) ...[
                const SizedBox(height: AppSpacing.xs),
                Text(title, style: AppTypography.bodyMedium),
              ],
              const SizedBox(height: AppSpacing.xs),
              Text(
                option.inStock
                    ? messages.estimatorInStock
                    : messages.estimatorOutOfStock,
                style: AppTypography.caption.copyWith(
                  color: option.inStock ? colors.success : colors.inkSecondary,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(width: AppSpacing.md),
        Text(
          formatPriceLabel(
            amount: option.total,
            currencyCode: currencyCode,
            unavailableLabel: messages.priceUnavailable,
          ),
          style: AppTypography.titleMedium,
        ),
      ],
    );
  }
}
