// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_create_product_option.g.dart';

/// The product option's details.
@JsonSerializable()
class AdminCreateProductOption {
  const AdminCreateProductOption({
    required this.title,
    required this.values,
    this.ranks,
    this.isExclusive,
  });

  factory AdminCreateProductOption.fromJson(Map<String, Object?> json) =>
      _$AdminCreateProductOptionFromJson(json);

  /// The product option's title.
  final String title;

  /// The product option's values.
  final List<String> values;

  /// The ranking of the option's values. The keys are the value names and the values are their respective ranks.
  final dynamic ranks;

  /// Whether the option is exclusive to the product.
  @JsonKey(name: 'is_exclusive')
  final bool? isExclusive;

  Map<String, Object?> toJson() => _$AdminCreateProductOptionToJson(this);
}
