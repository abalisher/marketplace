import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../cart/providers/cart_controller.dart';
import '../data/checkout_repository.dart';
import '../domain/checkout_address.dart';
import '../domain/checkout_state.dart';
import 'checkout_repository_provider.dart';

/// Контроллер чекаута: ведёт шаги подготовки корзины к оформлению (адрес →
/// способ получения) через [CheckoutRepository]. Логику из виджета держим
/// здесь; ошибки сетевых операций пробрасываются экрану для показа сообщения,
/// флаг [CheckoutState.isSubmitting] блокирует кнопки.
class CheckoutController extends Notifier<CheckoutState> {
  @override
  CheckoutState build() => const CheckoutState();

  CheckoutRepository get _repository => ref.read(checkoutRepositoryProvider);

  /// Привязывает покупателя, сохраняет адрес и загружает способы получения,
  /// переводя чекаут на шаг выбора способа.
  Future<void> submitAddress({
    required String cartId,
    required String email,
    required CheckoutAddress address,
  }) async {
    state = state.copyWith(isSubmitting: true);
    try {
      await _repository.associateCustomer(cartId);
      await _repository.setShippingAddress(
        cartId: cartId,
        email: email,
        address: address,
      );
      final options = await _repository.fetchShippingOptions(cartId);
      state = state.copyWith(
        step: CheckoutStep.delivery,
        options: options,
        selectedOptionId: options.isEmpty ? null : options.first.id,
        isSubmitting: false,
      );
    } catch (_) {
      state = state.copyWith(isSubmitting: false);
      rethrow;
    }
  }

  /// Выбирает способ получения (локально, до подтверждения).
  void selectOption(String optionId) {
    state = state.copyWith(selectedOptionId: optionId);
  }

  /// Сохраняет выбранный способ получения и переходит к оплате: инициализирует
  /// Kaspi-сессию (QR/ссылка) и открывает шаг оплаты.
  Future<void> confirmShippingMethod(String cartId) async {
    final optionId = state.selectedOptionId;
    if (optionId == null) return;
    state = state.copyWith(isSubmitting: true);
    try {
      await _repository.setShippingMethod(cartId: cartId, optionId: optionId);
      final payment = await _repository.initKaspiPayment(cartId);
      state = state.copyWith(
        step: CheckoutStep.payment,
        payment: payment,
        isSubmitting: false,
      );
    } catch (_) {
      state = state.copyWith(isSubmitting: false);
      rethrow;
    }
  }

  /// Опрашивает статус оплаты; при `authorized` оформляет заказ и переходит на
  /// шаг подтверждения (корзина сбрасывается). Иначе обновляет статус платежа.
  /// Возвращает true, если заказ оформлен.
  Future<bool> refreshPaymentAndPlace(String cartId) async {
    state = state.copyWith(isSubmitting: true);
    try {
      final payment = await _repository.pollKaspiPayment(cartId);
      if (!payment.isAuthorized) {
        state = state.copyWith(payment: payment, isSubmitting: false);
        return false;
      }
      final order = await _repository.placeOrder(cartId);
      state = state.copyWith(
        step: CheckoutStep.done,
        payment: payment,
        placedOrder: order,
        isSubmitting: false,
      );
      // Корзина оформлена на бэкенде — сбрасываем локальное состояние/бейдж.
      ref.invalidate(cartControllerProvider);
      return true;
    } catch (_) {
      state = state.copyWith(isSubmitting: false);
      rethrow;
    }
  }
}

/// Провайдер контроллера чекаута.
final checkoutControllerProvider =
    NotifierProvider<CheckoutController, CheckoutState>(CheckoutController.new);
