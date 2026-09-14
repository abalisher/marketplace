import 'package:flutter/material.dart';

import 'app_color_tokens.dart';
import 'app_radius.dart';
import 'app_spacing.dart';
import 'app_status_badge.dart';
import 'app_typography.dart';

/// Карточка товара в ленте чата (спек 1k: миниатюра 52, плейсхолдер-литера,
/// вариант = отдельная карточка). Показывает фото/название/цену с единицей/
/// наличие. Строки локализованы на уровне фичи и приходят параметрами —
/// ui_kit остаётся презентационным и локаль-агностичным.
/// Справа — слот [trailing]: в чате туда встаёт счётчик количества
/// ([AppQuantityStepper], T10.15), который пишет прямо в корзину. Прежний
/// «тап по всей карточке = реплика „Беру …“» отменён решением владельца
/// 2026-08-31: покупатель видел в ленте фразу, которой не писал, брал за ход
/// ровно одну позицию и ждал ход модели на каждое нажатие. [onTap] остался для
/// карточек вне чата; при null карточка не интерактивна. Миниатюра — отдельная
/// цель: при [onImageTap] тап по фото не доходит до карточки и открывает
/// просмотр изображения ([AppImageViewer]).
class AppProductCard extends StatelessWidget {
  const AppProductCard({
    required this.title,
    required this.price,
    required this.stockLabel,
    required this.stockColor,
    this.unit,
    this.imageUrl,
    this.onTap,
    this.onImageTap,
    this.imageTapLabel,
    this.trailing,
    this.highlighted = false,
    super.key,
  });

  /// Название (может включать вариант: «Цемент М400 — Мешок 50 кг»).
  final String title;

  /// Отформатированная цена: «3 200 ₸».
  final String price;

  /// Единица цены: «за мешок» (опц.).
  final String? unit;

  /// URL миниатюры; при null — плейсхолдер с первой буквой названия.
  final String? imageUrl;

  /// Метка наличия: «В наличии на складе» / «Под заказ · 2 дня».
  final String stockLabel;

  /// Цвет метки наличия (успех/предупреждение из токенов).
  final Color stockColor;

  /// Нажатие по карточке; если null — карточка не интерактивна.
  final VoidCallback? onTap;

  /// Нажатие по миниатюре (просмотр фото); если null — фото не интерактивно и
  /// тап по нему обрабатывает карточка. Игнорируется при отсутствии [imageUrl].
  final VoidCallback? onImageTap;

  /// Метка миниатюры для доступности/подсказки («Открыть фото»).
  final String? imageTapLabel;

  /// Элемент управления справа: в чате — счётчик количества.
  final Widget? trailing;

  /// Позиция уже в корзине — карточка обводится акцентом. Покупатель набирает
  /// список глазами, и «что я уже взял» должно читаться без пересчёта.
  final bool highlighted;

  @override
  Widget build(BuildContext context) {
    final colors = AppColorTokens.of(context);
    final borderRadius = BorderRadius.circular(AppRadius.card);
    final card = Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        borderRadius: borderRadius,
        border: Border.all(color: highlighted ? colors.accent : colors.border),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _Thumb(
            imageUrl: imageUrl,
            title: title,
            onTap: onImageTap,
            tapLabel: imageTapLabel,
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: AppTypography.titleMedium.copyWith(color: colors.ink),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: AppSpacing.xs),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.baseline,
                  textBaseline: TextBaseline.alphabetic,
                  children: [
                    Text(
                      price,
                      style: AppTypography.price.copyWith(color: colors.ink),
                    ),
                    if (unit != null) ...[
                      const SizedBox(width: 6),
                      Flexible(
                        child: Text(
                          unit!,
                          style: AppTypography.caption.copyWith(
                            color: colors.inkSecondary,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: AppSpacing.sm),
                AppStatusBadge(
                  label: stockLabel,
                  color: stockColor,
                  filled: false,
                ),
              ],
            ),
          ),
          if (trailing != null) ...[
            const SizedBox(width: AppSpacing.sm),
            trailing!,
          ],
        ],
      ),
    );

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.xs),
      child: Material(
        color: colors.surface,
        borderRadius: borderRadius,
        child: onTap == null
            ? card
            : InkWell(onTap: onTap, borderRadius: borderRadius, child: card),
      ),
    );
  }
}

/// Миниатюра 52×52: фото или плейсхолдер с первой буквой названия. При [onTap]
/// фото становится отдельной целью нажатия (просмотр) с меткой-лупой в углу.
class _Thumb extends StatelessWidget {
  const _Thumb({
    required this.imageUrl,
    required this.title,
    this.onTap,
    this.tapLabel,
  });

  final String? imageUrl;
  final String title;
  final VoidCallback? onTap;
  final String? tapLabel;

  @override
  Widget build(BuildContext context) {
    final colors = AppColorTokens.of(context);
    final radius = BorderRadius.circular(AppRadius.chip);
    if (imageUrl == null || imageUrl!.isEmpty) {
      return _placeholder(colors);
    }
    final photo = ClipRRect(
      borderRadius: radius,
      child: Image.network(
        imageUrl!,
        width: 52,
        height: 52,
        fit: BoxFit.cover,
        errorBuilder: (_, _, _) => _placeholder(colors),
      ),
    );
    if (onTap == null) {
      return photo;
    }
    return Semantics(
      button: true,
      label: tapLabel,
      child: Tooltip(
        message: tapLabel ?? '',
        child: InkWell(
          onTap: onTap,
          borderRadius: radius,
          child: Stack(
            children: [
              photo,
              Positioned(
                right: 2,
                bottom: 2,
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: colors.surface,
                    borderRadius: BorderRadius.circular(AppRadius.chip),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(1),
                    child: Icon(
                      Icons.zoom_in,
                      size: 14,
                      color: colors.inkSecondary,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _placeholder(AppColorTokens colors) {
    final letter = title.trim().isNotEmpty
        ? title.trim()[0].toUpperCase()
        : '?';
    return Container(
      width: 52,
      height: 52,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: colors.accentContainer,
        borderRadius: BorderRadius.circular(AppRadius.chip),
      ),
      child: Text(
        letter,
        style: AppTypography.titleMedium.copyWith(color: colors.accent),
      ),
    );
  }
}
