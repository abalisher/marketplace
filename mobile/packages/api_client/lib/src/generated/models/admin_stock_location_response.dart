// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_stock_location.dart';

part 'admin_stock_location_response.g.dart';

/// The stock location's details.
@JsonSerializable()
class AdminStockLocationResponse {
  const AdminStockLocationResponse({required this.stockLocation});

  factory AdminStockLocationResponse.fromJson(Map<String, Object?> json) =>
      _$AdminStockLocationResponseFromJson(json);

  @JsonKey(name: 'stock_location')
  final AdminStockLocation stockLocation;

  Map<String, Object?> toJson() => _$AdminStockLocationResponseToJson(this);
}
