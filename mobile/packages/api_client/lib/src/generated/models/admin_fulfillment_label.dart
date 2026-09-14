// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_fulfillment_label.g.dart';

/// The details of a fulfillmet's shipment label.
@JsonSerializable()
class AdminFulfillmentLabel {
  const AdminFulfillmentLabel({
    required this.id,
    required this.trackingNumber,
    required this.trackingUrl,
    required this.labelUrl,
    required this.fulfillmentId,
    required this.createdAt,
    required this.updatedAt,
    required this.deletedAt,
  });

  factory AdminFulfillmentLabel.fromJson(Map<String, Object?> json) =>
      _$AdminFulfillmentLabelFromJson(json);

  /// The label's ID.
  final String id;

  /// The label's tracking number.
  @JsonKey(name: 'tracking_number')
  final String trackingNumber;

  /// The label's tracking URL.
  @JsonKey(name: 'tracking_url')
  final String trackingUrl;

  /// The label's URL.
  @JsonKey(name: 'label_url')
  final String labelUrl;

  /// The ID of the fulfillment the label is associated with.
  @JsonKey(name: 'fulfillment_id')
  final String fulfillmentId;

  /// The date the label was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the label was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The date the label was deleted.
  @JsonKey(name: 'deleted_at')
  final DateTime? deletedAt;

  Map<String, Object?> toJson() => _$AdminFulfillmentLabelToJson(this);
}
