import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_kit/app_error_view.dart';
import 'package:ui_kit/app_primary_button.dart';
import 'package:ui_kit/app_theme.dart';

import 'package:marketplace_buyer/features/estimator/data/estimator_repository.dart';
import 'package:marketplace_buyer/features/estimator/domain/estimate_item.dart';
import 'package:marketplace_buyer/features/estimator/domain/estimate_option.dart';
import 'package:marketplace_buyer/features/estimator/domain/estimate_params.dart';
import 'package:marketplace_buyer/features/estimator/domain/estimate_result.dart';
import 'package:marketplace_buyer/features/estimator/providers/estimator_repository_provider.dart';
import 'package:marketplace_buyer/features/estimator/screens/estimator_screen.dart';

/// Фейк расчёта: считает вызовы, отдаёт заданный результат либо бросает ошибку.
/// Экран тестируется на границе [EstimatorRepository], без сети/DTO.
class _FakeEstimatorRepository implements EstimatorRepository {
  _FakeEstimatorRepository({this.result, this.fail = false});

  final EstimateResult? result;
  final bool fail;
  int calls = 0;

  @override
  Future<EstimateResult> calculate(EstimateParams params) async {
    calls++;
    if (fail || result == null) throw Exception('boom');
    return result!;
  }
}

Widget _harness(EstimatorRepository repo) {
  return ProviderScope(
    overrides: [estimatorRepositoryProvider.overrideWithValue(repo)],
    child: MaterialApp(theme: buildAppTheme(), home: const EstimatorScreen()),
  );
}

Future<void> _tapCalculate(WidgetTester tester) async {
  await tester.ensureVisible(find.byType(AppPrimaryButton));
  await tester.pumpAndSettle();
  await tester.tap(find.byType(AppPrimaryButton));
}

void main() {
  final result = EstimateResult(
    id: 'e1',
    currencyCode: 'kzt',
    items: const [
      EstimateItem(
        materialKind: 'Цемент М500',
        quantity: 12,
        unit: 'мешок',
        options: [
          EstimateOption(
            segment: 'economy',
            productTitle: 'Цемент Стандарт',
            unitPrice: 1500,
            total: 18000,
            inStock: true,
          ),
        ],
      ),
    ],
  );

  testWidgets('расчёт показывает позицию с количеством и вариант с ценой', (
    tester,
  ) async {
    await tester.pumpWidget(_harness(_FakeEstimatorRepository(result: result)));

    await tester.enterText(find.byType(TextField).first, '50');
    await _tapCalculate(tester);
    await tester.pumpAndSettle();

    // Результат ниже формы — ListView строит его лениво, докручиваем основной
    // список (первый Scrollable; у каждого TextField свой внутренний).
    await tester.dragUntilVisible(
      find.text('Цемент М500'),
      find.byType(Scrollable).first,
      const Offset(0, -200),
    );
    await tester.pumpAndSettle();

    expect(find.text('Цемент М500'), findsOneWidget);
    expect(find.text('12 мешок'), findsOneWidget);
    expect(find.text('Эконом'), findsOneWidget);
    expect(find.text('Цемент Стандарт'), findsOneWidget);
    expect(find.text('18000 KZT'), findsOneWidget);
    expect(find.text('В наличии'), findsOneWidget);
  });

  testWidgets('пустая форма показывает подсказку и не зовёт расчёт', (
    tester,
  ) async {
    final repo = _FakeEstimatorRepository(result: result);
    await tester.pumpWidget(_harness(repo));

    await _tapCalculate(tester);
    await tester.pump();

    expect(find.text('Укажите хотя бы один параметр'), findsOneWidget);
    expect(repo.calls, 0);
  });

  testWidgets('ошибка расчёта показывает AppErrorView', (tester) async {
    await tester.pumpWidget(_harness(_FakeEstimatorRepository(fail: true)));

    await tester.enterText(find.byType(TextField).first, '10');
    await _tapCalculate(tester);
    await tester.pumpAndSettle();

    expect(find.byType(AppErrorView), findsOneWidget);
    expect(find.text('Не удалось выполнить расчёт'), findsOneWidget);
  });

  testWidgets('пустой результат показывает сообщение', (tester) async {
    final empty = const EstimateResult(
      id: 'e2',
      currencyCode: 'kzt',
      items: [],
    );
    await tester.pumpWidget(_harness(_FakeEstimatorRepository(result: empty)));

    await tester.enterText(find.byType(TextField).first, '5');
    await _tapCalculate(tester);
    await tester.pumpAndSettle();

    expect(
      find.text('По заданным параметрам материалы не подобраны'),
      findsOneWidget,
    );
  });
}
