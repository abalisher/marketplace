/// Операция бонусного счёта — проекция StoreBonusTransaction. `type` — сырой
/// код (accrual|spend|expiry|manual_credit|manual_debit), локализуется на
/// экране. Сумма в баллах (равны тенге). Направление (плюс/минус) определяется
/// по типу — [isCredit].
class BonusEntry {
  const BonusEntry({
    required this.id,
    required this.type,
    required this.amount,
    required this.createdAt,
    this.expiresAt,
  });

  final String id;
  final String type;
  final int amount;
  final DateTime createdAt;
  final DateTime? expiresAt;

  /// Начисление (пополнение) — accrual/manual_credit; иначе списание/сгорание.
  bool get isCredit => type == 'accrual' || type == 'manual_credit';
}
