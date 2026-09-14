import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:ui_kit/app_color_tokens.dart';
import 'package:ui_kit/app_history_item.dart';
import 'package:ui_kit/app_radius.dart';
import 'package:ui_kit/app_spacing.dart';
import 'package:ui_kit/app_typography.dart';

import '../../../l10n/messages_provider.dart';
import '../domain/chat_conversation.dart';
import '../providers/chat_controller.dart';
import '../providers/chat_history_controller.dart';
import 'chat_delete_dialog.dart';

/// Строка диалога в рельсе истории (бриф T10.1 §3.1): тап — возобновить диалог
/// и закрыть панель; «⋮» — меню «Переименовать» / «Удалить» (danger).
/// Переименование — инлайн-поле в той же строке: Enter сохраняет, пустое имя
/// или потеря фокуса отменяют. Удаление спрашивает подтверждение.
class ChatHistoryRow extends ConsumerStatefulWidget {
  const ChatHistoryRow({
    required this.conversation,
    required this.active,
    super.key,
  });

  final ChatConversation conversation;

  /// Открыт ли этот диалог сейчас (подсветка строки).
  final bool active;

  @override
  ConsumerState<ChatHistoryRow> createState() => _ChatHistoryRowState();
}

class _ChatHistoryRowState extends ConsumerState<ChatHistoryRow> {
  /// Идёт ли инлайн-переименование этой строки.
  bool _renaming = false;

  TextEditingController? _rename;
  FocusNode? _renameFocus;

  @override
  void dispose() {
    _rename?.dispose();
    _renameFocus?.dispose();
    super.dispose();
  }

  void _startRename() {
    final controller = TextEditingController(text: widget.conversation.title);
    final focus = FocusNode();
    setState(() {
      _rename = controller;
      _renameFocus = focus;
      _renaming = true;
    });
    focus.requestFocus();
  }

  void _cancelRename() {
    if (!_renaming) return;
    // Освобождаем контроллер ПОСЛЕ кадра: до перестройки строки поле ещё
    // держит его, а обращение к освобождённому контроллеру — исключение.
    final controller = _rename;
    final focus = _renameFocus;
    _rename = null;
    _renameFocus = null;
    setState(() => _renaming = false);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      controller?.dispose();
      focus?.dispose();
    });
  }

  /// Enter в поле: пустое имя = отмена (правило брифа), иначе сохраняем.
  void _submitRename(String value) {
    final title = value.trim();
    if (title.isNotEmpty) {
      ref
          .read(chatHistoryControllerProvider.notifier)
          .rename(widget.conversation.id, title);
    }
    _cancelRename();
  }

  Future<void> _delete() async {
    final t = ref.read(messagesProvider);
    final wasActive = widget.active;
    final confirmed = await ChatDeleteDialog.show(context, t);
    if (!confirmed || !mounted) return;
    ref
        .read(chatHistoryControllerProvider.notifier)
        .remove(widget.conversation.id);
    // Удалили открытый диалог — лента возвращается к приветствию.
    if (wasActive) {
      ref.read(chatControllerProvider.notifier).reset();
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = ref.watch(messagesProvider);
    final colors = AppColorTokens.of(context);
    if (_renaming) {
      return _renameField();
    }
    return AppHistoryItem(
      title: widget.conversation.title,
      active: widget.active,
      onTap: () {
        ref
            .read(chatControllerProvider.notifier)
            .loadConversation(widget.conversation);
        Navigator.of(context).pop();
      },
      trailing: PopupMenuButton<_RowAction>(
        tooltip: t.assistantRailMore,
        // Тап-таргет 48dp: на телефоне строка живёт под пальцем (гейт U).
        // Отсюда `child` вместо `icon` — у него можно задать габарит точно.
        padding: EdgeInsets.zero,
        constraints: const BoxConstraints(minWidth: 180),
        onSelected: (action) => switch (action) {
          _RowAction.rename => _startRename(),
          _RowAction.delete => _delete(),
        },
        itemBuilder: (context) => [
          PopupMenuItem(
            value: _RowAction.rename,
            child: Text(
              t.assistantRailRename,
              style: AppTypography.bodyMedium.copyWith(color: colors.ink),
            ),
          ),
          PopupMenuItem(
            value: _RowAction.delete,
            child: Text(
              t.assistantHistoryDelete,
              style: AppTypography.bodyMedium.copyWith(color: colors.error),
            ),
          ),
        ],
        child: SizedBox(
          width: 48,
          height: 48,
          child: Icon(Icons.more_vert, size: 18, color: colors.inkSecondary),
        ),
      ),
    );
  }

  /// Инлайн-поле переименования в габаритах строки списка.
  Widget _renameField() {
    final t = ref.watch(messagesProvider);
    final colors = AppColorTokens.of(context);
    return Container(
      constraints: const BoxConstraints(minHeight: 48),
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm),
      alignment: Alignment.center,
      child: TextField(
        controller: _rename,
        focusNode: _renameFocus,
        autofocus: true,
        style: AppTypography.bodyLargeMedium.copyWith(color: colors.ink),
        textInputAction: TextInputAction.done,
        onSubmitted: _submitRename,
        onTapOutside: (_) => _cancelRename(),
        decoration: InputDecoration(
          isDense: true,
          hintText: t.assistantRailRenameHint,
          contentPadding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.sm,
            vertical: AppSpacing.sm,
          ),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(AppRadius.chip),
            borderSide: BorderSide(color: colors.border),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(AppRadius.chip),
            borderSide: BorderSide(color: colors.border),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(AppRadius.chip),
            borderSide: BorderSide(color: colors.accent, width: 1.5),
          ),
        ),
      ),
    );
  }
}

/// Действия меню строки истории.
enum _RowAction { rename, delete }
