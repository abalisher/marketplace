// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_complete_assembly.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminCompleteAssembly _$AdminCompleteAssemblyFromJson(
  Map<String, dynamic> json,
) => AdminCompleteAssembly(
  items: (json['items'] as List<dynamic>)
      .map((e) => AdminOrderLineInput.fromJson(e as Map<String, dynamic>))
      .toList(),
  locationId: json['location_id'] as String?,
);

Map<String, dynamic> _$AdminCompleteAssemblyToJson(
  AdminCompleteAssembly instance,
) => <String, dynamic>{
  'items': instance.items,
  'location_id': instance.locationId,
};
