// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_order_line_input.dart';

part 'admin_order_card_transition_targets.g.dart';

/// Цели переходов: позиции к сборке и fulfillment под отгрузку/вручение выбирает бэкенд.
@JsonSerializable()
class AdminOrderCardTransitionTargets {
  const AdminOrderCardTransitionTargets({
    required this.items,
    this.shipFulfillmentId,
    this.deliverFulfillmentId,
  });

  factory AdminOrderCardTransitionTargets.fromJson(Map<String, Object?> json) =>
      _$AdminOrderCardTransitionTargetsFromJson(json);

  final List<AdminOrderLineInput> items;
  @JsonKey(name: 'ship_fulfillment_id')
  final String? shipFulfillmentId;
  @JsonKey(name: 'deliver_fulfillment_id')
  final String? deliverFulfillmentId;

  Map<String, Object?> toJson() =>
      _$AdminOrderCardTransitionTargetsToJson(this);
}
