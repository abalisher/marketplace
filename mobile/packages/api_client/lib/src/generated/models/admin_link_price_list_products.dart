// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_link_price_list_products.g.dart';

/// The products removal details.
@JsonSerializable()
class AdminLinkPriceListProducts {
  const AdminLinkPriceListProducts({this.remove});

  factory AdminLinkPriceListProducts.fromJson(Map<String, Object?> json) =>
      _$AdminLinkPriceListProductsFromJson(json);

  /// The products to remove from the price list.
  final List<String>? remove;

  Map<String, Object?> toJson() => _$AdminLinkPriceListProductsToJson(this);
}
