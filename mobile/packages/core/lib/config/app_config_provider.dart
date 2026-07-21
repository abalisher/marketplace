import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'app_config.dart';

/// Провайдер конфигурации приложения. По умолчанию читает `--dart-define`;
/// в тестах/сборках переопределяется через `overrideWithValue`.
final appConfigProvider = Provider<AppConfig>((ref) {
  return AppConfig.fromEnvironment();
});
