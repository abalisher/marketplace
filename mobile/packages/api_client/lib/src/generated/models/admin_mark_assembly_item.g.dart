// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_mark_assembly_item.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminMarkAssemblyItem _$AdminMarkAssemblyItemFromJson(
  Map<String, dynamic> json,
) => AdminMarkAssemblyItem(
  status: AdminMarkAssemblyItemStatus.fromJson(json['status'] as String),
  pickedQuantity: (json['picked_quantity'] as num?)?.toInt(),
  note: json['note'] as String?,
);

Map<String, dynamic> _$AdminMarkAssemblyItemToJson(
  AdminMarkAssemblyItem instance,
) => <String, dynamic>{
  'status': _$AdminMarkAssemblyItemStatusEnumMap[instance.status]!,
  'picked_quantity': ?instance.pickedQuantity,
  'note': ?instance.note,
};

const _$AdminMarkAssemblyItemStatusEnumMap = {
  AdminMarkAssemblyItemStatus.picked: 'picked',
  AdminMarkAssemblyItemStatus.partial: 'partial',
  AdminMarkAssemblyItemStatus.missing: 'missing',
  AdminMarkAssemblyItemStatus.$unknown: r'$unknown',
};
