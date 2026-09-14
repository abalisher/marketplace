import 'package:flutter/material.dart';

import 'app_color_tokens.dart';
import 'app_spacing.dart';
import 'app_typography.dart';

/// Состояние голосового ввода на месте поля композера (T10.3): пульсирующая
/// красная точка + подпись + таймер «12/60», либо кружок ожидания на время
/// распознавания.
///
/// Занимает МЕСТО ПОЛЯ, а не строку рядом: иначе непонятно, слушает микрофон
/// сейчас или уже нет. [timer] пуст, когда таймер не нужен (распознавание).
class AppRecordingIndicator extends StatefulWidget {
  const AppRecordingIndicator({
    required this.label,
    this.timer,
    this.isRecording = true,
    super.key,
  });

  /// Подпись состояния («Идёт запись…» / «Распознаём…»).
  final String label;

  /// Правый счётчик, например «12/60». Null — не показываем.
  final String? timer;

  /// Идёт запись (точка) или распознавание (кружок ожидания).
  final bool isRecording;

  @override
  State<AppRecordingIndicator> createState() => _AppRecordingIndicatorState();
}

class _AppRecordingIndicatorState extends State<AppRecordingIndicator>
    with SingleTickerProviderStateMixin {
  late final AnimationController _pulse;

  @override
  void initState() {
    super.initState();
    // Создаём сразу, а не лениво: при `isRecording: false` точку не рисуют,
    // и ленивое поле впервые тронулось бы уже в dispose — тикер полез бы за
    // контекстом отсоединённого виджета.
    _pulse = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _pulse.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColorTokens.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.md + 2,
      ),
      child: Row(
        children: [
          if (widget.isRecording)
            FadeTransition(
              opacity: _pulse.drive(Tween(begin: 0.35, end: 1)),
              child: Container(
                width: 12,
                height: 12,
                decoration: BoxDecoration(
                  color: colors.error,
                  shape: BoxShape.circle,
                ),
              ),
            )
          else
            SizedBox(
              width: 14,
              height: 14,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                color: colors.inkSecondary,
              ),
            ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Text(
              widget.label,
              style: AppTypography.bodyLarge.copyWith(color: colors.ink),
            ),
          ),
          if (widget.timer != null)
            Text(
              widget.timer!,
              style: AppTypography.bodyMedium.copyWith(
                color: colors.inkSecondary,
              ),
            ),
        ],
      ),
    );
  }
}
