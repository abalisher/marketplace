// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_update_product_type.g.dart';

/// The properties to update in the product type.
@JsonSerializable()
class AdminUpdateProductType {
  const AdminUpdateProductType({this.value, this.metadata, this.externalId});

  factory AdminUpdateProductType.fromJson(Map<String, Object?> json) =>
      _$AdminUpdateProductTypeFromJson(json);

  /// The product type's value.
  final String? value;

  /// The product type's metadata. Can hold custom key-value pairs.
  final dynamic metadata;

  /// The product type's external ID used to link it with external systems.
  @JsonKey(name: 'external_id')
  final String? externalId;

  Map<String, Object?> toJson() => _$AdminUpdateProductTypeToJson(this);
}
