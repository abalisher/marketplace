import 'package:core/auth/auth_controller.dart';
import 'package:core/auth/auth_customer.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_kit/app_theme.dart';

import 'package:marketplace_buyer/features/cart/domain/cart.dart';
import 'package:marketplace_buyer/features/cart/providers/cart_controller.dart';
import 'package:marketplace_buyer/features/checkout/data/checkout_repository.dart';
import 'package:marketplace_buyer/features/checkout/domain/checkout_address.dart';
import 'package:marketplace_buyer/features/checkout/domain/kaspi_payment.dart';
import 'package:marketplace_buyer/features/checkout/domain/order_summary.dart';
import 'package:marketplace_buyer/features/checkout/domain/shipping_option.dart';
import 'package:marketplace_buyer/features/checkout/providers/checkout_repository_provider.dart';
import 'package:marketplace_buyer/features/checkout/screens/checkout_screen.dart';

class _SeededAuthController extends AuthController {
  @override
  Future<AuthCustomer?> build() async =>
      const AuthCustomer(id: 'cus_1', email: 'buyer@mail.kz');
}

class _SeededCartController extends CartController {
  @override
  Future<Cart?> build() async =>
      const Cart(id: 'cart_1', lines: [], total: 0, currencyCode: 'kzt');
}

/// Фейк чекаута: записывает вызовы и отдаёт заданные способы получения,
/// Kaspi-статус и итог заказа. [paymentStatus] управляет исходом опроса оплаты.
class _FakeCheckoutRepository implements CheckoutRepository {
  _FakeCheckoutRepository(
    this._options, {
    this.paymentStatus = KaspiPaymentStatus.authorized,
  });

  final List<ShippingOption> _options;
  final KaspiPaymentStatus paymentStatus;
  int associateCalls = 0;
  CheckoutAddress? savedAddress;
  String? selectedMethodId;
  int placeOrderCalls = 0;

  @override
  Future<void> associateCustomer(String cartId) async => associateCalls++;

  @override
  Future<void> setShippingAddress({
    required String cartId,
    required String email,
    required CheckoutAddress address,
  }) async => savedAddress = address;

  @override
  Future<List<ShippingOption>> fetchShippingOptions(String cartId) async =>
      _options;

  @override
  Future<void> setShippingMethod({
    required String cartId,
    required String optionId,
  }) async => selectedMethodId = optionId;

  @override
  Future<KaspiPayment> initKaspiPayment(String cartId) async =>
      const KaspiPayment(
        status: KaspiPaymentStatus.pending,
        qrPayload: 'qr_payload_data',
        paymentUrl: 'https://kaspi.kz/pay/xyz',
      );

  @override
  Future<KaspiPayment> pollKaspiPayment(String cartId) async =>
      KaspiPayment(status: paymentStatus);

  @override
  Future<OrderSummary> placeOrder(String cartId) async {
    placeOrderCalls++;
    return const OrderSummary(
      orderId: 'order_1',
      displayNumber: '#42',
      total: 3980,
      currencyCode: 'kzt',
    );
  }
}

Future<void> _pump(WidgetTester tester, _FakeCheckoutRepository repo) async {
  await tester.binding.setSurfaceSize(const Size(600, 2400));
  addTearDown(() => tester.binding.setSurfaceSize(null));
  await tester.pumpWidget(
    ProviderScope(
      overrides: [
        authControllerProvider.overrideWith(_SeededAuthController.new),
        cartControllerProvider.overrideWith(_SeededCartController.new),
        checkoutRepositoryProvider.overrideWithValue(repo),
      ],
      child: MaterialApp(theme: buildAppTheme(), home: const CheckoutScreen()),
    ),
  );
  await tester.pumpAndSettle();
}

Future<void> _fillAddress(WidgetTester tester) async {
  final fields = find.byType(TextFormField);
  await tester.enterText(fields.at(0), 'Иван'); // имя
  await tester.enterText(fields.at(1), 'Петров'); // фамилия
  await tester.enterText(fields.at(2), 'ул. Абая 1'); // адрес
  await tester.enterText(fields.at(3), 'Астана'); // город
  await tester.enterText(fields.at(4), '010000'); // индекс
  // fields.at(5) — область (необязательно)
  await tester.enterText(fields.at(6), '+77010000000'); // телефон
}

void main() {
  final options = const [
    ShippingOption(
      id: 'so_del',
      name: 'Доставка по Астане',
      amount: 2000,
      currencyCode: 'kzt',
    ),
    ShippingOption(
      id: 'so_pick',
      name: 'Самовывоз',
      amount: 0,
      currencyCode: 'kzt',
    ),
  ];

  testWidgets('адрес → загрузка способов получения', (tester) async {
    final repo = _FakeCheckoutRepository(options);
    await _pump(tester, repo);

    expect(find.text('Адрес доставки'), findsOneWidget);

    await _fillAddress(tester);
    await tester.tap(find.widgetWithText(ElevatedButton, 'Далее'));
    await tester.pumpAndSettle();

    expect(repo.associateCalls, 1);
    expect(repo.savedAddress?.city, 'Астана');
    expect(find.text('Способ получения'), findsOneWidget);
    expect(find.text('Доставка по Астане'), findsOneWidget);
    expect(find.text('Самовывоз'), findsOneWidget);
  });

  testWidgets('способ получения → оплата Kaspi', (tester) async {
    final repo = _FakeCheckoutRepository(options);
    await _pump(tester, repo);
    await _fillAddress(tester);
    await tester.tap(find.widgetWithText(ElevatedButton, 'Далее'));
    await tester.pumpAndSettle();

    // По умолчанию выбран первый; выберем самовывоз.
    await tester.tap(find.text('Самовывоз'));
    await tester.pumpAndSettle();
    await tester.tap(find.widgetWithText(ElevatedButton, 'К оплате'));
    await tester.pumpAndSettle();

    expect(repo.selectedMethodId, 'so_pick');
    // Перешли на шаг оплаты. Платить предлагаем КНОПКОЙ, а не QR: покупатель
    // держит этот экран в руке, сканировать его нечем — ссылка Kaspi
    // универсальная и открывает приложение прямо отсюда.
    expect(find.text('Оплата'), findsOneWidget);
    expect(
      find.widgetWithText(ElevatedButton, 'Оплатить в Kaspi'),
      findsOneWidget,
    );

    // QR остаётся, но свёрнутым — он нужен для оплаты с СОСЕДНЕГО устройства.
    expect(find.text('Оплатить с другого устройства'), findsOneWidget);
    expect(find.text('Скрыть QR-код'), findsNothing);

    await tester.tap(find.text('Оплатить с другого устройства'));
    await tester.pumpAndSettle();
    expect(find.text('Скрыть QR-код'), findsOneWidget);
    expect(
      find.text('Отсканируйте код в приложении Kaspi на другом устройстве'),
      findsOneWidget,
    );
  });

  testWidgets('оплата authorized → заказ оформлен, подтверждение', (
    tester,
  ) async {
    final repo = _FakeCheckoutRepository(options);
    await _pump(tester, repo);
    await _fillAddress(tester);
    await tester.tap(find.widgetWithText(ElevatedButton, 'Далее'));
    await tester.pumpAndSettle();
    await tester.tap(find.widgetWithText(ElevatedButton, 'К оплате'));
    await tester.pumpAndSettle();

    await tester.tap(find.widgetWithText(ElevatedButton, 'Проверить оплату'));
    await tester.pumpAndSettle();

    expect(repo.placeOrderCalls, 1);
    expect(find.text('Заказ оформлен'), findsOneWidget);
    expect(find.textContaining('#42'), findsOneWidget);
  });

  testWidgets('оплата не поступила → остаёмся на шаге оплаты', (tester) async {
    final repo = _FakeCheckoutRepository(
      options,
      paymentStatus: KaspiPaymentStatus.pending,
    );
    await _pump(tester, repo);
    await _fillAddress(tester);
    await tester.tap(find.widgetWithText(ElevatedButton, 'Далее'));
    await tester.pumpAndSettle();
    await tester.tap(find.widgetWithText(ElevatedButton, 'К оплате'));
    await tester.pumpAndSettle();
    await tester.tap(find.widgetWithText(ElevatedButton, 'Проверить оплату'));
    await tester.pumpAndSettle();

    expect(repo.placeOrderCalls, 0);
    expect(find.text('Оплата ещё не поступила'), findsOneWidget);
  });

  testWidgets('пустой адрес показывает ошибки валидации', (tester) async {
    final repo = _FakeCheckoutRepository(options);
    await _pump(tester, repo);

    await tester.tap(find.widgetWithText(ElevatedButton, 'Далее'));
    await tester.pumpAndSettle();

    expect(find.text('Обязательное поле'), findsWidgets);
    expect(repo.savedAddress, isNull);
  });
}
