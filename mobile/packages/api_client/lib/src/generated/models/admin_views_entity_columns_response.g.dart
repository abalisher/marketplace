// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_views_entity_columns_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminViewsEntityColumnsResponse _$AdminViewsEntityColumnsResponseFromJson(
  Map<String, dynamic> json,
) => AdminViewsEntityColumnsResponse(
  columns: (json['columns'] as List<dynamic>)
      .map((e) => AdminColumn.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic> _$AdminViewsEntityColumnsResponseToJson(
  AdminViewsEntityColumnsResponse instance,
) => <String, dynamic>{'columns': instance.columns};
