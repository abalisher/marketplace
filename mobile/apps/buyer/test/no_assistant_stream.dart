import 'package:marketplace_buyer/features/assistant/data/assistant_repository.dart';
import 'package:marketplace_buyer/features/assistant/data/assistant_stream_exception.dart';
import 'package:marketplace_buyer/features/assistant/domain/assistant_stream_event.dart';
import 'package:marketplace_buyer/features/assistant/domain/chat_file.dart';
import 'package:marketplace_buyer/features/assistant/domain/chat_message.dart';

/// Примесь для фейков ассистента в тестах: потока нет — контроллер откатывается
/// на обычный POST (откат из T10.1d). Так экранные тесты проверяют ту же
/// семантику хода, что и до стриминга; сам стриминг покрыт отдельно
/// (`chat_stream_test.dart`, `assistant_stream_test.dart`).
mixin NoAssistantStream implements AssistantRepository {
  @override
  Stream<AssistantStreamEvent> stream({
    required List<ChatMessage> history,
    String? cartId,
    String? orderId,
    List<ChatFile> files = const [],
  }) => Stream<AssistantStreamEvent>.error(
    const AssistantStreamUnavailableException('streaming is off in tests'),
  );
}
