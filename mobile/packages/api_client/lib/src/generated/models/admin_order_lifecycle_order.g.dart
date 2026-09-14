// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_order_lifecycle_order.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminOrderLifecycleOrder _$AdminOrderLifecycleOrderFromJson(
  Map<String, dynamic> json,
) => AdminOrderLifecycleOrder(
  id: json['id'] as String,
  displayId: (json['display_id'] as num?)?.toInt(),
  email: json['email'] as String?,
  createdAt: json['created_at'] == null
      ? null
      : DateTime.parse(json['created_at'] as String),
  customerName: json['customer_name'] as String?,
  companyId: json['company_id'] as String?,
  isCompany: json['is_company'] as bool?,
  itemCount: (json['item_count'] as num?)?.toInt(),
  total: json['total'] as num?,
  currencyCode: json['currency_code'] as String?,
  paymentState: json['payment_state'] == null
      ? null
      : AdminOrderLifecycleOrderPaymentState.fromJson(
          json['payment_state'] as String,
        ),
  address: json['address'] as String?,
);

Map<String, dynamic> _$AdminOrderLifecycleOrderToJson(
  AdminOrderLifecycleOrder instance,
) => <String, dynamic>{
  'id': instance.id,
  'display_id': ?instance.displayId,
  'email': ?instance.email,
  'created_at': ?instance.createdAt?.toIso8601String(),
  'customer_name': ?instance.customerName,
  'company_id': ?instance.companyId,
  'is_company': ?instance.isCompany,
  'item_count': ?instance.itemCount,
  'total': ?instance.total,
  'currency_code': ?instance.currencyCode,
  'payment_state':
      ?_$AdminOrderLifecycleOrderPaymentStateEnumMap[instance.paymentState],
  'address': ?instance.address,
};

const _$AdminOrderLifecycleOrderPaymentStateEnumMap = {
  AdminOrderLifecycleOrderPaymentState.paid: 'paid',
  AdminOrderLifecycleOrderPaymentState.awaiting: 'awaiting',
  AdminOrderLifecycleOrderPaymentState.canceled: 'canceled',
  AdminOrderLifecycleOrderPaymentState.$unknown: r'$unknown',
};
