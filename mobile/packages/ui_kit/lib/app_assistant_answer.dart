import 'package:flutter/material.dart';

import 'app_assistant_markdown.dart';
import 'app_color_tokens.dart';
import 'app_radius.dart';
import 'app_spacing.dart';
import 'app_typography.dart';

/// Ответ ассистента одним блоком (эталон Gemini, бриф T10.1 §3.4): БЕЗ пузыря и
/// рамки, во всю ширину столбца. Слева сверху метка-аватар 24px (квадрат с
/// радиусом `chip`, фон `ink`, литеры бренда), справа от неё — текст с лёгким
/// markdown, затем наши вставки ([attachments]) и ряд действий ([actions]).
///
/// Только отображение: текст и вставки приходят параметрами, состояние хода
/// держит экран.
class AppAssistantAnswer extends StatelessWidget {
  const AppAssistantAnswer({
    required this.text,
    required this.avatarMark,
    this.attachments = const [],
    this.actions,
    super.key,
  });

  final String text;

  /// Литеры метки-аватара (бренд-марка, уже локализованная).
  final String avatarMark;

  /// Наши вставки хода (карточка товара, оплата, статус заказа) — внутри блока
  /// ответа, сразу под текстом.
  final List<Widget> attachments;

  /// Ряд действий под ответом ([AppMessageActions]); null — действий нет.
  final Widget? actions;

  /// Сторона квадратной метки-аватара.
  static const double _avatarSide = 24;

  @override
  Widget build(BuildContext context) {
    final colors = AppColorTokens.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: _avatarSide,
            height: _avatarSide,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: colors.ink,
              borderRadius: BorderRadius.circular(AppRadius.chip),
            ),
            child: Text(
              avatarMark,
              style: AppTypography.overline.copyWith(color: colors.surface),
            ),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                AppAssistantMarkdown(text: text),
                for (final attachment in attachments) ...[
                  const SizedBox(height: AppSpacing.md),
                  attachment,
                ],
                if (actions != null) ...[
                  const SizedBox(height: AppSpacing.xs),
                  actions!,
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}
