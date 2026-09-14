import 'package:flutter/material.dart';

import 'app_color_tokens.dart';
import 'app_radius.dart';

/// Квадратная миниатюра дизайн-системы: изображение по [url] со скруглением из
/// токенов и плейсхолдером при отсутствии URL или ошибке загрузки. Используется
/// в карточке каталога и строке корзины.
class AppThumbnail extends StatelessWidget {
  const AppThumbnail({required this.url, this.size = 64, super.key});

  /// URL изображения; null — показывается плейсхолдер.
  final String? url;

  /// Сторона квадрата (по умолчанию 64px).
  final double size;

  @override
  Widget build(BuildContext context) {
    final url = this.url;
    return ClipRRect(
      borderRadius: BorderRadius.circular(AppRadius.sm),
      child: SizedBox(
        width: size,
        height: size,
        child: url == null
            ? const _Placeholder()
            : Image.network(
                url,
                fit: BoxFit.cover,
                errorBuilder: (_, _, _) => const _Placeholder(),
              ),
      ),
    );
  }
}

/// Плейсхолдер миниатюры (нейтральный фон с иконкой изображения).
class _Placeholder extends StatelessWidget {
  const _Placeholder();

  @override
  Widget build(BuildContext context) {
    final colors = AppColorTokens.of(context);
    return ColoredBox(
      color: colors.surfaceDim,
      child: Icon(Icons.image_outlined, color: colors.inkSecondary),
    );
  }
}
