import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../domain/assistant_cart_state.dart';
import '../domain/cart_event.dart';
import '../domain/cart_summary.dart';
import 'assistant_repository_provider.dart';
import 'chat_controller.dart';

/// Пауза перед отправкой: столько покупатель обычно докликивает количество.
const _flushDelay = Duration(milliseconds: 450);

/// Корзина чата (T10.15). Счётчики «−/+» на карточках подбора пишут в неё
/// напрямую, без хода модели: ход стоил бы 5–8 секунд и токенов на каждое
/// нажатие, а набрать шесть позиций надо за минуту.
///
/// Три правила, на которых держится честность цифр:
///  * показываем ОПТИМИСТИЧНО — нажатие двигает счётчик мгновенно, иначе кнопка
///    ощущается сломанной; правда с сервера приходит следом;
///  * шлём АБСОЛЮТНОЕ количество с дебаунсом: серия «+ + + +» схлопывается в
///    один запрос, и последняя запись побеждает — гонок нет;
///  * ошибка ОТКАТЫВАЕТ счётчик к подтверждённому серверу значению: цифра на
///    экране, которой нет в корзине, — это счёт-сюрприз на оформлении.
class AssistantCartController extends Notifier<AssistantCartState> {
  /// Нажатия, ещё не отправленные: variant_id → целевое количество.
  final Map<String, int> _pending = {};

  /// Последние ПОДТВЕРЖДЁННЫЕ сервером количества — точка отката при ошибке.
  Map<String, int> _confirmed = const {};

  Timer? _timer;
  bool _isFlushing = false;

  @override
  AssistantCartState build() {
    ref.onDispose(() {
      _timer?.cancel();
      _timer = null;
    });
    return const AssistantCartState();
  }

  /// Покупатель нажал счётчик: показываем новое количество сразу, отправляем —
  /// пачкой после паузы.
  void setQuantity({
    required String variantId,
    required String title,
    required int quantity,
  }) {
    final target = quantity < 0 ? 0 : quantity;
    _pending[variantId] = target;
    state = state.copyWith(
      quantities: {...state.quantities, variantId: target},
      events: [
        ...state.events.where((event) => event.variantId != variantId),
        CartEvent(variantId: variantId, title: title, quantity: target),
      ],
    );
    _timer?.cancel();
    _timer = Timer(_flushDelay, _flush);
  }

  Future<void> _flush() async {
    if (_isFlushing || _pending.isEmpty) return;
    final batch = Map<String, int>.from(_pending);
    _pending.clear();
    _isFlushing = true;
    state = state.copyWith(isBusy: true);
    try {
      final cart = await ref
          .read(assistantRepositoryProvider)
          .setCartQuantities(cartId: state.cart.cartId, quantities: batch);
      _apply(cart);
      state = state.copyWith(isBusy: false, hasError: false);
    } catch (_) {
      // Запись не прошла — возвращаем счётчики к подтверждённому состоянию.
      _pending.clear();
      state = state.copyWith(
        quantities: _confirmed,
        isBusy: false,
        hasError: true,
      );
    } finally {
      _isFlushing = false;
      // Пока шёл запрос, покупатель мог кликнуть ещё — досылаем.
      if (_pending.isNotEmpty) unawaited(_flush());
    }
  }

  void _apply(CartSummary cart) {
    _confirmed = cart.quantities;
    // Первое «+» гостя создало корзину — её id держит диалог (как и раньше:
    // клиент шлёт cart_id следующим ходом).
    final cartId = cart.cartId;
    if (cartId != null) {
      ref.read(chatControllerProvider.notifier).attachCart(cartId);
    }
    state = state.copyWith(
      cart: cart,
      // Пока есть неотправленные нажатия, показ не трогаем: покупатель уже
      // кликнул дальше, и «правда» сервера отстала от его намерения.
      quantities: _pending.isEmpty ? _confirmed : state.quantities,
    );
  }

  /// Перечитывает состав после хода модели: корзину мог поменять ассистент.
  Future<void> refresh(String? cartId) async {
    if (cartId == null) {
      _confirmed = const {};
      _pending.clear();
      state = const AssistantCartState();
      return;
    }
    try {
      _apply(await ref.read(assistantRepositoryProvider).readCart(cartId));
    } catch (_) {
      // Не прочитали — оставляем прежний показ: ассистент всё равно говорит о
      // корзине по своим данным.
    }
  }

  /// Отметки о нажатиях гаснут, как только покупатель пишет сам: дальше о
  /// корзине говорит ассистент.
  void clearEvents() {
    if (state.events.isEmpty) return;
    state = state.copyWith(events: const []);
  }

  /// Новый диалог: корзина с нуля, неотправленные нажатия отменяются.
  void reset() {
    _timer?.cancel();
    _timer = null;
    _pending.clear();
    _confirmed = const {};
    state = const AssistantCartState();
  }
}

/// Провайдер корзины чата.
final assistantCartControllerProvider =
    NotifierProvider<AssistantCartController, AssistantCartState>(
      AssistantCartController.new,
    );
