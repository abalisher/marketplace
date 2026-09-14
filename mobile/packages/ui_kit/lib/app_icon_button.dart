import 'package:flutter/material.dart';

import 'app_color_tokens.dart';
import 'app_input_bar.dart';

/// Круглая кнопка-иконка без заливки (48×48) — вспомогательное действие рядом с
/// главным: отмена голосовой записи в композере (T10.3) и подобные.
///
/// Сторона та же, что у отправки: меньший круг на прогоне 2026-08-13
/// промахивался пальцем. У кнопки только иконка, поэтому [label] обязателен —
/// это её озвучка для screen reader.
class AppIconButton extends StatelessWidget {
  const AppIconButton({
    required this.icon,
    required this.label,
    required this.onTap,
    super.key,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final colors = AppColorTokens.of(context);
    return Semantics(
      button: true,
      label: label,
      child: Material(
        color: Colors.transparent,
        shape: const CircleBorder(),
        child: InkWell(
          onTap: onTap,
          customBorder: const CircleBorder(),
          child: SizedBox(
            width: AppInputBar.sendSide,
            height: AppInputBar.sendSide,
            child: Icon(icon, size: 22, color: colors.inkSecondary),
          ),
        ),
      ),
    );
  }
}
