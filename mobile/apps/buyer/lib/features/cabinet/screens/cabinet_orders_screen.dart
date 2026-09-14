import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:ui_kit/app_choice_chip.dart';
import 'package:ui_kit/app_color_tokens.dart';
import 'package:ui_kit/app_error_view.dart';
import 'package:ui_kit/app_loader.dart';
import 'package:ui_kit/app_order_list_item.dart';
import 'package:ui_kit/app_spacing.dart';
import 'package:ui_kit/app_typography.dart';

import '../../../l10n/messages.dart';
import '../../../l10n/messages_provider.dart';
import '../../../shared/date_label.dart';
import '../../../shared/delivery_slot_label.dart';
import '../../../shared/order_status_color.dart';
import '../../../shared/tenge.dart';
import '../../orders/domain/order_list_item.dart';
import '../../orders/providers/orders_provider.dart';
import '../domain/cabinet_section.dart';
import '../widgets/cabinet_scaffold.dart';

/// Раздел «Заказы» кабинета клиента (T10.6; до кабинета — отдельный экран 1f
/// «Мои заказы»): чипы-фильтры Активные/Все и список заказов покупателя —
/// номер, дата, сумма, стадия. Данные считает бэкенд; экран отображает и
/// фильтрует. Стадии приходят одним запросом вместе со списком (T10.6a).
class CabinetOrdersScreen extends ConsumerStatefulWidget {
  const CabinetOrdersScreen({super.key});

  @override
  ConsumerState<CabinetOrdersScreen> createState() =>
      _CabinetOrdersScreenState();
}

class _CabinetOrdersScreenState extends ConsumerState<CabinetOrdersScreen> {
  bool _activeOnly = false;

  @override
  Widget build(BuildContext context) {
    final t = ref.watch(messagesProvider);
    final ordersAsync = ref.watch(ordersProvider);

    return CabinetScaffold(
      section: CabinetSection.orders,
      child: ordersAsync.when(
        loading: () => const AppLoader(),
        error: (_, _) => AppErrorView(
          message: t.ordersLoadError,
          retryLabel: t.retry,
          onRetry: () => ref.invalidate(ordersProvider),
        ),
        data: (orders) => _OrdersBody(
          orders: orders,
          activeOnly: _activeOnly,
          onFilterChanged: (v) => setState(() => _activeOnly = v),
        ),
      ),
    );
  }
}

class _OrdersBody extends ConsumerWidget {
  const _OrdersBody({
    required this.orders,
    required this.activeOnly,
    required this.onFilterChanged,
  });

  final List<OrderListItem> orders;
  final bool activeOnly;
  final ValueChanged<bool> onFilterChanged;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = ref.watch(messagesProvider);
    final visible = activeOnly
        ? orders.where((o) => o.isActive).toList()
        : orders;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(
            AppSpacing.lg,
            0,
            AppSpacing.lg,
            AppSpacing.md,
          ),
          child: Row(
            children: [
              AppChoiceChip(
                label: t.ordersFilterActive,
                selected: activeOnly,
                onTap: () => onFilterChanged(true),
              ),
              const SizedBox(width: AppSpacing.sm),
              AppChoiceChip(
                label: t.ordersFilterAll,
                selected: !activeOnly,
                onTap: () => onFilterChanged(false),
              ),
            ],
          ),
        ),
        Expanded(
          child: visible.isEmpty
              ? Center(
                  child: Text(
                    activeOnly ? t.ordersEmptyActive : t.ordersEmpty,
                    style: AppTypography.bodyLarge,
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.fromLTRB(
                    AppSpacing.lg,
                    0,
                    AppSpacing.lg,
                    AppSpacing.lg,
                  ),
                  itemCount: visible.length,
                  itemBuilder: (context, i) => _tile(context, t, visible[i]),
                ),
        ),
      ],
    );
  }

  Widget _tile(BuildContext context, Messages t, OrderListItem order) {
    final colors = AppColorTokens.of(context);
    final status = order.lifecycleStatus;
    // Слот доставки — отдельной строкой карточки (T5.6a): когда ждать машину,
    // видно без открытия заказа. Внутри меты, рядом с бейджем статуса, окно
    // обрезалось на «13:00–…» (кадр гейта U), поэтому строка своя и на всю
    // ширину. Слота нет — строки нет.
    final slot = formatDeliverySlotLabel(
      order.deliveryDate,
      order.deliveryWindow,
      t,
    );
    final meta =
        '${t.orderItemsCount(order.itemCount)} · ${formatTenge(order.total.round())}';
    return AppOrderListItem(
      number: order.displayNumber,
      meta: meta,
      // Дата — по ней покупатель и узнаёт свой заказ в списке (паритет с
      // витриной, T10.6b).
      dateLabel: formatDateLabel(order.createdAt),
      slotLabel: slot == null ? null : '${t.deliverySlotTitle}: $slot',
      statusLabel: status != null
          ? t.orderStatusLabel(status)
          : t.orderStatusUnknown,
      statusColor: orderStatusColor(status, colors),
      onTap: () => context.push('/cabinet/orders/${order.id}'),
    );
  }
}
