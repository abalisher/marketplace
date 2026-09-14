import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../domain/queue_filter.dart';

/// Выбранный чип очереди. По умолчанию — «в работе»: собранные задания за
/// своим чипом, чтобы не всплывать над сегодняшней работой (очередь FIFO).
/// Живёт отдельно от контроллера, чтобы смена чипа перечитывала очередь сама.
final queueFilterProvider = StateProvider<QueueFilter>(
  (ref) => QueueFilter.active,
);
