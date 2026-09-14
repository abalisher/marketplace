import 'package:api_client/api_client.dart'
    show MedusaStoreApi, StoreBonusTransaction;

import '../domain/bonus_account.dart';
import '../domain/bonus_entry.dart';
import 'bonus_repository.dart';

/// Реализация [BonusRepository] поверх Medusa Store API (`GET /store/bonus`).
class MedusaBonusRepository implements BonusRepository {
  MedusaBonusRepository(this._api, this._publishableKey);

  final MedusaStoreApi _api;
  final String _publishableKey;

  @override
  Future<BonusAccount> fetchBonus() async {
    final response = await _api.bonus.getBonus(
      xPublishableApiKey: _publishableKey,
    );
    final bonus = response.bonus;
    return BonusAccount(
      balance: bonus.balance,
      currencyCode: bonus.currencyCode,
      entries: bonus.transactions.map(_toEntry).toList(),
    );
  }

  BonusEntry _toEntry(StoreBonusTransaction transaction) {
    return BonusEntry(
      id: transaction.id,
      // Enum операции сериализуется в свой код (accrual/spend/...); держим строкой.
      type: transaction.type.json ?? '',
      amount: transaction.amount,
      createdAt: transaction.createdAt,
      expiresAt: transaction.expiresAt,
    );
  }
}
