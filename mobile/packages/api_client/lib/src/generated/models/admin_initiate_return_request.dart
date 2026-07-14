// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_initiate_return_request.g.dart';

/// The return's details.
@JsonSerializable()
class AdminInitiateReturnRequest {
  const AdminInitiateReturnRequest({
    required this.orderId,
    this.locationId,
    this.description,
    this.internalNote,
    this.noNotification,
    this.metadata,
  });

  factory AdminInitiateReturnRequest.fromJson(Map<String, Object?> json) =>
      _$AdminInitiateReturnRequestFromJson(json);

  /// The ID of the order the return belongs to.
  @JsonKey(name: 'order_id')
  final String orderId;

  /// The ID of the location the items are returned to.
  @JsonKey(name: 'location_id')
  final String? locationId;

  /// The return's description.
  final String? description;

  /// A note viewed only by admin users.
  @JsonKey(name: 'internal_note')
  final String? internalNote;

  /// Whether to send the customer a notification about the created return.
  @JsonKey(name: 'no_notification')
  final bool? noNotification;

  /// The return's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  Map<String, Object?> toJson() => _$AdminInitiateReturnRequestToJson(this);
}
