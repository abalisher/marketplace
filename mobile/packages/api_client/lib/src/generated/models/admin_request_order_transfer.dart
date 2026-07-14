// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_request_order_transfer.g.dart';

/// The details of the request to transfer the order.
@JsonSerializable()
class AdminRequestOrderTransfer {
  const AdminRequestOrderTransfer({
    required this.customerId,
    this.updateOrderEmail = false,
    this.description,
    this.internalNote,
  });

  factory AdminRequestOrderTransfer.fromJson(Map<String, Object?> json) =>
      _$AdminRequestOrderTransferFromJson(json);

  /// The ID of the customer to transfer the order to.
  @JsonKey(name: 'customer_id')
  final String customerId;

  /// The description of the order transfer, which can be shown to the customer receiving the order transfer request.
  final String? description;

  /// An internal note viewable only by admin users.
  @JsonKey(name: 'internal_note')
  final String? internalNote;

  /// Whether to update the order's email to the email of the customer the order is being transferred to. By default, the order's email will not be updated.
  @JsonKey(name: 'update_order_email')
  final bool updateOrderEmail;

  Map<String, Object?> toJson() => _$AdminRequestOrderTransferToJson(this);
}
