import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'staff_auth_repository.dart';
import 'staff_auth_repository_provider.dart';
import 'staff_user.dart';

/// Контроллер авторизации сотрудника: держит текущего вошедшего (`null` — не
/// вошли) и выполняет вход/выход через [StaffAuthRepository]. Идиома совпадает
/// с `AuthController` покупателя. При старте состояние восстанавливается из
/// хранилища сессии — смена не начинается с повторного ввода пароля.
///
/// Ошибки входа пробрасываются экрану (для локализованного сообщения),
/// состояние при этом остаётся невошедшим.
class StaffAuthController extends AsyncNotifier<StaffUser?> {
  @override
  Future<StaffUser?> build() =>
      ref.read(staffAuthRepositoryProvider).restoreSession();

  StaffAuthRepository get _repository => ref.read(staffAuthRepositoryProvider);

  /// Признак вошедшего сотрудника (для гардов роутинга).
  bool get isAuthenticated => state.valueOrNull != null;

  Future<void> signIn({required String email, required String password}) async {
    final user = await _repository.signIn(email: email, password: password);
    state = AsyncData(user);
  }

  Future<void> signOut() async {
    await _repository.signOut();
    state = const AsyncData(null);
  }
}

/// Провайдер контроллера авторизации сотрудника.
final staffAuthControllerProvider =
    AsyncNotifierProvider<StaffAuthController, StaffUser?>(
      StaffAuthController.new,
    );
