// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_create_stock_location_fulfillment_set.g.dart';

/// The fulfillment set to create.
@JsonSerializable()
class AdminCreateStockLocationFulfillmentSet {
  const AdminCreateStockLocationFulfillmentSet({
    required this.name,
    required this.type,
  });

  factory AdminCreateStockLocationFulfillmentSet.fromJson(
    Map<String, Object?> json,
  ) => _$AdminCreateStockLocationFulfillmentSetFromJson(json);

  /// The fulfillment set's name.
  final String name;

  /// The fulfillment set's type.
  final String type;

  Map<String, Object?> toJson() =>
      _$AdminCreateStockLocationFulfillmentSetToJson(this);
}
