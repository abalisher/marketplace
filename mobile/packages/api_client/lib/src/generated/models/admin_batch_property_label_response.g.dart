// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_batch_property_label_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminBatchPropertyLabelResponse _$AdminBatchPropertyLabelResponseFromJson(
  Map<String, dynamic> json,
) => AdminBatchPropertyLabelResponse(
  created: (json['created'] as List<dynamic>)
      .map((e) => AdminPropertyLabel.fromJson(e as Map<String, dynamic>))
      .toList(),
  updated: (json['updated'] as List<dynamic>)
      .map((e) => AdminPropertyLabel.fromJson(e as Map<String, dynamic>))
      .toList(),
  deleted: (json['deleted'] as List<dynamic>)
      .map((e) => Deleted3.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic> _$AdminBatchPropertyLabelResponseToJson(
  AdminBatchPropertyLabelResponse instance,
) => <String, dynamic>{
  'created': instance.created,
  'updated': instance.updated,
  'deleted': instance.deleted,
};
