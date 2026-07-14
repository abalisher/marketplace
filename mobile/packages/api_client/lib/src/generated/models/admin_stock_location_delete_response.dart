// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_stock_location_delete_response.g.dart';

/// The details of the stock location's deletion.
@JsonSerializable()
class AdminStockLocationDeleteResponse {
  const AdminStockLocationDeleteResponse({
    required this.id,
    required this.deleted,
    this.object = 'stock_location',
  });

  factory AdminStockLocationDeleteResponse.fromJson(
    Map<String, Object?> json,
  ) => _$AdminStockLocationDeleteResponseFromJson(json);

  /// The stock location's ID.
  final String id;

  /// The name of the deleted object.
  final String object;

  /// Whether the stock location was deleted.
  final bool deleted;

  Map<String, Object?> toJson() =>
      _$AdminStockLocationDeleteResponseToJson(this);
}
