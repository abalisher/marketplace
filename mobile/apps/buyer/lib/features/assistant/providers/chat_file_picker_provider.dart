import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/chat_file_picker.dart';
import '../data/platform_chat_file_picker.dart';

/// Провайдер системного выбора вложения (T10.4c). По умолчанию — камера,
/// галерея и файловый менеджер устройства; в тестах переопределяется фейком
/// (ни камеры, ни диалога выбора в тестовой среде нет).
final chatFilePickerProvider = Provider<ChatFilePicker>(
  (ref) => PlatformChatFilePicker(),
);
