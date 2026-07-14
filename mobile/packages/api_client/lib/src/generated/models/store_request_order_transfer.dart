// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'store_request_order_transfer.g.dart';

/// The details of requesting the order transfer.
@JsonSerializable()
class StoreRequestOrderTransfer {
  const StoreRequestOrderTransfer({
    this.updateOrderEmail = false,
    this.description,
  });

  factory StoreRequestOrderTransfer.fromJson(Map<String, Object?> json) =>
      _$StoreRequestOrderTransferFromJson(json);

  /// The transfer's description, which can be shown to the other customer receiving the request.
  final String? description;

  /// Whether to update the order's email to the receiving customer's email. By default, the order's email will not be updated.
  @JsonKey(name: 'update_order_email')
  final bool updateOrderEmail;

  Map<String, Object?> toJson() => _$StoreRequestOrderTransferToJson(this);
}
