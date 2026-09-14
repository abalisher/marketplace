import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../domain/assembly_queue.dart';
import 'assembly_repository_provider.dart';
import 'queue_filter_provider.dart';

/// Очередь заданий сборщика: страница заданий своей категории со счётчиками по
/// статусам. Перечитывается сама при смене чипа-фильтра ([queueFilterProvider])
/// и по «потянуть вниз».
///
/// Страница одна и большая (сервер режет по [_pageLimit]): у сборщика на смену
/// приходится десятки заданий, а не тысячи, — листалка внизу экрана на складе
/// только мешала бы.
class TaskQueueController extends AsyncNotifier<AssemblyQueue> {
  static const _pageLimit = 50;

  @override
  Future<AssemblyQueue> build() {
    final filter = ref.watch(queueFilterProvider);
    return ref
        .read(assemblyRepositoryProvider)
        .loadQueue(statuses: filter.statuses, limit: _pageLimit);
  }

  /// Перечитывает очередь, оставляя на экране прежний список: сборщик тянет
  /// вниз, а не смотрит на пустой прогресс.
  Future<void> reload() async {
    final filter = ref.read(queueFilterProvider);
    state = await AsyncValue.guard(
      () => ref
          .read(assemblyRepositoryProvider)
          .loadQueue(statuses: filter.statuses, limit: _pageLimit),
    );
  }
}

/// Провайдер очереди заданий.
final taskQueueControllerProvider =
    AsyncNotifierProvider<TaskQueueController, AssemblyQueue>(
      TaskQueueController.new,
    );
