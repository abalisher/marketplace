import 'package:api_client/api_client.dart'
    show
        MedusaStoreApi,
        StoreCartsIdCustomerRequestBody,
        StoreCartsIdRequestBody,
        StoreKaspiPayment,
        StoreKaspiPaymentStatus,
        StorePlaceOrder,
        StoreShippingOptionListResponseShippingOptions,
        UpdateCartDataShippingAddressSealedCreateAddress;

import '../domain/checkout_address.dart';
import '../domain/kaspi_payment.dart';
import '../domain/order_summary.dart';
import '../domain/shipping_option.dart';
import 'checkout_repository.dart';

/// Реализация [CheckoutRepository] поверх Medusa Store API. Токен сессии
/// покупателя добавляет общий Dio-интерцептор (`core`), поэтому привязка
/// покупателя к корзине идёт от его имени.
class MedusaCheckoutRepository implements CheckoutRepository {
  MedusaCheckoutRepository(this._api, this._publishableKey);

  final MedusaStoreApi _api;
  final String _publishableKey;

  @override
  Future<void> associateCustomer(String cartId) async {
    await _api.carts.postCartsIdCustomer(
      id: cartId,
      xPublishableApiKey: _publishableKey,
      body: const StoreCartsIdCustomerRequestBody(),
    );
  }

  @override
  Future<void> setShippingAddress({
    required String cartId,
    required String email,
    required CheckoutAddress address,
  }) async {
    await _api.carts.postCartsId(
      id: cartId,
      xPublishableApiKey: _publishableKey,
      body: StoreCartsIdRequestBody(
        email: email,
        shippingAddress: UpdateCartDataShippingAddressSealedCreateAddress(
          customerId: null,
          company: null,
          firstName: address.firstName,
          lastName: address.lastName,
          address1: address.address1,
          address2: null,
          city: address.city,
          countryCode: address.countryCode,
          province: address.province,
          postalCode: address.postalCode,
          phone: address.phone,
          metadata: null,
        ),
      ),
    );
  }

  @override
  Future<List<ShippingOption>> fetchShippingOptions(String cartId) async {
    final response = await _api.shippingOptions.getShippingOptions(
      xPublishableApiKey: _publishableKey,
      cartId: cartId,
    );
    return response.shippingOptions.map(_toShippingOption).toList();
  }

  @override
  Future<void> setShippingMethod({
    required String cartId,
    required String optionId,
  }) async {
    await _api.carts.postCartsIdShippingMethods(
      id: cartId,
      xPublishableApiKey: _publishableKey,
      body: {'option_id': optionId},
    );
  }

  @override
  Future<KaspiPayment> initKaspiPayment(String cartId) async {
    final response = await _api.payment.postCartsIdPaymentKaspi(
      id: cartId,
      xPublishableApiKey: _publishableKey,
    );
    return _toKaspiPayment(response.payment);
  }

  @override
  Future<KaspiPayment> pollKaspiPayment(String cartId) async {
    final response = await _api.payment.getCartsIdPaymentKaspi(
      id: cartId,
      xPublishableApiKey: _publishableKey,
    );
    return _toKaspiPayment(response.payment);
  }

  @override
  Future<OrderSummary> placeOrder(String cartId) async {
    // Единственный способ получения после пивота 2026-07-22 — доставка (бэкенд
    // принимает только delivery_method=delivery, оно же default). Оформление
    // требует авторизованной предоплаты — вызывать после Kaspi authorized.
    final placed = await _api.orders.postOrders(
      xPublishableApiKey: _publishableKey,
      body: StorePlaceOrder(cartId: cartId),
    );
    final orderId = placed.order.id ?? '';
    final response = await _api.orders.getOrdersId(
      id: orderId,
      xPublishableApiKey: _publishableKey,
    );
    final order = response.order;
    final displayId = order.displayId;
    return OrderSummary(
      orderId: order.id,
      displayNumber: displayId == null ? order.id : '#${displayId.toInt()}',
      total: order.total,
      currencyCode: order.currencyCode,
    );
  }

  KaspiPayment _toKaspiPayment(StoreKaspiPayment payment) {
    final status = switch (payment.status) {
      StoreKaspiPaymentStatus.authorized ||
      StoreKaspiPaymentStatus.captured => KaspiPaymentStatus.authorized,
      StoreKaspiPaymentStatus.pending ||
      StoreKaspiPaymentStatus.requiresMore => KaspiPaymentStatus.pending,
      _ => KaspiPaymentStatus.failed,
    };
    return KaspiPayment(
      status: status,
      qrPayload: payment.qrPayload,
      paymentUrl: payment.paymentUrl,
    );
  }

  ShippingOption _toShippingOption(
    StoreShippingOptionListResponseShippingOptions option,
  ) {
    // Цену берём из рассчитанной бэкендом (`calculatedPrice`) — с учётом региона
    // и налогов; `amount` как запас, если расчёт недоступен.
    final calculated = option.calculatedPrice;
    return ShippingOption(
      id: option.id,
      name: option.name,
      amount: calculated.calculatedAmount,
      currencyCode: calculated.currencyCode,
    );
  }
}
