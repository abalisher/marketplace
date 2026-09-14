import '../domain/bonus_account.dart';

/// Контракт бонусного счёта покупателя. Реализация по умолчанию — поверх Medusa
/// (`GET /store/bonus`); в тестах переопределяется фейком. Счёт авторизованного
/// покупателя — токен сессии добавляет общий Dio-интерцептор (`core`).
abstract interface class BonusRepository {
  Future<BonusAccount> fetchBonus();
}
