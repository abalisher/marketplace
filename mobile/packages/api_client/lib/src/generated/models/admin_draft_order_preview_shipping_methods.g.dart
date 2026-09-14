// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_draft_order_preview_shipping_methods.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminDraftOrderPreviewShippingMethods
_$AdminDraftOrderPreviewShippingMethodsFromJson(
  Map<String, dynamic> json,
) => AdminDraftOrderPreviewShippingMethods(
  id: json['id'] as String,
  orderId: json['order_id'] as String,
  name: json['name'] as String,
  amount: json['amount'] as num,
  isTaxInclusive: json['is_tax_inclusive'] as bool,
  shippingOptionId: json['shipping_option_id'] as String,
  data: json['data'],
  metadata: json['metadata'],
  originalTotal: json['original_total'] as num,
  originalSubtotal: json['original_subtotal'] as num,
  originalTaxTotal: json['original_tax_total'] as num,
  total: json['total'] as num,
  subtotal: json['subtotal'] as num,
  taxTotal: json['tax_total'] as num,
  discountTotal: json['discount_total'] as num,
  discountTaxTotal: json['discount_tax_total'] as num,
  createdAt: DateTime.parse(json['created_at'] as String),
  updatedAt: DateTime.parse(json['updated_at'] as String),
  description: json['description'] as String?,
  taxLines: (json['tax_lines'] as List<dynamic>?)
      ?.map(
        (e) =>
            BaseOrderShippingMethodTaxLine.fromJson(e as Map<String, dynamic>),
      )
      .toList(),
  adjustments: (json['adjustments'] as List<dynamic>?)
      ?.map(
        (e) => BaseOrderShippingMethodAdjustment.fromJson(
          e as Map<String, dynamic>,
        ),
      )
      .toList(),
  detail: json['detail'] == null
      ? null
      : BaseOrderShippingDetail.fromJson(
          json['detail'] as Map<String, dynamic>,
        ),
  actions: json['actions'] as List<dynamic>?,
);

Map<String, dynamic> _$AdminDraftOrderPreviewShippingMethodsToJson(
  AdminDraftOrderPreviewShippingMethods instance,
) => <String, dynamic>{
  'id': instance.id,
  'order_id': instance.orderId,
  'name': instance.name,
  'description': ?instance.description,
  'amount': instance.amount,
  'is_tax_inclusive': instance.isTaxInclusive,
  'shipping_option_id': instance.shippingOptionId,
  'data': ?instance.data,
  'metadata': ?instance.metadata,
  'tax_lines': ?instance.taxLines,
  'adjustments': ?instance.adjustments,
  'original_total': instance.originalTotal,
  'original_subtotal': instance.originalSubtotal,
  'original_tax_total': instance.originalTaxTotal,
  'total': instance.total,
  'subtotal': instance.subtotal,
  'tax_total': instance.taxTotal,
  'discount_total': instance.discountTotal,
  'discount_tax_total': instance.discountTaxTotal,
  'created_at': instance.createdAt.toIso8601String(),
  'updated_at': instance.updatedAt.toIso8601String(),
  'detail': ?instance.detail,
  'actions': ?instance.actions,
};
