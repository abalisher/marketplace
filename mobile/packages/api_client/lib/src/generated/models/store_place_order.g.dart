// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_place_order.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StorePlaceOrder _$StorePlaceOrderFromJson(Map<String, dynamic> json) =>
    StorePlaceOrder(
      cartId: json['cart_id'] as String,
      deliveryMethod: json['delivery_method'] == null
          ? StorePlaceOrderDeliveryMethod.delivery
          : StorePlaceOrderDeliveryMethod.fromJson(
              json['delivery_method'] as String,
            ),
    );

Map<String, dynamic> _$StorePlaceOrderToJson(StorePlaceOrder instance) =>
    <String, dynamic>{
      'cart_id': instance.cartId,
      'delivery_method':
          _$StorePlaceOrderDeliveryMethodEnumMap[instance.deliveryMethod]!,
    };

const _$StorePlaceOrderDeliveryMethodEnumMap = {
  StorePlaceOrderDeliveryMethod.delivery: 'delivery',
  StorePlaceOrderDeliveryMethod.$unknown: r'$unknown',
};
