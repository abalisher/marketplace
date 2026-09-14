import 'package:core/auth/auth_controller.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:ui_kit/app_card.dart';
import 'package:ui_kit/app_color_tokens.dart';
import 'package:ui_kit/app_kaspi_pay_block.dart';
import 'package:ui_kit/app_primary_button.dart';
import 'package:ui_kit/app_spacing.dart';
import 'package:ui_kit/app_typography.dart';
import 'package:ui_kit/app_text_field.dart';

import '../../../l10n/messages.dart';
import '../../../l10n/messages_provider.dart';
import '../../../shared/kaspi_pay_actions.dart';
import '../../../shared/price_label.dart';
import '../../cart/providers/cart_controller.dart';
import '../domain/checkout_address.dart';
import '../domain/checkout_state.dart';
import '../domain/order_summary.dart';
import '../providers/checkout_controller.dart';
import '../widgets/shipping_option_tile.dart';

/// Экран оформления заказа, шаг 1 (итерация 6a): адрес доставки → выбор способа
/// получения. Данные сохраняются в корзине через контроллер; оплата и
/// завершение заказа — итерация 6b (кнопка «К оплате» пока заглушка). Собран
/// только из ui_kit; бизнес-логика — в контроллере.
class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({super.key});

  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen>
    with WidgetsBindingObserver {
  final _formKey = GlobalKey<FormState>();
  final _firstName = TextEditingController();
  final _lastName = TextEditingController();
  final _address1 = TextEditingController();
  final _city = TextEditingController();
  final _postalCode = TextEditingController();
  final _province = TextEditingController();
  final _phone = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    // Префилл из профиля покупателя (чекаут доступен только авторизованному).
    final customer = ref.read(authControllerProvider).valueOrNull;
    if (customer != null) {
      _firstName.text = customer.firstName ?? '';
      _lastName.text = customer.lastName ?? '';
      _phone.text = customer.phone ?? '';
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _firstName.dispose();
    _lastName.dispose();
    _address1.dispose();
    _city.dispose();
    _postalCode.dispose();
    _province.dispose();
    _phone.dispose();
    super.dispose();
  }

  /// Возврат в приложение с шага оплаты — самый вероятный момент «уже
  /// оплатил»: покупатель уходил в Kaspi по ссылке. Спрашиваем статус молча —
  /// в отличие от кнопки, отсутствие оплаты здесь не новость и не повод для
  /// всплывашки.
  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state != AppLifecycleState.resumed) {
      return;
    }
    final checkout = ref.read(checkoutControllerProvider);
    if (checkout.step != CheckoutStep.payment || checkout.isSubmitting) {
      return;
    }
    final cartId = ref.read(cartControllerProvider).valueOrNull?.id;
    if (cartId == null) {
      return;
    }
    ref
        .read(checkoutControllerProvider.notifier)
        .refreshPaymentAndPlace(cartId)
        .catchError((_) => false);
  }

  String? _required(String? value, Messages messages) =>
      (value == null || value.trim().isEmpty) ? messages.fieldRequired : null;

  Future<void> _submitAddress(
    Messages messages,
    String cartId,
    String email,
  ) async {
    if (!_formKey.currentState!.validate()) return;
    final messenger = ScaffoldMessenger.of(context);
    try {
      await ref
          .read(checkoutControllerProvider.notifier)
          .submitAddress(
            cartId: cartId,
            email: email,
            address: CheckoutAddress(
              firstName: _firstName.text.trim(),
              lastName: _lastName.text.trim(),
              address1: _address1.text.trim(),
              city: _city.text.trim(),
              postalCode: _postalCode.text.trim(),
              phone: _phone.text.trim(),
              province: _province.text.trim().isEmpty
                  ? null
                  : _province.text.trim(),
            ),
          );
    } catch (_) {
      messenger
        ..hideCurrentSnackBar()
        ..showSnackBar(SnackBar(content: Text(messages.checkoutError)));
    }
  }

  Future<void> _toPayment(Messages messages, String cartId) async {
    final messenger = ScaffoldMessenger.of(context);
    try {
      await ref
          .read(checkoutControllerProvider.notifier)
          .confirmShippingMethod(cartId);
    } catch (_) {
      messenger
        ..hideCurrentSnackBar()
        ..showSnackBar(SnackBar(content: Text(messages.checkoutError)));
    }
  }

  Future<void> _checkPayment(Messages messages, String cartId) async {
    final messenger = ScaffoldMessenger.of(context);
    try {
      final placed = await ref
          .read(checkoutControllerProvider.notifier)
          .refreshPaymentAndPlace(cartId);
      if (!placed) {
        messenger
          ..hideCurrentSnackBar()
          ..showSnackBar(SnackBar(content: Text(messages.paymentPending)));
      }
    } catch (_) {
      messenger
        ..hideCurrentSnackBar()
        ..showSnackBar(SnackBar(content: Text(messages.checkoutError)));
    }
  }

  @override
  Widget build(BuildContext context) {
    final messages = ref.watch(messagesProvider);
    final cart = ref.watch(cartControllerProvider).valueOrNull;
    final email = ref.watch(authControllerProvider).valueOrNull?.email;
    final state = ref.watch(checkoutControllerProvider);

    // На шаге подтверждения корзина уже сброшена — экран не должен исчезать.
    if (state.step == CheckoutStep.done) {
      return Scaffold(
        appBar: AppBar(
          title: Text(messages.checkoutTitle),
          automaticallyImplyLeading: false,
        ),
        body: _doneStep(messages, state.placedOrder),
      );
    }

    final cartId = cart?.id;
    return Scaffold(
      appBar: AppBar(title: Text(messages.checkoutTitle)),
      // Профиль входа по номеру (T10.7) без email: ядровое оформление требует
      // email, и путь покупателя тут — чат (оформление ведёт ассистент).
      body: (cartId == null || email == null)
          ? Center(
              child: Text(
                cartId == null
                    ? messages.cartEmpty
                    : messages.checkoutNeedsEmail,
                style: AppTypography.bodyLarge,
                textAlign: TextAlign.center,
              ),
            )
          : switch (state.step) {
              CheckoutStep.address => _addressStep(
                messages,
                cartId,
                email,
                state,
              ),
              CheckoutStep.delivery => _deliveryStep(messages, cartId, state),
              CheckoutStep.payment => _paymentStep(messages, cartId, state),
              CheckoutStep.done => const SizedBox.shrink(),
            },
    );
  }

  Widget _addressStep(
    Messages messages,
    String cartId,
    String email,
    CheckoutState state,
  ) {
    return Form(
      key: _formKey,
      child: ListView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        children: [
          Text(messages.deliveryAddressTitle, style: AppTypography.titleMedium),
          const SizedBox(height: AppSpacing.lg),
          AppTextField(
            controller: _firstName,
            label: messages.firstNameLabel,
            textInputAction: TextInputAction.next,
            enabled: !state.isSubmitting,
            validator: (v) => _required(v, messages),
          ),
          const SizedBox(height: AppSpacing.lg),
          AppTextField(
            controller: _lastName,
            label: messages.lastNameLabel,
            textInputAction: TextInputAction.next,
            enabled: !state.isSubmitting,
            validator: (v) => _required(v, messages),
          ),
          const SizedBox(height: AppSpacing.lg),
          AppTextField(
            controller: _address1,
            label: messages.addressLine1Label,
            textInputAction: TextInputAction.next,
            enabled: !state.isSubmitting,
            validator: (v) => _required(v, messages),
          ),
          const SizedBox(height: AppSpacing.lg),
          AppTextField(
            controller: _city,
            label: messages.cityLabel,
            textInputAction: TextInputAction.next,
            enabled: !state.isSubmitting,
            validator: (v) => _required(v, messages),
          ),
          const SizedBox(height: AppSpacing.lg),
          AppTextField(
            controller: _postalCode,
            label: messages.postalCodeLabel,
            textInputAction: TextInputAction.next,
            enabled: !state.isSubmitting,
            validator: (v) => _required(v, messages),
          ),
          const SizedBox(height: AppSpacing.lg),
          AppTextField(
            controller: _province,
            label: messages.provinceLabel,
            textInputAction: TextInputAction.next,
            enabled: !state.isSubmitting,
          ),
          const SizedBox(height: AppSpacing.lg),
          AppTextField(
            controller: _phone,
            label: messages.phoneLabel,
            keyboardType: TextInputType.phone,
            textInputAction: TextInputAction.done,
            enabled: !state.isSubmitting,
            validator: (v) => _required(v, messages),
          ),
          const SizedBox(height: AppSpacing.xl),
          AppPrimaryButton(
            label: messages.continueToDelivery,
            onPressed: state.isSubmitting
                ? null
                : () => _submitAddress(messages, cartId, email),
          ),
        ],
      ),
    );
  }

  Widget _deliveryStep(Messages messages, String cartId, CheckoutState state) {
    if (state.options.isEmpty) {
      return Center(
        child: Text(messages.noShippingOptions, style: AppTypography.bodyLarge),
      );
    }
    return Column(
      children: [
        Expanded(
          child: ListView.separated(
            padding: const EdgeInsets.all(AppSpacing.lg),
            itemCount: state.options.length + 1,
            separatorBuilder: (_, _) => const SizedBox(height: AppSpacing.md),
            itemBuilder: (context, index) {
              if (index == 0) {
                return Text(
                  messages.deliveryMethodTitle,
                  style: AppTypography.titleMedium,
                );
              }
              final option = state.options[index - 1];
              return ShippingOptionTile(
                option: option,
                selected: option.id == state.selectedOptionId,
                onTap: state.isSubmitting
                    ? () {}
                    : () => ref
                          .read(checkoutControllerProvider.notifier)
                          .selectOption(option.id),
              );
            },
          ),
        ),
        SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: AppPrimaryButton(
              label: messages.continueToPayment,
              onPressed: state.isSubmitting
                  ? null
                  : () => _toPayment(messages, cartId),
            ),
          ),
        ),
      ],
    );
  }

  Widget _paymentStep(Messages messages, String cartId, CheckoutState state) {
    final payment = state.payment;
    final cartTotal = ref.watch(cartControllerProvider).valueOrNull?.total;
    final cartCurrency = ref
        .watch(cartControllerProvider)
        .valueOrNull
        ?.currencyCode;
    return Column(
      children: [
        Expanded(
          child: ListView(
            padding: const EdgeInsets.all(AppSpacing.lg),
            children: [
              Text(messages.paymentTitle, style: AppTypography.titleMedium),
              const SizedBox(height: AppSpacing.lg),
              if (cartTotal != null)
                AppCard(
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        messages.cartTotal,
                        style: AppTypography.titleMedium,
                      ),
                      Text(
                        formatPriceLabel(
                          amount: cartTotal,
                          currencyCode: cartCurrency,
                          unavailableLabel: messages.priceUnavailable,
                        ),
                        style: AppTypography.titleMedium,
                      ),
                    ],
                  ),
                ),
              if (payment != null) ...[
                const SizedBox(height: AppSpacing.md),
                AppKaspiPayBlock(
                  qrData: payment.qrPayload,
                  statusLabel: messages.attachmentAwaitingPayment,
                  statusColor: AppColorTokens.of(context).warning,
                  payLabel: (payment.paymentUrl?.isNotEmpty ?? false)
                      ? messages.kaspiPayInApp
                      : null,
                  onPay: () => KaspiPayActions.openInKaspi(
                    context,
                    messages,
                    payment.paymentUrl,
                  ),
                  copyLabel: (payment.paymentUrl?.isNotEmpty ?? false)
                      ? messages.kaspiCopyLink
                      : null,
                  onCopy: () => KaspiPayActions.copyLink(
                    context,
                    messages,
                    payment.paymentUrl,
                  ),
                  showQrLabel: messages.kaspiShowQr,
                  hideQrLabel: messages.kaspiHideQr,
                  qrHint: messages.kaspiScanHint,
                ),
              ],
            ],
          ),
        ),
        SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: AppPrimaryButton(
              label: messages.checkPayment,
              onPressed: state.isSubmitting
                  ? null
                  : () => _checkPayment(messages, cartId),
            ),
          ),
        ),
      ],
    );
  }

  Widget _doneStep(Messages messages, OrderSummary? order) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.check_circle,
              color: AppColorTokens.of(context).success,
              size: 64,
            ),
            const SizedBox(height: AppSpacing.lg),
            Text(
              messages.orderPlaced,
              style: AppTypography.headingMedium,
              textAlign: TextAlign.center,
            ),
            if (order != null) ...[
              const SizedBox(height: AppSpacing.sm),
              Text(
                '${messages.orderNumber} ${order.displayNumber}',
                style: AppTypography.bodyLarge,
              ),
              const SizedBox(height: AppSpacing.xs),
              Text(
                formatPriceLabel(
                  amount: order.total,
                  currencyCode: order.currencyCode,
                  unavailableLabel: messages.priceUnavailable,
                ),
                style: AppTypography.titleMedium,
              ),
            ],
            const SizedBox(height: AppSpacing.xl),
            AppPrimaryButton(
              label: messages.backToCatalog,
              onPressed: () => context.go('/'),
            ),
          ],
        ),
      ),
    );
  }
}
