import 'package:core/auth/auth_controller.dart';
import 'package:core/auth/auth_customer.dart';
import 'package:core/auth/auth_exception.dart';
import 'package:core/auth/auth_interceptor.dart';
import 'package:core/auth/auth_repository.dart';
import 'package:core/auth/auth_repository_provider.dart';
import 'package:core/auth/in_memory_session_store.dart';
import 'package:core/auth/phone_code_request.dart';
import 'package:core/auth/token_holder.dart';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

/// Фейковый репозиторий авторизации: детерминированные ответы без сети.
class _FakeAuthRepository implements AuthRepository {
  _FakeAuthRepository({this.restored, this.signInError, this.phoneError});

  final AuthCustomer? restored;
  final AuthException? signInError;
  final AuthException? phoneError;
  int signOutCalls = 0;
  final List<String> codeRequests = [];

  static const _customer = AuthCustomer(id: 'cus_1', email: 'a@b.kz');
  static const _phoneCustomer = AuthCustomer(
    id: 'cus_2',
    phone: '+77012345678',
  );

  @override
  Future<AuthCustomer?> restoreSession() async => restored;

  @override
  Future<AuthCustomer> signIn({
    required String email,
    required String password,
  }) async {
    final error = signInError;
    if (error != null) throw error;
    return _customer;
  }

  @override
  Future<AuthCustomer> register({
    required String email,
    required String password,
    String? firstName,
    String? lastName,
    String? phone,
  }) async => _customer;

  @override
  Future<PhoneCodeRequest> requestPhoneCode(String phone) async {
    final error = phoneError;
    if (error != null) throw error;
    codeRequests.add(phone);
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
    final error = phoneError;
    if (error != null) throw error;
    return _phoneCustomer;
  }

  @override
  Future<void> signOut() async => signOutCalls++;
}

void main() {
  group('AuthInterceptor', () {
    test('добавляет Bearer-заголовок при наличии токена', () {
      final holder = AuthTokenHolder()..token = 'tok_123';
      final options = RequestOptions(path: '/store/customers/me');

      AuthInterceptor(holder).onRequest(options, RequestInterceptorHandler());

      expect(options.headers['Authorization'], 'Bearer tok_123');
    });

    test('без токена заголовок не добавляется', () {
      final holder = AuthTokenHolder();
      final options = RequestOptions(path: '/store/products');

      AuthInterceptor(holder).onRequest(options, RequestInterceptorHandler());

      expect(options.headers.containsKey('Authorization'), isFalse);
    });
  });

  group('InMemorySessionStore', () {
    test('write → read → clear', () async {
      final store = InMemorySessionStore();
      expect(await store.readToken(), isNull);

      await store.writeToken('tok_abc');
      expect(await store.readToken(), 'tok_abc');

      await store.clear();
      expect(await store.readToken(), isNull);
    });
  });

  group('AuthController', () {
    ProviderContainer containerWith(_FakeAuthRepository repo) {
      final container = ProviderContainer(
        overrides: [authRepositoryProvider.overrideWithValue(repo)],
      );
      addTearDown(container.dispose);
      return container;
    }

    test('build восстанавливает сессию из репозитория', () async {
      final container = containerWith(
        _FakeAuthRepository(
          restored: const AuthCustomer(id: 'cus_1', email: 'a@b.kz'),
        ),
      );

      final customer = await container.read(authControllerProvider.future);

      expect(customer?.email, 'a@b.kz');
      expect(
        container.read(authControllerProvider.notifier).isAuthenticated,
        isTrue,
      );
    });

    test('без сессии — гость', () async {
      final container = containerWith(_FakeAuthRepository());

      final customer = await container.read(authControllerProvider.future);

      expect(customer, isNull);
      expect(
        container.read(authControllerProvider.notifier).isAuthenticated,
        isFalse,
      );
    });

    test('signIn переводит в авторизованное состояние', () async {
      final container = containerWith(_FakeAuthRepository());
      await container.read(authControllerProvider.future);

      await container
          .read(authControllerProvider.notifier)
          .signIn(email: 'a@b.kz', password: 'secret1');

      expect(container.read(authControllerProvider).valueOrNull?.id, 'cus_1');
    });

    test('ошибка signIn пробрасывается, состояние остаётся гостевым', () async {
      final container = containerWith(
        _FakeAuthRepository(
          signInError: const AuthException(AuthErrorKind.invalidCredentials),
        ),
      );
      await container.read(authControllerProvider.future);

      await expectLater(
        container
            .read(authControllerProvider.notifier)
            .signIn(email: 'a@b.kz', password: 'wrong'),
        throwsA(isA<AuthException>()),
      );
      expect(container.read(authControllerProvider).valueOrNull, isNull);
    });

    test(
      'requestPhoneCode отдаёт канон номера и не меняет состояние',
      () async {
        final repo = _FakeAuthRepository();
        final container = containerWith(repo);
        await container.read(authControllerProvider.future);

        final request = await container
            .read(authControllerProvider.notifier)
            .requestPhoneCode('8 701 234 56 78');

        expect(request.phone, '+77012345678');
        expect(request.devCode, '123456');
        expect(repo.codeRequests, ['8 701 234 56 78']);
        expect(container.read(authControllerProvider).valueOrNull, isNull);
      },
    );

    test('вход по коду переводит в авторизованное состояние', () async {
      final container = containerWith(_FakeAuthRepository());
      await container.read(authControllerProvider.future);

      await container
          .read(authControllerProvider.notifier)
          .signInWithPhoneCode(phone: '+77012345678', code: '123456');

      final customer = container.read(authControllerProvider).valueOrNull;
      expect(customer?.id, 'cus_2');
      // Профиль «только телефон»: имени нет — показываем номер.
      expect(customer?.displayName, '+77012345678');
    });

    test('неверный код пробрасывается, состояние гостевое', () async {
      final container = containerWith(
        _FakeAuthRepository(
          phoneError: const AuthException(AuthErrorKind.invalidCode),
        ),
      );
      await container.read(authControllerProvider.future);

      await expectLater(
        container
            .read(authControllerProvider.notifier)
            .signInWithPhoneCode(phone: '+77012345678', code: '000000'),
        throwsA(isA<AuthException>()),
      );
      expect(container.read(authControllerProvider).valueOrNull, isNull);
    });

    test('signOut очищает состояние и зовёт репозиторий', () async {
      final repo = _FakeAuthRepository(
        restored: const AuthCustomer(id: 'cus_1', email: 'a@b.kz'),
      );
      final container = containerWith(repo);
      await container.read(authControllerProvider.future);

      await container.read(authControllerProvider.notifier).signOut();

      expect(container.read(authControllerProvider).valueOrNull, isNull);
      expect(repo.signOutCalls, 1);
    });
  });
}
