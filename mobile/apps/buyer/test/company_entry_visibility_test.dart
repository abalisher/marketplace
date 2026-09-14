import 'package:core/auth/auth_controller.dart';
import 'package:core/auth/auth_customer.dart';
import 'package:core/config/app_config.dart';
import 'package:core/config/app_config_provider.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:ui_kit/app_theme.dart';

import 'package:marketplace_buyer/features/assistant/providers/chat_history_store_provider.dart';
import 'package:marketplace_buyer/features/assistant/widgets/chat_drawer.dart';
import 'package:marketplace_buyer/features/auth/screens/account_screen.dart';

/// Вошедший покупатель: экран аккаунта показывает пункты меню только ему.
class _AuthedAuthController extends AuthController {
  @override
  Future<AuthCustomer?> build() async =>
      const AuthCustomer(id: 'cus_1', email: 'buyer@stroymarket.kz');
}

late SharedPreferences _prefs;

Widget _harness(Widget child, {required bool featureCompanies}) {
  return ProviderScope(
    overrides: [
      appConfigProvider.overrideWithValue(
        AppConfig(
          baseUrl: 'http://localhost:9000',
          publishableKey: 'pk_test',
          featureCompanies: featureCompanies,
        ),
      ),
      authControllerProvider.overrideWith(_AuthedAuthController.new),
      sharedPreferencesProvider.overrideWithValue(_prefs),
    ],
    child: MaterialApp(
      theme: buildAppTheme(),
      home: Scaffold(body: child),
    ),
  );
}

// Юрлица заморожены на MVP (T10.9): вход в раздел «Компания» есть в двух местах
// — панель чата и экран аккаунта. Проверяем оба: с выключенным флагом пункта
// нет, с включённым он возвращается (маршрут `/company` объявляется тем же
// флагом в app_router.dart).
void main() {
  setUp(() async {
    SharedPreferences.setMockInitialValues({});
    _prefs = await SharedPreferences.getInstance();
  });

  testWidgets('панель чата прячет «Компанию», пока юрлица заморожены', (
    tester,
  ) async {
    await tester.pumpWidget(
      _harness(const ChatDrawer(), featureCompanies: false),
    );
    await tester.pump();

    expect(find.text('Компания'), findsNothing);
  });

  testWidgets('панель чата возвращает «Компанию» вместе с флагом', (
    tester,
  ) async {
    await tester.pumpWidget(
      _harness(const ChatDrawer(), featureCompanies: true),
    );
    await tester.pump();

    expect(find.text('Компания'), findsOneWidget);
  });

  testWidgets('аккаунт прячет «Компанию», пока юрлица заморожены', (
    tester,
  ) async {
    await tester.pumpWidget(
      _harness(const AccountScreen(), featureCompanies: false),
    );
    await tester.pumpAndSettle();

    expect(find.text('Компания'), findsNothing);
  });

  testWidgets('аккаунт возвращает «Компанию» вместе с флагом', (tester) async {
    await tester.pumpWidget(
      _harness(const AccountScreen(), featureCompanies: true),
    );
    await tester.pumpAndSettle();

    expect(find.text('Компания'), findsOneWidget);
  });
}
