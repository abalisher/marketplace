// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_estimate_line.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreEstimateLine _$StoreEstimateLineFromJson(Map<String, dynamic> json) =>
    StoreEstimateLine(
      id: json['id'] as String,
      materialKind: json['material_kind'] as String,
      quantity: json['quantity'] as num,
      unit: json['unit'] as String,
      normCode: json['norm_code'] as String?,
      segment: json['segment'] as String?,
      productId: json['product_id'] as String?,
      unitPrice: json['unit_price'] as num?,
      total: json['total'] as num?,
    );

Map<String, dynamic> _$StoreEstimateLineToJson(StoreEstimateLine instance) =>
    <String, dynamic>{
      'id': instance.id,
      'material_kind': instance.materialKind,
      'quantity': instance.quantity,
      'unit': instance.unit,
      'norm_code': ?instance.normCode,
      'segment': ?instance.segment,
      'product_id': ?instance.productId,
      'unit_price': ?instance.unitPrice,
      'total': ?instance.total,
    };
