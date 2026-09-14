import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:ui_kit/app_choice_chip.dart';
import 'package:ui_kit/app_spacing.dart';

import '../../../l10n/messages.dart';
import '../../../l10n/messages_provider.dart';
import '../../assistant/widgets/chat_drawer.dart';
import '../domain/cabinet_section.dart';

/// Оболочка кабинета клиента (T10.6): шапка «Мой кабинет» с той же панелью
/// истории диалогов, что и в чате, ряд-переключатель разделов и содержимое.
/// Кабинет живёт РЯДОМ с диалогами, а не отдельным «аккаунтом»: покупатель
/// ходит между «спросить ассистента» и «посмотреть свой заказ» постоянно, и
/// смена оболочки на этом переходе читалась бы как выход из приложения.
class CabinetScaffold extends ConsumerWidget {
  const CabinetScaffold({
    required this.section,
    required this.child,
    super.key,
  });

  /// Активный раздел — подсвечивается в ряду переключателя.
  final CabinetSection section;

  /// Содержимое раздела.
  final Widget child;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = ref.watch(messagesProvider);

    return Scaffold(
      appBar: AppBar(title: Text(t.cabinetTitle)),
      drawer: const ChatDrawer(),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(
              AppSpacing.lg,
              AppSpacing.sm,
              AppSpacing.lg,
              AppSpacing.sm,
            ),
            child: Wrap(
              spacing: AppSpacing.sm,
              runSpacing: AppSpacing.sm,
              children: [
                for (final item in CabinetSection.values)
                  AppChoiceChip(
                    label: _label(t, item),
                    selected: item == section,
                    onTap: item == section
                        ? null
                        : () => context.go(item.route),
                  ),
              ],
            ),
          ),
          Expanded(child: child),
        ],
      ),
    );
  }

  String _label(Messages t, CabinetSection item) => switch (item) {
    CabinetSection.orders => t.cabinetNavOrders,
    CabinetSection.cart => t.cabinetNavCart,
    CabinetSection.documents => t.cabinetNavDocuments,
    CabinetSection.profile => t.cabinetNavProfile,
  };
}
