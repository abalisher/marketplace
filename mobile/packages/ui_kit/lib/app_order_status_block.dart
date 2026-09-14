import 'package:flutter/material.dart';

import 'app_color_tokens.dart';
import 'app_radius.dart';
import 'app_spacing.dart';
import 'app_status_badge.dart';
import 'app_typography.dart';

/// Стадия заказа в степпере статуса.
enum AppOrderStageState { done, active, pending }

/// Одна стадия: подпись + состояние.
class AppOrderStage {
  const AppOrderStage(this.label, this.state);
  final String label;
  final AppOrderStageState state;
}

/// Блок статуса заказа в ленте чата (спек 1k: 4 стадии + прогресс курьера + код).
/// Горизонтальный степпер (принят→собран→в доставке→доставлен), примечание о
/// курьере и код получения. Только отображение; при [onOpen] карточка целиком
/// становится нажимаемой и показывает строку-ссылку [openLabel] («Открыть
/// заказ») — иначе read-only.
class AppOrderStatusBlock extends StatelessWidget {
  const AppOrderStatusBlock({
    required this.orderNumber,
    required this.statusLabel,
    required this.statusColor,
    required this.stages,
    this.courierNote,
    this.slotTitle,
    this.slotLabel,
    this.receiptCode,
    this.codeLabel,
    this.onOpen,
    this.openLabel,
    super.key,
  });

  final String orderNumber;
  final String statusLabel;
  final Color statusColor;
  final List<AppOrderStage> stages;

  /// «Курьер в пути · ≈ 12:40» (опц.).
  final String? courierNote;

  /// Подпись слота доставки: «Доставка» (опц.).
  final String? slotTitle;

  /// Окно приезда машины: «6 сент., 13:00–17:00» (опц.). Рисуется только вместе
  /// с [slotTitle]; null — слота у заказа нет.
  final String? slotLabel;

  /// Код получения: «7419» (опц.).
  final String? receiptCode;

  /// Подпись к коду: «Код получения» (опц.).
  final String? codeLabel;

  /// Открыть страницу заказа. null — карточка read-only (гость, либо экран
  /// самого заказа, где открывать уже нечего).
  final VoidCallback? onOpen;

  /// Подпись действия открытия: «Открыть заказ». Без неё нажатие остаётся
  /// незаметным, поэтому строка-ссылка рисуется только вместе с [onOpen].
  final String? openLabel;

  @override
  Widget build(BuildContext context) {
    final colors = AppColorTokens.of(context);
    final borderRadius = BorderRadius.circular(AppRadius.card);
    final card = Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        borderRadius: borderRadius,
        border: Border.all(color: colors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Номер и статус — Wrap, а не Row: на ширине телефона длинная метка
          // статуса уезжает на свою строку целиком вместо того, чтобы сжимать
          // номер заказа до одной буквы в столбик (приёмка 2026-08-11).
          Wrap(
            spacing: AppSpacing.sm,
            runSpacing: AppSpacing.xs,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              Text(
                orderNumber,
                style: AppTypography.titleMedium.copyWith(color: colors.ink),
              ),
              AppStatusBadge(label: statusLabel, color: statusColor),
            ],
          ),
          if (stages.isNotEmpty) ...[
            const SizedBox(height: AppSpacing.lg),
            _Stepper(stages: stages),
          ],
          // Слот доставки — сразу под прогрессом: «когда привезут» покупатель
          // ищет первым, а примечание курьера появляется только после рейса.
          if (slotTitle != null && slotLabel != null) ...[
            const SizedBox(height: AppSpacing.md),
            Row(
              children: [
                Expanded(
                  child: Text(
                    slotTitle!,
                    style: AppTypography.caption.copyWith(
                      color: colors.inkSecondary,
                    ),
                  ),
                ),
                const SizedBox(width: AppSpacing.sm),
                Text(
                  slotLabel!,
                  style: AppTypography.bodyMediumSemibold.copyWith(
                    color: colors.ink,
                  ),
                ),
              ],
            ),
          ],
          if (courierNote != null) ...[
            const SizedBox(height: AppSpacing.md),
            Text(
              courierNote!,
              style: AppTypography.caption.copyWith(color: colors.inkSecondary),
            ),
          ],
          if (receiptCode != null) ...[
            const SizedBox(height: AppSpacing.md),
            const Divider(height: 1),
            const SizedBox(height: AppSpacing.md),
            Row(
              children: [
                Expanded(
                  child: Text(
                    codeLabel ?? '',
                    style: AppTypography.caption.copyWith(
                      color: colors.inkSecondary,
                    ),
                  ),
                ),
                Text(
                  _spaced(receiptCode!),
                  style: AppTypography.headingMedium.copyWith(
                    color: colors.ink,
                    letterSpacing: 3,
                  ),
                ),
              ],
            ),
          ],
          if (onOpen != null && openLabel != null) ...[
            const SizedBox(height: AppSpacing.md),
            Row(
              children: [
                Text(
                  openLabel!,
                  style: AppTypography.bodyMediumSemibold.copyWith(
                    color: colors.accent,
                  ),
                ),
                Icon(Icons.chevron_right, size: 18, color: colors.accent),
              ],
            ),
          ],
        ],
      ),
    );

    // Тап-цель — вся карточка (как у AppProductCard), поэтому 48 dp набираются
    // с запасом; строка-ссылка выше делает нажатие видимым.
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.xs),
      child: Material(
        color: colors.surface,
        borderRadius: borderRadius,
        child: onOpen == null
            ? card
            : InkWell(onTap: onOpen, borderRadius: borderRadius, child: card),
      ),
    );
  }

  static String _spaced(String code) => code.split('').join(' ');
}

class _Stepper extends StatelessWidget {
  const _Stepper({required this.stages});

  final List<AppOrderStage> stages;

  @override
  Widget build(BuildContext context) {
    final colors = AppColorTokens.of(context);
    final nodes = <Widget>[];
    for (var i = 0; i < stages.length; i++) {
      nodes.add(_Node(state: stages[i].state));
      if (i < stages.length - 1) {
        // Соединитель окрашен, если левая стадия уже пройдена.
        final passed = stages[i].state == AppOrderStageState.done;
        nodes.add(
          Expanded(
            child: Container(
              height: 2,
              color: passed ? colors.accent : colors.border,
            ),
          ),
        );
      }
    }

    return Column(
      children: [
        Row(children: nodes),
        const SizedBox(height: AppSpacing.sm),
        Row(
          children: stages.map((s) {
            final active = s.state == AppOrderStageState.active;
            return Expanded(
              child: Text(
                s.label,
                textAlign: TextAlign.center,
                style:
                    (active
                            ? AppTypography.captionSemibold
                            : AppTypography.caption)
                        .copyWith(
                          color: active ? colors.accent : colors.inkSecondary,
                        ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            );
          }).toList(),
        ),
      ],
    );
  }
}

class _Node extends StatelessWidget {
  const _Node({required this.state});

  final AppOrderStageState state;

  @override
  Widget build(BuildContext context) {
    final colors = AppColorTokens.of(context);
    switch (state) {
      case AppOrderStageState.done:
        return Container(
          width: 20,
          height: 20,
          decoration: BoxDecoration(
            color: colors.accent,
            shape: BoxShape.circle,
          ),
          child: Icon(Icons.check, size: 13, color: colors.onAccent),
        );
      case AppOrderStageState.active:
        return Container(
          width: 20,
          height: 20,
          decoration: BoxDecoration(
            color: colors.surface,
            shape: BoxShape.circle,
            border: Border.all(color: colors.accent, width: 3),
          ),
        );
      case AppOrderStageState.pending:
        return Container(
          width: 20,
          height: 20,
          decoration: BoxDecoration(
            color: colors.surface,
            shape: BoxShape.circle,
            border: Border.all(color: colors.border, width: 2),
          ),
        );
    }
  }
}
