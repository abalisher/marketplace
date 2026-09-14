import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../providers/cart_item_count_provider.dart';

/// Кнопка-иконка корзины для шапки с бейджем количества. Количество берётся из
/// [cartItemCountProvider]; при нуле бейдж не показывается.
class CartIconButton extends ConsumerWidget {
  const CartIconButton({required this.onPressed, super.key});

  /// Обработчик нажатия (обычно — переход на экран корзины).
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final count = ref.watch(cartItemCountProvider);
    const icon = Icon(Icons.shopping_cart_outlined);
    return IconButton(
      onPressed: onPressed,
      icon: count > 0 ? Badge.count(count: count, child: icon) : icon,
    );
  }
}
