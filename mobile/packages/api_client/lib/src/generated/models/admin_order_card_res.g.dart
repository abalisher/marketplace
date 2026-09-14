// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_order_card_res.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminOrderCardRes _$AdminOrderCardResFromJson(Map<String, dynamic> json) =>
    AdminOrderCardRes(
      orderCard: AdminOrderCard.fromJson(
        json['order_card'] as Map<String, dynamic>,
      ),
    );

Map<String, dynamic> _$AdminOrderCardResToJson(AdminOrderCardRes instance) =>
    <String, dynamic>{'order_card': instance.orderCard};
