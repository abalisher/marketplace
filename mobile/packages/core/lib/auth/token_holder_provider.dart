import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'token_holder.dart';

/// Провайдер-синглтон держателя токена. Общий и для [dioProvider]
/// (интерцептор читает токен), и для репозитория авторизации (обновляет его).
final authTokenHolderProvider = Provider<AuthTokenHolder>(
  (ref) => AuthTokenHolder(),
);
