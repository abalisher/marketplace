// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_stock_location_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminStockLocationResponse _$AdminStockLocationResponseFromJson(
  Map<String, dynamic> json,
) => AdminStockLocationResponse(
  stockLocation: AdminStockLocation.fromJson(
    json['stock_location'] as Map<String, dynamic>,
  ),
);

Map<String, dynamic> _$AdminStockLocationResponseToJson(
  AdminStockLocationResponse instance,
) => <String, dynamic>{'stock_location': instance.stockLocation};
