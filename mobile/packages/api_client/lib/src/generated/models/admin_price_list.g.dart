// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_price_list.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminPriceList _$AdminPriceListFromJson(Map<String, dynamic> json) =>
    AdminPriceList(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      rules: json['rules'],
      startsAt: json['starts_at'] as String,
      endsAt: json['ends_at'] as String,
      status: AdminPriceListStatus.fromJson(json['status'] as String),
      type: AdminPriceListType.fromJson(json['type'] as String),
      prices: (json['prices'] as List<dynamic>)
          .map((e) => AdminPriceListPrice.fromJson(e as Map<String, dynamic>))
          .toList(),
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
      deletedAt: json['deleted_at'] == null
          ? null
          : DateTime.parse(json['deleted_at'] as String),
      metadata: json['metadata'],
    );

Map<String, dynamic> _$AdminPriceListToJson(AdminPriceList instance) =>
    <String, dynamic>{
      'id': instance.id,
      'title': instance.title,
      'description': ?instance.description,
      'rules': ?instance.rules,
      'starts_at': instance.startsAt,
      'ends_at': instance.endsAt,
      'status': _$AdminPriceListStatusEnumMap[instance.status]!,
      'type': _$AdminPriceListTypeEnumMap[instance.type]!,
      'prices': instance.prices,
      'created_at': instance.createdAt.toIso8601String(),
      'updated_at': instance.updatedAt.toIso8601String(),
      'deleted_at': ?instance.deletedAt?.toIso8601String(),
      'metadata': ?instance.metadata,
    };

const _$AdminPriceListStatusEnumMap = {
  AdminPriceListStatus.draft: 'draft',
  AdminPriceListStatus.active: 'active',
  AdminPriceListStatus.$unknown: r'$unknown',
};

const _$AdminPriceListTypeEnumMap = {
  AdminPriceListType.sale: 'sale',
  AdminPriceListType.override: 'override',
  AdminPriceListType.$unknown: r'$unknown',
};
