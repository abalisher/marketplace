// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

import '../models/store_assistant_cart_items.dart';
import '../models/store_assistant_cart_res.dart';
import '../models/store_assistant_chat.dart';
import '../models/store_assistant_chat_res.dart';
import '../models/store_assistant_transcribe.dart';
import '../models/store_assistant_transcript_res.dart';

part 'assistant_client.g.dart';

@RestApi()
abstract class AssistantClient {
  factory AssistantClient(Dio dio, {String? baseUrl}) = _AssistantClient;

  /// Chat with the buyer assistant.
  ///
  /// Один ход разговорного ассистента покупателя (Gemini function-calling). Stateless: клиент присылает всю историю диалога и cart_id (если корзина уже создана), получает ответ ассистента, дополненную историю и актуальный cart_id. Гость допускается. Инструменты: поиск товаров, расчёт материалов, добавление в корзину, просмотр корзины. К последней реплике можно приложить files — фото или PDF (T10.4): вложение видно модели только в этом ходе, нигде не сохраняется и в ответ не возвращается.
  @POST('/store/assistant/chat')
  Future<StoreAssistantChatRes> postAssistantChat({
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Body() required StoreAssistantChat body,
  });

  /// Chat with the buyer assistant (streaming).
  ///
  /// Тот же ход ассистента, что и POST /store/assistant/chat, но ответ печатается по мере генерации (T10.1d). Транспорт — SSE (text/event-stream). События: `open` (поток открыт — по нему клиент понимает, что стриминг поддерживается, иначе откатывается на обычный POST), `delta` ({text} — фрагмент ответа), `reset` (сбросить напечатанное: модель написала преамбулу перед вызовом инструмента), `state` ({cart_id, order_id} — токены сессии изменились посреди хода: инструмент создал корзину или оформил заказ; клиент запоминает их сразу), `done` (авторитетный итог хода — тот же payload, что у обычного POST, плюс поле aborted), `error` ({message}). «Стоп» покупателя = обрыв соединения клиентом: ход прекращается, уже исполненные инструменты не откатываются, а последнее событие `state` оставляет клиенту актуальные токены. К последней реплике можно приложить files — фото или PDF (T10.4): вложение видно модели только в этом ходе, нигде не сохраняется и в ответ не возвращается.
  @POST('/store/assistant/chat/stream')
  Future<String> postAssistantChatStream({
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Body() required StoreAssistantChat body,
  });

  /// Read the assistant cart.
  ///
  /// Состав корзины чата для полосы корзины над композером (T10.15). Нужен потому, что корзину меняют два пути: кнопки «−/+» (их ответ уже несёт свежую сводку) и сам ассистент инструментами — после хода модели клиент знает только cart_id. Без cart_id отвечает пустой сводкой.
  ///
  /// [cartId] - Id корзины чата, который клиент держит между ходами.
  @GET('/store/assistant/cart')
  Future<StoreAssistantCartRes> getAssistantCart({
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Query('cart_id') String? cartId,
  });

  /// Set quantities in the assistant cart.
  ///
  /// Счётчики «−/+» на карточках подбора (T10.15): покупатель кладёт товар в корзину сам, без хода модели. Количество АБСОЛЮТНОЕ (сколько позиции должно стать), quantity=0 убирает позицию совсем — запрос идемпотентен, поэтому серию нажатий можно схлопывать дебаунсом и безопасно повторять после обрыва. Гость допускается: первое положительное количество создаёт корзину и возвращает её cart_id (клиент держит его так же, как в чате). Ассистент узнаёт об изменениях на следующем ходе — снимок корзины кладётся в контекст хода.
  @POST('/store/assistant/cart/items')
  Future<StoreAssistantCartRes> postAssistantCartItems({
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Body() required StoreAssistantCartItems body,
  });

  /// Transcribe a buyer voice message.
  ///
  /// Распознать голосовое сообщение покупателя (T10.2): аудиозапись (base64) → текст. Ход ассистента роут НЕ делает: голос — не отдельный режим, распознанный текст падает в композер клиента, покупатель может его поправить и отправляет обычным сообщением в POST /store/assistant/chat (решение T11.4). Гость допускается. Пределы записи: не дольше 60 с (длительность присылает клиент — внутри контейнера opus/aac её без декодера не прочитать) и не больше 8 МБ содержимого. Аудио нигде не сохраняется — живёт ровно до конца запроса. Пустой text — не ошибка: значит не расслышали (тишина, шум), и клиент честно говорит об этом, оставляя ручной ввод.
  @POST('/store/assistant/transcribe')
  Future<StoreAssistantTranscriptRes> postAssistantTranscribe({
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Body() required StoreAssistantTranscribe body,
  });
}
