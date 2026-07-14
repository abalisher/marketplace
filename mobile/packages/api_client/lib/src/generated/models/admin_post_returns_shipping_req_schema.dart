// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_post_returns_shipping_req_schema.g.dart';

/// The shipping method's details.
@JsonSerializable()
class AdminPostReturnsShippingReqSchema {
  const AdminPostReturnsShippingReqSchema({
    required this.shippingOptionId,
    this.customAmount,
    this.description,
    this.internalNote,
    this.metadata,
  });

  factory AdminPostReturnsShippingReqSchema.fromJson(
    Map<String, Object?> json,
  ) => _$AdminPostReturnsShippingReqSchemaFromJson(json);

  /// The ID of the associated shipping option.
  @JsonKey(name: 'shipping_option_id')
  final String shippingOptionId;

  /// Set the price of the shipping method.
  @JsonKey(name: 'custom_amount')
  final num? customAmount;

  /// The shipping method's description.
  final String? description;

  /// A note viewed only by admin users.
  @JsonKey(name: 'internal_note')
  final String? internalNote;

  /// The exchange's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  Map<String, Object?> toJson() =>
      _$AdminPostReturnsShippingReqSchemaToJson(this);
}
