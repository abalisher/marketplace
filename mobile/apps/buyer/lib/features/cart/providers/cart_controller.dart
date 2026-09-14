import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/cart_repository.dart';
import '../domain/cart.dart';
import 'cart_repository_provider.dart';

/// Контроллер корзины: хранит текущую корзину (и её id) и выполняет мутации
/// через [CartRepository]. Корзина создаётся лениво при первом добавлении, до
/// этого состояние — `null` (пустая корзина). Итоги/наличие считает бэкенд —
/// контроллер только зовёт API и отдаёт результат.
///
/// При ошибке мутации состояние НЕ меняется (прежняя корзина сохраняется), а
/// исключение пробрасывается — вызывающий экран показывает уведомление.
class CartController extends AsyncNotifier<Cart?> {
  @override
  Future<Cart?> build() async => null;

  CartRepository get _repository => ref.read(cartRepositoryProvider);

  /// Добавляет вариант в корзину, создавая её при отсутствии.
  Future<void> addVariant(String variantId, {int quantity = 1}) async {
    final current = state.valueOrNull;
    final cartId = current?.id ?? (await _repository.createCart()).id;
    state = AsyncData(
      await _repository.addLineItem(
        cartId: cartId,
        variantId: variantId,
        quantity: quantity,
      ),
    );
  }

  /// Устанавливает количество строки [lineId]; при [quantity] ≤ 0 удаляет её.
  Future<void> setQuantity(String lineId, int quantity) async {
    final cart = state.valueOrNull;
    if (cart == null) return;
    if (quantity <= 0) {
      await removeLine(lineId);
      return;
    }
    state = AsyncData(
      await _repository.updateLineItem(
        cartId: cart.id,
        lineId: lineId,
        quantity: quantity,
      ),
    );
  }

  /// Удаляет строку [lineId] из корзины.
  Future<void> removeLine(String lineId) async {
    final cart = state.valueOrNull;
    if (cart == null) return;
    state = AsyncData(
      await _repository.removeLineItem(cartId: cart.id, lineId: lineId),
    );
  }
}

/// Провайдер контроллера корзины.
final cartControllerProvider = AsyncNotifierProvider<CartController, Cart?>(
  CartController.new,
);
