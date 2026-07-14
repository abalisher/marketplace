// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_update_price_list.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminUpdatePriceList _$AdminUpdatePriceListFromJson(
  Map<String, dynamic> json,
) => AdminUpdatePriceList(
  title: json['title'] as String?,
  description: json['description'] as String?,
  startsAt: json['starts_at'] as String?,
  endsAt: json['ends_at'] as String?,
  status: json['status'] == null
      ? null
      : AdminUpdatePriceListStatus.fromJson(json['status'] as String),
  type: json['type'] == null
      ? null
      : AdminUpdatePriceListType.fromJson(json['type'] as String),
  rules: json['rules'],
  metadata: json['metadata'],
);

Map<String, dynamic> _$AdminUpdatePriceListToJson(
  AdminUpdatePriceList instance,
) => <String, dynamic>{
  'title': instance.title,
  'description': instance.description,
  'starts_at': instance.startsAt,
  'ends_at': instance.endsAt,
  'status': _$AdminUpdatePriceListStatusEnumMap[instance.status],
  'type': _$AdminUpdatePriceListTypeEnumMap[instance.type],
  'rules': instance.rules,
  'metadata': instance.metadata,
};

const _$AdminUpdatePriceListStatusEnumMap = {
  AdminUpdatePriceListStatus.active: 'active',
  AdminUpdatePriceListStatus.draft: 'draft',
  AdminUpdatePriceListStatus.$unknown: r'$unknown',
};

const _$AdminUpdatePriceListTypeEnumMap = {
  AdminUpdatePriceListType.sale: 'sale',
  AdminUpdatePriceListType.override: 'override',
  AdminUpdatePriceListType.$unknown: r'$unknown',
};
