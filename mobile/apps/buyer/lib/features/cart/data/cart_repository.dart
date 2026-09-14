import '../domain/cart.dart';

/// Источник корзины для экранов покупателя. Скрывает Store API и DTO за моделью
/// [Cart] — провайдеры/экраны зависят только от контракта, а тесты подменяют
/// реализацию. Бизнес-логику (итоги, наличие) считает бэкенд.
abstract interface class CartRepository {
  /// Создаёт новую корзину (регион KZ разрешается внутри) и возвращает её.
  Future<Cart> createCart();

  /// Возвращает корзину по [cartId].
  Future<Cart> fetchCart(String cartId);

  /// Текущая (незавершённая) корзина покупателя по данным бэкенда; `null` —
  /// корзины нет. Нужна кабинету (T10.6): корзину собирает АССИСТЕНТ, её id
  /// живёт в состоянии диалога, и на другом устройстве раздел «Корзина» о ней
  /// бы не знал — поэтому корзину ищет бэкенд (`/store/carts/me`).
  Future<Cart?> fetchMyCart();

  /// Добавляет вариант [variantId] в корзину [cartId]; возвращает обновлённую.
  Future<Cart> addLineItem({
    required String cartId,
    required String variantId,
    int quantity,
  });

  /// Меняет количество строки [lineId] в корзине [cartId] на [quantity].
  Future<Cart> updateLineItem({
    required String cartId,
    required String lineId,
    required int quantity,
  });

  /// Удаляет строку [lineId] из корзины [cartId]; возвращает обновлённую.
  Future<Cart> removeLineItem({required String cartId, required String lineId});
}
