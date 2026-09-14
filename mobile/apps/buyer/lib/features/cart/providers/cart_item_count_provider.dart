import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'cart_controller.dart';

/// Суммарное количество единиц в корзине — для бейджа в шапке. 0, если корзины
/// ещё нет. Отдельный провайдер, чтобы шапка перестраивалась только при смене
/// количества, а не на каждое изменение корзины.
final cartItemCountProvider = Provider<int>((ref) {
  final cart = ref.watch(cartControllerProvider).valueOrNull;
  return cart?.itemCount ?? 0;
});
