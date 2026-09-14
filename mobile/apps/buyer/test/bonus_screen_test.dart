import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_kit/app_error_view.dart';
import 'package:ui_kit/app_theme.dart';

import 'package:marketplace_buyer/features/bonus/data/bonus_repository.dart';
import 'package:marketplace_buyer/features/bonus/domain/bonus_account.dart';
import 'package:marketplace_buyer/features/bonus/domain/bonus_entry.dart';
import 'package:marketplace_buyer/features/bonus/providers/bonus_repository_provider.dart';
import 'package:marketplace_buyer/features/bonus/screens/bonus_screen.dart';

/// Фейк бонусов: отдаёт заданный счёт либо бросает ошибку. Экран тестируется на
/// границе [BonusRepository], без сети/DTO.
class _FakeBonusRepository implements BonusRepository {
  _FakeBonusRepository({this.account, this.fail = false});

  final BonusAccount? account;
  final bool fail;

  @override
  Future<BonusAccount> fetchBonus() async {
    if (fail || account == null) throw Exception("boom");
    return account!;
  }
}

Widget _harness(BonusRepository repo) {
  return ProviderScope(
    overrides: [bonusRepositoryProvider.overrideWithValue(repo)],
    child: MaterialApp(theme: buildAppTheme(), home: const BonusScreen()),
  );
}

void main() {
  testWidgets("показывает баланс и историю со знаками", (tester) async {
    final account = BonusAccount(
      balance: 6000,
      currencyCode: "kzt",
      entries: [
        BonusEntry(
          id: "b1",
          type: "accrual",
          amount: 500,
          createdAt: DateTime(2026, 7, 20),
        ),
        BonusEntry(
          id: "b2",
          type: "spend",
          amount: 200,
          createdAt: DateTime(2026, 7, 21),
        ),
      ],
    );
    await tester.pumpWidget(_harness(_FakeBonusRepository(account: account)));
    await tester.pumpAndSettle();

    expect(find.text("Баланс бонусов"), findsOneWidget);
    expect(find.text("6000 KZT"), findsOneWidget);
    expect(find.text("Начисление"), findsOneWidget);
    expect(find.text("+500 KZT"), findsOneWidget);
    expect(find.text("Списание"), findsOneWidget);
    expect(find.text("−200 KZT"), findsOneWidget);
  });

  testWidgets("пустая история показывает сообщение", (tester) async {
    final account = const BonusAccount(
      balance: 0,
      currencyCode: "kzt",
      entries: [],
    );
    await tester.pumpWidget(_harness(_FakeBonusRepository(account: account)));
    await tester.pumpAndSettle();

    expect(find.text("Пока нет бонусных операций"), findsOneWidget);
  });

  testWidgets("ошибка показывает AppErrorView", (tester) async {
    await tester.pumpWidget(_harness(_FakeBonusRepository(fail: true)));
    await tester.pumpAndSettle();

    expect(find.byType(AppErrorView), findsOneWidget);
    expect(find.text("Не удалось загрузить бонусы"), findsOneWidget);
  });
}
