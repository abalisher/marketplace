// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_update_return_shipping.g.dart';

/// The shipping method's details.
@JsonSerializable()
class AdminUpdateReturnShipping {
  const AdminUpdateReturnShipping({
    this.customAmount,
    this.internalNote,
    this.metadata,
  });

  factory AdminUpdateReturnShipping.fromJson(Map<String, Object?> json) =>
      _$AdminUpdateReturnShippingFromJson(json);

  /// Set a custom price for the shipping method.
  @JsonKey(name: 'custom_amount')
  final num? customAmount;

  /// A note viewed only by admin users.
  @JsonKey(name: 'internal_note')
  final String? internalNote;

  /// The return's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  Map<String, Object?> toJson() => _$AdminUpdateReturnShippingToJson(this);
}
