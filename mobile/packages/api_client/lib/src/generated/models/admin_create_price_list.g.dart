// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_create_price_list.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminCreatePriceList _$AdminCreatePriceListFromJson(
  Map<String, dynamic> json,
) => AdminCreatePriceList(
  title: json['title'] as String,
  description: json['description'] as String?,
  startsAt: json['starts_at'] == null
      ? null
      : DateTime.parse(json['starts_at'] as String),
  endsAt: json['ends_at'] == null
      ? null
      : DateTime.parse(json['ends_at'] as String),
  status: json['status'] == null
      ? null
      : AdminCreatePriceListStatus.fromJson(json['status'] as String),
  type: json['type'] == null
      ? null
      : AdminCreatePriceListType.fromJson(json['type'] as String),
  rules: json['rules'],
  prices: (json['prices'] as List<dynamic>?)
      ?.map(
        (e) => AdminCreatePriceListPrice.fromJson(e as Map<String, dynamic>),
      )
      .toList(),
  metadata: json['metadata'],
);

Map<String, dynamic> _$AdminCreatePriceListToJson(
  AdminCreatePriceList instance,
) => <String, dynamic>{
  'title': instance.title,
  'description': ?instance.description,
  'starts_at': ?instance.startsAt?.toIso8601String(),
  'ends_at': ?instance.endsAt?.toIso8601String(),
  'status': ?_$AdminCreatePriceListStatusEnumMap[instance.status],
  'type': ?_$AdminCreatePriceListTypeEnumMap[instance.type],
  'rules': ?instance.rules,
  'prices': ?instance.prices,
  'metadata': ?instance.metadata,
};

const _$AdminCreatePriceListStatusEnumMap = {
  AdminCreatePriceListStatus.active: 'active',
  AdminCreatePriceListStatus.draft: 'draft',
  AdminCreatePriceListStatus.$unknown: r'$unknown',
};

const _$AdminCreatePriceListTypeEnumMap = {
  AdminCreatePriceListType.sale: 'sale',
  AdminCreatePriceListType.override: 'override',
  AdminCreatePriceListType.$unknown: r'$unknown',
};
