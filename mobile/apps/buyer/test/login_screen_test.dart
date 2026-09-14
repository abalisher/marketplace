import 'package:core/auth/auth_customer.dart';
import 'package:core/auth/auth_exception.dart';
import 'package:core/auth/auth_repository.dart';
import 'package:core/auth/auth_repository_provider.dart';
import 'package:core/auth/phone_code_request.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_kit/app_theme.dart';

import 'package:marketplace_buyer/features/auth/screens/login_screen.dart';

/// Фейк авторизации: записывает вызов signIn и управляет исходом. Экран
/// тестируется на границе [AuthRepository], без сети.
class _FakeAuthRepository implements AuthRepository {
  _FakeAuthRepository({this.error});

  final AuthException? error;
  String? signInEmail;

  @override
  Future<AuthCustomer?> restoreSession() async => null;

  @override
  Future<AuthCustomer> signIn({
    required String email,
    required String password,
  }) async {
    signInEmail = email;
    final err = error;
    if (err != null) throw err;
    return AuthCustomer(id: 'cus_1', email: email);
  }

  @override
  Future<AuthCustomer> register({
    required String email,
    required String password,
    String? firstName,
    String? lastName,
    String? phone,
  }) async => AuthCustomer(id: 'cus_1', email: email);

  // Вход по номеру телефона этот экран не использует (T10.7 — отдельный экран).
  @override
  Future<PhoneCodeRequest> requestPhoneCode(String phone) =>
      throw UnimplementedError();

  @override
  Future<AuthCustomer> signInWithPhoneCode({
    required String phone,
    required String code,
  }) => throw UnimplementedError();

  @override
  Future<void> signOut() async {}
}

Widget _harness(AuthRepository repository) {
  return ProviderScope(
    overrides: [authRepositoryProvider.overrideWithValue(repository)],
    child: MaterialApp(theme: buildAppTheme(), home: const LoginScreen()),
  );
}

void main() {
  testWidgets('пустая форма показывает ошибки валидации, вход не зовётся', (
    tester,
  ) async {
    final repo = _FakeAuthRepository();
    await tester.pumpWidget(_harness(repo));
    await tester.pumpAndSettle();

    await tester.tap(find.widgetWithText(ElevatedButton, 'Войти'));
    await tester.pumpAndSettle();

    expect(find.text('Обязательное поле'), findsWidgets);
    expect(repo.signInEmail, isNull);
  });

  testWidgets('неверные учётные данные показывают сообщение об ошибке', (
    tester,
  ) async {
    final repo = _FakeAuthRepository(
      error: const AuthException(AuthErrorKind.invalidCredentials),
    );
    await tester.pumpWidget(_harness(repo));
    await tester.pumpAndSettle();

    await tester.enterText(find.byType(TextFormField).at(0), 'buyer@mail.kz');
    await tester.enterText(find.byType(TextFormField).at(1), 'secret1');
    await tester.tap(find.widgetWithText(ElevatedButton, 'Войти'));
    await tester.pumpAndSettle();

    expect(find.text('Неверный email или пароль'), findsOneWidget);
  });

  testWidgets('корректный вход отправляет email в репозиторий без ошибки', (
    tester,
  ) async {
    final repo = _FakeAuthRepository();
    await tester.pumpWidget(_harness(repo));
    await tester.pumpAndSettle();

    await tester.enterText(find.byType(TextFormField).at(0), 'buyer@mail.kz');
    await tester.enterText(find.byType(TextFormField).at(1), 'secret1');
    await tester.tap(find.widgetWithText(ElevatedButton, 'Войти'));
    await tester.pumpAndSettle();

    expect(repo.signInEmail, 'buyer@mail.kz');
    expect(find.text('Неверный email или пароль'), findsNothing);
  });
}
