// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_order_card_credit.dart';
import 'admin_order_card_customer.dart';
import 'admin_order_card_delivery.dart';
import 'admin_order_card_delivery_method.dart';
import 'admin_order_card_dispute.dart';
import 'admin_order_card_item.dart';
import 'admin_order_card_payment_state.dart';
import 'admin_order_card_totals.dart';
import 'admin_order_card_transition_targets.dart';
import 'admin_order_document.dart';
import 'admin_order_lifecycle_event.dart';

part 'admin_order_card.g.dart';

@JsonSerializable()
class AdminOrderCard {
  const AdminOrderCard({
    required this.orderId,
    required this.history,
    required this.customer,
    required this.items,
    required this.totals,
    required this.delivery,
    required this.documents,
    required this.transitionTargets,
    this.displayId,
    this.createdAt,
    this.status,
    this.previousStatus,
    this.note,
    this.deliveryMethod,
    this.credit,
    this.paymentState,
    this.activeDispute,
  });

  factory AdminOrderCard.fromJson(Map<String, Object?> json) =>
      _$AdminOrderCardFromJson(json);

  @JsonKey(name: 'order_id')
  final String orderId;
  @JsonKey(name: 'display_id')
  final int? displayId;
  @JsonKey(name: 'created_at')
  final DateTime? createdAt;
  final String? status;
  @JsonKey(name: 'previous_status')
  final String? previousStatus;
  final String? note;
  @JsonKey(name: 'delivery_method')
  final AdminOrderCardDeliveryMethod? deliveryMethod;
  final List<AdminOrderLifecycleEvent> history;
  final AdminOrderCardCustomer customer;
  final AdminOrderCardCredit? credit;
  final List<AdminOrderCardItem> items;
  final AdminOrderCardTotals totals;
  @JsonKey(name: 'payment_state')
  final AdminOrderCardPaymentState? paymentState;
  final AdminOrderCardDelivery delivery;

  /// Только актуальные версии документов заказа.
  final List<AdminOrderDocument> documents;
  @JsonKey(name: 'transition_targets')
  final AdminOrderCardTransitionTargets transitionTargets;

  /// Активная претензия по заказу; null — претензий нет.
  @JsonKey(name: 'active_dispute')
  final AdminOrderCardDispute? activeDispute;

  Map<String, Object?> toJson() => _$AdminOrderCardToJson(this);
}
