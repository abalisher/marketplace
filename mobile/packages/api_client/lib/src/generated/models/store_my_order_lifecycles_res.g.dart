// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_my_order_lifecycles_res.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreMyOrderLifecyclesRes _$StoreMyOrderLifecyclesResFromJson(
  Map<String, dynamic> json,
) => StoreMyOrderLifecyclesRes(
  lifecycles: (json['lifecycles'] as List<dynamic>)
      .map((e) => StoreMyOrderLifecycle.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic> _$StoreMyOrderLifecyclesResToJson(
  StoreMyOrderLifecyclesRes instance,
) => <String, dynamic>{'lifecycles': instance.lifecycles};
