import 'package:flutter/material.dart';
import 'package:ui_kit/app_card.dart';
import 'package:ui_kit/app_color_tokens.dart';
import 'package:ui_kit/app_spacing.dart';
import 'package:ui_kit/app_typography.dart';

import '../../../l10n/messages.dart';
import '../../../shared/date_label.dart';
import '../../../shared/price_label.dart';
import '../domain/bonus_entry.dart';

/// Строка истории бонусов: тип операции (локализован) + дата и сумма со знаком
/// (начисление «+», списание/сгорание «−»). Собрана поверх [AppCard].
class BonusEntryTile extends StatelessWidget {
  const BonusEntryTile({
    required this.entry,
    required this.currencyCode,
    required this.messages,
    super.key,
  });

  final BonusEntry entry;
  final String currencyCode;
  final Messages messages;

  @override
  Widget build(BuildContext context) {
    final sign = entry.isCredit ? '+' : '−';
    final amount = formatPriceLabel(
      amount: entry.amount,
      currencyCode: currencyCode,
      unavailableLabel: '',
    );
    return AppCard(
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  messages.bonusTypeLabel(entry.type),
                  style: AppTypography.titleMedium,
                ),
                const SizedBox(height: AppSpacing.xs),
                Text(
                  formatDateLabel(entry.createdAt),
                  style: AppTypography.caption.copyWith(
                    color: AppColorTokens.of(context).inkSecondary,
                  ),
                ),
              ],
            ),
          ),
          Text('$sign$amount', style: AppTypography.titleMedium),
        ],
      ),
    );
  }
}
