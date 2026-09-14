import 'bonus_entry.dart';

/// Бонусный счёт покупателя: баланс + история операций (новые первыми). Считает
/// бэкенд; экран отображает. Вывод бонусов деньгами запрещён — только частичная
/// оплата заказа (в чекауте).
class BonusAccount {
  const BonusAccount({
    required this.balance,
    required this.currencyCode,
    required this.entries,
  });

  final int balance;
  final String currencyCode;
  final List<BonusEntry> entries;

  bool get isEmpty => entries.isEmpty;
}
