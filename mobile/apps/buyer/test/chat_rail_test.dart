import 'dart:async';
import 'dart:convert';

import 'package:core/auth/auth_controller.dart';
import 'package:core/auth/auth_customer.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:ui_kit/app_search_field.dart';
import 'package:ui_kit/app_theme.dart';

import 'package:marketplace_buyer/features/assistant/domain/chat_file.dart';
import 'package:marketplace_buyer/features/assistant/data/assistant_repository.dart';
import 'no_assistant_cart.dart';
import 'no_assistant_stream.dart';
import 'package:marketplace_buyer/features/assistant/data/shared_prefs_chat_history_store.dart';
import 'package:marketplace_buyer/features/assistant/domain/assistant_reply.dart';
import 'package:marketplace_buyer/features/assistant/domain/chat_message.dart';
import 'package:marketplace_buyer/features/assistant/providers/assistant_repository_provider.dart';
import 'package:marketplace_buyer/features/assistant/providers/chat_history_store_provider.dart';
import 'package:marketplace_buyer/features/assistant/screens/chat_screen.dart';

/// Рельс истории по брифу T10.1 (§3.1): поиск с порога 5 диалогов, меню строки
/// с переименованием и удаление с подтверждением. Тесты работают через экран —
/// панель открывается из шапки, как у покупателя.

/// Ассистент в этих тестах не зовётся — рельс работает с локальной историей.
class _StubAssistantRepository
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

class _AuthedAuthController extends AuthController {
  @override
  Future<AuthCustomer?> build() async =>
      const AuthCustomer(id: 'cus_1', email: 'buyer@stroymarket.kz');
}

/// Пять диалогов — ровно порог показа поиска (формат store v1).
String _seededHistory() => jsonEncode([
  for (final entry in const [
    ('5', 'Цемент на стяжку 30 м²', '2026-08-26T10:12:00.000'),
    ('4', 'Кирпич облицовочный на фасад', '2026-08-25T16:40:00.000'),
    ('3', 'Газоблок на перегородку 12 м²', '2026-08-24T09:05:00.000'),
    ('2', 'Песок мытый, 3 тонны', '2026-08-23T12:00:00.000'),
    ('1', 'Где мой заказ?', '2026-08-22T08:30:00.000'),
  ])
    {
      'id': entry.$1,
      'title': entry.$2,
      'updated_at': entry.$3,
      'messages': [
        {'role': 'user', 'content': entry.$2},
        {'role': 'assistant', 'content': 'Подобрал варианты'},
      ],
    },
]);

late SharedPreferences _prefs;

/// Открывает экран чата в габаритах телефона и раскрывает рельс истории.
Future<void> _openRail(WidgetTester tester) async {
  tester.view.physicalSize = const Size(412, 892);
  tester.view.devicePixelRatio = 1.0;
  addTearDown(tester.view.reset);

  await tester.pumpWidget(
    ProviderScope(
      overrides: [
        assistantRepositoryProvider.overrideWithValue(
          _StubAssistantRepository(),
        ),
        authControllerProvider.overrideWith(_AuthedAuthController.new),
        sharedPreferencesProvider.overrideWithValue(_prefs),
      ],
      child: MaterialApp(theme: buildAppTheme(), home: const ChatScreen()),
    ),
  );
  await tester.pumpAndSettle();
  await tester.tap(find.byIcon(Icons.menu));
  await tester.pumpAndSettle();
}

void main() {
  setUp(() async {
    SharedPreferences.setMockInitialValues({
      'assistant_chat_history_v1': _seededHistory(),
    });
    _prefs = await SharedPreferences.getInstance();
  });

  testWidgets('поиск фильтрует историю по названию и тексту реплик', (
    tester,
  ) async {
    await _openRail(tester);

    expect(find.byType(AppSearchField), findsOneWidget);
    expect(find.text('НЕДАВНИЕ'), findsOneWidget);
    expect(find.text('Кирпич облицовочный на фасад'), findsOneWidget);

    await tester.enterText(find.byType(AppSearchField), 'кирпич');
    await tester.pumpAndSettle();

    // Регистр не важен, остальные диалоги ушли из списка.
    expect(find.text('Кирпич облицовочный на фасад'), findsOneWidget);
    expect(find.text('Цемент на стяжку 30 м²'), findsNothing);

    await tester.enterText(find.byType(AppSearchField), 'экскаватор');
    await tester.pumpAndSettle();
    expect(find.text('Ничего не нашлось'), findsOneWidget);
  });

  testWidgets('меню строки: переименование сохраняется в истории', (
    tester,
  ) async {
    await _openRail(tester);

    await tester.tap(find.byIcon(Icons.more_vert).first);
    await tester.pumpAndSettle();
    await tester.tap(find.text('Переименовать'));
    await tester.pumpAndSettle();

    // Инлайн-поле в строке подставляет текущее название.
    final field = find.widgetWithText(TextField, 'Цемент на стяжку 30 м²');
    expect(field, findsOneWidget);

    await tester.enterText(field, 'Стяжка в подвале');
    await tester.testTextInput.receiveAction(TextInputAction.done);
    await tester.pumpAndSettle();

    expect(find.text('Стяжка в подвале'), findsOneWidget);
    final saved = await SharedPrefsChatHistoryStore(_prefs).load();
    final renamed = saved.firstWhere((c) => c.id == '5');
    expect(renamed.title, 'Стяжка в подвале');
    // Флаг «имя задал покупатель» — автозаголовок его не перетрёт.
    expect(renamed.titleCustom, isTrue);
  });

  testWidgets('удаление спрашивает подтверждение и убирает диалог', (
    tester,
  ) async {
    await _openRail(tester);

    await tester.tap(find.byIcon(Icons.more_vert).first);
    await tester.pumpAndSettle();
    await tester.tap(find.text('Удалить диалог'));
    await tester.pumpAndSettle();

    expect(find.text('Удалить диалог?'), findsOneWidget);
    expect(find.text('Его нельзя восстановить'), findsOneWidget);

    // Отмена оставляет диалог на месте.
    await tester.tap(find.text('Отмена'));
    await tester.pumpAndSettle();
    expect(find.text('Цемент на стяжку 30 м²'), findsOneWidget);

    await tester.tap(find.byIcon(Icons.more_vert).first);
    await tester.pumpAndSettle();
    await tester.tap(find.text('Удалить диалог'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Удалить'));
    await tester.pumpAndSettle();

    expect(find.text('Цемент на стяжку 30 м²'), findsNothing);
    final saved = await SharedPrefsChatHistoryStore(_prefs).load();
    expect(saved.map((c) => c.id), isNot(contains('5')));
  });

  testWidgets('поиск не показывается, пока диалогов меньше порога', (
    tester,
  ) async {
    // Четыре диалога — на один меньше порога.
    final trimmed = (jsonDecode(_seededHistory()) as List).sublist(0, 4);
    SharedPreferences.setMockInitialValues({
      'assistant_chat_history_v1': jsonEncode(trimmed),
    });
    _prefs = await SharedPreferences.getInstance();

    await _openRail(tester);

    expect(find.byType(AppSearchField), findsNothing);
    expect(find.text('НЕДАВНИЕ'), findsOneWidget);
  });
}
