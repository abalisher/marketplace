// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_store_locale.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminStoreLocale _$AdminStoreLocaleFromJson(Map<String, dynamic> json) =>
    AdminStoreLocale(
      id: json['id'] as String,
      localeCode: json['locale_code'] as String,
      storeId: json['store_id'] as String,
      locale: AdminLocale.fromJson(json['locale'] as Map<String, dynamic>),
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
      deletedAt: DateTime.parse(json['deleted_at'] as String),
    );

Map<String, dynamic> _$AdminStoreLocaleToJson(AdminStoreLocale instance) =>
    <String, dynamic>{
      'id': instance.id,
      'locale_code': instance.localeCode,
      'store_id': instance.storeId,
      'locale': instance.locale,
      'created_at': instance.createdAt.toIso8601String(),
      'updated_at': instance.updatedAt.toIso8601String(),
      'deleted_at': instance.deletedAt.toIso8601String(),
    };
