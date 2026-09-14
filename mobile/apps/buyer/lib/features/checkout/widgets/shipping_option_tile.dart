import 'package:flutter/material.dart';
import 'package:ui_kit/app_card.dart';
import 'package:ui_kit/app_color_tokens.dart';
import 'package:ui_kit/app_spacing.dart';
import 'package:ui_kit/app_typography.dart';

import '../../../shared/price_label.dart';
import '../domain/shipping_option.dart';

/// Тайл способа получения: название, цена (0 — бесплатно) и отметка выбора.
/// Собран поверх [AppCard]; выбор отражается галочкой и обрабатывается извне.
class ShippingOptionTile extends StatelessWidget {
  const ShippingOptionTile({
    required this.option,
    required this.selected,
    required this.onTap,
    super.key,
  });

  final ShippingOption option;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      onTap: onTap,
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(option.name, style: AppTypography.titleMedium),
                const SizedBox(height: AppSpacing.xs),
                Text(
                  formatPriceLabel(
                    amount: option.amount,
                    currencyCode: option.currencyCode,
                    unavailableLabel: '',
                  ),
                  style: AppTypography.bodyLarge,
                ),
              ],
            ),
          ),
          if (selected)
            Icon(Icons.check_circle, color: AppColorTokens.of(context).success)
          else
            const Icon(Icons.radio_button_unchecked),
        ],
      ),
    );
  }
}
