// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'order.dart';
import 'order_change_action_action.dart';
import 'order_change_action_reference.dart';

part 'order_change_action.g.dart';

/// The order change action's details.
@JsonSerializable()
class OrderChangeAction {
  const OrderChangeAction({
    required this.id,
    required this.orderChangeId,
    required this.orderChange,
    required this.orderId,
    required this.returnId,
    required this.claimId,
    required this.exchangeId,
    required this.order,
    required this.reference,
    required this.referenceId,
    required this.action,
    required this.details,
    required this.internalNote,
    required this.createdAt,
    required this.updatedAt,
    required this.ordering,
  });

  factory OrderChangeAction.fromJson(Map<String, Object?> json) =>
      _$OrderChangeActionFromJson(json);

  /// The action's ID.
  final String id;

  /// The ID of the order change that the action belongs to.
  @JsonKey(name: 'order_change_id')
  final String orderChangeId;
  @JsonKey(name: 'order_change')
  final dynamic orderChange;

  /// The ID of the order the associated change is for.
  @JsonKey(name: 'order_id')
  final String orderId;

  /// The ID of the associated return.
  @JsonKey(name: 'return_id')
  final String returnId;

  /// The ID of the associated claim.
  @JsonKey(name: 'claim_id')
  final String claimId;

  /// The ID of the associated exchange.
  @JsonKey(name: 'exchange_id')
  final String exchangeId;
  final Order order;

  /// The name of the table this action applies on.
  final OrderChangeActionReference reference;

  /// The ID of the record in the referenced table.
  @JsonKey(name: 'reference_id')
  final String referenceId;

  /// The applied action.
  final OrderChangeActionAction action;

  /// The action's details.
  final dynamic details;

  /// A note that's viewed only by admin users.
  @JsonKey(name: 'internal_note')
  final String internalNote;

  /// The date the action was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the action was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The action's ordering among other actions in the same order change.
  final num ordering;

  Map<String, Object?> toJson() => _$OrderChangeActionToJson(this);
}
