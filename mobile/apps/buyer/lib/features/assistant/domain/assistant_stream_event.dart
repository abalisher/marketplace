import 'assistant_reply.dart';

/// События потокового хода ассистента (T10.1d): бэкенд печатает ответ по мере
/// генерации, а итог хода присылает отдельным событием. Порядок в норме такой:
/// [AssistantTextDelta]… → [AssistantTurnDone]; между ними могут прийти
/// [AssistantTextReset] (модель написала преамбулу перед вызовом инструмента —
/// в ответ она не попадает) и [AssistantTokens] (инструмент создал корзину или
/// оформил заказ).
sealed class AssistantStreamEvent {
  const AssistantStreamEvent();
}

/// Очередной фрагмент текста ответа — дописывается к напечатанному.
class AssistantTextDelta extends AssistantStreamEvent {
  const AssistantTextDelta(this.text);

  final String text;
}

/// Сбросить напечатанное и печатать ответ заново.
class AssistantTextReset extends AssistantStreamEvent {
  const AssistantTextReset();
}

/// Токены сессии изменились посреди хода. Приходят сразу, а не только в итоге:
/// если покупатель нажмёт «Стоп», итог до клиента уже не доедет, а корзина,
/// созданная инструментом, должна остаться его корзиной.
class AssistantTokens extends AssistantStreamEvent {
  const AssistantTokens({this.cartId, this.orderId});

  final String? cartId;
  final String? orderId;
}

/// Итог хода — источник истины по ленте, токенам и вставкам (то же, что
/// возвращает обычный POST).
class AssistantTurnDone extends AssistantStreamEvent {
  const AssistantTurnDone(this.reply);

  final AssistantReply reply;
}
