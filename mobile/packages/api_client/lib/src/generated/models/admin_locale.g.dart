// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_locale.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminLocale _$AdminLocaleFromJson(Map<String, dynamic> json) => AdminLocale(
  code: json['code'] as String,
  name: json['name'] as String,
  createdAt: DateTime.parse(json['created_at'] as String),
  updatedAt: DateTime.parse(json['updated_at'] as String),
  deletedAt: json['deleted_at'] == null
      ? null
      : DateTime.parse(json['deleted_at'] as String),
);

Map<String, dynamic> _$AdminLocaleToJson(AdminLocale instance) =>
    <String, dynamic>{
      'code': instance.code,
      'name': instance.name,
      'created_at': instance.createdAt.toIso8601String(),
      'updated_at': instance.updatedAt.toIso8601String(),
      'deleted_at': ?instance.deletedAt?.toIso8601String(),
    };
