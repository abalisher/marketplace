// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_create_fulfillment_label.g.dart';

/// Details of the fulfillment label to create.
@JsonSerializable()
class AdminCreateFulfillmentLabel {
  const AdminCreateFulfillmentLabel({
    required this.trackingNumber,
    required this.trackingUrl,
    required this.labelUrl,
  });

  factory AdminCreateFulfillmentLabel.fromJson(Map<String, Object?> json) =>
      _$AdminCreateFulfillmentLabelFromJson(json);

  /// The label's tracking number.
  @JsonKey(name: 'tracking_number')
  final String trackingNumber;

  /// The label's tracking URL.
  @JsonKey(name: 'tracking_url')
  final String trackingUrl;

  /// The label's URL.
  @JsonKey(name: 'label_url')
  final String labelUrl;

  Map<String, Object?> toJson() => _$AdminCreateFulfillmentLabelToJson(this);
}
