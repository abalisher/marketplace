import 'package:flutter/material.dart';

/// Инлайн-разметка текста ассистента: выделяет фрагменты `**…**` полужирным.
/// Ассистент отвечает лёгким markdown (ключевые числа — жирными), и одна и та же
/// разметка нужна и в пузыре реплики, и в блоке ответа без пузыря, поэтому логика
/// живёт отдельным токеном дизайн-системы, а не внутри одного виджета.
///
/// Непарные `**` и пары без содержимого (`****`) остаются в тексте как есть.
abstract final class AppInlineMarkdown {
  /// Разбивает [text] на спаны. [color] — цвет текста (нужен и жирным спанам,
  /// так как весовые стили задаются через готовые роли типографики).
  /// [style] — базовая роль (по умолчанию `bodyLarge`), [boldStyle] — её
  /// полужирный вариант; передаются вызывающим, чтобы разметка работала в любой
  /// типографической роли.
  static List<InlineSpan> spans(
    String text, {
    required Color color,
    required TextStyle boldStyle,
  }) {
    final spans = <InlineSpan>[];
    var rest = text;
    while (true) {
      final open = rest.indexOf('**');
      final close = open >= 0 ? rest.indexOf('**', open + 2) : -1;
      if (open < 0 || close < 0) {
        if (rest.isNotEmpty) spans.add(TextSpan(text: rest));
        return spans;
      }
      if (close == open + 2) {
        // Пустое выделение «****» — не разметка, оставляем литералом.
        spans.add(TextSpan(text: rest.substring(0, close + 2)));
        rest = rest.substring(close + 2);
        continue;
      }
      if (open > 0) spans.add(TextSpan(text: rest.substring(0, open)));
      spans.add(
        TextSpan(
          text: rest.substring(open + 2, close),
          style: boldStyle.copyWith(color: color),
        ),
      );
      rest = rest.substring(close + 2);
    }
  }
}
