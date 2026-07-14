// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_update_product_tag.g.dart';

/// The properties to update in the product tag.
@JsonSerializable()
class AdminUpdateProductTag {
  const AdminUpdateProductTag({this.value, this.metadata, this.externalId});

  factory AdminUpdateProductTag.fromJson(Map<String, Object?> json) =>
      _$AdminUpdateProductTagFromJson(json);

  /// The product tag's value.
  final String? value;

  /// The product tag's metadata. Can hold custom key-value pairs.
  final dynamic metadata;

  /// The product tag's external ID used to link it with external systems.
  @JsonKey(name: 'external_id')
  final String? externalId;

  Map<String, Object?> toJson() => _$AdminUpdateProductTagToJson(this);
}
