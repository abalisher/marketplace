import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../chat_file_selection.dart';
import '../data/chat_file_exception.dart';
import '../domain/chat_file_failure.dart';
import '../domain/chat_file_source.dart';
import '../domain/chat_files_state.dart';
import 'chat_file_picker_provider.dart';

/// Вложения композера (T10.4c): скрепка → системный выбор → чипы над полем →
/// отправка вместе с репликой.
///
/// Два правила, за которые отвечает именно этот контроллер:
///  * годные файлы из выбора берём, даже если один негоден: три кадра листа не
///    теряются из-за случайно захваченного видео;
///  * отказ называет ПРИЧИНУ (доступ, тип, размер, число), потому что делать
///    покупателю в каждом случае надо разное.
class ChatFilesController extends Notifier<ChatFilesState> {
  /// Счётчик локальных ключей вложений: по ним чипы убирают крестиком.
  int _sequence = 0;

  @override
  ChatFilesState build() => const ChatFilesState();

  /// Открыть системный выбор и добавить выбранное к набранному.
  Future<void> pick(ChatFileSource source) async {
    if (state.isPicking) return;
    // Предел в три файла скрепку НЕ гасит: покупатель узнаёт о нём строкой
    // отказа, а не молчащей кнопкой (находка прогонов про неактивные заглушки).
    if (state.freeSlots <= 0) {
      state = state.copyWith(failure: ChatFileFailure.tooMany);
      return;
    }
    state = state.copyWith(isPicking: true, clearFailure: true);
    try {
      final picked = await ref.read(chatFilePickerProvider).pick(source);
      if (picked.isEmpty) {
        // Передумал и закрыл диалог — это не отказ, молчим.
        state = state.copyWith(isPicking: false);
        return;
      }
      final selection = acceptChatFiles(
        current: state.files,
        picked: picked,
        nextId: _nextId,
      );
      state = ChatFilesState(
        files: selection.files,
        failure: selection.failure,
      );
    } on ChatFileException catch (error) {
      state = state.copyWith(isPicking: false, failure: error.failure);
    } catch (_) {
      state = state.copyWith(isPicking: false, failure: ChatFileFailure.failed);
    }
  }

  /// Убрать вложение до отправки.
  void remove(String id) {
    state = ChatFilesState(
      files: state.files.where((file) => file.id != id).toList(),
    );
  }

  /// Реплика ушла (или диалог сброшен) — набор пуст.
  void clear() {
    if (state.isEmpty && state.failure == null) return;
    state = const ChatFilesState();
  }

  /// Убрать строку с отказом (покупатель её прочитал).
  void dismissFailure() {
    if (state.failure == null) return;
    state = state.copyWith(clearFailure: true);
  }

  String _nextId() =>
      'file-${DateTime.now().microsecondsSinceEpoch}-${_sequence++}';
}

/// Провайдер вложений композера.
final chatFilesControllerProvider =
    NotifierProvider<ChatFilesController, ChatFilesState>(
      ChatFilesController.new,
    );
