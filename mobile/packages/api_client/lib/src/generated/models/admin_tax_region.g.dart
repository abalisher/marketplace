// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_tax_region.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminTaxRegion _$AdminTaxRegionFromJson(Map<String, dynamic> json) =>
    AdminTaxRegion(
      id: json['id'] as String,
      countryCode: json['country_code'] as String,
      provinceCode: json['province_code'] as String,
      metadata: json['metadata'],
      parentId: json['parent_id'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
      deletedAt: json['deleted_at'] == null
          ? null
          : DateTime.parse(json['deleted_at'] as String),
      createdBy: json['created_by'] as String,
      taxRates: json['tax_rates'] as List<dynamic>,
      parent: json['parent'],
      children: json['children'] as List<dynamic>,
    );

Map<String, dynamic> _$AdminTaxRegionToJson(AdminTaxRegion instance) =>
    <String, dynamic>{
      'id': instance.id,
      'country_code': instance.countryCode,
      'province_code': instance.provinceCode,
      'metadata': ?instance.metadata,
      'parent_id': instance.parentId,
      'created_at': instance.createdAt.toIso8601String(),
      'updated_at': instance.updatedAt.toIso8601String(),
      'deleted_at': ?instance.deletedAt?.toIso8601String(),
      'created_by': instance.createdBy,
      'tax_rates': instance.taxRates,
      'parent': ?instance.parent,
      'children': instance.children,
    };
