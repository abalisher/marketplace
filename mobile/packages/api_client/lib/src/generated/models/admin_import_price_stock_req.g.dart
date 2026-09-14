// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_import_price_stock_req.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminImportPriceStockReq _$AdminImportPriceStockReqFromJson(
  Map<String, dynamic> json,
) => AdminImportPriceStockReq(
  contentBase64: json['content_base64'] as String,
  fileName: json['file_name'] as String?,
  locationId: json['location_id'] as String?,
);

Map<String, dynamic> _$AdminImportPriceStockReqToJson(
  AdminImportPriceStockReq instance,
) => <String, dynamic>{
  'file_name': ?instance.fileName,
  'content_base64': instance.contentBase64,
  'location_id': ?instance.locationId,
};
