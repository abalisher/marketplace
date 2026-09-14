import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../domain/bonus_account.dart';
import 'bonus_repository_provider.dart';

/// Бонусный счёт текущего покупателя (баланс + история).
final bonusProvider = FutureProvider<BonusAccount>((ref) {
  return ref.watch(bonusRepositoryProvider).fetchBonus();
});
