// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_link_product_options.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminLinkProductOptions _$AdminLinkProductOptionsFromJson(
  Map<String, dynamic> json,
) => AdminLinkProductOptions(
  add: json['add'] as List<dynamic>?,
  remove: (json['remove'] as List<dynamic>?)?.map((e) => e as String).toList(),
  update: (json['update'] as List<dynamic>?)
      ?.map(
        (e) =>
            AdminUpdateProductOptionValues.fromJson(e as Map<String, dynamic>),
      )
      .toList(),
);

Map<String, dynamic> _$AdminLinkProductOptionsToJson(
  AdminLinkProductOptions instance,
) => <String, dynamic>{
  'add': instance.add,
  'remove': instance.remove,
  'update': instance.update,
};
