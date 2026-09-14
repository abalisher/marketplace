import 'package:flutter/material.dart';

import 'app_color_tokens.dart';
import 'app_inline_markdown.dart';
import 'app_radius.dart';
import 'app_spacing.dart';
import 'app_typography.dart';

/// Пузырь реплики диалога ассистента (компонент дизайн-системы, спек 1k:
/// радиус 16, срез 4 у «хвоста», паддинг 10×14, макс. ширина ~82%).
///
/// По брифу T10.1 (эталон Gemini) пузырь остался у РЕПЛИКИ ПОКУПАТЕЛЯ
/// ([isUser] = true) — справа на акценте, белым, хвост снизу справа. Вариант
/// ассистента ([isUser] = false, поверхность с обводкой) сохранён для галереи
/// компонентов и прочих контекстов, но ответ ассистента в ленте рисует
/// `AppAssistantAnswer` — без пузыря, во всю ширину столбца.
///
/// Текст поддерживает инлайн-выделение `**жирным**` ([AppInlineMarkdown]);
/// прочая разметка не интерпретируется. Только отображение: текст приходит
/// параметром, без доменных моделей.
///
/// Вложения покупателя (T10.4) идут слотом [attachments] НАД текстом — как в
/// эталоне. Текст при этом может быть пустым: снимок листа без подписи —
/// нормальное сообщение, и пустой строки под превью в пузыре не появляется.
class AppChatBubble extends StatelessWidget {
  const AppChatBubble({
    required this.text,
    required this.isUser,
    this.attachments,
    super.key,
  });

  final String text;
  final bool isUser;

  /// Превью приложенных файлов; рисуется над текстом внутри того же пузыря.
  final Widget? attachments;

  @override
  Widget build(BuildContext context) {
    final colors = AppColorTokens.of(context);
    const r = Radius.circular(AppRadius.bubble);
    const tail = Radius.circular(AppSpacing.xs); // срез 4 у «хвоста»
    final radius = BorderRadius.only(
      topLeft: isUser ? r : tail,
      topRight: r,
      bottomLeft: r,
      bottomRight: isUser ? tail : r,
    );
    final color = isUser ? colors.onAccent : colors.ink;

    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: ConstrainedBox(
        constraints: BoxConstraints(
          maxWidth: MediaQuery.sizeOf(context).width * 0.82,
        ),
        child: Container(
          margin: const EdgeInsets.symmetric(vertical: AppSpacing.xs),
          padding: const EdgeInsets.symmetric(
            horizontal: 14,
            vertical: AppSpacing.sm + 2,
          ),
          decoration: BoxDecoration(
            color: isUser ? colors.accent : colors.surface,
            borderRadius: radius,
            border: isUser ? null : Border.all(color: colors.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              ?attachments,
              if (text.isNotEmpty)
                Padding(
                  padding: EdgeInsets.only(
                    top: attachments == null ? 0 : AppSpacing.sm,
                  ),
                  child: Text.rich(
                    TextSpan(
                      children: AppInlineMarkdown.spans(
                        text,
                        color: color,
                        boldStyle: AppTypography.bodyLargeSemibold,
                      ),
                    ),
                    style: AppTypography.bodyLarge.copyWith(color: color),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
