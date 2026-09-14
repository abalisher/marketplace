import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../cart/domain/cart.dart';
import '../../cart/providers/cart_repository_provider.dart';

/// Текущая корзина покупателя для кабинета: её ищет бэкенд по учётке
/// (`/store/carts/me`), а не состояние диалога — иначе в вебе и на телефоне
/// раздел «Корзина» показывал бы разное. `null` — корзины нет.
final myCartProvider = FutureProvider<Cart?>((ref) {
  return ref.watch(cartRepositoryProvider).fetchMyCart();
});
