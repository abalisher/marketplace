import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../domain/pending_mark.dart';
import 'pending_mark_store.dart';

/// Реализация [PendingMarkStore] поверх shared_preferences: очередь целиком
/// сериализуется в один JSON под ключом [_key]. Отметок единицы, отдельная БД
/// не нужна; битая запись теряет ОДНУ отметку, а не всю очередь.
class SharedPrefsPendingMarkStore implements PendingMarkStore {
  SharedPrefsPendingMarkStore(this._prefs);

  final SharedPreferences _prefs;

  static const _key = 'assembly_pending_marks_v1';

  @override
  Future<List<PendingMark>> read() async {
    final raw = _prefs.getString(_key);
    if (raw == null || raw.isEmpty) {
      return const [];
    }
    final List<dynamic> decoded;
    try {
      decoded = jsonDecode(raw) as List;
    } catch (_) {
      // Битый верхнеуровневый JSON — очереди нет (не роняем экран).
      return const [];
    }
    final marks = <PendingMark>[];
    for (final item in decoded) {
      final mark = PendingMark.fromJson(item);
      if (mark != null) {
        marks.add(mark);
      }
    }
    return marks;
  }

  @override
  Future<void> write(List<PendingMark> marks) async {
    if (marks.isEmpty) {
      await _prefs.remove(_key);
      return;
    }
    await _prefs.setString(
      _key,
      jsonEncode(marks.map((mark) => mark.toJson()).toList()),
    );
  }
}
