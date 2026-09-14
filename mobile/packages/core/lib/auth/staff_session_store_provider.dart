import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'secure_staff_session_store.dart';
import 'staff_session_store.dart';

/// Провайдер хранилища сессии сотрудника. По умолчанию — персистентное
/// ([SecureStaffSessionStore]); в тестах переопределяется
/// `InMemoryStaffSessionStore`.
final staffSessionStoreProvider = Provider<StaffSessionStore>(
  (ref) => SecureStaffSessionStore(),
);
