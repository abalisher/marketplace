import 'package:flutter/material.dart';

import 'app_color_tokens.dart';
import 'app_inline_markdown.dart';
import 'app_spacing.dart';
import 'app_typography.dart';

/// Текст ответа ассистента с лёгким markdown (эталон Gemini, бриф T10.1 §3.4):
/// абзацы, маркированные и нумерованные списки, инлайн-выделение `**жирным**`.
/// Таблиц и кода в ответах ассистента нет — их не разбираем.
///
/// Разметка строчная: каждая строка исходника — отдельный блок. Строка,
/// начинающаяся с `- `, `* ` или `• `, становится пунктом с маркером; строка
/// вида `1. ` / `1) ` — нумерованным пунктом (номер берём из текста, чтобы
/// нумерация ассистента не переигрывалась). Пустые строки задают отступ абзаца.
class AppAssistantMarkdown extends StatelessWidget {
  const AppAssistantMarkdown({required this.text, this.color, super.key});

  final String text;

  /// Цвет текста; по умолчанию — `ink` темы.
  final Color? color;

  /// Отступ между блоками (абзацами и пунктами списка).
  static const double _blockGap = AppSpacing.sm;

  /// Отступ маркера списка от текста пункта.
  static const double _markerGap = AppSpacing.sm;

  /// Пункт нумерованного списка: `1. …` или `1) …`.
  static final _numbered = RegExp(r'^(\d{1,2})[.)]\s+(.*)$');

  @override
  Widget build(BuildContext context) {
    final colors = AppColorTokens.of(context);
    final textColor = color ?? colors.ink;
    final blocks = <Widget>[];
    for (final raw in text.split('\n')) {
      final line = raw.trim();
      if (line.isEmpty) continue;
      final bullet = _bulletContent(line);
      if (bullet != null) {
        blocks.add(_item(marker: '•', content: bullet, color: textColor));
        continue;
      }
      final numbered = _numberedContent(line);
      if (numbered != null) {
        blocks.add(
          _item(
            marker: numbered.$1,
            content: numbered.$2,
            color: textColor,
            markerWidth: 22,
          ),
        );
        continue;
      }
      blocks.add(_paragraph(line, textColor));
    }
    if (blocks.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        for (var i = 0; i < blocks.length; i++) ...[
          if (i > 0) const SizedBox(height: _blockGap),
          blocks[i],
        ],
      ],
    );
  }

  /// Содержимое пункта маркированного списка или null, если строка не пункт.
  static String? _bulletContent(String line) {
    for (final marker in const ['- ', '* ', '• ']) {
      if (line.startsWith(marker)) return line.substring(marker.length).trim();
    }
    return null;
  }

  /// Номер и содержимое пункта нумерованного списка (`1. …` / `1) …`)
  /// или null, если строка не пункт.
  static (String, String)? _numberedContent(String line) {
    final match = _numbered.firstMatch(line);
    if (match == null) return null;
    return ('${match.group(1)}.', match.group(2)!.trim());
  }

  Widget _paragraph(String line, Color color) => Text.rich(
    TextSpan(
      children: AppInlineMarkdown.spans(
        line,
        color: color,
        boldStyle: AppTypography.bodyLargeSemibold,
      ),
    ),
    style: AppTypography.bodyLarge.copyWith(color: color),
  );

  Widget _item({
    required String marker,
    required String content,
    required Color color,
    double markerWidth = 14,
  }) => Row(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SizedBox(
        width: markerWidth,
        child: Text(
          marker,
          style: AppTypography.bodyLarge.copyWith(color: color),
        ),
      ),
      const SizedBox(width: _markerGap),
      Expanded(child: _paragraph(content, color)),
    ],
  );
}
