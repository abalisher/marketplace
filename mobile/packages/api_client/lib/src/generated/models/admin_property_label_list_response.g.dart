// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_property_label_list_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminPropertyLabelListResponse _$AdminPropertyLabelListResponseFromJson(
  Map<String, dynamic> json,
) => AdminPropertyLabelListResponse(
  propertyLabels: (json['property_labels'] as List<dynamic>)
      .map((e) => AdminPropertyLabel.fromJson(e as Map<String, dynamic>))
      .toList(),
  count: json['count'] as num,
  offset: json['offset'] as num,
  limit: json['limit'] as num,
);

Map<String, dynamic> _$AdminPropertyLabelListResponseToJson(
  AdminPropertyLabelListResponse instance,
) => <String, dynamic>{
  'property_labels': instance.propertyLabels,
  'count': instance.count,
  'offset': instance.offset,
  'limit': instance.limit,
};
