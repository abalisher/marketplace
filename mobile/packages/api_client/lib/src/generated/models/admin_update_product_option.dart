// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_update_product_option.g.dart';

/// The details to update in a product option.
@JsonSerializable()
class AdminUpdateProductOption {
  const AdminUpdateProductOption({
    this.title,
    this.values,
    this.id,
    this.ranks,
    this.isExclusive,
    this.metadata,
  });

  factory AdminUpdateProductOption.fromJson(Map<String, Object?> json) =>
      _$AdminUpdateProductOptionFromJson(json);

  /// The option's title.
  final String? title;

  /// The option's values.
  final List<String>? values;

  /// The option's ID.
  final String? id;

  /// The product option's ranks.
  final dynamic ranks;

  /// Whether the product option is exclusive to the product. If disabled, the product option can be used by other products.
  @JsonKey(name: 'is_exclusive')
  final bool? isExclusive;

  /// Key-value pairs that hold additional information about the product option.
  final dynamic metadata;

  Map<String, Object?> toJson() => _$AdminUpdateProductOptionToJson(this);
}
