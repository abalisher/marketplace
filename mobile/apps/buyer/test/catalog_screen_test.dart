import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_kit/app_error_view.dart';
import 'package:ui_kit/app_theme.dart';

import 'package:marketplace_buyer/features/catalog/data/catalog_repository.dart';
import 'package:marketplace_buyer/features/catalog/domain/catalog_product.dart';
import 'package:marketplace_buyer/features/catalog/domain/product_detail.dart';
import 'package:marketplace_buyer/features/catalog/providers/catalog_repository_provider.dart';
import 'package:marketplace_buyer/features/catalog/screens/catalog_screen.dart';

/// Фейк репозитория: отдаёт заданные товары либо бросает ошибку. Тесты работают
/// на границе [CatalogRepository] и не зависят от сгенерированных DTO/сети.
class _FakeCatalogRepository implements CatalogRepository {
  const _FakeCatalogRepository(this._products, {this.shouldFail = false});

  final List<CatalogProduct> _products;
  final bool shouldFail;

  @override
  Future<List<CatalogProduct>> fetchProducts() async {
    if (shouldFail) throw Exception('boom');
    return _products;
  }

  @override
  Future<ProductDetail> fetchProduct(String id) async {
    throw UnimplementedError();
  }
}

Widget _harness(CatalogRepository repository) {
  return ProviderScope(
    overrides: [catalogRepositoryProvider.overrideWithValue(repository)],
    child: MaterialApp(theme: buildAppTheme(), home: const CatalogScreen()),
  );
}

void main() {
  testWidgets('показывает список товаров с ценой', (tester) async {
    await tester.pumpWidget(
      _harness(
        const _FakeCatalogRepository([
          CatalogProduct(
            id: 'p1',
            title: 'Цемент М500',
            priceAmount: 1990,
            currencyCode: 'kzt',
          ),
          CatalogProduct(id: 'p2', title: 'Песок речной'),
        ]),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Цемент М500'), findsOneWidget);
    expect(find.text('1990 KZT'), findsOneWidget);
    // У второго товара нет цены — показывается подпись «цена по запросу».
    expect(find.text('Песок речной'), findsOneWidget);
    expect(find.text('Цена по запросу'), findsOneWidget);
  });

  testWidgets('показывает сообщение при пустом каталоге', (tester) async {
    await tester.pumpWidget(_harness(const _FakeCatalogRepository([])));
    await tester.pumpAndSettle();

    expect(find.text('Товары не найдены'), findsOneWidget);
  });

  testWidgets('показывает ошибку и кнопку повтора при сбое', (tester) async {
    await tester.pumpWidget(
      _harness(const _FakeCatalogRepository([], shouldFail: true)),
    );
    await tester.pumpAndSettle();

    expect(find.byType(AppErrorView), findsOneWidget);
    expect(find.text('Не удалось загрузить каталог'), findsOneWidget);
    expect(find.text('Повторить'), findsOneWidget);
  });
}
