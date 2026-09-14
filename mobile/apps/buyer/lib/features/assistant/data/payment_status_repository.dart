import '../domain/payment_status.dart';

/// Граница опроса статуса оплаты Kaspi для экрана 1c. Контроллер/экран не знают
/// про DTO контракта — работают через эту абстракцию (в тестах — фейк).
abstract interface class PaymentStatusRepository {
  /// Опрашивает статус оплаты корзины (GET /store/carts/:id/payment/kaspi).
  /// Гость допускается — владение подтверждает сам cartId (капабилити-токен).
  Future<PaymentStatus> poll(String cartId);
}
