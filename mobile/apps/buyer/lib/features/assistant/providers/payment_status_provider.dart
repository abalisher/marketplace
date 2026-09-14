import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../domain/payment_status.dart';
import 'payment_status_repository_provider.dart';

/// Интервал авто-поллинга статуса оплаты Kaspi (макет 1c: покупатель платит вне
/// чата, экран сам перепроверяет статус).
const _pollInterval = Duration(seconds: 4);

/// Живой статус оплаты корзины [cartId]: опрашивает бэкенд каждые [_pollInterval],
/// пока оплата в ожидании; останавливается на `paid`/`failed`. Ошибка сети
/// уходит в поток как `AsyncError` — карточка оплаты показывает «Повторить»
/// (перезапуск через `ref.invalidate`). autoDispose: поток живёт, только пока
/// карточка оплаты на экране.
final paymentStatusProvider = StreamProvider.autoDispose
    .family<PaymentStatus, String>((ref, cartId) async* {
      final repo = ref.watch(paymentStatusRepositoryProvider);
      while (true) {
        final status = await repo.poll(cartId);
        yield status;
        // Терминальные статусы — дальше опрашивать нечего.
        if (status != PaymentStatus.pending) return;
        await Future<void>.delayed(_pollInterval);
      }
    });
