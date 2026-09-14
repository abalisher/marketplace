import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:ui_kit/app_color_tokens.dart';
import 'package:ui_kit/app_error_view.dart';
import 'package:ui_kit/app_loader.dart';
import 'package:ui_kit/app_primary_button.dart';
import 'package:ui_kit/app_spacing.dart';
import 'package:ui_kit/app_typography.dart';

import '../../../l10n/messages.dart';
import '../../../l10n/messages_provider.dart';
import '../../../shared/price_label.dart';
import '../domain/cart.dart';
import '../providers/cart_controller.dart';
import '../widgets/cart_line_tile.dart';

/// Экран корзины — первая мутационная поверхность пути покупателя: строки,
/// изменение количества/удаление и итог (считает бэкенд). Данные — из
/// [cartControllerProvider]; экран только отображает и делегирует действия.
class CartScreen extends ConsumerWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final messages = ref.watch(messagesProvider);
    final cartAsync = ref.watch(cartControllerProvider);

    return Scaffold(
      appBar: AppBar(title: Text(messages.cartTitle)),
      body: cartAsync.when(
        loading: () => const AppLoader(),
        error: (_, _) => AppErrorView(
          message: messages.cartLoadError,
          retryLabel: messages.retry,
          onRetry: () => ref.invalidate(cartControllerProvider),
        ),
        data: (cart) {
          if (cart == null || cart.isEmpty) {
            return Center(
              child: Text(messages.cartEmpty, style: AppTypography.bodyLarge),
            );
          }
          return _CartBody(cart: cart, messages: messages);
        },
      ),
    );
  }
}

/// Список строк корзины и итог. Действия делегируются контроллеру; ошибка
/// мутации показывается SnackBar'ом, прежняя корзина сохраняется.
class _CartBody extends ConsumerWidget {
  const _CartBody({required this.cart, required this.messages});

  final Cart cart;
  final Messages messages;

  Future<void> _run(
    BuildContext context,
    Future<void> Function() action,
  ) async {
    final messenger = ScaffoldMessenger.of(context);
    try {
      await action();
    } catch (_) {
      messenger
        ..hideCurrentSnackBar()
        ..showSnackBar(SnackBar(content: Text(messages.cartUpdateError)));
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final controller = ref.read(cartControllerProvider.notifier);
    return Column(
      children: [
        Expanded(
          child: ListView.separated(
            padding: const EdgeInsets.all(AppSpacing.lg),
            itemCount: cart.lines.length,
            separatorBuilder: (_, _) => const SizedBox(height: AppSpacing.md),
            itemBuilder: (context, index) {
              final line = cart.lines[index];
              return CartLineTile(
                line: line,
                priceUnavailableLabel: messages.priceUnavailable,
                onIncrement: () => _run(
                  context,
                  () => controller.setQuantity(line.id, line.quantity + 1),
                ),
                onDecrement: () => _run(
                  context,
                  () => controller.setQuantity(line.id, line.quantity - 1),
                ),
                onRemove: () =>
                    _run(context, () => controller.removeLine(line.id)),
              );
            },
          ),
        ),
        _CartSummary(cart: cart, messages: messages),
      ],
    );
  }
}

/// Нижняя панель с итогом и кнопкой оформления (заглушка до итерации чекаута).
class _CartSummary extends StatelessWidget {
  const _CartSummary({required this.cart, required this.messages});

  final Cart cart;
  final Messages messages;

  @override
  Widget build(BuildContext context) {
    final colors = AppColorTokens.of(context);
    return SafeArea(
      top: false,
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: colors.surface,
          border: Border(top: BorderSide(color: colors.border)),
        ),
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(messages.cartTotal, style: AppTypography.titleMedium),
                  Text(
                    formatPriceLabel(
                      amount: cart.total,
                      currencyCode: cart.currencyCode,
                      unavailableLabel: messages.priceUnavailable,
                    ),
                    style: AppTypography.headingMedium,
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.md),
              AppPrimaryButton(
                label: messages.checkout,
                onPressed: () => context.push('/checkout'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
