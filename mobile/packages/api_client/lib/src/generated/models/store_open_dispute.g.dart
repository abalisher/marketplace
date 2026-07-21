// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_open_dispute.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreOpenDispute _$StoreOpenDisputeFromJson(Map<String, dynamic> json) =>
    StoreOpenDispute(
      category: StoreOpenDisputeCategory.fromJson(json['category'] as String),
      description: json['description'] as String,
    );

Map<String, dynamic> _$StoreOpenDisputeToJson(StoreOpenDispute instance) =>
    <String, dynamic>{
      'category': _$StoreOpenDisputeCategoryEnumMap[instance.category]!,
      'description': instance.description,
    };

const _$StoreOpenDisputeCategoryEnumMap = {
  StoreOpenDisputeCategory.notDelivered: 'not_delivered',
  StoreOpenDisputeCategory.damaged: 'damaged',
  StoreOpenDisputeCategory.wrongItem: 'wrong_item',
  StoreOpenDisputeCategory.quality: 'quality',
  StoreOpenDisputeCategory.other: 'other',
  StoreOpenDisputeCategory.$unknown: r'$unknown',
};
