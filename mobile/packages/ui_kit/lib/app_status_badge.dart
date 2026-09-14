import 'package:flutter/material.dart';

import 'app_radius.dart';
import 'app_typography.dart';

/// Бейдж статуса дизайн-системы: точка + метка (спек макета — статусы всегда с
/// точкой). Два вида: [filled] = плашка-пилюля с подложкой (статус заказа), иначе
/// — inline «точка + текст» (например «В наличии на складе»). Цвет задаёт
/// вызывающий из семантических токенов (accent/success/warning/error/…).
class AppStatusBadge extends StatelessWidget {
  const AppStatusBadge({
    required this.label,
    required this.color,
    this.filled = true,
    super.key,
  });

  final String label;
  final Color color;
  final bool filled;

  @override
  Widget build(BuildContext context) {
    final dot = Container(
      width: 6,
      height: 6,
      decoration: BoxDecoration(color: color, shape: BoxShape.circle),
    );
    // Длинная метка («Заказ собран, готов к доставке») переносится по словам, а
    // не растягивает бейдж: иначе он съедал всю ширину строки и заголовок рядом
    // рассыпался по буквам в столбик (замечание владельца на приёмке
    // 2026-08-11, ширина телефона 400 px).
    final text = Flexible(
      child: Text(
        label,
        style: AppTypography.captionSemibold.copyWith(color: color),
        softWrap: true,
      ),
    );
    final row = Row(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Точка выровнена по первой строке метки.
        Padding(padding: const EdgeInsets.only(top: 5), child: dot),
        const SizedBox(width: 6),
        text,
      ],
    );

    if (!filled) {
      return row;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(AppRadius.chip),
      ),
      child: row,
    );
  }
}
