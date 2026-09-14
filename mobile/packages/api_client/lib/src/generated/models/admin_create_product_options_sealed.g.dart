// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_create_product_options_sealed.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Map<String, dynamic> _$AdminCreateProductOptionsSealedToJson(
  AdminCreateProductOptionsSealed instance,
) => <String, dynamic>{};

AdminCreateProductOptionsSealedAdminCreateProductOption
_$AdminCreateProductOptionsSealedAdminCreateProductOptionFromJson(
  Map<String, dynamic> json,
) => AdminCreateProductOptionsSealedAdminCreateProductOption(
  title: json['title'] as String,
  values: (json['values'] as List<dynamic>).map((e) => e as String).toList(),
  ranks: json['ranks'],
  isExclusive: json['isExclusive'] as bool?,
);

Map<String, dynamic>
_$AdminCreateProductOptionsSealedAdminCreateProductOptionToJson(
  AdminCreateProductOptionsSealedAdminCreateProductOption instance,
) => <String, dynamic>{
  'title': instance.title,
  'values': instance.values,
  'ranks': ?instance.ranks,
  'isExclusive': ?instance.isExclusive,
};

AdminCreateProductOptionsSealedVariant2
_$AdminCreateProductOptionsSealedVariant2FromJson(Map<String, dynamic> json) =>
    AdminCreateProductOptionsSealedVariant2(
      id: json['id'] as String,
      valueIds: (json['valueIds'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
    );

Map<String, dynamic> _$AdminCreateProductOptionsSealedVariant2ToJson(
  AdminCreateProductOptionsSealedVariant2 instance,
) => <String, dynamic>{'id': instance.id, 'valueIds': ?instance.valueIds};
