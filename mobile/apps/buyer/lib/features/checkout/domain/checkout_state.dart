import 'kaspi_payment.dart';
import 'order_summary.dart';
import 'shipping_option.dart';

/// Шаги чекаута: адрес → способ получения → оплата → готово (подтверждение).
enum CheckoutStep { address, delivery, payment, done }

/// Состояние чекаута: текущий шаг, способы получения и выбранный способ,
/// состояние Kaspi-оплаты, итог оформленного заказа и флаг сетевой операции
/// (блокирует кнопки).
class CheckoutState {
  const CheckoutState({
    this.step = CheckoutStep.address,
    this.options = const [],
    this.selectedOptionId,
    this.payment,
    this.placedOrder,
    this.isSubmitting = false,
  });

  final CheckoutStep step;
  final List<ShippingOption> options;
  final String? selectedOptionId;
  final KaspiPayment? payment;
  final OrderSummary? placedOrder;
  final bool isSubmitting;

  CheckoutState copyWith({
    CheckoutStep? step,
    List<ShippingOption>? options,
    String? selectedOptionId,
    KaspiPayment? payment,
    OrderSummary? placedOrder,
    bool? isSubmitting,
  }) {
    return CheckoutState(
      step: step ?? this.step,
      options: options ?? this.options,
      selectedOptionId: selectedOptionId ?? this.selectedOptionId,
      payment: payment ?? this.payment,
      placedOrder: placedOrder ?? this.placedOrder,
      isSubmitting: isSubmitting ?? this.isSubmitting,
    );
  }
}
