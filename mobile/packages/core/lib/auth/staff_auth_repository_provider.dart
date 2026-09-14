import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../network/medusa_api_provider.dart';
import 'medusa_staff_auth_repository.dart';
import 'staff_auth_repository.dart';
import 'staff_session_store_provider.dart';
import 'token_holder_provider.dart';

/// Провайдер репозитория авторизации сотрудника. По умолчанию — реализация
/// поверх Medusa admin auth; в тестах переопределяется фейком.
final staffAuthRepositoryProvider = Provider<StaffAuthRepository>((ref) {
  final api = ref.watch(medusaApiProvider);
  final holder = ref.watch(authTokenHolderProvider);
  final store = ref.watch(staffSessionStoreProvider);
  return MedusaStaffAuthRepository(api, holder, store);
});
