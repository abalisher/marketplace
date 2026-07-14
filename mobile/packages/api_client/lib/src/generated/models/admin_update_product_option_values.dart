// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_update_product_option_values.g.dart';

/// The details to update a product option's values.
@JsonSerializable()
class AdminUpdateProductOptionValues {
  const AdminUpdateProductOptionValues({
    required this.productOptionId,
    this.add,
    this.remove,
  });

  factory AdminUpdateProductOptionValues.fromJson(Map<String, Object?> json) =>
      _$AdminUpdateProductOptionValuesFromJson(json);

  /// The ID of the product option to update.
  @JsonKey(name: 'product_option_id')
  final String productOptionId;

  /// The values to add to the product option.
  final List<dynamic>? add;

  /// The values to remove from the product option.
  final List<String>? remove;

  Map<String, Object?> toJson() => _$AdminUpdateProductOptionValuesToJson(this);
}
