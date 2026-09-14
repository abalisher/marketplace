import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_kit/app_choice_chip.dart';
import 'package:ui_kit/app_error_view.dart';
import 'package:ui_kit/app_theme.dart';

import 'package:marketplace_buyer/features/cart/data/cart_repository.dart';
import 'package:marketplace_buyer/features/cart/domain/cart.dart';
import 'package:marketplace_buyer/features/cart/domain/cart_line.dart';
import 'package:marketplace_buyer/features/cart/providers/cart_repository_provider.dart';
import 'package:marketplace_buyer/features/catalog/data/catalog_repository.dart';
import 'package:marketplace_buyer/features/catalog/domain/catalog_product.dart';
import 'package:marketplace_buyer/features/catalog/domain/product_detail.dart';
import 'package:marketplace_buyer/features/catalog/domain/product_variant_option.dart';
import 'package:marketplace_buyer/features/catalog/providers/catalog_repository_provider.dart';
import 'package:marketplace_buyer/features/catalog/screens/product_detail_screen.dart';

/// Фейк репозитория деталей: отдаёт заданный товар либо бросает ошибку. Тест
/// работает на границе [CatalogRepository] и не зависит от DTO/сети.
class _FakeCatalogRepository implements CatalogRepository {
  const _FakeCatalogRepository(this._detail, {this.shouldFail = false});

  final ProductDetail _detail;
  final bool shouldFail;

  @override
  Future<List<CatalogProduct>> fetchProducts() async => const [];

  @override
  Future<ProductDetail> fetchProduct(String id) async {
    if (shouldFail) throw Exception('boom');
    return _detail;
  }
}

/// Фейк репозитория корзины: записывает добавления и возвращает корзину с одной
/// строкой. Позволяет проверить, что экран зовёт добавление реального варианта.
class _FakeCartRepository implements CartRepository {
  int addCalls = 0;
  String? lastVariantId;

  @override
  Future<Cart> createCart() async =>
      const Cart(id: 'c1', lines: [], total: 0, currencyCode: 'kzt');

  @override
  Future<Cart> fetchCart(String cartId) async =>
      const Cart(id: 'c1', lines: [], total: 0, currencyCode: 'kzt');

  @override
  Future<Cart?> fetchMyCart() async => null;

  @override
  Future<Cart> addLineItem({
    required String cartId,
    required String variantId,
    int quantity = 1,
  }) async {
    addCalls++;
    lastVariantId = variantId;
    return Cart(
      id: cartId,
      currencyCode: 'kzt',
      total: 1990,
      lines: [
        CartLine(
          id: 'l1',
          title: 'Цемент М500',
          quantity: quantity,
          unitPrice: 1990,
          currencyCode: 'kzt',
        ),
      ],
    );
  }

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

/// Поднимает экран деталей на высоком «телефонном» холсте, чтобы вся
/// прокручиваемая разметка (галерея → цена → варианты → описание → кнопка) была
/// построена и доступна для поиска/нажатия (ленивый ListView иначе не строит
/// нижние блоки на стандартном 800×600).
Future<void> _pump(
  WidgetTester tester,
  CatalogRepository repository, {
  CartRepository? cartRepository,
}) async {
  await tester.binding.setSurfaceSize(const Size(600, 2000));
  addTearDown(() => tester.binding.setSurfaceSize(null));
  await tester.pumpWidget(
    ProviderScope(
      overrides: [
        catalogRepositoryProvider.overrideWithValue(repository),
        if (cartRepository != null)
          cartRepositoryProvider.overrideWithValue(cartRepository),
      ],
      child: MaterialApp(
        theme: buildAppTheme(),
        home: const ProductDetailScreen(productId: 'p1'),
      ),
    ),
  );
  await tester.pumpAndSettle();
}

const _twoVariants = ProductDetail(
  id: 'p1',
  title: 'Цемент М500',
  imageUrls: [],
  description: 'Портландцемент',
  variants: [
    ProductVariantOption(
      id: 'v1',
      title: 'Мешок 50 кг',
      priceAmount: 1990,
      currencyCode: 'kzt',
    ),
    ProductVariantOption(
      id: 'v2',
      title: 'Мешок 25 кг',
      priceAmount: 1100,
      currencyCode: 'kzt',
    ),
  ],
);

void main() {
  testWidgets('показывает товар, цену первого варианта и описание', (
    tester,
  ) async {
    await _pump(tester, const _FakeCatalogRepository(_twoVariants));

    expect(find.text('Цемент М500'), findsOneWidget);
    expect(find.text('1990 KZT'), findsOneWidget);
    expect(find.text('Портландцемент'), findsOneWidget);
    // Два варианта — показываются чипы.
    expect(find.byType(AppChoiceChip), findsNWidgets(2));
    expect(find.text('В корзину'), findsOneWidget);
  });

  testWidgets('выбор варианта меняет отображаемую цену', (tester) async {
    await _pump(tester, const _FakeCatalogRepository(_twoVariants));

    expect(find.text('1990 KZT'), findsOneWidget);

    await tester.tap(find.text('Мешок 25 кг'));
    await tester.pumpAndSettle();

    expect(find.text('1100 KZT'), findsOneWidget);
    expect(find.text('1990 KZT'), findsNothing);
  });

  testWidgets('«В корзину» добавляет выбранный вариант и подтверждает', (
    tester,
  ) async {
    final cartRepository = _FakeCartRepository();
    await _pump(
      tester,
      const _FakeCatalogRepository(_twoVariants),
      cartRepository: cartRepository,
    );

    // Выбираем второй вариант и добавляем именно его.
    await tester.tap(find.text('Мешок 25 кг'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('В корзину'));
    await tester.pumpAndSettle();

    expect(cartRepository.addCalls, 1);
    expect(cartRepository.lastVariantId, 'v2');
    expect(find.text('Добавлено в корзину'), findsOneWidget);
  });

  testWidgets('показывает ошибку и кнопку повтора при сбое', (tester) async {
    await _pump(
      tester,
      const _FakeCatalogRepository(
        ProductDetail(id: 'p1', title: '', imageUrls: [], variants: []),
        shouldFail: true,
      ),
    );

    expect(find.byType(AppErrorView), findsOneWidget);
    expect(find.text('Не удалось загрузить товар'), findsOneWidget);
    expect(find.text('Повторить'), findsOneWidget);
  });
}
