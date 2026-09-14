import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_kit/app_theme.dart';

import 'package:marketplace_buyer/features/assistant/data/payment_status_repository.dart';
import 'package:marketplace_buyer/features/assistant/domain/chat_attachment.dart';
import 'package:marketplace_buyer/features/assistant/domain/payment_status.dart';
import 'package:marketplace_buyer/features/assistant/providers/payment_status_repository_provider.dart';
import 'package:marketplace_buyer/features/assistant/widgets/payment_attachment_view.dart';

/// Фейк опроса статуса: отдаёт очередь статусов (по одному на вызов, последний
/// повторяется) либо бросает ошибку — для баннера «Повторить».
class _FakePaymentStatusRepository implements PaymentStatusRepository {
  _FakePaymentStatusRepository(this._statuses, {this.fail = false});

  final List<PaymentStatus> _statuses;
  final bool fail;
  int calls = 0;

  @override
  Future<PaymentStatus> poll(String cartId) async {
    calls++;
    if (fail) throw Exception('network');
    final i = calls - 1;
    return _statuses[i < _statuses.length ? i : _statuses.length - 1];
  }
}

const _pending = PaymentAttachment(
  provider: 'kaspi',
  status: 'pending',
  paid: false,
  amount: 92400,
  currency: 'kzt',
  qrPayload: 'kaspi://pay/demo',
  paymentUrl: 'https://kaspi.kz/pay/demo',
);

Widget _harness(PaymentStatusRepository repo, {String? cartId = 'cart_1'}) {
  return ProviderScope(
    overrides: [paymentStatusRepositoryProvider.overrideWithValue(repo)],
    child: MaterialApp(
      theme: buildAppTheme(),
      home: Scaffold(
        body: PaymentAttachmentView(attachment: _pending, cartId: cartId),
      ),
    ),
  );
}

void main() {
  testWidgets('ожидание → авто-поллинг переводит статус в «Оплачено»', (
    tester,
  ) async {
    final repo = _FakePaymentStatusRepository([
      PaymentStatus.pending,
      PaymentStatus.paid,
    ]);
    await tester.pumpWidget(_harness(repo));

    // Первый опрос: ещё ожидание, показана сумма и подсказка про QR.
    await tester.pump();
    expect(find.text('Ожидание оплаты'), findsOneWidget);
    expect(find.text('92 400 ₸'), findsOneWidget);

    // Второй опрос (после интервала) — оплачено, поллинг останавливается.
    await tester.pump(const Duration(seconds: 5));
    await tester.pump();
    expect(find.text('Оплачено'), findsOneWidget);
    expect(find.text('Ожидание оплаты'), findsNothing);
  });

  testWidgets('ошибка опроса показывает баннер и «Повторить»', (tester) async {
    final repo = _FakePaymentStatusRepository(const [], fail: true);
    await tester.pumpWidget(_harness(repo));
    await tester.pump();

    expect(find.text('Не удалось обновить статус оплаты'), findsOneWidget);
    expect(find.text('Повторить'), findsOneWidget);
    // Блок оплаты остаётся на экране (данные не теряются).
    expect(find.text('92 400 ₸'), findsOneWidget);
  });

  testWidgets('уже оплаченная вставка не опрашивает бэкенд', (tester) async {
    final repo = _FakePaymentStatusRepository(const [PaymentStatus.pending]);
    await tester.pumpWidget(
      ProviderScope(
        overrides: [paymentStatusRepositoryProvider.overrideWithValue(repo)],
        child: MaterialApp(
          theme: buildAppTheme(),
          home: const Scaffold(
            body: PaymentAttachmentView(
              attachment: PaymentAttachment(
                provider: 'kaspi',
                status: 'authorized',
                paid: true,
                amount: 92400,
                currency: 'kzt',
              ),
              cartId: 'cart_1',
            ),
          ),
        ),
      ),
    );
    await tester.pump();

    expect(find.text('Оплачено'), findsOneWidget);
    expect(repo.calls, 0); // опроса не было
  });
}
