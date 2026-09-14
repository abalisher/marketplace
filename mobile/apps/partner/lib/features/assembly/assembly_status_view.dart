import 'package:flutter/material.dart';
import 'package:ui_kit/app_color_tokens.dart';

import '../../l10n/messages.dart';
import 'domain/assembly_item_status.dart';
import 'domain/assembly_task_status.dart';

/// Как статусы сборки выглядят на экране: подпись из словаря локали и цвет из
/// семантических токенов. Собрано в одном месте, чтобы очередь и карточка
/// задания не разошлись в названиях и цветах.

String taskStatusLabel(AssemblyTaskStatus status, Messages t) {
  switch (status) {
    case AssemblyTaskStatus.pending:
      return t.statusPending;
    case AssemblyTaskStatus.picking:
      return t.statusPicking;
    case AssemblyTaskStatus.assembled:
      return t.statusAssembled;
    case AssemblyTaskStatus.shortage:
      return t.statusShortage;
  }
}

Color taskStatusColor(AssemblyTaskStatus status, AppColorTokens colors) {
  switch (status) {
    case AssemblyTaskStatus.pending:
      return colors.inkSecondary;
    case AssemblyTaskStatus.picking:
      return colors.accent;
    case AssemblyTaskStatus.assembled:
      return colors.success;
    case AssemblyTaskStatus.shortage:
      return colors.warning;
  }
}

/// Подпись отметки по позиции («Набрано 3 из 5»).
String itemStatusLabel(
  AssemblyItemStatus status,
  Messages t, {
  required int picked,
  required int quantity,
}) {
  switch (status) {
    case AssemblyItemStatus.pending:
      return t.itemPending;
    case AssemblyItemStatus.picked:
      return t.itemPicked;
    case AssemblyItemStatus.partial:
      return t.itemPartial(picked, quantity);
    case AssemblyItemStatus.missing:
      return t.itemMissing;
  }
}

Color itemStatusColor(AssemblyItemStatus status, AppColorTokens colors) {
  switch (status) {
    case AssemblyItemStatus.pending:
      return colors.inkSecondary;
    case AssemblyItemStatus.picked:
      return colors.success;
    case AssemblyItemStatus.partial:
      return colors.warning;
    case AssemblyItemStatus.missing:
      return colors.error;
  }
}
