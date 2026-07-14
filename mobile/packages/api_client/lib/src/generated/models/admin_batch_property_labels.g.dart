// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_batch_property_labels.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminBatchPropertyLabels _$AdminBatchPropertyLabelsFromJson(
  Map<String, dynamic> json,
) => AdminBatchPropertyLabels(
  create: (json['create'] as List<dynamic>?)
      ?.map((e) => Create.fromJson(e as Map<String, dynamic>))
      .toList(),
  update: (json['update'] as List<dynamic>?)
      ?.map((e) => Update.fromJson(e as Map<String, dynamic>))
      .toList(),
  delete: (json['delete'] as List<dynamic>?)?.map((e) => e as String).toList(),
);

Map<String, dynamic> _$AdminBatchPropertyLabelsToJson(
  AdminBatchPropertyLabels instance,
) => <String, dynamic>{
  'create': instance.create,
  'update': instance.update,
  'delete': instance.delete,
};
