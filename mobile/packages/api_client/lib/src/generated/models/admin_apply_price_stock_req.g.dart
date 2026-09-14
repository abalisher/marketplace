// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_apply_price_stock_req.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminApplyPriceStockReq _$AdminApplyPriceStockReqFromJson(
  Map<String, dynamic> json,
) => AdminApplyPriceStockReq(
  changes: (json['changes'] as List<dynamic>)
      .map((e) => AdminPriceStockChange.fromJson(e as Map<String, dynamic>))
      .toList(),
  source: json['source'] == null
      ? AdminApplyPriceStockReqSource.manual
      : AdminApplyPriceStockReqSource.fromJson(json['source'] as String),
);

Map<String, dynamic> _$AdminApplyPriceStockReqToJson(
  AdminApplyPriceStockReq instance,
) => <String, dynamic>{
  'changes': instance.changes,
  'source': _$AdminApplyPriceStockReqSourceEnumMap[instance.source]!,
};

const _$AdminApplyPriceStockReqSourceEnumMap = {
  AdminApplyPriceStockReqSource.manual: 'manual',
  AdminApplyPriceStockReqSource.valueImport: 'import',
  AdminApplyPriceStockReqSource.$unknown: r'$unknown',
};
