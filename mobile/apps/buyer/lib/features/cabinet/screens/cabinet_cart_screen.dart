import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:ui_kit/app_card.dart';
import 'package:ui_kit/app_color_tokens.dart';
import 'package:ui_kit/app_error_view.dart';
import 'package:ui_kit/app_loader.dart';
import 'package:ui_kit/app_primary_button.dart';
import 'package:ui_kit/app_spacing.dart';
import 'package:ui_kit/app_thumbnail.dart';
import 'package:ui_kit/app_typography.dart';

import '../../../l10n/messages_provider.dart';
import '../../../shared/tenge.dart';
import '../../cart/domain/cart.dart';
import '../../cart/domain/cart_line.dart';
import '../domain/cabinet_section.dart';
import '../providers/my_cart_provider.dart';
import '../widgets/cabinet_scaffold.dart';

/// Раздел «Корзина» кабинета (T10.6): то, что ассистент собрал к этому моменту.
/// Корзину ищет БЭКЕНД по учётке (`/store/carts/me`), а не состояние диалога —
/// иначе на телефоне и в вебе кабинет показывал бы разные корзины.
/// Редактирования здесь НЕТ намеренно: корзину ведёт ассистент (пивот №3), и
/// вторая точка правки развела бы состояние диалога и корзину.
class CabinetCartScreen extends ConsumerWidget {
  const CabinetCartScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = ref.watch(messagesProvider);
    final cartAsync = ref.watch(myCartProvider);

    return CabinetScaffold(
      section: CabinetSection.cart,
      child: cartAsync.when(
        loading: () => const AppLoader(),
        error: (_, _) => AppErrorView(
          message: t.cabinetCartLoadError,
          retryLabel: t.retry,
          onRetry: () => ref.invalidate(myCartProvider),
        ),
        data: (cart) => _CartBody(cart: cart),
      ),
    );
  }
}

class _CartBody extends ConsumerWidget {
  const _CartBody({required this.cart});

  final Cart? cart;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = ref.watch(messagesProvider);
    final colors = AppColorTokens.of(context);
    final current = cart;

    // Пустая корзина и её отсутствие для покупателя — одно и то же состояние.
    if (current == null || current.isEmpty) {
      return Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              t.cabinetCartEmpty,
              style: AppTypography.titleMedium.copyWith(color: colors.ink),
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              t.cabinetCartEmptyHint,
              style: AppTypography.bodyLarge.copyWith(
                color: colors.inkSecondary,
              ),
            ),
            const SizedBox(height: AppSpacing.lg),
            AppPrimaryButton(
              label: t.cabinetContinueInChat,
              onPressed: () => context.go('/chat'),
            ),
          ],
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Expanded(
          child: ListView.separated(
            padding: const EdgeInsets.fromLTRB(
              AppSpacing.lg,
              0,
              AppSpacing.lg,
              AppSpacing.lg,
            ),
            itemCount: current.lines.length,
            separatorBuilder: (_, _) => const SizedBox(height: AppSpacing.sm),
            itemBuilder: (context, i) =>
                _line(colors, current.lines[i], current.currencyCode),
          ),
        ),
        _Total(cart: current),
      ],
    );
  }

  Widget _line(AppColorTokens colors, CartLine line, String currencyCode) {
    // Вариант (фасовка) обязателен: без него «Цемент ПЦ 400-Д20» в мешке 50 кг
    // и в мешке 25 кг — две одинаковые строки.
    final meta = [
      if (line.variantTitle != null) line.variantTitle!,
      '${line.quantity} × ${formatTenge(line.unitPrice.round())}',
    ].join(' · ');

    return AppCard(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AppThumbnail(url: line.thumbnailUrl),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  line.title,
                  style: AppTypography.titleMedium.copyWith(color: colors.ink),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: AppSpacing.xs),
                Text(
                  meta,
                  style: AppTypography.caption.copyWith(
                    color: colors.inkSecondary,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: AppSpacing.sm),
          Text(
            formatTenge((line.unitPrice * line.quantity).round()),
            style: AppTypography.bodyLargeSemibold.copyWith(color: colors.ink),
          ),
        ],
      ),
    );
  }
}

/// Итог корзины и выход обратно в чат — единственное действие раздела.
class _Total extends ConsumerWidget {
  const _Total({required this.cart});

  final Cart cart;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = ref.watch(messagesProvider);
    final colors = AppColorTokens.of(context);

    return Container(
      decoration: BoxDecoration(
        color: colors.surface,
        border: Border(top: BorderSide(color: colors.border)),
      ),
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: SafeArea(
        top: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  t.cartTotal,
                  style: AppTypography.titleMedium.copyWith(color: colors.ink),
                ),
                Text(
                  formatTenge(cart.total.round()),
                  style: AppTypography.headingMedium.copyWith(
                    color: colors.ink,
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            AppPrimaryButton(
              label: t.cabinetContinueInChat,
              onPressed: () => context.go('/chat'),
            ),
          ],
        ),
      ),
    );
  }
}
