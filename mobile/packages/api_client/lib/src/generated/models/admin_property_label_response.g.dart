// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_property_label_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminPropertyLabelResponse _$AdminPropertyLabelResponseFromJson(
  Map<String, dynamic> json,
) => AdminPropertyLabelResponse(
  propertyLabel: AdminPropertyLabel.fromJson(
    json['property_label'] as Map<String, dynamic>,
  ),
);

Map<String, dynamic> _$AdminPropertyLabelResponseToJson(
  AdminPropertyLabelResponse instance,
) => <String, dynamic>{'property_label': instance.propertyLabel};
