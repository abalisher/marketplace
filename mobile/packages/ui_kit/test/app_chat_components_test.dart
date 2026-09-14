import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:ui_kit/app_assistant_answer.dart';
import 'package:ui_kit/app_assistant_markdown.dart';
import 'package:ui_kit/app_chat_bubble.dart';
import 'package:ui_kit/app_color_tokens.dart';
import 'package:ui_kit/app_colors.dart';
import 'package:ui_kit/app_history_item.dart';
import 'package:ui_kit/app_image_viewer.dart';
import 'package:ui_kit/app_inline_markdown.dart';
import 'package:ui_kit/app_input_bar.dart';
import 'package:ui_kit/app_message_actions.dart';
import 'package:ui_kit/app_order_list_item.dart';
import 'package:ui_kit/app_order_status_block.dart';
import 'package:ui_kit/app_product_card.dart';
import 'package:ui_kit/app_search_field.dart';
import 'package:ui_kit/app_status_badge.dart';
import 'package:ui_kit/app_suggestion_chip.dart';
import 'package:ui_kit/app_theme.dart';
import 'package:ui_kit/app_typing_bubble.dart';
import 'package:ui_kit/app_typography.dart';

Widget _host(Widget child) => MaterialApp(
  home: Scaffold(body: SingleChildScrollView(child: child)),
);

Widget _darkHost(Widget child) => MaterialApp(
  theme: buildAppTheme(brightness: Brightness.dark),
  home: Scaffold(body: SingleChildScrollView(child: child)),
);

void main() {
  testWidgets('AppChatBubble показывает текст', (tester) async {
    await tester.pumpWidget(
      _host(const AppChatBubble(text: 'Нужен цемент', isUser: true)),
    );
    expect(find.text('Нужен цемент'), findsOneWidget);
  });

  testWidgets('AppChatBubble выделяет **фрагменты** полужирным', (
    tester,
  ) async {
    await tester.pumpWidget(
      _host(
        const AppChatBubble(text: 'Нужно **27 мешков** цемента', isUser: false),
      ),
    );
    // Маркеры ** не отображаются — текст склеен из спанов.
    expect(find.text('Нужно 27 мешков цемента'), findsOneWidget);

    final spans = AppInlineMarkdown.spans(
      'Нужно **27 мешков** цемента',
      color: AppColors.ink,
      boldStyle: AppTypography.bodyLargeSemibold,
    );
    expect(spans, hasLength(3));
    expect((spans[1] as TextSpan).text, '27 мешков');
    expect((spans[1] as TextSpan).style?.fontWeight, FontWeight.w600);
    // Непарные ** остаются текстом как есть.
    final unpaired = AppInlineMarkdown.spans(
      'Скидка ** сегодня',
      color: AppColors.ink,
      boldStyle: AppTypography.bodyLargeSemibold,
    );
    expect(unpaired, hasLength(1));
    expect((unpaired.single as TextSpan).text, 'Скидка ** сегодня');
  });

  testWidgets('AppInlineMarkdown: краевые случаи разметки', (tester) async {
    String plain(List<InlineSpan> spans) =>
        spans.map((s) => (s as TextSpan).text).join();
    List<String?> boldTexts(List<InlineSpan> spans) => spans
        .where((s) => (s as TextSpan).style?.fontWeight == FontWeight.w600)
        .map((s) => (s as TextSpan).text)
        .toList();

    // Пустая пара «****» — литерал, ничего не проглатывается.
    final empty = AppInlineMarkdown.spans(
      'a****b',
      color: AppColors.ink,
      boldStyle: AppTypography.bodyLargeSemibold,
    );
    expect(plain(empty), 'a****b');
    expect(boldTexts(empty), isEmpty);

    // Выделение в начале и в конце строки.
    final edges = AppInlineMarkdown.spans(
      '**27 мешков** и песок **1 : 3**',
      color: AppColors.ink,
      boldStyle: AppTypography.bodyLargeSemibold,
    );
    expect(plain(edges), '27 мешков и песок 1 : 3');
    expect(boldTexts(edges), ['27 мешков', '1 : 3']);

    // Тройные звёздочки: жирным уходит «*x», хвостовая «*» остаётся текстом.
    final triple = AppInlineMarkdown.spans(
      '***x***',
      color: AppColors.ink,
      boldStyle: AppTypography.bodyLargeSemibold,
    );
    expect(plain(triple), '*x*');
    expect(boldTexts(triple), ['*x']);
  });

  testWidgets('AppTypingBubble: точки мигают каскадом со сдвигом фазы', (
    tester,
  ) async {
    await tester.pumpWidget(_host(const AppTypingBubble(label: 'Печатает…')));
    // t = 0.24s (фаза 0.2): первая точка почти разгорелась, вторая на старте
    // подъёма, третья ещё в хвосте паузы — прозрачности строго убывают.
    await tester.pump(const Duration(milliseconds: 240));
    final dots = tester
        .widgetList<Opacity>(
          find.descendant(
            of: find.byType(AppTypingBubble),
            matching: find.byType(Opacity),
          ),
        )
        .map((o) => o.opacity)
        .toList();
    expect(dots, hasLength(3));
    expect(dots[0], greaterThan(dots[1]));
    expect(dots[1], greaterThan(dots[2]));
    expect(find.bySemanticsLabel('Печатает…'), findsOneWidget);
  });

  testWidgets('AppChatBubble: хвост ассистента сверху слева (макет 1b)', (
    tester,
  ) async {
    await tester.pumpWidget(
      _host(const AppChatBubble(text: 'Подобрал варианты', isUser: false)),
    );
    final box = tester.widget<Container>(
      find.ancestor(
        of: find.text('Подобрал варианты'),
        matching: find.byType(Container),
      ),
    );
    final radius = (box.decoration as BoxDecoration).borderRadius!;
    expect(
      radius,
      const BorderRadius.only(
        topLeft: Radius.circular(4),
        topRight: Radius.circular(16),
        bottomLeft: Radius.circular(16),
        bottomRight: Radius.circular(16),
      ),
    );
  });

  testWidgets('AppProductCard показывает название, цену и наличие', (
    tester,
  ) async {
    await tester.pumpWidget(
      _host(
        const AppProductCard(
          title: 'Цемент М400',
          price: '3 200 ₸',
          unit: 'за мешок',
          stockLabel: 'В наличии',
          stockColor: AppColors.success,
        ),
      ),
    );
    expect(find.text('Цемент М400'), findsOneWidget);
    expect(find.text('3 200 ₸'), findsOneWidget);
    expect(find.text('В наличии'), findsOneWidget);
  });

  testWidgets('AppProductCard: тап зовёт onTap, без onTap карточка read-only', (
    tester,
  ) async {
    var taps = 0;
    await tester.pumpWidget(
      _host(
        AppProductCard(
          title: 'Цемент М400',
          price: '3 200 ₸',
          stockLabel: 'В наличии',
          stockColor: AppColors.success,
          onTap: () => taps++,
        ),
      ),
    );
    await tester.tap(find.text('Цемент М400'));
    expect(taps, 1);

    await tester.pumpWidget(
      _host(
        const AppProductCard(
          title: 'Цемент М400',
          price: '3 200 ₸',
          stockLabel: 'В наличии',
          stockColor: AppColors.success,
        ),
      ),
    );
    expect(find.byType(InkWell), findsNothing);
  });

  testWidgets(
    'AppProductCard: тап по фото зовёт onImageTap и не выбирает товар',
    (tester) async {
      var picks = 0;
      var photos = 0;
      await tester.pumpWidget(
        _host(
          AppProductCard(
            title: 'Цемент М400',
            price: '3 200 ₸',
            stockLabel: 'В наличии',
            stockColor: AppColors.success,
            imageUrl: 'https://example.test/cement.jpg',
            imageTapLabel: 'Открыть фото',
            onTap: () => picks++,
            onImageTap: () => photos++,
          ),
        ),
      );

      // Метка-лупа подсказывает, что миниатюра — отдельная цель нажатия.
      await tester.tap(find.byIcon(Icons.zoom_in));
      expect(photos, 1);
      expect(picks, 0);

      // Тап по остальной карточке остаётся выбором товара.
      await tester.tap(find.text('Цемент М400'));
      expect(picks, 1);
      expect(photos, 1);
    },
  );

  testWidgets('AppImageViewer: показывает подпись и закрывается крестиком', (
    tester,
  ) async {
    await tester.pumpWidget(
      _host(
        Builder(
          builder: (context) => TextButton(
            onPressed: () => AppImageViewer.show(
              context,
              imageUrl: 'https://example.test/cement.jpg',
              title: 'Цемент М400',
              closeLabel: 'Закрыть',
            ),
            child: const Text('открыть'),
          ),
        ),
      ),
    );

    await tester.tap(find.text('открыть'));
    await tester.pumpAndSettle();
    expect(find.byType(AppImageViewer), findsOneWidget);
    expect(find.text('Цемент М400'), findsOneWidget);
    expect(find.byType(InteractiveViewer), findsOneWidget);

    await tester.tap(find.byIcon(Icons.close));
    await tester.pumpAndSettle();
    expect(find.byType(AppImageViewer), findsNothing);
  });

  testWidgets('AppInputBar: кнопка неактивна без текста, активна с текстом и '
      'зовёт onSend', (tester) async {
    final controller = TextEditingController();
    String? sent;
    await tester.pumpWidget(
      _host(
        AppInputBar(
          controller: controller,
          onSend: (t) => sent = t,
          hintText: 'Сообщение',
        ),
      ),
    );
    // Пустое поле — отправка не срабатывает.
    await tester.tap(find.byIcon(Icons.arrow_upward));
    await tester.pump();
    expect(sent, isNull);
    // С текстом — отправляет обрезанный текст.
    await tester.enterText(find.byType(TextField), '  Оформляй  ');
    await tester.pump();
    await tester.tap(find.byIcon(Icons.arrow_upward));
    await tester.pump();
    expect(sent, 'Оформляй');
  });

  testWidgets('AppSuggestionChip зовёт onTap', (tester) async {
    var tapped = false;
    await tester.pumpWidget(
      _host(
        AppSuggestionChip(
          label: 'Нужен цемент на стяжку 30 м²',
          onTap: () => tapped = true,
        ),
      ),
    );
    await tester.tap(find.text('Нужен цемент на стяжку 30 м²'));
    expect(tapped, isTrue);
  });

  testWidgets('AppStatusBadge показывает метку', (tester) async {
    await tester.pumpWidget(
      _host(const AppStatusBadge(label: 'В доставке', color: AppColors.accent)),
    );
    expect(find.text('В доставке'), findsOneWidget);
  });

  testWidgets('AppOrderStatusBlock показывает стадии и код получения', (
    tester,
  ) async {
    await tester.pumpWidget(
      _host(
        const AppOrderStatusBlock(
          orderNumber: '№ СМ-4821',
          statusLabel: 'В доставке',
          statusColor: AppColors.accent,
          stages: [
            AppOrderStage('Принят', AppOrderStageState.done),
            AppOrderStage('Собран', AppOrderStageState.done),
            AppOrderStage('В доставке', AppOrderStageState.active),
            AppOrderStage('Доставлен', AppOrderStageState.pending),
          ],
          courierNote: 'Курьер в пути · ≈ 12:40',
          slotTitle: 'Доставка',
          slotLabel: '6 сент., 13:00–17:00',
          receiptCode: '7419',
          codeLabel: 'Код получения',
        ),
      ),
    );
    expect(find.text('№ СМ-4821'), findsOneWidget);
    expect(find.text('Принят'), findsOneWidget);
    expect(find.text('Доставлен'), findsOneWidget);
    expect(find.text('7 4 1 9'), findsOneWidget); // код с разрядкой
    // Слот доставки — строкой «Доставка · окно» (T5.6a).
    expect(find.text('Доставка'), findsOneWidget);
    expect(find.text('6 сент., 13:00–17:00'), findsOneWidget);
  });

  // Слот необязателен: у заказа до T5.6 его нет, и строка не должна появляться
  // пустой подписью.
  testWidgets('AppOrderStatusBlock без слота: строки доставки нет', (
    tester,
  ) async {
    await tester.pumpWidget(
      _host(
        const AppOrderStatusBlock(
          orderNumber: '№ СМ-4821',
          statusLabel: 'Оформлен',
          statusColor: AppColors.accent,
          stages: [AppOrderStage('Принят', AppOrderStageState.active)],
        ),
      ),
    );
    expect(find.text('Доставка'), findsNothing);
  });

  testWidgets('AppOrderStatusBlock: ссылка открытия заказа зовёт onOpen', (
    tester,
  ) async {
    var opened = false;
    await tester.pumpWidget(
      _host(
        AppOrderStatusBlock(
          orderNumber: '№ СМ-4821',
          statusLabel: 'В доставке',
          statusColor: AppColors.accent,
          stages: const [],
          openLabel: 'Открыть заказ',
          onOpen: () => opened = true,
        ),
      ),
    );

    expect(find.text('Открыть заказ'), findsOneWidget);
    await tester.tap(find.text('Открыть заказ'));
    expect(opened, isTrue);
  });

  testWidgets('AppOrderStatusBlock без onOpen: ссылки нет', (tester) async {
    await tester.pumpWidget(
      _host(
        const AppOrderStatusBlock(
          orderNumber: '№ СМ-4821',
          statusLabel: 'В доставке',
          statusColor: AppColors.accent,
          stages: [],
          openLabel: 'Открыть заказ',
        ),
      ),
    );

    expect(find.text('Открыть заказ'), findsNothing);
  });

  testWidgets('компоненты берут цвета из тёмной темы (токены из контекста)', (
    tester,
  ) async {
    await tester.pumpWidget(
      _darkHost(
        const Column(
          children: [
            AppChatBubble(text: 'Нужен цемент', isUser: true),
            AppChatBubble(text: 'Подобрал варианты', isUser: false),
          ],
        ),
      ),
    );

    // Пузырь покупателя залит тёмным акцентом, ответ — тёмной поверхностью.
    final containers = tester
        .widgetList<Container>(find.byType(Container))
        .toList();
    final colors = containers
        .map((c) => (c.decoration as BoxDecoration?)?.color)
        .whereType<Color>()
        .toList();
    expect(colors, contains(AppColorTokens.dark.accent));
    expect(colors, contains(AppColorTokens.dark.surface));
  });

  testWidgets('AppHistoryItem и AppOrderListItem зовут onTap', (tester) async {
    var h = false;
    var o = false;
    await tester.pumpWidget(
      _host(
        Column(
          children: [
            AppHistoryItem(
              title: 'Цемент на стяжку 30 м²',
              meta: 'заказ № СМ-4821 · оплачен',
              active: true,
              onTap: () => h = true,
            ),
            AppOrderListItem(
              number: '№ СМ-4821',
              meta: '1 позиция · 92 400 ₸',
              statusLabel: 'В доставке',
              statusColor: AppColors.accent,
              onTap: () => o = true,
            ),
          ],
        ),
      ),
    );
    await tester.tap(find.text('Цемент на стяжку 30 м²'));
    await tester.tap(find.text('№ СМ-4821'));
    expect(h, isTrue);
    expect(o, isTrue);
  });

  // --- Оболочка чата по эталону Gemini (T10.1c) ---

  testWidgets('AppInputBar: на время хода поле редактируется, отправка нет', (
    tester,
  ) async {
    final controller = TextEditingController();
    String? sent;
    await tester.pumpWidget(
      _host(
        AppInputBar(
          controller: controller,
          onSend: (t) => sent = t,
          sendEnabled: false,
          hintText: 'Сообщение',
        ),
      ),
    );
    // Печатать можно — покупатель готовит следующий вопрос (бриф §3.3)…
    await tester.enterText(find.byType(TextField), 'а сколько доставка?');
    await tester.pump();
    expect(
      find.widgetWithText(TextField, 'а сколько доставка?'),
      findsOneWidget,
    );
    // …но отправка недоступна, пока идёт ход.
    await tester.tap(find.byIcon(Icons.arrow_upward));
    await tester.pump();
    expect(sent, isNull);
  });

  testWidgets(
    'AppInputBar: на время хода отправка становится «Стоп» (T10.1d)',
    (tester) async {
      var stopped = 0;
      final controller = TextEditingController(text: 'ещё вопрос');
      await tester.pumpWidget(
        _host(
          AppInputBar(
            controller: controller,
            onSend: (_) {},
            sendEnabled: false,
            onStop: () => stopped++,
            stopLabel: 'Остановить ответ',
          ),
        ),
      );
      // На месте отправки — «Стоп»: стрелки нет, квадрат есть.
      expect(find.byIcon(Icons.arrow_upward), findsNothing);
      expect(find.byIcon(Icons.stop_rounded), findsOneWidget);
      await tester.tap(find.byIcon(Icons.stop_rounded));
      await tester.pump();
      expect(stopped, 1);

      // Ход закончился — вернулась отправка.
      await tester.pumpWidget(
        _host(
          AppInputBar(
            controller: controller,
            onSend: (_) {},
            onStop: () => stopped++,
            stopLabel: 'Остановить ответ',
          ),
        ),
      );
      expect(find.byIcon(Icons.stop_rounded), findsNothing);
      expect(find.byIcon(Icons.arrow_upward), findsOneWidget);
    },
  );

  testWidgets('AppInputBar: без onStop на время хода остаётся отправка', (
    tester,
  ) async {
    await tester.pumpWidget(
      _host(
        AppInputBar(
          controller: TextEditingController(),
          onSend: (_) {},
          sendEnabled: false,
        ),
      ),
    );
    expect(find.byIcon(Icons.stop_rounded), findsNothing);
    expect(find.byIcon(Icons.arrow_upward), findsOneWidget);
  });

  testWidgets('AppInputBar: тап-таргет «Стоп» — 48dp', (tester) async {
    await tester.pumpWidget(
      _host(
        AppInputBar(
          controller: TextEditingController(),
          onSend: (_) {},
          sendEnabled: false,
          onStop: () {},
        ),
      ),
    );
    final size = tester.getSize(
      find.ancestor(
        of: find.byIcon(Icons.stop_rounded),
        matching: find.byType(SizedBox),
      ),
    );
    expect(size, const Size(48, 48));
  });

  testWidgets('AppInputBar: авторост до 8 строк, дальше внутренний скролл', (
    tester,
  ) async {
    await tester.pumpWidget(
      _host(AppInputBar(controller: TextEditingController(), onSend: (_) {})),
    );
    final field = tester.widget<TextField>(find.byType(TextField));
    expect(field.minLines, 1);
    expect(field.maxLines, AppInputBar.maxLines);
    expect(AppInputBar.maxLines, 8);
  });

  testWidgets('AppAssistantMarkdown: абзацы, маркеры и нумерация', (
    tester,
  ) async {
    await tester.pumpWidget(
      _host(
        const AppAssistantMarkdown(
          text:
              'Нужно **27 мешков**:\n'
              '- цемент М400\n'
              '* песок мытый\n'
              '\n'
              '1. привезём завтра\n'
              '2) оплата Kaspi',
        ),
      ),
    );
    // Маркеры разметки не печатаются, содержимое пунктов — печатается.
    expect(find.text('Нужно 27 мешков:'), findsOneWidget);
    expect(find.text('цемент М400'), findsOneWidget);
    expect(find.text('песок мытый'), findsOneWidget);
    expect(find.text('•'), findsNWidgets(2));
    // Номер берём из текста ассистента, а не перенумеровываем.
    expect(find.text('1.'), findsOneWidget);
    expect(find.text('2.'), findsOneWidget);
    expect(find.text('привезём завтра'), findsOneWidget);
    expect(find.text('оплата Kaspi'), findsOneWidget);
  });

  testWidgets('AppAssistantAnswer: без пузыря, с меткой-аватаром и вставками', (
    tester,
  ) async {
    await tester.pumpWidget(
      _host(
        const AppAssistantAnswer(
          text: 'Подобрал варианты',
          avatarMark: 'СМ',
          attachments: [Text('карточка товара')],
          actions: Text('действия'),
        ),
      ),
    );
    expect(find.text('СМ'), findsOneWidget);
    expect(find.text('Подобрал варианты'), findsOneWidget);
    expect(find.text('карточка товара'), findsOneWidget);
    expect(find.text('действия'), findsOneWidget);
    // Пузыря у ответа нет — только метка-аватар и текст.
    expect(find.byType(AppChatBubble), findsNothing);
  });

  testWidgets('AppMessageActions: копировать всегда, повтор — по callback', (
    tester,
  ) async {
    var copied = false;
    var again = false;
    await tester.pumpWidget(
      _host(
        Column(
          children: [
            AppMessageActions(
              copyLabel: 'Копировать',
              onCopy: () => copied = true,
              regenerateLabel: 'Повторить ответ',
              onRegenerate: () => again = true,
            ),
            AppMessageActions(copyLabel: 'Копировать', onCopy: () {}),
          ],
        ),
      ),
    );
    // Повтор есть только у первого ряда (последний ответ в ленте).
    expect(find.byIcon(Icons.content_copy_outlined), findsNWidgets(2));
    expect(find.byIcon(Icons.refresh), findsOneWidget);

    await tester.tap(find.byIcon(Icons.content_copy_outlined).first);
    await tester.tap(find.byIcon(Icons.refresh));
    expect(copied, isTrue);
    expect(again, isTrue);
  });

  testWidgets('AppSearchField: крестик появляется с текстом и очищает поле', (
    tester,
  ) async {
    final controller = TextEditingController();
    await tester.pumpWidget(
      _host(
        AppSearchField(
          controller: controller,
          hintText: 'Поиск по диалогам',
          clearLabel: 'Очистить поиск',
        ),
      ),
    );
    expect(find.byIcon(Icons.close), findsNothing);

    await tester.enterText(find.byType(TextField), 'кирпич');
    await tester.pump();
    expect(find.byIcon(Icons.close), findsOneWidget);

    await tester.tap(find.byIcon(Icons.close));
    await tester.pump();
    expect(controller.text, isEmpty);
    expect(find.byIcon(Icons.close), findsNothing);
  });

  testWidgets('AppHistoryItem: активная строка на контейнере акцента', (
    tester,
  ) async {
    await tester.pumpWidget(
      _host(
        const Column(
          children: [
            AppHistoryItem(
              title: 'Активный диалог',
              active: true,
              trailing: Icon(Icons.more_vert),
            ),
            AppHistoryItem(title: 'Обычный диалог'),
          ],
        ),
      ),
    );
    final materials = tester
        .widgetList<Material>(
          find.descendant(
            of: find.byType(AppHistoryItem),
            matching: find.byType(Material),
          ),
        )
        .map((m) => m.color)
        .toList();
    expect(materials, contains(AppColorTokens.light.accentContainer));
    expect(materials, contains(Colors.transparent));
    // Слот «⋮» — на месте.
    expect(find.byIcon(Icons.more_vert), findsOneWidget);
  });
}
