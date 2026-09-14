import 'package:flutter/material.dart';

import 'app_color_tokens.dart';
import 'app_loader.dart';
import 'app_radius.dart';
import 'app_spacing.dart';
import 'app_typography.dart';

/// Просмотр одного изображения во весь экран: затемнённая подложка, зум
/// щипком/двойным тапом ([InteractiveViewer]), крестик и подпись снизу.
/// Тексты не содержит — подпись и метка крестика приходят параметрами
/// (ui_kit остаётся локаль-агностичным). Открывать через [AppImageViewer.show].
class AppImageViewer extends StatelessWidget {
  const AppImageViewer({
    required this.imageUrl,
    this.title,
    this.closeLabel,
    super.key,
  });

  /// Показать просмотрщик поверх текущего экрана (модальный диалог).
  static Future<void> show(
    BuildContext context, {
    required String imageUrl,
    String? title,
    String? closeLabel,
  }) {
    return showDialog<void>(
      context: context,
      barrierColor: AppColorTokens.of(context).scrim,
      barrierLabel: closeLabel,
      builder: (_) => AppImageViewer(
        imageUrl: imageUrl,
        title: title,
        closeLabel: closeLabel,
      ),
    );
  }

  /// URL изображения в полном размере.
  final String imageUrl;

  /// Подпись под изображением (в чате — название товара); null — без подписи.
  final String? title;

  /// Метка/tooltip кнопки закрытия для доступности.
  final String? closeLabel;

  @override
  Widget build(BuildContext context) {
    final colors = AppColorTokens.of(context);
    // Свой диалог вместо AlertDialog: нужна прозрачная подложка на весь экран,
    // тап по которой закрывает просмотр (как в мессенджерах).
    return Dialog.fullscreen(
      backgroundColor: Colors.transparent,
      child: Stack(
        children: [
          Positioned.fill(
            child: GestureDetector(
              onTap: () => Navigator.of(context).pop(),
              behavior: HitTestBehavior.opaque,
              child: const SizedBox.expand(),
            ),
          ),
          Positioned.fill(
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.lg),
              child: Center(
                child: InteractiveViewer(
                  minScale: 1,
                  maxScale: 4,
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(AppRadius.card),
                    child: Image.network(
                      imageUrl,
                      fit: BoxFit.contain,
                      loadingBuilder: (_, child, progress) =>
                          progress == null ? child : const AppLoader(),
                      errorBuilder: (_, _, _) => _Placeholder(colors: colors),
                    ),
                  ),
                ),
              ),
            ),
          ),
          if (title != null)
            Positioned(
              left: AppSpacing.lg,
              right: AppSpacing.lg,
              bottom: AppSpacing.xl,
              child: _Caption(text: title!, colors: colors),
            ),
          Positioned(
            top: AppSpacing.sm,
            right: AppSpacing.sm,
            child: SafeArea(
              child: IconButton(
                onPressed: () => Navigator.of(context).pop(),
                tooltip: closeLabel,
                icon: const Icon(Icons.close),
                style: IconButton.styleFrom(
                  backgroundColor: colors.surface,
                  foregroundColor: colors.ink,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Подпись под изображением на подложке поверхности (читается на любом фото).
class _Caption extends StatelessWidget {
  const _Caption({required this.text, required this.colors});

  final String text;
  final AppColorTokens colors;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.sm,
      ),
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: BorderRadius.circular(AppRadius.chip),
      ),
      child: Text(
        text,
        textAlign: TextAlign.center,
        style: AppTypography.titleMedium.copyWith(color: colors.ink),
        maxLines: 2,
        overflow: TextOverflow.ellipsis,
      ),
    );
  }
}

/// Заглушка при недоступном изображении.
class _Placeholder extends StatelessWidget {
  const _Placeholder({required this.colors});

  final AppColorTokens colors;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 200,
      height: 200,
      alignment: Alignment.center,
      color: colors.surfaceDim,
      child: Icon(Icons.image_outlined, color: colors.inkSecondary, size: 48),
    );
  }
}
