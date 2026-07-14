// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_link_product_option_with_values.g.dart';

/// The details for linking a product option with its values.
@JsonSerializable()
class AdminLinkProductOptionWithValues {
  const AdminLinkProductOptionWithValues({
    required this.id,
    required this.valueIds,
  });

  factory AdminLinkProductOptionWithValues.fromJson(
    Map<String, Object?> json,
  ) => _$AdminLinkProductOptionWithValuesFromJson(json);

  /// The option's ID.
  final String id;

  /// The values to add to the product.
  @JsonKey(name: 'value_ids')
  final List<String> valueIds;

  Map<String, Object?> toJson() =>
      _$AdminLinkProductOptionWithValuesToJson(this);
}
