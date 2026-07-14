// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_authorize_order_payment_session_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminAuthorizeOrderPaymentSessionResponse
_$AdminAuthorizeOrderPaymentSessionResponseFromJson(
  Map<String, dynamic> json,
) => AdminAuthorizeOrderPaymentSessionResponse(
  order: AdminOrder.fromJson(json['order'] as Map<String, dynamic>),
  isAuthorized: json['is_authorized'] as bool,
);

Map<String, dynamic> _$AdminAuthorizeOrderPaymentSessionResponseToJson(
  AdminAuthorizeOrderPaymentSessionResponse instance,
) => <String, dynamic>{
  'order': instance.order,
  'is_authorized': instance.isAuthorized,
};
