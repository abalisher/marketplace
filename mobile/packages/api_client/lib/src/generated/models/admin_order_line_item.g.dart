// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_order_line_item.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminOrderLineItem _$AdminOrderLineItemFromJson(
  Map<String, dynamic> json,
) => AdminOrderLineItem(
  variantSku: json['variant_sku'] as String,
  title: json['title'] as String,
  subtitle: json['subtitle'] as String?,
  thumbnail: json['thumbnail'] as String?,
  refundableTotalPerUnit: json['refundable_total_per_unit'] as num,
  variantId: json['variant_id'] as String,
  refundableTotal: json['refundable_total'] as num,
  productId: json['product_id'] as String,
  productTitle: json['product_title'] as String,
  productDescription: json['product_description'] as String,
  productSubtitle: json['product_subtitle'] as String,
  productType: json['product_type'] as String,
  productCollection: json['product_collection'] as String,
  productHandle: json['product_handle'] as String,
  id: json['id'] as String,
  variantBarcode: json['variant_barcode'] as String,
  variantTitle: json['variant_title'] as String,
  variantOptionValues: json['variant_option_values'],
  requiresShipping: json['requires_shipping'] as bool,
  isDiscountable: json['is_discountable'] as bool,
  isTaxInclusive: json['is_tax_inclusive'] as bool,
  updatedAt: DateTime.parse(json['updated_at'] as String),
  unitPrice: json['unit_price'] as num,
  quantity: json['quantity'] as num,
  discountTaxTotal: json['discount_tax_total'] as num,
  discountTotal: json['discount_total'] as num,
  detail: json['detail'],
  createdAt: DateTime.parse(json['created_at'] as String),
  productTypeId: json['product_type_id'] as String,
  metadata: json['metadata'],
  originalTotal: json['original_total'] as num,
  originalSubtotal: json['original_subtotal'] as num,
  originalTaxTotal: json['original_tax_total'] as num,
  itemTotal: json['item_total'] as num,
  itemSubtotal: json['item_subtotal'] as num,
  itemTaxTotal: json['item_tax_total'] as num,
  taxTotal: json['tax_total'] as num,
  subtotal: json['subtotal'] as num,
  total: json['total'] as num,
  adjustments: (json['adjustments'] as List<dynamic>?)
      ?.map(
        (e) => BaseOrderLineItemAdjustment.fromJson(e as Map<String, dynamic>),
      )
      .toList(),
  taxLines: (json['tax_lines'] as List<dynamic>?)
      ?.map((e) => BaseOrderLineItemTaxLine.fromJson(e as Map<String, dynamic>))
      .toList(),
  product: json['product'] == null
      ? null
      : AdminProduct.fromJson(json['product'] as Map<String, dynamic>),
  variant: json['variant'] == null
      ? null
      : AdminProductVariant.fromJson(json['variant'] as Map<String, dynamic>),
  compareAtUnitPrice: json['compare_at_unit_price'] as num?,
);

Map<String, dynamic> _$AdminOrderLineItemToJson(AdminOrderLineItem instance) =>
    <String, dynamic>{
      'id': instance.id,
      'title': instance.title,
      'subtitle': ?instance.subtitle,
      'thumbnail': ?instance.thumbnail,
      'variant': ?instance.variant,
      'variant_id': instance.variantId,
      'product': ?instance.product,
      'product_id': instance.productId,
      'product_title': instance.productTitle,
      'product_description': instance.productDescription,
      'product_subtitle': instance.productSubtitle,
      'product_type': instance.productType,
      'product_collection': instance.productCollection,
      'product_handle': instance.productHandle,
      'variant_sku': instance.variantSku,
      'variant_barcode': instance.variantBarcode,
      'variant_title': instance.variantTitle,
      'variant_option_values': ?instance.variantOptionValues,
      'requires_shipping': instance.requiresShipping,
      'is_discountable': instance.isDiscountable,
      'is_tax_inclusive': instance.isTaxInclusive,
      'compare_at_unit_price': ?instance.compareAtUnitPrice,
      'unit_price': instance.unitPrice,
      'quantity': instance.quantity,
      'tax_lines': ?instance.taxLines,
      'adjustments': ?instance.adjustments,
      'detail': ?instance.detail,
      'created_at': instance.createdAt.toIso8601String(),
      'updated_at': instance.updatedAt.toIso8601String(),
      'metadata': ?instance.metadata,
      'original_total': instance.originalTotal,
      'original_subtotal': instance.originalSubtotal,
      'original_tax_total': instance.originalTaxTotal,
      'item_total': instance.itemTotal,
      'item_subtotal': instance.itemSubtotal,
      'item_tax_total': instance.itemTaxTotal,
      'total': instance.total,
      'subtotal': instance.subtotal,
      'tax_total': instance.taxTotal,
      'discount_total': instance.discountTotal,
      'discount_tax_total': instance.discountTaxTotal,
      'refundable_total': instance.refundableTotal,
      'refundable_total_per_unit': instance.refundableTotalPerUnit,
      'product_type_id': instance.productTypeId,
    };
