import 'package:marketplace_buyer/features/assistant/data/assistant_repository.dart';
import 'package:marketplace_buyer/features/assistant/domain/cart_summary.dart';

/// Примесь для фейков ассистента в тестах: корзина чата (T10.15) пустая и
/// неизменная. Счётчики «−/+» пишут в корзину отдельными роутами, и экранным
/// тестам ленты эта часть интерфейса не нужна — а реализовать её обязан каждый
/// фейк. Тесты самих счётчиков подставляют свой фейк.
mixin NoAssistantCart implements AssistantRepository {
  @override
  Future<CartSummary> setCartQuantities({
    String? cartId,
    required Map<String, int> quantities,
  }) async => const CartSummary.empty();

  @override
  Future<CartSummary> readCart(String cartId) async =>
      const CartSummary.empty();
}
