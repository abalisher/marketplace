import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_kit/app_error_view.dart';
import 'package:ui_kit/app_theme.dart';

import 'package:marketplace_buyer/features/orders/data/orders_repository.dart';
import 'package:marketplace_buyer/features/orders/domain/order_detail.dart';
import 'package:marketplace_buyer/features/orders/domain/order_document.dart';
import 'package:marketplace_buyer/features/orders/domain/order_line.dart';
import 'package:marketplace_buyer/features/orders/domain/order_list_item.dart';
import 'package:marketplace_buyer/features/orders/providers/orders_repository_provider.dart';
import 'package:marketplace_buyer/features/orders/screens/order_detail_screen.dart';
import 'package:marketplace_buyer/features/cabinet/screens/cabinet_orders_screen.dart';

/// Фейк заказов: отдаёт заданные список/детали либо бросает ошибку. Экраны
/// тестируются на границе [OrdersRepository], без сети/DTO.
class _FakeOrdersRepository implements OrdersRepository {
  _FakeOrdersRepository({
    this.orders = const [],
    this.detail,
    this.fail = false,
  });

  final List<OrderListItem> orders;
  final OrderDetail? detail;
  final bool fail;

  @override
  Future<List<OrderListItem>> fetchOrders() async {
    if (fail) throw Exception("boom");
    return orders;
  }

  @override
  Future<OrderDetail> fetchOrder(String orderId) async {
    if (fail || detail == null) throw Exception("boom");
    return detail!;
  }
}

Widget _harness(Widget child, OrdersRepository repo) {
  return ProviderScope(
    overrides: [ordersRepositoryProvider.overrideWithValue(repo)],
    child: MaterialApp(theme: buildAppTheme(), home: child),
  );
}

void main() {
  final orders = [
    OrderListItem(
      id: "o1",
      displayNumber: "#101",
      total: 4980,
      currencyCode: "kzt",
      createdAt: DateTime(2026, 7, 20),
      itemCount: 1,
      lifecycleStatus: "delivered",
    ),
    OrderListItem(
      id: "o2",
      displayNumber: "#102",
      total: 1500,
      currencyCode: "kzt",
      createdAt: DateTime(2026, 7, 21),
      itemCount: 2,
      lifecycleStatus: "in_delivery",
      // Слот доставки в строке списка (T5.6a): когда ждать машину, видно без
      // открытия заказа.
      deliveryDate: DateTime(2026, 9, 6),
      deliveryWindow: "day",
    ),
  ];

  testWidgets("список показывает заказы: номер, позиции·сумма, статус", (
    tester,
  ) async {
    await tester.pumpWidget(
      _harness(
        const CabinetOrdersScreen(),
        _FakeOrdersRepository(orders: orders),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text("#101"), findsOneWidget);
    expect(find.text("#102"), findsOneWidget);
    // Мета: склонение позиций + сумма тенге (разряды пробелом) в одной строке.
    expect(find.text("1 позиция · 4 980 ₸"), findsOneWidget);
    expect(find.text("2 позиции · 1 500 ₸"), findsOneWidget);
    // Статус-бейджи локализованы.
    expect(find.text("Доставлен"), findsOneWidget);
    expect(find.text("Жеткізілуде"), findsNothing); // ru-локаль по умолчанию
    expect(find.text("В доставке"), findsOneWidget);
  });

  testWidgets("слот доставки идёт строкой меты, а без слота меты прежние", (
    tester,
  ) async {
    await tester.pumpWidget(
      _harness(
        const CabinetOrdersScreen(),
        _FakeOrdersRepository(orders: orders),
      ),
    );
    await tester.pumpAndSettle();

    // Слот — своя строка карточки, мета не меняется.
    expect(find.text("Доставка: 6 сент., 13:00–17:00"), findsOneWidget);
    expect(find.text("2 позиции · 1 500 ₸"), findsOneWidget);
    // Заказ без слота (оформлен до T5.6) — строки доставки нет.
    expect(find.text("1 позиция · 4 980 ₸"), findsOneWidget);
  });

  testWidgets("фильтр «Активные» скрывает доставленные", (tester) async {
    await tester.pumpWidget(
      _harness(
        const CabinetOrdersScreen(),
        _FakeOrdersRepository(orders: orders),
      ),
    );
    await tester.pumpAndSettle();

    await tester.tap(find.text("Активные"));
    await tester.pumpAndSettle();

    // Остаётся только активный #102 (in_delivery); доставленный #101 скрыт.
    expect(find.text("#102"), findsOneWidget);
    expect(find.text("#101"), findsNothing);
  });

  testWidgets("пустой список показывает сообщение", (tester) async {
    await tester.pumpWidget(
      _harness(const CabinetOrdersScreen(), _FakeOrdersRepository()),
    );
    await tester.pumpAndSettle();

    expect(find.text("У вас пока нет заказов"), findsOneWidget);
  });

  testWidgets("ошибка списка показывает AppErrorView", (tester) async {
    await tester.pumpWidget(
      _harness(const CabinetOrdersScreen(), _FakeOrdersRepository(fail: true)),
    );
    await tester.pumpAndSettle();

    expect(find.byType(AppErrorView), findsOneWidget);
    expect(find.text("Не удалось загрузить заказы"), findsOneWidget);
  });

  testWidgets("детали показывают локализованный статус, строки и итог", (
    tester,
  ) async {
    final detail = OrderDetail(
      id: "o1",
      displayNumber: "#101",
      total: 4980,
      currencyCode: "kzt",
      lifecycleStatus: "delivered",
      deliveryCode: "1234",
      deliveryDate: DateTime(2026, 9, 6),
      deliveryWindow: "day",
      lines: const [
        OrderLine(
          title: "Цемент М500",
          quantity: 2,
          total: 3980,
          currencyCode: "kzt",
        ),
      ],
      documents: const [
        OrderDocument(
          type: "invoice",
          number: "INV-2026-000101",
          fileUrl: "https://files.example/inv.pdf",
        ),
      ],
    );
    await tester.pumpWidget(
      _harness(
        const OrderDetailScreen(orderId: "o1"),
        _FakeOrdersRepository(detail: detail),
      ),
    );
    await tester.pumpAndSettle();

    // Статус «Доставлен» встречается и в бейдже, и как стадия таймлайна.
    expect(find.text("Доставлен"), findsWidgets);
    // Код получения с разрядкой из AppOrderStatusBlock.
    expect(find.text("1 2 3 4"), findsOneWidget);
    // Слот доставки: подпись и окно приезда (T5.6a).
    expect(find.text("Доставка"), findsOneWidget);
    expect(find.text("6 сент., 13:00–17:00"), findsOneWidget);
    // Состав + итог tenge.
    expect(find.text("Цемент М500 × 2"), findsOneWidget);
    expect(find.text("3 980 ₸"), findsOneWidget);
    expect(find.text("4 980 ₸"), findsOneWidget);
    // Документ-основание: тип, номер, PDF.
    expect(find.text("Счёт на оплату"), findsOneWidget);
    expect(find.text("INV-2026-000101"), findsOneWidget);
    expect(find.text("PDF"), findsOneWidget);
  });
}
