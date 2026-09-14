// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_create_company.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreCreateCompany _$StoreCreateCompanyFromJson(Map<String, dynamic> json) =>
    StoreCreateCompany(
      name: json['name'] as String,
      bin: json['bin'] as String,
      files: (json['files'] as List<dynamic>?)
          ?.map(
            (e) => StoreCreateCompanyFile.fromJson(e as Map<String, dynamic>),
          )
          .toList(),
    );

Map<String, dynamic> _$StoreCreateCompanyToJson(StoreCreateCompany instance) =>
    <String, dynamic>{
      'name': instance.name,
      'bin': instance.bin,
      'files': ?instance.files,
    };
