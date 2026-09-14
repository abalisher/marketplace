import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:ui_kit/app_icon_button.dart';
import 'package:ui_kit/app_input_bar.dart';
import 'package:ui_kit/app_mic_button.dart';
import 'package:ui_kit/app_recording_indicator.dart';

Widget _host(Widget child) => MaterialApp(
  home: Scaffold(body: Center(child: child)),
);

void main() {
  testWidgets('AppMicButton: в покое микрофон, в записи — стоп', (
    tester,
  ) async {
    await tester.pumpWidget(_host(AppMicButton(onTap: () {})));
    expect(find.byIcon(Icons.mic_none_rounded), findsOneWidget);

    await tester.pumpWidget(
      _host(AppMicButton(isRecording: true, onTap: () {})),
    );
    expect(find.byIcon(Icons.stop_rounded), findsOneWidget);
  });

  testWidgets('AppMicButton: тап-таргет не меньше кнопки отправки', (
    tester,
  ) async {
    await tester.pumpWidget(_host(AppMicButton(onTap: () {})));
    final size = tester.getSize(find.byType(AppMicButton));
    expect(size.width, AppInputBar.sendSide);
    expect(size.height, AppInputBar.sendSide);
  });

  testWidgets('AppRecordingIndicator: подпись и таймер', (tester) async {
    await tester.pumpWidget(
      _host(const AppRecordingIndicator(label: 'Идёт запись…', timer: '12/60')),
    );
    expect(find.text('Идёт запись…'), findsOneWidget);
    expect(find.text('12/60'), findsOneWidget);
  });

  testWidgets('AppRecordingIndicator: распознавание — кружок без таймера', (
    tester,
  ) async {
    await tester.pumpWidget(
      _host(
        const AppRecordingIndicator(label: 'Распознаём…', isRecording: false),
      ),
    );
    expect(find.byType(CircularProgressIndicator), findsOneWidget);
    expect(find.text('Распознаём…'), findsOneWidget);
  });

  testWidgets('AppInputBar: на время записи поле уступает место индикатору', (
    tester,
  ) async {
    final controller = TextEditingController(text: 'набрано руками');
    addTearDown(controller.dispose);
    await tester.pumpWidget(
      _host(
        AppInputBar(
          controller: controller,
          onSend: (_) {},
          fieldReplacement: const AppRecordingIndicator(
            label: 'Идёт запись…',
            timer: '3/60',
          ),
          trailing: AppIconButton(
            icon: Icons.close_rounded,
            label: 'Отменить запись',
            onTap: () {},
          ),
        ),
      ),
    );
    // Поля нет — вместо него индикатор; набранное при этом не потеряно, оно
    // живёт в контроллере и вернётся, когда запись закончится.
    expect(find.byType(TextField), findsNothing);
    expect(find.text('Идёт запись…'), findsOneWidget);
    expect(controller.text, 'набрано руками');
  });
}
