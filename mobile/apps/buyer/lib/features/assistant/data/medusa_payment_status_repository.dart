import 'package:api_client/api_client.dart'
    show MedusaStoreApi, StoreKaspiPayment, StoreKaspiPaymentStatus;

import '../domain/payment_status.dart';
import 'payment_status_repository.dart';

/// Реализация [PaymentStatusRepository] поверх Medusa Store API
/// (`GET /store/carts/:id/payment/kaspi`). Только чтение статуса; инвойс/сессию
/// ведёт бэкенд. Бизнес-логики нет — лишь маппинг статуса сессии в [PaymentStatus].
class MedusaPaymentStatusRepository implements PaymentStatusRepository {
  MedusaPaymentStatusRepository(this._api, this._publishableKey);

  final MedusaStoreApi _api;
  final String _publishableKey;

  @override
  Future<PaymentStatus> poll(String cartId) async {
    final response = await _api.payment.getCartsIdPaymentKaspi(
      id: cartId,
      xPublishableApiKey: _publishableKey,
    );
    return _toStatus(response.payment);
  }

  PaymentStatus _toStatus(StoreKaspiPayment payment) =>
      switch (payment.status) {
        StoreKaspiPaymentStatus.authorized ||
        StoreKaspiPaymentStatus.captured => PaymentStatus.paid,
        StoreKaspiPaymentStatus.pending ||
        StoreKaspiPaymentStatus.requiresMore => PaymentStatus.pending,
        _ => PaymentStatus.failed,
      };
}
