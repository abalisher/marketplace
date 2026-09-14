import 'package:flutter/material.dart';

import 'app_color_tokens.dart';
import 'app_radius.dart';
import 'app_spacing.dart';

/// Ряд действий под ответом ассистента (эталон Gemini, бриф T10.1 §3.4):
/// «копировать» и «повторить ответ». Иконки 20px в цвете `ink-secondary`,
/// тап-таргет 40dp. На мобильном ряд виден всегда (наведения нет).
///
/// «Повторить ответ» показывается только у ПОСЛЕДНЕГО ответа — вызывающий
/// передаёт [onRegenerate] = null у остальных.
class AppMessageActions extends StatelessWidget {
  const AppMessageActions({
    required this.copyLabel,
    required this.onCopy,
    this.regenerateLabel,
    this.onRegenerate,
    super.key,
  });

  /// Озвучка и tooltip кнопки копирования (у кнопки только иконка).
  final String copyLabel;
  final VoidCallback onCopy;

  /// Озвучка и tooltip кнопки повтора ответа.
  final String? regenerateLabel;
  final VoidCallback? onRegenerate;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        _ActionButton(
          icon: Icons.content_copy_outlined,
          label: copyLabel,
          onTap: onCopy,
        ),
        if (onRegenerate != null)
          _ActionButton(
            icon: Icons.refresh,
            label: regenerateLabel ?? '',
            onTap: onRegenerate!,
          ),
      ],
    );
  }
}

/// Кнопка-иконка ряда действий: 20px иконка в тап-таргете 40dp.
class _ActionButton extends StatelessWidget {
  const _ActionButton({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final colors = AppColorTokens.of(context);
    return Tooltip(
      message: label,
      child: Semantics(
        button: true,
        label: label,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(AppRadius.chip),
          child: SizedBox(
            width: 40,
            height: 40,
            child: Icon(
              icon,
              size: AppSpacing.xl - AppSpacing.xs,
              color: colors.inkSecondary,
            ),
          ),
        ),
      ),
    );
  }
}
