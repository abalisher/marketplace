import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_kit/app_theme.dart';

import 'package:marketplace_buyer/features/cart/data/cart_repository.dart';
import 'package:marketplace_buyer/features/cart/domain/cart.dart';
import 'package:marketplace_buyer/features/cart/domain/cart_line.dart';
import 'package:marketplace_buyer/features/cart/providers/cart_controller.dart';
import 'package:marketplace_buyer/features/cart/providers/cart_repository_provider.dart';
import 'package:marketplace_buyer/features/cart/screens/cart_screen.dart';

/// Контроллер корзины с предзаданным начальным состоянием — чтобы отрисовать
/// уже наполненную корзину без прохода через мутации. Мутации (± / удаление)
/// работают штатно через переопределённый [CartRepository].
class _SeededCartController extends CartController {
  _SeededCartController(this._seed);

  final Cart? _seed;

  @override
  Future<Cart?> build() async => _seed;
}

/// Фейк репозитория корзины: возвращает заранее заданные корзины на мутации и
/// записывает переданные аргументы. Тест не зависит от сети/DTO.
class _FakeCartRepository implements CartRepository {
  _FakeCartRepository({this.updateResult, this.removeResult});

  final Cart? updateResult;
  final Cart? removeResult;

  int updateCalls = 0;
  int removeCalls = 0;
  String? lastLineId;
  int? lastQuantity;

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
  }) async => throw UnimplementedError();

  @override
  Future<Cart> updateLineItem({
    required String cartId,
    required String lineId,
    required int quantity,
  }) async {
    updateCalls++;
    lastLineId = lineId;
    lastQuantity = quantity;
    return updateResult!;
  }

  @override
  Future<Cart> removeLineItem({
    required String cartId,
    required String lineId,
  }) async {
    removeCalls++;
    lastLineId = lineId;
    return removeResult!;
  }
}

Cart _cart({required int quantity, required num total}) => Cart(
  id: 'c1',
  currencyCode: 'kzt',
  total: total,
  lines: [
    CartLine(
      id: 'l1',
      title: 'Цемент М500',
      variantTitle: 'Мешок 50 кг',
      quantity: quantity,
      unitPrice: 1990,
      currencyCode: 'kzt',
    ),
  ],
);

Future<void> _pump(
  WidgetTester tester, {
  Cart? seed,
  CartRepository? cartRepository,
}) async {
  await tester.binding.setSurfaceSize(const Size(600, 2000));
  addTearDown(() => tester.binding.setSurfaceSize(null));
  await tester.pumpWidget(
    ProviderScope(
      overrides: [
        cartControllerProvider.overrideWith(() => _SeededCartController(seed)),
        if (cartRepository != null)
          cartRepositoryProvider.overrideWithValue(cartRepository),
      ],
      child: MaterialApp(theme: buildAppTheme(), home: const CartScreen()),
    ),
  );
  await tester.pumpAndSettle();
}

void main() {
  testWidgets('пустая корзина показывает сообщение', (tester) async {
    await _pump(tester);

    expect(find.text('Корзина пуста'), findsOneWidget);
  });

  testWidgets('показывает строку, вариант и итог', (tester) async {
    await _pump(tester, seed: _cart(quantity: 2, total: 3980));

    expect(find.text('Цемент М500'), findsOneWidget);
    expect(find.text('Мешок 50 кг'), findsOneWidget);
    // Цена за единицу в строке и итог в нижней панели.
    expect(find.text('1990 KZT'), findsOneWidget);
    expect(find.text('3980 KZT'), findsOneWidget);
    // Текущее количество в счётчике.
    expect(find.text('2'), findsOneWidget);
  });

  testWidgets('«+» увеличивает количество через репозиторий', (tester) async {
    final repository = _FakeCartRepository(
      updateResult: _cart(quantity: 3, total: 5970),
    );
    await _pump(
      tester,
      seed: _cart(quantity: 2, total: 3980),
      cartRepository: repository,
    );

    await tester.tap(find.byIcon(Icons.add));
    await tester.pumpAndSettle();

    expect(repository.updateCalls, 1);
    expect(repository.lastLineId, 'l1');
    expect(repository.lastQuantity, 3);
    expect(find.text('3'), findsOneWidget);
    expect(find.text('5970 KZT'), findsOneWidget);
  });

  testWidgets('удаление строки очищает корзину', (tester) async {
    final repository = _FakeCartRepository(
      removeResult: const Cart(
        id: 'c1',
        lines: [],
        total: 0,
        currencyCode: 'kzt',
      ),
    );
    await _pump(
      tester,
      seed: _cart(quantity: 2, total: 3980),
      cartRepository: repository,
    );

    await tester.tap(find.byIcon(Icons.delete_outline));
    await tester.pumpAndSettle();

    expect(repository.removeCalls, 1);
    expect(repository.lastLineId, 'l1');
    expect(find.text('Корзина пуста'), findsOneWidget);
  });
}
