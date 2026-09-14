import 'package:core/auth/auth_customer.dart';
import 'package:core/auth/auth_exception.dart';
import 'package:core/auth/auth_repository.dart';
import 'package:core/auth/auth_repository_provider.dart';
import 'package:core/auth/phone_code_request.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_kit/app_theme.dart';

import 'package:marketplace_buyer/features/auth/screens/phone_login_screen.dart';

/// Фейк авторизации по номеру: записывает вызовы и управляет исходом. Экран
/// тестируется на границе [AuthRepository], без сети.
class _FakeAuthRepository implements AuthRepository {
  _FakeAuthRepository({this.requestError, this.verifyError});

  final AuthException? requestError;
  final AuthException? verifyError;

  final List<String> requestedPhones = [];
  final List<String> verifiedPhones = [];
  final List<String> verifiedCodes = [];

  @override
  Future<AuthCustomer?> restoreSession() async => null;

  @override
  Future<PhoneCodeRequest> requestPhoneCode(String phone) async {
    final error = requestError;
    if (error != null) throw error;
    requestedPhones.add(phone);
    return const PhoneCodeRequest(
      phone: '+77012345678',
      expiresIn: 300,
      resendAfter: 60,
      devCode: '123456',
    );
  }

  @override
  Future<AuthCustomer> signInWithPhoneCode({
    required String phone,
    required String code,
  }) async {
    verifiedPhones.add(phone);
    verifiedCodes.add(code);
    final error = verifyError;
    if (error != null) throw error;
    return const AuthCustomer(id: 'cus_1', phone: '+77012345678');
  }

  @override
  Future<AuthCustomer> signIn({
    required String email,
    required String password,
  }) => throw UnimplementedError();

  @override
  Future<AuthCustomer> register({
    required String email,
    required String password,
    String? firstName,
    String? lastName,
    String? phone,
  }) => throw UnimplementedError();

  @override
  Future<void> signOut() async {}
}

Widget _harness(AuthRepository repository) {
  return ProviderScope(
    overrides: [authRepositoryProvider.overrideWithValue(repository)],
    child: MaterialApp(theme: buildAppTheme(), home: const PhoneLoginScreen()),
  );
}

Future<void> _enter(WidgetTester tester, String label, String value) async {
  await tester.enterText(
    find.ancestor(of: find.text(label), matching: find.byType(TextFormField)),
    value,
  );
}

void main() {
  testWidgets('пустой номер показывает ошибку, код не запрашивается', (
    tester,
  ) async {
    final repo = _FakeAuthRepository();
    await tester.pumpWidget(_harness(repo));
    await tester.pumpAndSettle();

    await tester.tap(find.text('Получить код'));
    await tester.pumpAndSettle();

    expect(find.text('Обязательное поле'), findsOneWidget);
    expect(repo.requestedPhones, isEmpty);
  });

  testWidgets('короткий номер отсекается на клиенте', (tester) async {
    final repo = _FakeAuthRepository();
    await tester.pumpWidget(_harness(repo));
    await tester.pumpAndSettle();

    await _enter(tester, 'Телефон', '+7 701 23');
    await tester.tap(find.text('Получить код'));
    await tester.pumpAndSettle();

    expect(
      find.text('Укажите мобильный номер Казахстана: +7 701 234 56 78'),
      findsOneWidget,
    );
    expect(repo.requestedPhones, isEmpty);
  });

  testWidgets('городской номер отклоняет бэкенд, экран остаётся на номере', (
    tester,
  ) async {
    // Какие коды операторов мобильные, знает бэкенд (клиент правила не дублирует).
    final repo = _FakeAuthRepository(
      requestError: const AuthException(AuthErrorKind.invalidPhone),
    );
    await tester.pumpWidget(_harness(repo));
    await tester.pumpAndSettle();

    await _enter(tester, 'Телефон', '+7 7172 12 34 56');
    await tester.tap(find.text('Получить код'));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 100));

    expect(
      find.text('Укажите мобильный номер Казахстана: +7 701 234 56 78'),
      findsWidgets,
    );
    // Шаг кода не открылся.
    expect(find.text('Код из SMS'), findsNothing);
  });

  testWidgets('номер в любой записи ведёт на шаг кода с каноном', (
    tester,
  ) async {
    final repo = _FakeAuthRepository();
    await tester.pumpWidget(_harness(repo));
    await tester.pumpAndSettle();

    await _enter(tester, 'Телефон', '8 701 234 56 78');
    await tester.tap(find.text('Получить код'));
    await tester.pumpAndSettle();

    expect(repo.requestedPhones, ['8 701 234 56 78']);
    // Канон номера — от бэкенда; на стенде видна и подсказка dev-канала.
    expect(find.text('Код отправлен на +7 701 234 56 78'), findsOneWidget);
    expect(find.text('Код стенда: 123456'), findsOneWidget);
    // Пауза «выслать снова» стартовала с ответа бэкенда.
    expect(find.text('Выслать снова можно через 60 с'), findsOneWidget);
  });

  testWidgets('верный код уходит на вход вместе с каноном номера', (
    tester,
  ) async {
    final repo = _FakeAuthRepository();
    await tester.pumpWidget(_harness(repo));
    await tester.pumpAndSettle();

    await _enter(tester, 'Телефон', '+77012345678');
    await tester.tap(find.text('Получить код'));
    await tester.pumpAndSettle();

    await _enter(tester, 'Код из SMS', '123456');
    await tester.tap(find.text('Войти'));
    await tester.pumpAndSettle();

    expect(repo.verifiedPhones, ['+77012345678']);
    expect(repo.verifiedCodes, ['123456']);
  });

  testWidgets('истёкший код объясняется и убирает подсказку стенда', (
    tester,
  ) async {
    final repo = _FakeAuthRepository(
      verifyError: const AuthException(AuthErrorKind.codeExpired),
    );
    await tester.pumpWidget(_harness(repo));
    await tester.pumpAndSettle();

    await _enter(tester, 'Телефон', '+77012345678');
    await tester.tap(find.text('Получить код'));
    await tester.pumpAndSettle();

    await _enter(tester, 'Код из SMS', '123456');
    await tester.tap(find.text('Войти'));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 100));

    expect(find.text('Код истёк — запросите новый'), findsOneWidget);
    expect(find.text('Код стенда: 123456'), findsNothing);
  });

  testWidgets('слишком частый запрос кода включает таймер', (tester) async {
    final repo = _FakeAuthRepository(
      requestError: const AuthException(
        AuthErrorKind.tooManyRequests,
        retryAfter: 42,
      ),
    );
    await tester.pumpWidget(_harness(repo));
    await tester.pumpAndSettle();

    await _enter(tester, 'Телефон', '+77012345678');
    await tester.tap(find.text('Получить код'));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 100));

    expect(find.text('Код уже отправлен — дождитесь таймера'), findsOneWidget);
  });
}
