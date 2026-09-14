import 'package:flutter/material.dart';

import 'app_color_tokens.dart';
import 'app_input_bar.dart';

/// Кнопка голосового ввода в композере (T10.3). Одна кнопка на два действия —
/// «начать» и «закончить»: покупатель заканчивает запись там же, где начал, как
/// в эталоне.
///
/// Сторона — та же, что у отправки (48px): меньший круг на прогоне 2026-08-13
/// промахивался пальцем. Во время записи кнопка заливается [AppColorTokens.error]
/// — красный кружок и есть общепонятный знак «идёт запись».
class AppMicButton extends StatelessWidget {
  const AppMicButton({
    required this.onTap,
    this.isRecording = false,
    this.label,
    super.key,
  });

  final VoidCallback onTap;

  /// Идёт ли запись прямо сейчас.
  final bool isRecording;

  /// Озвучка для screen reader (у кнопки только иконка).
  final String? label;

  @override
  Widget build(BuildContext context) {
    final colors = AppColorTokens.of(context);
    return Semantics(
      button: true,
      label: label,
      child: Material(
        color: isRecording ? colors.error : Colors.transparent,
        shape: const CircleBorder(),
        child: InkWell(
          onTap: onTap,
          customBorder: const CircleBorder(),
          child: SizedBox(
            width: AppInputBar.sendSide,
            height: AppInputBar.sendSide,
            child: Icon(
              isRecording ? Icons.stop_rounded : Icons.mic_none_rounded,
              size: 22,
              color: isRecording ? colors.surface : colors.inkSecondary,
            ),
          ),
        ),
      ),
    );
  }
}
