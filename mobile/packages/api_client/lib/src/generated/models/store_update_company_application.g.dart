// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_update_company_application.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreUpdateCompanyApplication _$StoreUpdateCompanyApplicationFromJson(
  Map<String, dynamic> json,
) => StoreUpdateCompanyApplication(
  name: json['name'] as String?,
  bin: json['bin'] as String?,
  files: (json['files'] as List<dynamic>?)
      ?.map((e) => StoreCreateCompanyFile.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic> _$StoreUpdateCompanyApplicationToJson(
  StoreUpdateCompanyApplication instance,
) => <String, dynamic>{
  'name': ?instance.name,
  'bin': ?instance.bin,
  'files': ?instance.files,
};
