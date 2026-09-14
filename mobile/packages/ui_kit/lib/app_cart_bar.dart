import 'package:flutter/material.dart';

import 'app_color_tokens.dart';
import 'app_radius.dart';
import 'app_spacing.dart';
import 'app_typography.dart';

/// Полоса корзины над композером чата (T10.15). Карточки подбора живут ровно
/// один ход: уехали вверх по ленте — и управлять количеством стало бы нечем.
/// Полоса — постоянное место, где видно, что набрано, и где это правится.
/// Свёрнутая — одна строка с итогом; раскрытая — [lines] (их строит фича:
/// название позиции + счётчик), ui_kit остаётся презентационным.
class AppCartBar extends StatefulWidget {
  const AppCartBar({
    required this.title,
    required this.count,
    required this.total,
    required this.expandLabel,
    required this.collapseLabel,
    required this.lines,
    this.errorText,
    super.key,
  });

  /// Подпись полосы («Корзина»).
  final String title;

  /// Сколько позиций в корзине — бейдж рядом с подписью.
  final int count;

  /// Отформатированный итог: «128 400 ₸».
  final String total;

  final String expandLabel;
  final String collapseLabel;

  /// Строки раскрытого состояния (позиция + счётчик).
  final List<Widget> lines;

  /// Текст ошибки записи в корзину; null — ошибки нет.
  final String? errorText;

  @override
  State<AppCartBar> createState() => _AppCartBarState();
}

class _AppCartBarState extends State<AppCartBar> {
  bool _isOpen = false;

  @override
  Widget build(BuildContext context) {
    final colors = AppColorTokens.of(context);
    final borderRadius = BorderRadius.circular(AppRadius.card);

    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: Material(
        color: colors.surface,
        borderRadius: borderRadius,
        child: Container(
          decoration: BoxDecoration(
            borderRadius: borderRadius,
            border: Border.all(color: colors.border),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Semantics(
                button: true,
                label: _isOpen ? widget.collapseLabel : widget.expandLabel,
                child: InkWell(
                  onTap: () => setState(() => _isOpen = !_isOpen),
                  borderRadius: borderRadius,
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.md,
                      vertical: AppSpacing.sm,
                    ),
                    child: Row(
                      children: [
                        Text(
                          widget.title,
                          style: AppTypography.bodyLargeMedium.copyWith(
                            color: colors.ink,
                          ),
                        ),
                        const SizedBox(width: AppSpacing.xs),
                        _CountBadge(count: widget.count),
                        const Spacer(),
                        Text(
                          widget.total,
                          style: AppTypography.bodyLarge.copyWith(
                            color: colors.ink,
                          ),
                        ),
                        const SizedBox(width: AppSpacing.xs),
                        Icon(
                          _isOpen
                              ? Icons.keyboard_arrow_down
                              : Icons.keyboard_arrow_up,
                          size: 20,
                          color: colors.inkSecondary,
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              if (widget.errorText != null)
                Padding(
                  padding: const EdgeInsets.fromLTRB(
                    AppSpacing.md,
                    0,
                    AppSpacing.md,
                    AppSpacing.sm,
                  ),
                  child: Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      widget.errorText!,
                      style: AppTypography.caption.copyWith(
                        color: colors.error,
                      ),
                    ),
                  ),
                ),
              if (_isOpen)
                Padding(
                  padding: const EdgeInsets.fromLTRB(
                    AppSpacing.md,
                    0,
                    AppSpacing.md,
                    AppSpacing.sm,
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: widget.lines,
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Бейдж с числом позиций: числом, а не словом — «6 позиций/позиции/позиция»
/// потребовало бы склонения в каждой локали.
class _CountBadge extends StatelessWidget {
  const _CountBadge({required this.count});

  final int count;

  @override
  Widget build(BuildContext context) {
    final colors = AppColorTokens.of(context);
    return Container(
      constraints: const BoxConstraints(minWidth: 20),
      height: 20,
      alignment: Alignment.center,
      padding: const EdgeInsets.symmetric(horizontal: 6),
      decoration: BoxDecoration(
        color: colors.accent,
        borderRadius: BorderRadius.circular(AppRadius.chip),
      ),
      child: Text(
        '$count',
        style: AppTypography.caption.copyWith(color: colors.surface),
      ),
    );
  }
}
