import 'package:flutter/material.dart';

import 'app_color_tokens.dart';
import 'app_radius.dart';
import 'app_spacing.dart';

/// Галерея изображений дизайн-системы: горизонтальная листалка (PageView) с
/// индикатором-точками. При отсутствии изображений и ошибке загрузки показывает
/// плейсхолдер. Тексты не содержит — чисто визуальный примитив.
class AppImageGallery extends StatefulWidget {
  const AppImageGallery({
    required this.imageUrls,
    this.aspectRatio = 1,
    super.key,
  });

  /// URL изображений; пустой список — показывается плейсхолдер.
  final List<String> imageUrls;

  /// Соотношение сторон области галереи (ширина / высота).
  final double aspectRatio;

  @override
  State<AppImageGallery> createState() => _AppImageGalleryState();
}

class _AppImageGalleryState extends State<AppImageGallery> {
  int _current = 0;

  @override
  Widget build(BuildContext context) {
    final urls = widget.imageUrls;
    return AspectRatio(
      aspectRatio: widget.aspectRatio,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(AppRadius.lg),
        child: urls.isEmpty
            ? const _GalleryPlaceholder()
            : Stack(
                children: [
                  PageView.builder(
                    itemCount: urls.length,
                    onPageChanged: (index) => setState(() => _current = index),
                    itemBuilder: (_, index) => Image.network(
                      urls[index],
                      fit: BoxFit.cover,
                      width: double.infinity,
                      errorBuilder: (_, _, _) => const _GalleryPlaceholder(),
                    ),
                  ),
                  if (urls.length > 1)
                    Positioned(
                      left: 0,
                      right: 0,
                      bottom: AppSpacing.md,
                      child: _Dots(count: urls.length, active: _current),
                    ),
                ],
              ),
      ),
    );
  }
}

/// Плейсхолдер при отсутствии/ошибке изображения.
class _GalleryPlaceholder extends StatelessWidget {
  const _GalleryPlaceholder();

  @override
  Widget build(BuildContext context) {
    final colors = AppColorTokens.of(context);
    return ColoredBox(
      color: colors.surfaceDim,
      child: Center(
        child: Icon(Icons.image_outlined, color: colors.inkSecondary, size: 48),
      ),
    );
  }
}

/// Индикатор текущей страницы галереи.
class _Dots extends StatelessWidget {
  const _Dots({required this.count, required this.active});

  final int count;
  final int active;

  @override
  Widget build(BuildContext context) {
    final colors = AppColorTokens.of(context);
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(count, (index) {
        final isActive = index == active;
        return Container(
          width: isActive ? 10 : 8,
          height: isActive ? 10 : 8,
          margin: const EdgeInsets.symmetric(horizontal: AppSpacing.xs),
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: isActive ? colors.accent : colors.border,
          ),
        );
      }),
    );
  }
}
