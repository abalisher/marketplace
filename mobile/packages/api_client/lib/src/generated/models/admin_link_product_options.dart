// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_update_product_option_values.dart';

part 'admin_link_product_options.g.dart';

/// The details of linking product options to a product.
@JsonSerializable()
class AdminLinkProductOptions {
  const AdminLinkProductOptions({this.add, this.remove, this.update});

  factory AdminLinkProductOptions.fromJson(Map<String, Object?> json) =>
      _$AdminLinkProductOptionsFromJson(json);

  /// The options to add to the product.
  final List<dynamic>? add;

  /// The IDs of the product options to remove from the product.
  final List<String>? remove;

  /// The product's update.
  final List<AdminUpdateProductOptionValues>? update;

  Map<String, Object?> toJson() => _$AdminLinkProductOptionsToJson(this);
}
