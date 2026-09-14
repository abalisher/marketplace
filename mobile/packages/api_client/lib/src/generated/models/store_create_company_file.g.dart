// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_create_company_file.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreCreateCompanyFile _$StoreCreateCompanyFileFromJson(
  Map<String, dynamic> json,
) => StoreCreateCompanyFile(
  name: json['name'] as String,
  mimeType: StoreCreateCompanyFileMimeType.fromJson(
    json['mime_type'] as String,
  ),
  contentBase64: json['content_base64'] as String,
);

Map<String, dynamic> _$StoreCreateCompanyFileToJson(
  StoreCreateCompanyFile instance,
) => <String, dynamic>{
  'name': instance.name,
  'mime_type': _$StoreCreateCompanyFileMimeTypeEnumMap[instance.mimeType]!,
  'content_base64': instance.contentBase64,
};

const _$StoreCreateCompanyFileMimeTypeEnumMap = {
  StoreCreateCompanyFileMimeType.undefined0: 'application/pdf',
  StoreCreateCompanyFileMimeType.undefined1: 'image/jpeg',
  StoreCreateCompanyFileMimeType.undefined2: 'image/png',
  StoreCreateCompanyFileMimeType.$unknown: r'$unknown',
};
