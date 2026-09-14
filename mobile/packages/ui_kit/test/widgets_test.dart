import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:ui_kit/app_card.dart';
import 'package:ui_kit/app_choice_chip.dart';
import 'package:ui_kit/app_documents_card.dart';
import 'package:ui_kit/app_error_view.dart';
import 'package:ui_kit/app_image_gallery.dart';
import 'package:ui_kit/app_loader.dart';
import 'package:ui_kit/app_primary_button.dart';
import 'package:ui_kit/app_quantity_stepper.dart';
import 'package:ui_kit/app_text_field.dart';
import 'package:ui_kit/app_thumbnail.dart';

Widget _wrap(Widget child) => MaterialApp(home: Scaffold(body: child));

void main() {
  testWidgets('AppCard рендерит содержимое и реагирует на нажатие', (
    tester,
  ) async {
    var tapped = false;
    await tester.pumpWidget(
      _wrap(
        AppCard(onTap: () => tapped = true, child: const Text('содержимое')),
      ),
    );

    expect(find.text('содержимое'), findsOneWidget);
    await tester.tap(find.byType(AppCard));
    expect(tapped, isTrue);
  });

  testWidgets('AppLoader показывает индикатор загрузки', (tester) async {
    await tester.pumpWidget(_wrap(const AppLoader()));

    expect(find.byType(CircularProgressIndicator), findsOneWidget);
  });

  testWidgets('AppErrorView показывает сообщение и кнопку повтора', (
    tester,
  ) async {
    var retried = false;
    await tester.pumpWidget(
      _wrap(
        AppErrorView(
          message: 'ошибка',
          retryLabel: 'повторить',
          onRetry: () => retried = true,
        ),
      ),
    );

    expect(find.text('ошибка'), findsOneWidget);
    await tester.tap(find.text('повторить'));
    expect(retried, isTrue);
  });

  testWidgets('AppErrorView без onRetry не показывает кнопку', (tester) async {
    await tester.pumpWidget(_wrap(const AppErrorView(message: 'ошибка')));

    expect(find.text('ошибка'), findsOneWidget);
    expect(find.byType(ElevatedButton), findsNothing);
  });

  testWidgets('AppPrimaryButton зовёт onPressed; при null — неактивна', (
    tester,
  ) async {
    var pressed = false;
    await tester.pumpWidget(
      _wrap(
        AppPrimaryButton(label: 'В корзину', onPressed: () => pressed = true),
      ),
    );
    await tester.tap(find.text('В корзину'));
    expect(pressed, isTrue);

    await tester.pumpWidget(_wrap(const AppPrimaryButton(label: 'В корзину')));
    final button = tester.widget<ElevatedButton>(find.byType(ElevatedButton));
    expect(button.onPressed, isNull);
  });

  testWidgets('AppChoiceChip зовёт onTap', (tester) async {
    var tapped = false;
    await tester.pumpWidget(
      _wrap(
        AppChoiceChip(
          label: 'Мешок 50 кг',
          selected: true,
          onTap: () => tapped = true,
        ),
      ),
    );

    expect(find.text('Мешок 50 кг'), findsOneWidget);
    await tester.tap(find.byType(AppChoiceChip));
    expect(tapped, isTrue);
  });

  testWidgets('AppImageGallery без изображений показывает плейсхолдер', (
    tester,
  ) async {
    await tester.pumpWidget(_wrap(const AppImageGallery(imageUrls: [])));

    expect(find.byIcon(Icons.image_outlined), findsOneWidget);
  });

  testWidgets('AppThumbnail без URL показывает плейсхолдер', (tester) async {
    await tester.pumpWidget(_wrap(const AppThumbnail(url: null)));

    expect(find.byIcon(Icons.image_outlined), findsOneWidget);
  });

  testWidgets('AppQuantityStepper показывает значение и зовёт колбэки', (
    tester,
  ) async {
    var incremented = false;
    var decremented = false;
    await tester.pumpWidget(
      _wrap(
        AppQuantityStepper(
          value: 3,
          onIncrement: () => incremented = true,
          onDecrement: () => decremented = true,
        ),
      ),
    );

    expect(find.text('3'), findsOneWidget);
    await tester.tap(find.byIcon(Icons.add));
    expect(incremented, isTrue);
    await tester.tap(find.byIcon(Icons.remove));
    expect(decremented, isTrue);
  });

  testWidgets('AppQuantityStepper без колбэков делает кнопки неактивными', (
    tester,
  ) async {
    await tester.pumpWidget(_wrap(const AppQuantityStepper(value: 1)));

    final buttons = tester.widgetList<IconButton>(find.byType(IconButton));
    expect(buttons.length, 2);
    expect(buttons.every((button) => button.onPressed == null), isTrue);
  });

  // --- Целевой режим счётчика (T10.15): карточка подбора и полоса корзины ---

  testWidgets('AppQuantityStepper: ноль — это кнопка «в корзину»', (
    tester,
  ) async {
    // Минус при нуле бессмысленен, а «0» на счётчике читается как «уже
    // добавлено нулём».
    var target = -1;
    await tester.pumpWidget(
      _wrap(
        AppQuantityStepper(
          value: 0,
          addLabel: 'В корзину',
          onChanged: (next) => target = next,
        ),
      ),
    );

    expect(find.byIcon(Icons.remove), findsNothing);
    await tester.tap(find.text('В корзину'));
    expect(target, 1);
  });

  testWidgets('AppQuantityStepper: минус на единице убирает позицию', (
    tester,
  ) async {
    // Иначе в корзине копились бы строки с нулём.
    var target = -1;
    await tester.pumpWidget(
      _wrap(
        AppQuantityStepper(
          value: 1,
          addLabel: 'В корзину',
          onChanged: (next) => target = next,
        ),
      ),
    );

    await tester.tap(find.byIcon(Icons.remove));
    expect(target, 0);
  });

  testWidgets('AppQuantityStepper: число — кнопка с вводом количества', (
    tester,
  ) async {
    // 30 мешков 30 нажатиями не набирают.
    var target = -1;
    await tester.pumpWidget(
      _wrap(
        AppQuantityStepper(
          value: 2,
          addLabel: 'В корзину',
          quantityLabel: 'Количество',
          onChanged: (next) => target = next,
        ),
      ),
    );

    await tester.tap(find.text('2'));
    await tester.pump();
    await tester.enterText(find.byType(TextField), '30');
    await tester.testTextInput.receiveAction(TextInputAction.done);
    await tester.pump();

    expect(target, 30);
  });

  testWidgets('AppDocumentsCard показывает документы и открывает PDF', (
    tester,
  ) async {
    var opened = false;
    await tester.pumpWidget(
      _wrap(
        AppDocumentsCard(
          title: 'Документы по заказу № 24',
          openLabel: 'Открыть PDF',
          pendingLabel: 'файл готовится',
          documents: [
            AppDocumentEntry(
              title: 'Счёт на оплату',
              number: 'INV-2026-000001',
              onOpen: () => opened = true,
            ),
            const AppDocumentEntry(
              title: 'Накладная',
              number: 'WB-2026-000004',
            ),
          ],
        ),
      ),
    );

    expect(find.text('Документы по заказу № 24'), findsOneWidget);
    expect(find.text('INV-2026-000001'), findsOneWidget);
    // Документ без файла — без кнопки, с подписью «файл готовится».
    expect(find.text('Открыть PDF'), findsOneWidget);
    expect(find.text('файл готовится'), findsOneWidget);

    await tester.tap(find.text('Открыть PDF'));
    expect(opened, isTrue);
  });

  testWidgets('AppTextField показывает подсказку формата под полем', (
    tester,
  ) async {
    final controller = TextEditingController();
    addTearDown(controller.dispose);
    await tester.pumpWidget(
      _wrap(
        AppTextField(
          controller: controller,
          label: 'БИН',
          helperText: '12 цифр',
        ),
      ),
    );

    expect(find.text('БИН'), findsOneWidget);
    expect(find.text('12 цифр'), findsOneWidget);
  });

  testWidgets('AppTextField без helperText подсказку не рисует', (
    tester,
  ) async {
    final controller = TextEditingController();
    addTearDown(controller.dispose);
    await tester.pumpWidget(
      _wrap(AppTextField(controller: controller, label: 'БИН')),
    );

    expect(find.text('12 цифр'), findsNothing);
  });
}
