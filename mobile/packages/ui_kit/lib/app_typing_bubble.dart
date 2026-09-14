import 'package:flutter/material.dart';

import 'app_color_tokens.dart';
import 'app_radius.dart';
import 'app_spacing.dart';

/// Пузырь «ассистент печатает…» (макет 1b): три точки 7px, мигающие каскадом
/// (цикл 1.2s, пик прозрачности на 40%, сдвиг между точками 0.2s — keyframes
/// `smdot` макета). Форма пузыря повторяет ответ ассистента [AppChatBubble]:
/// поверхность с обводкой, хвост-срез 4 сверху слева. [label] — озвучка для
/// screen reader («Печатает…»), приходит локализованной строкой фичи.
class AppTypingBubble extends StatefulWidget {
  const AppTypingBubble({required this.label, super.key});

  final String label;

  @override
  State<AppTypingBubble> createState() => _AppTypingBubbleState();
}

class _AppTypingBubbleState extends State<AppTypingBubble>
    with SingleTickerProviderStateMixin {
  static const _cycle = Duration(milliseconds: 1200);

  /// Сдвиг фазы между соседними точками (0.2s от цикла 1.2s).
  static const _phaseShift = 0.2 / 1.2;

  late final AnimationController _controller = AnimationController(
    vsync: this,
    duration: _cycle,
  )..repeat();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  /// Прозрачность точки по фазе цикла: 0 → 0.4 разгорается 0.25→1,
  /// 0.4 → 0.8 гаснет до 0.25, дальше пауза (как keyframes макета).
  @visibleForTesting
  static double opacityAt(double t) {
    if (t < 0.4) return 0.25 + 0.75 * (t / 0.4);
    if (t < 0.8) return 1.0 - 0.75 * ((t - 0.4) / 0.4);
    return 0.25;
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColorTokens.of(context);
    return Align(
      alignment: Alignment.centerLeft,
      child: Semantics(
        label: widget.label,
        child: Container(
          margin: const EdgeInsets.symmetric(vertical: AppSpacing.xs),
          // Паддинг макета 15×16: 16 = md+xs, 15 = md+3 (вне шкалы, композиция
          // токенов — как отступы 10/20/28 экрана 1a).
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.md + AppSpacing.xs,
            vertical: AppSpacing.md + 3,
          ),
          decoration: BoxDecoration(
            color: colors.surface,
            borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(AppSpacing.xs),
              topRight: Radius.circular(AppRadius.bubble),
              bottomLeft: Radius.circular(AppRadius.bubble),
              bottomRight: Radius.circular(AppRadius.bubble),
            ),
            border: Border.all(color: colors.border),
          ),
          child: AnimatedBuilder(
            animation: _controller,
            builder: (context, _) => Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                for (var i = 0; i < 3; i++) ...[
                  if (i > 0) const SizedBox(width: 5),
                  Opacity(
                    opacity: opacityAt(
                      (_controller.value - i * _phaseShift) % 1.0,
                    ),
                    child: Container(
                      width: 7,
                      height: 7,
                      decoration: BoxDecoration(
                        color: colors.inkSecondary,
                        shape: BoxShape.circle,
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
