import '../domain/checkout_address.dart';
import '../domain/kaspi_payment.dart';
import '../domain/order_summary.dart';
import '../domain/shipping_option.dart';

/// Контракт чекаута: подготовка корзины к оформлению (привязка покупателя,
/// адрес доставки, способ получения), оплата Kaspi и оформление заказа.
/// Реализация по умолчанию — поверх Medusa; в тестах переопределяется фейком.
abstract interface class CheckoutRepository {
  /// Привязывает авторизованного покупателя (по токену сессии) к корзине.
  Future<void> associateCustomer(String cartId);

  /// Сохраняет email и адрес доставки в корзине.
  Future<void> setShippingAddress({
    required String cartId,
    required String email,
    required CheckoutAddress address,
  });

  /// Возвращает доступные способы получения для корзины.
  Future<List<ShippingOption>> fetchShippingOptions(String cartId);

  /// Выбирает способ получения (shipping method) для корзины.
  Future<void> setShippingMethod({
    required String cartId,
    required String optionId,
  });

  /// Инициализирует Kaspi-оплату корзины (создаёт сессию, возвращает QR/ссылку).
  Future<KaspiPayment> initKaspiPayment(String cartId);

  /// Опрашивает статус Kaspi-оплаты (синхронизация с инвойсом).
  Future<KaspiPayment> pollKaspiPayment(String cartId);

  /// Оформляет заказ из корзины (требует авторизованной предоплаты) и
  /// возвращает итог для подтверждения.
  Future<OrderSummary> placeOrder(String cartId);
}
