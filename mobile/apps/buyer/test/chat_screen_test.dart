import 'dart:async';

import 'package:core/auth/auth_controller.dart';
import 'package:core/auth/auth_customer.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:ui_kit/app_input_bar.dart';
import 'package:ui_kit/app_suggestion_chip.dart';
import 'package:ui_kit/app_theme.dart';
import 'package:ui_kit/app_typing_bubble.dart';

import 'package:marketplace_buyer/features/assistant/domain/chat_file.dart';
import 'package:marketplace_buyer/features/assistant/data/assistant_repository.dart';
import 'no_assistant_cart.dart';
import 'no_assistant_stream.dart';
import 'package:marketplace_buyer/features/assistant/domain/assistant_reply.dart';
import 'package:marketplace_buyer/features/assistant/domain/cart_line.dart';
import 'package:marketplace_buyer/features/assistant/domain/cart_summary.dart';
import 'package:marketplace_buyer/features/assistant/domain/chat_attachment.dart';
import 'package:marketplace_buyer/features/assistant/domain/chat_message.dart';
import 'package:marketplace_buyer/features/assistant/domain/chat_role.dart';
import 'package:marketplace_buyer/features/assistant/providers/assistant_repository_provider.dart';
import 'package:marketplace_buyer/features/assistant/providers/chat_history_store_provider.dart';
import 'package:marketplace_buyer/features/assistant/screens/chat_screen.dart';

/// Фейк ассистента: считает вызовы, запоминает присланную историю/токены,
/// отдаёт заданный ответ либо бросает ошибку. Экран тестируется на границе
/// [AssistantRepository] — без сети и DTO контракта.
class _FakeAssistantRepository
    with NoAssistantStream
    implements AssistantRepository {
  _FakeAssistantRepository({this.reply, this.fail = false});

  final AssistantReply? reply;
  final bool fail;
  int calls = 0;
  List<ChatMessage> lastHistory = const [];
  String? lastCartId;

  /// Счётчики «−/+» пишут в корзину отдельным роутом, БЕЗ хода модели (T10.15):
  /// фейк запоминает присланные количества и отдаёт корзину, как это сделал бы
  /// бэкенд.
  Map<String, int> lastQuantities = const {};
  int cartWrites = 0;
  CartSummary cart = const CartSummary.empty();

  @override
  Future<CartSummary> setCartQuantities({
    String? cartId,
    required Map<String, int> quantities,
  }) async {
    cartWrites++;
    lastQuantities = quantities;
    cart = CartSummary(
      cartId: cartId ?? 'cart_1',
      currency: 'kzt',
      items: [
        for (final entry in quantities.entries)
          if (entry.value > 0)
            CartLine(
              variantId: entry.key,
              title: 'Цемент М400, мешок 50 кг',
              quantity: entry.value,
              unitPrice: 3200,
              total: 3200 * entry.value,
            ),
      ],
      total: quantities.values.fold(0, (sum, q) => sum + 3200 * q),
    );
    return cart;
  }

  @override
  Future<CartSummary> readCart(String cartId) async => cart;

  @override
  Future<AssistantReply> send({
    required List<ChatMessage> history,
    String? cartId,
    String? orderId,
    List<ChatFile> files = const [],
  }) async {
    calls++;
    lastHistory = history;
    lastCartId = cartId;
    if (fail || reply == null) throw Exception('boom');
    return reply!;
  }
}

/// Никогда не отвечает — для проверки состояния «печатает…».
class _PendingAssistantRepository
    with NoAssistantStream, NoAssistantCart
    implements AssistantRepository {
  @override
  Future<AssistantReply> send({
    required List<ChatMessage> history,
    String? cartId,
    String? orderId,
    List<ChatFile> files = const [],
  }) => Completer<AssistantReply>().future;
}

/// Гость: панель истории читает состояние авторизации — без сети и хранилища.
class _GuestAuthController extends AuthController {
  @override
  Future<AuthCustomer?> build() async => null;
}

/// Вошедший покупатель: вставке «статус заказа» нужна авторизация, чтобы
/// показать ссылку на защищённый экран заказа.
class _AuthedAuthController extends AuthController {
  @override
  Future<AuthCustomer?> build() async =>
      const AuthCustomer(id: 'cus_1', email: 'buyer@stroymarket.kz');
}

/// Инстанс SharedPreferences для истории диалогов — заполняется в setUp
/// (мок-значения в памяти), чтобы _harness оставался одноаргументным.
late SharedPreferences _prefs;

/// Пампит экран в габаритах телефона: приветствие по брифу T10.1 (обращение,
/// композер по центру, чипы) в дефолтные 800×600 теста не влезает.
Future<void> _pump(WidgetTester tester, Widget app) async {
  tester.view.physicalSize = const Size(412, 892);
  tester.view.devicePixelRatio = 1.0;
  addTearDown(tester.view.reset);
  await tester.pumpWidget(app);
}

Widget _harness(AssistantRepository repo) {
  return ProviderScope(
    overrides: [
      assistantRepositoryProvider.overrideWithValue(repo),
      authControllerProvider.overrideWith(_GuestAuthController.new),
      sharedPreferencesProvider.overrideWithValue(_prefs),
    ],
    child: MaterialApp(theme: buildAppTheme(), home: const ChatScreen()),
  );
}

/// Харнесс с роутером: вставка «статус заказа» уводит в карточку заказа
/// кабинета (T10.6), поэтому маршрут `/cabinet/orders/:id` нужен настоящий
/// (экран подменён заглушкой — проверяем переход, а не сам экран заказа).
Widget _routedHarness(AssistantRepository repo, {required bool authed}) {
  final router = GoRouter(
    routes: [
      GoRoute(path: '/', builder: (_, _) => const ChatScreen()),
      GoRoute(
        path: '/cabinet/orders/:id',
        builder: (_, state) =>
            Scaffold(body: Text('заказ ${state.pathParameters['id']}')),
      ),
    ],
  );
  return ProviderScope(
    overrides: [
      assistantRepositoryProvider.overrideWithValue(repo),
      authControllerProvider.overrideWith(
        authed ? _AuthedAuthController.new : _GuestAuthController.new,
      ),
      sharedPreferencesProvider.overrideWithValue(_prefs),
    ],
    child: MaterialApp.router(theme: buildAppTheme(), routerConfig: router),
  );
}

/// Ответ ассистента со вставкой «статус заказа» на заданной стадии цикла.
AssistantReply _orderStatusReply(String stage, {bool withSlot = false}) =>
    AssistantReply(
      messages: [
        const ChatMessage(role: ChatRole.user, content: 'Где мой заказ?'),
        ChatMessage(
          role: ChatRole.assistant,
          content: 'Заказ в работе',
          attachments: [
            OrderStatusAttachment(
              displayId: 43,
              statusText: 'В доставке',
              deliveryStage: stage,
              // Слот доставки приходит кодами — подпись собирает лента (T5.6a).
              deliveryDate: withSlot ? DateTime(2026, 9, 6) : null,
              deliveryWindow: withSlot ? 'day' : null,
            ),
          ],
        ),
      ],
      orderId: 'order_43',
    );

/// Ответ ассистента с просьбой войти (T10.8): гость дошёл до оформления.
AssistantReply _authPromptReply() => const AssistantReply(
  messages: [
    ChatMessage(role: ChatRole.user, content: 'Оформляем'),
    ChatMessage(
      role: ChatRole.assistant,
      content: 'Для оформления нужен вход по номеру',
      attachments: [AuthPromptAttachment(reason: 'checkout')],
    ),
  ],
  cartId: 'cart_1',
);

Future<void> _send(WidgetTester tester, String text) async {
  await tester.enterText(find.byType(TextField), text);
  await tester.pump(); // AppInputBar активирует кнопку отправки по вводу текста
  await tester.tap(find.byIcon(Icons.arrow_upward));
  await tester.pumpAndSettle();
}

void main() {
  setUp(() async {
    SharedPreferences.setMockInitialValues({});
    _prefs = await SharedPreferences.getInstance();
  });

  testWidgets('приветствие: обращение, композер по центру, чипы и дисклеймер', (
    tester,
  ) async {
    await _pump(tester, _harness(_FakeAssistantRepository()));

    expect(find.text('Чем помочь на стройке?'), findsOneWidget);
    expect(find.byType(AppSuggestionChip), findsNWidgets(3));
    expect(find.text('Можно писать на русском или казахском'), findsOneWidget);
    // Композер стоит на приветствии (бриф §3.2) вместе с дисклеймером.
    expect(find.byType(AppInputBar), findsOneWidget);
    expect(
      find.text('Ассистент может ошибаться — проверяйте количества и цены'),
      findsOneWidget,
    );
  });

  testWidgets('тап по чипу-примеру отправляет пример как реплику', (
    tester,
  ) async {
    final repo = _FakeAssistantRepository(
      reply: const AssistantReply(
        messages: [ChatMessage(role: ChatRole.assistant, content: 'ок')],
      ),
    );
    await _pump(tester, _harness(repo));

    // Черновик в композере не должен стираться отправкой примера.
    await tester.enterText(find.byType(TextField), 'черновик');
    await tester.tap(find.text('Развести воду в санузле'));
    await tester.pumpAndSettle();

    expect(repo.calls, 1);
    expect(repo.lastHistory.last.content, 'Развести воду в санузле');
    expect(find.widgetWithText(TextField, 'черновик'), findsOneWidget);
  });

  testWidgets('переключатель языка переводит экран на казахский и обратно', (
    tester,
  ) async {
    await _pump(tester, _harness(_FakeAssistantRepository()));

    await tester.tap(find.text('Қаз'));
    await tester.pump();

    expect(find.text('Құрылыста неге көмектесейін?'), findsOneWidget);

    await tester.tap(find.text('Рус'));
    await tester.pump();

    expect(find.text('Чем помочь на стройке?'), findsOneWidget);
  });

  testWidgets('рельс истории: «Новый чат» очищает ленту', (tester) async {
    final repo = _FakeAssistantRepository(
      reply: const AssistantReply(
        messages: [
          ChatMessage(role: ChatRole.user, content: 'Нужен цемент'),
          ChatMessage(role: ChatRole.assistant, content: 'Подобрал варианты'),
        ],
      ),
    );
    await _pump(tester, _harness(repo));
    await _send(tester, 'Нужен цемент');

    await tester.tap(find.byIcon(Icons.menu));
    await tester.pumpAndSettle();

    // Панель истории ведёт в кабинет: четыре раздела вместо прежней одной
    // ссылки «Мои заказы» (T10.6).
    expect(find.text('Заказы'), findsOneWidget);
    expect(find.text('Документы'), findsOneWidget);
    expect(find.text('Войти в аккаунт'), findsOneWidget);

    await tester.tap(find.text('Новый чат'));
    await tester.pumpAndSettle();

    // Лента сброшена — снова приветственный экран.
    expect(find.text('Чем помочь на стройке?'), findsOneWidget);
    expect(find.text('Подобрал варианты'), findsNothing);
  });

  testWidgets('диалог попадает в историю и возобновляется из панели', (
    tester,
  ) async {
    final repo = _FakeAssistantRepository(
      reply: const AssistantReply(
        messages: [
          ChatMessage(role: ChatRole.user, content: 'Нужен цемент на стяжку'),
          ChatMessage(role: ChatRole.assistant, content: 'Подобрал варианты'),
        ],
        cartId: 'cart_1',
      ),
    );
    await _pump(tester, _harness(repo));
    await _send(tester, 'Нужен цемент на стяжку');

    // Начинаем новый диалог — лента пустая.
    await tester.tap(find.byIcon(Icons.menu));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Новый чат'));
    await tester.pumpAndSettle();
    expect(find.text('Подобрал варианты'), findsNothing);

    // Открываем панель — прошлый диалог в истории (по заголовку-реплике).
    await tester.tap(find.byIcon(Icons.menu));
    await tester.pumpAndSettle();
    expect(find.text('Нужен цемент на стяжку'), findsOneWidget);

    // Тап по элементу истории возобновляет диалог.
    await tester.tap(find.text('Нужен цемент на стяжку'));
    await tester.pumpAndSettle();
    expect(find.text('Подобрал варианты'), findsOneWidget);
  });

  testWidgets('отправка показывает реплику покупателя и ответ ассистента', (
    tester,
  ) async {
    final repo = _FakeAssistantRepository(
      reply: const AssistantReply(
        messages: [
          ChatMessage(role: ChatRole.user, content: 'Нужен цемент'),
          ChatMessage(role: ChatRole.assistant, content: 'Подобрал варианты'),
        ],
        cartId: 'cart_1',
      ),
    );
    await _pump(tester, _harness(repo));

    await _send(tester, 'Нужен цемент');

    expect(repo.calls, 1);
    expect(find.text('Нужен цемент'), findsOneWidget);
    expect(find.text('Подобрал варианты'), findsOneWidget);
    // Приветствие ушло, как только появились сообщения.
    expect(find.text('Чем помочь на стройке?'), findsNothing);
  });

  testWidgets('карточки товара из вставок: метки наличия локализованы', (
    tester,
  ) async {
    final repo = _FakeAssistantRepository(
      reply: const AssistantReply(
        messages: [
          ChatMessage(role: ChatRole.user, content: 'Нужен цемент'),
          ChatMessage(
            role: ChatRole.assistant,
            content: 'Подходящие варианты:',
            attachments: [
              ProductCardAttachment(
                variantId: 'var_1',
                title: 'Цемент М400, мешок 50 кг',
                price: 3200,
                currency: 'KZT',
                unit: 'мешок',
                inStock: true,
              ),
              ProductCardAttachment(
                variantId: 'var_2',
                title: 'Пескобетон М300, мешок 40 кг',
                price: 2100,
                currency: 'KZT',
                unit: 'мешок',
                inStock: false,
              ),
            ],
          ),
        ],
      ),
    );
    await _pump(tester, _harness(repo));
    await _send(tester, 'Нужен цемент');

    // Обе карточки в ленте: название, цена с разрядами, метки наличия ru.
    expect(find.text('Цемент М400, мешок 50 кг'), findsOneWidget);
    expect(find.text('3 200 ₸'), findsOneWidget);
    expect(find.text('В наличии на складе'), findsOneWidget);
    expect(find.text('Под заказ'), findsOneWidget);

    // Единица приходит из данных в именительном падеже — подпись строится
    // слэшем, иначе получалось «за тонна» (находка Ф-прогона 2026-08-13).
    expect(find.text('/ мешок'), findsNWidgets(2));

    // Переключение локали переводит метки вставок на казахский.
    await tester.tap(find.text('Қаз'));
    await tester.pump();
    expect(find.text('Қоймада бар'), findsOneWidget);
    expect(find.text('Тапсырыспен'), findsOneWidget);
  });

  testWidgets('«+» на карточке кладёт товар в корзину без хода модели', (
    tester,
  ) async {
    final repo = _FakeAssistantRepository(
      reply: const AssistantReply(
        messages: [
          ChatMessage(role: ChatRole.user, content: 'Нужен цемент'),
          ChatMessage(
            role: ChatRole.assistant,
            content: 'Подходящие варианты:',
            attachments: [
              ProductCardAttachment(
                variantId: 'var_1',
                title: 'Цемент М400, мешок 50 кг',
                price: 3200,
                currency: 'KZT',
                inStock: true,
              ),
            ],
          ),
        ],
      ),
    );
    await _pump(tester, _harness(repo));
    await _send(tester, 'Нужен цемент');

    expect(
      find.text('Наберите нужное количество кнопками — или напишите словами'),
      findsOneWidget,
    );

    // Нулевое состояние счётчика — кнопка «В корзину».
    await tester.tap(find.text('В корзину'));
    await tester.pump();
    // Показ оптимистичный: счётчик двигается сразу, до ответа сервера.
    expect(find.text('1'), findsOneWidget);

    // Дебаунс: серия нажатий уходит одним запросом.
    await tester.tap(find.byIcon(Icons.add));
    await tester.pump();
    expect(find.text('2'), findsOneWidget);
    await tester.pumpAndSettle();

    expect(repo.cartWrites, 1);
    expect(repo.lastQuantities, {'var_1': 2});
    // Хода модели не было: реплики «Беру …» в ленте нет, ход всего один.
    expect(repo.calls, 1);
    expect(find.text('Беру Цемент М400, мешок 50 кг'), findsNothing);
    // Отметка о нажатии — в ленте, но это не реплика покупателя.
    expect(
      find.text('Добавлено в корзину: Цемент М400, мешок 50 кг × 2'),
      findsOneWidget,
    );
  });

  testWidgets('вставка статуса заказа: степпер стадий по коду цикла', (
    tester,
  ) async {
    final repo = _FakeAssistantRepository(
      reply: _orderStatusReply('in_delivery'),
    );
    await _pump(tester, _routedHarness(repo, authed: true));
    await tester.pumpAndSettle();
    await _send(tester, 'Где мой заказ?');

    // Все четыре стадии в ленте — раньше степпер приходил пустым.
    expect(find.text('Принят'), findsOneWidget);
    expect(find.text('Собран'), findsOneWidget);
    expect(find.text('В доставке'), findsWidgets); // стадия + метка статуса
    expect(find.text('Доставлен'), findsOneWidget);
  });

  // T5.6a: слот доехал до заказа, но в ленте его не было — покупатель заплатил
  // и не видел в карточке, когда ждать машину.
  testWidgets('вставка статуса заказа: окно доставки строкой', (tester) async {
    final repo = _FakeAssistantRepository(
      reply: _orderStatusReply('confirmed', withSlot: true),
    );
    await _pump(tester, _routedHarness(repo, authed: true));
    await tester.pumpAndSettle();
    await _send(tester, 'Где мой заказ?');

    expect(find.text('Доставка'), findsOneWidget);
    expect(find.text('6 сент., 13:00–17:00'), findsOneWidget);
  });

  testWidgets('вставка статуса заказа: без слота строки доставки нет', (
    tester,
  ) async {
    final repo = _FakeAssistantRepository(reply: _orderStatusReply('new'));
    await _pump(tester, _routedHarness(repo, authed: true));
    await tester.pumpAndSettle();
    await _send(tester, 'Где мой заказ?');

    expect(find.text('Доставка'), findsNothing);
  });

  testWidgets('вставка статуса заказа: «Открыть заказ» ведёт на экран заказа', (
    tester,
  ) async {
    final repo = _FakeAssistantRepository(reply: _orderStatusReply('new'));
    await _pump(tester, _routedHarness(repo, authed: true));
    await tester.pumpAndSettle();
    await _send(tester, 'Где мой заказ?');

    await tester.tap(find.text('Открыть заказ'));
    await tester.pumpAndSettle();

    // Переход по токену заказа из диалога.
    expect(find.text('заказ order_43'), findsOneWidget);
  });

  testWidgets('вставка статуса заказа: гостю ссылки на заказ нет', (
    tester,
  ) async {
    final repo = _FakeAssistantRepository(reply: _orderStatusReply('new'));
    await _pump(tester, _routedHarness(repo, authed: false));
    await tester.pumpAndSettle();
    await _send(tester, 'Где мой заказ?');

    // Экран заказа защищён — гостя ссылка увела бы на вход.
    expect(find.text('Заказ № 43'), findsOneWidget);
    expect(find.text('Открыть заказ'), findsNothing);
  });

  testWidgets('пока ассистент отвечает — пузырь «печатает…» с точками', (
    tester,
  ) async {
    await _pump(tester, _harness(_PendingAssistantRepository()));

    await tester.enterText(find.byType(TextField), 'Нужен цемент');
    await tester.pump();
    await tester.tap(find.byIcon(Icons.arrow_upward));
    await tester.pump(); // не settle: ждём ответ, в ленте «печатает…»

    expect(find.byType(AppTypingBubble), findsOneWidget);
    expect(find.bySemanticsLabel('Печатает…'), findsOneWidget);
  });

  testWidgets('второй ход присылает удержанный cart_id', (tester) async {
    final repo = _FakeAssistantRepository(
      reply: const AssistantReply(
        messages: [ChatMessage(role: ChatRole.assistant, content: 'ок')],
        cartId: 'cart_1',
      ),
    );
    await _pump(tester, _harness(repo));

    await _send(tester, 'первый');
    await _send(tester, 'второй');

    expect(repo.calls, 2);
    // На втором ходе клиент вернул токен корзины из первого ответа.
    expect(repo.lastCartId, 'cart_1');
  });

  testWidgets('ошибка показывает баннер, повтор зовёт ассистента снова', (
    tester,
  ) async {
    final repo = _FakeAssistantRepository(fail: true);
    await _pump(tester, _harness(repo));

    await _send(tester, 'привет');

    expect(find.text('Не удалось получить ответ'), findsOneWidget);
    // Реплика покупателя осталась в ленте.
    expect(find.text('привет'), findsOneWidget);
    expect(repo.calls, 1);

    await tester.tap(find.text('Повторить'));
    await tester.pumpAndSettle();

    expect(repo.calls, 2);
  });

  // T10.8: оформление доступно только вошедшему — гость видит в ленте карточку
  // входа по номеру (единственная вставка с действием).
  testWidgets('гость видит карточку входа под ответом ассистента', (
    tester,
  ) async {
    final repo = _FakeAssistantRepository(reply: _authPromptReply());
    await _pump(tester, _routedHarness(repo, authed: false));

    await _send(tester, 'Оформляем');

    expect(find.text('Войдите, чтобы оформить заказ'), findsOneWidget);
    expect(find.text('Войти по номеру'), findsOneWidget);
  });

  // Вернулся из входа — диалог продолжается сам: покупателю не надо гадать,
  // что писать дальше. Карточка входа при этом больше не показывается.
  testWidgets('вошедшему карточка не показывается, а диалог продолжается сам', (
    tester,
  ) async {
    final repo = _FakeAssistantRepository(reply: _authPromptReply());
    await _pump(tester, _routedHarness(repo, authed: true));

    await _send(tester, 'Оформляем');
    await tester.pumpAndSettle();

    expect(find.text('Войти по номеру'), findsNothing);
    // Первый ход — реплика покупателя, второй — авто-продолжение после входа.
    expect(repo.calls, 2);
    expect(repo.lastHistory.last.content, 'Я вошёл, продолжаем оформление');
  });

  // T10.1c: ряд действий под ответом ассистента (бриф §3.4).
  testWidgets('«копировать» кладёт ответ в буфер и показывает подтверждение', (
    tester,
  ) async {
    // Перехватываем платформенный канал буфера обмена: в тесте его нет.
    final copied = <String>[];
    tester.binding.defaultBinaryMessenger.setMockMethodCallHandler(
      SystemChannels.platform,
      (call) async {
        if (call.method == 'Clipboard.setData') {
          copied.add((call.arguments as Map)['text'] as String);
        }
        return null;
      },
    );
    addTearDown(
      () => tester.binding.defaultBinaryMessenger.setMockMethodCallHandler(
        SystemChannels.platform,
        null,
      ),
    );

    final repo = _FakeAssistantRepository(
      reply: const AssistantReply(
        messages: [
          ChatMessage(role: ChatRole.user, content: 'Нужен цемент'),
          ChatMessage(role: ChatRole.assistant, content: 'Подобрал варианты'),
        ],
      ),
    );
    await _pump(tester, _harness(repo));
    await _send(tester, 'Нужен цемент');

    await tester.tap(find.byIcon(Icons.content_copy_outlined));
    await tester.pump();

    expect(copied, ['Подобрал варианты']);
    expect(find.text('Скопировано'), findsOneWidget);
  });

  testWidgets('«повторить ответ» перезапускает последний ход', (tester) async {
    final repo = _FakeAssistantRepository(
      reply: const AssistantReply(
        messages: [
          ChatMessage(role: ChatRole.user, content: 'Нужен цемент'),
          ChatMessage(role: ChatRole.assistant, content: 'Подобрал варианты'),
        ],
      ),
    );
    await _pump(tester, _harness(repo));
    await _send(tester, 'Нужен цемент');
    expect(repo.calls, 1);

    await tester.tap(find.byIcon(Icons.refresh));
    await tester.pumpAndSettle();

    // Ход отправлен заново той же репликой, дубля реплики в истории нет.
    expect(repo.calls, 2);
    expect(repo.lastHistory.map((m) => m.content), ['Нужен цемент']);
    expect(find.text('Нужен цемент'), findsOneWidget);
  });
}
