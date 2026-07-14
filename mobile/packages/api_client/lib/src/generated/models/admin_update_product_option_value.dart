// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_update_product_option_value.g.dart';

/// The details of updating a product option value.
@JsonSerializable()
class AdminUpdateProductOptionValue {
  const AdminUpdateProductOptionValue({this.value, this.metadata});

  factory AdminUpdateProductOptionValue.fromJson(Map<String, Object?> json) =>
      _$AdminUpdateProductOptionValueFromJson(json);

  /// The product option's value.
  final String? value;

  /// Key-value pairs that hold additional information about the product option value.
  final dynamic metadata;

  Map<String, Object?> toJson() => _$AdminUpdateProductOptionValueToJson(this);
}
