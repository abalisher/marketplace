import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../domain/buyer_profile.dart';
import 'profile_repository_provider.dart';

/// Профиль текущего покупателя (раздел «Профиль» кабинета).
final buyerProfileProvider = FutureProvider<BuyerProfile>((ref) {
  return ref.watch(profileRepositoryProvider).fetchProfile();
});
