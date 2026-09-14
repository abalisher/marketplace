import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_kit/app_error_view.dart';
import 'package:ui_kit/app_theme.dart';

import 'package:marketplace_buyer/features/cabinet/data/documents_repository.dart';
import 'package:marketplace_buyer/features/cabinet/data/profile_repository.dart';
import 'package:marketplace_buyer/features/cabinet/domain/buyer_document.dart';
import 'package:marketplace_buyer/features/cabinet/domain/buyer_profile.dart';
import 'package:marketplace_buyer/features/cabinet/providers/documents_repository_provider.dart';
import 'package:marketplace_buyer/features/cabinet/providers/profile_repository_provider.dart';
import 'package:marketplace_buyer/features/cabinet/screens/cabinet_cart_screen.dart';
import 'package:marketplace_buyer/features/cabinet/screens/cabinet_documents_screen.dart';
import 'package:marketplace_buyer/features/cabinet/screens/cabinet_profile_screen.dart';
import 'package:marketplace_buyer/features/cart/data/cart_repository.dart';
import 'package:marketplace_buyer/features/cart/domain/cart.dart';
import 'package:marketplace_buyer/features/cart/domain/cart_line.dart';
import 'package:marketplace_buyer/features/cart/providers/cart_repository_provider.dart';

/// Фейк документов кабинета: отдаёт заданный список либо падает.
class _FakeDocumentsRepository implements DocumentsRepository {
  _FakeDocumentsRepository({this.documents = const [], this.fail = false});

  final List<BuyerDocument> documents;
  final bool fail;

  @override
  Future<List<BuyerDocument>> fetchDocuments() async {
    if (fail) throw Exception('boom');
    return documents;
  }
}

/// Фейк профиля кабинета.
class _FakeProfileRepository implements ProfileRepository {
  _FakeProfileRepository({this.profile = const BuyerProfile()});

  final BuyerProfile profile;

  @override
  Future<BuyerProfile> fetchProfile() async => profile;
}

/// Фейк корзины: кабинету нужен только fetchMyCart, остальное не вызывается.
class _FakeCartRepository implements CartRepository {
  _FakeCartRepository({this.cart});

  final Cart? cart;

  @override
  Future<Cart?> fetchMyCart() async => cart;

  @override
  Future<Cart> createCart() async => throw UnimplementedError();

  @override
  Future<Cart> fetchCart(String cartId) async => throw UnimplementedError();

  @override
  Future<Cart> addLineItem({
    required String cartId,
    required String variantId,
    int quantity = 1,
  }) async => throw UnimplementedError();

  @override
  Future<Cart> updateLineItem({
    required String cartId,
    required String lineId,
    required int quantity,
  }) async => throw UnimplementedError();

  @override
  Future<Cart> removeLineItem({
    required String cartId,
    required String lineId,
  }) async => throw UnimplementedError();
}

Widget _harness(Widget child, List<Override> overrides) {
  return ProviderScope(
    overrides: overrides,
    child: MaterialApp(theme: buildAppTheme(), home: child),
  );
}

void main() {
  final documents = [
    BuyerDocument(
      id: 'doc_1',
      type: 'waybill',
      number: 'WB-2026-000013',
      orderId: 'order_1',
      orderDisplayNumber: '#53',
      total: 194800,
      currencyCode: 'kzt',
      createdAt: DateTime(2026, 8, 28),
      fileUrl: 'https://files.local/wb.pdf',
    ),
    const BuyerDocument(
      id: 'doc_2',
      type: 'invoice',
      number: 'INV-2026-000028',
      orderId: 'order_1',
      orderDisplayNumber: '#53',
    ),
  ];

  testWidgets('документы: тип, номер и заказ; без файла кнопки PDF нет', (
    tester,
  ) async {
    await tester.pumpWidget(
      _harness(const CabinetDocumentsScreen(), [
        documentsRepositoryProvider.overrideWithValue(
          _FakeDocumentsRepository(documents: documents),
        ),
      ]),
    );
    await tester.pumpAndSettle();

    expect(find.text('Накладная · WB-2026-000013'), findsOneWidget);
    expect(find.text('Счёт на оплату · INV-2026-000028'), findsOneWidget);
    expect(find.textContaining('Заказ #53'), findsNWidgets(2));
    expect(find.byIcon(Icons.picture_as_pdf_outlined), findsOneWidget);
  });

  testWidgets('документы: пусто — заголовок и подсказка', (tester) async {
    await tester.pumpWidget(
      _harness(const CabinetDocumentsScreen(), [
        documentsRepositoryProvider.overrideWithValue(
          _FakeDocumentsRepository(),
        ),
      ]),
    );
    await tester.pumpAndSettle();

    expect(find.text('Документов пока нет'), findsOneWidget);
  });

  testWidgets('документы: ошибка — AppErrorView с повтором', (tester) async {
    await tester.pumpWidget(
      _harness(const CabinetDocumentsScreen(), [
        documentsRepositoryProvider.overrideWithValue(
          _FakeDocumentsRepository(fail: true),
        ),
      ]),
    );
    await tester.pumpAndSettle();

    expect(find.byType(AppErrorView), findsOneWidget);
  });

  testWidgets('корзина кабинета: позиции с фасовкой и выход в чат', (
    tester,
  ) async {
    const cart = Cart(
      id: 'cart_1',
      currencyCode: 'kzt',
      total: 114400,
      lines: [
        CartLine(
          id: 'l1',
          title: 'Цемент ПЦ 400-Д20',
          variantTitle: 'Мешок 50 кг',
          quantity: 18,
          unitPrice: 6000,
          currencyCode: 'kzt',
        ),
      ],
    );

    await tester.pumpWidget(
      _harness(const CabinetCartScreen(), [
        cartRepositoryProvider.overrideWithValue(
          _FakeCartRepository(cart: cart),
        ),
      ]),
    );
    await tester.pumpAndSettle();

    expect(find.text('Цемент ПЦ 400-Д20'), findsOneWidget);
    expect(find.textContaining('Мешок 50 кг'), findsOneWidget);
    expect(find.text('Продолжить в чате'), findsOneWidget);
  });

  testWidgets('корзина кабинета: корзины нет — пустое состояние', (
    tester,
  ) async {
    await tester.pumpWidget(
      _harness(const CabinetCartScreen(), [
        cartRepositoryProvider.overrideWithValue(_FakeCartRepository()),
      ]),
    );
    await tester.pumpAndSettle();

    expect(find.text('Корзина пуста'), findsOneWidget);
    expect(find.text('Продолжить в чате'), findsOneWidget);
  });

  testWidgets('профиль: ФИО, телефон и адреса', (tester) async {
    await tester.pumpWidget(
      _harness(const CabinetProfileScreen(), [
        profileRepositoryProvider.overrideWithValue(
          _FakeProfileRepository(
            profile: const BuyerProfile(
              name: 'Ерлан Смагулов',
              phone: '+7 701 214 33 12',
              addresses: ['ул. Кабанбай батыра, 53, Астана'],
            ),
          ),
        ),
      ]),
    );
    await tester.pumpAndSettle();

    expect(find.text('Ерлан Смагулов'), findsOneWidget);
    expect(find.text('+7 701 214 33 12'), findsOneWidget);
    expect(find.text('ул. Кабанбай батыра, 53, Астана'), findsOneWidget);
  });

  testWidgets('профиль: пустые поля показываются как «Не указано»', (
    tester,
  ) async {
    await tester.pumpWidget(
      _harness(const CabinetProfileScreen(), [
        profileRepositoryProvider.overrideWithValue(_FakeProfileRepository()),
      ]),
    );
    await tester.pumpAndSettle();

    expect(find.text('Не указано'), findsNWidgets(2));
    expect(find.textContaining('Адресов пока нет'), findsOneWidget);
  });
}
