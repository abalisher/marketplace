import 'package:flutter/material.dart';

import 'app_color_tokens.dart';
import 'app_radius.dart';
import 'app_spacing.dart';
import 'app_status_badge.dart';
import 'app_typography.dart';

/// Размер иконки-коробки. Вынесен: по нему выравнивается строка слота под
/// текстовой колонкой, а не под иконкой.
const _iconSize = 40.0;

/// Элемент списка заказов (спек 1k: номер + мета + статус-чип). Иконка-коробка,
/// номер заказа, мета (позиции · сумма · компания), справа — бейдж статуса.
/// Ниже — необязательная строка слота доставки на всю ширину карточки.
class AppOrderListItem extends StatelessWidget {
  const AppOrderListItem({
    required this.number,
    required this.statusLabel,
    required this.statusColor,
    this.meta,
    this.dateLabel,
    this.slotLabel,
    this.onTap,
    super.key,
  });

  /// Номер заказа: «№ СМ-4821».
  final String number;

  /// Мета: «1 позиция · 92 400 ₸ · ТОО «АстанаСтройГрупп»».
  final String? meta;

  /// Дата/время рядом с номером (опц.).
  final String? dateLabel;

  /// Слот доставки строкой под номером и метой: «Доставка: 6 сент.,
  /// 13:00–17:00» (опц.). Отдельная строка НА ВСЮ ширину карточки, а не часть
  /// меты: рядом с бейджем статуса окно приезда обрезалось на «13:00–…»
  /// (находка гейта U T5.6a), а время — то, ради чего строка и нужна.
  final String? slotLabel;

  final String statusLabel;
  final Color statusColor;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final colors = AppColorTokens.of(context);
    return Container(
      margin: const EdgeInsets.symmetric(vertical: AppSpacing.xs),
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: BorderRadius.circular(AppRadius.card),
        border: Border.all(color: colors.border),
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(AppRadius.card),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(AppRadius.card),
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.md),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: _iconSize,
                      height: _iconSize,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: colors.surfaceDim,
                        borderRadius: BorderRadius.circular(AppRadius.chip),
                      ),
                      child: Icon(
                        Icons.inventory_2_outlined,
                        size: 20,
                        color: colors.inkSecondary,
                      ),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Flexible(
                                child: Text(
                                  number,
                                  style: AppTypography.titleMedium.copyWith(
                                    color: colors.ink,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              if (dateLabel != null) ...[
                                const SizedBox(width: AppSpacing.sm),
                                Text(
                                  dateLabel!,
                                  style: AppTypography.caption.copyWith(
                                    color: colors.inkSecondary,
                                  ),
                                ),
                              ],
                            ],
                          ),
                          if (meta != null) ...[
                            const SizedBox(height: 2),
                            Text(
                              meta!,
                              style: AppTypography.caption.copyWith(
                                color: colors.inkSecondary,
                              ),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ],
                      ),
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    AppStatusBadge(label: statusLabel, color: statusColor),
                  ],
                ),
                if (slotLabel != null) ...[
                  const SizedBox(height: AppSpacing.xs),
                  Padding(
                    // Выравниваем по номеру и мете — иначе строка уезжает под
                    // иконку и читается как подпись к ней.
                    padding: const EdgeInsets.only(
                      left: _iconSize + AppSpacing.md,
                    ),
                    child: Text(
                      slotLabel!,
                      style: AppTypography.caption.copyWith(color: colors.ink),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
