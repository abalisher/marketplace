// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_order_line_item.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreOrderLineItem _$StoreOrderLineItemFromJson(
  Map<String, dynamic> json,
) => StoreOrderLineItem(
  itemSubtotal: json['item_subtotal'] as num,
  quantity: json['quantity'] as num,
  unitPrice: json['unit_price'] as num,
  isTaxInclusive: json['is_tax_inclusive'] as bool,
  detail: StoreOrderLineItemDetail.fromJson(
    json['detail'] as Map<String, dynamic>,
  ),
  title: json['title'] as String,
  id: json['id'] as String,
  metadata: json['metadata'],
  createdAt: DateTime.parse(json['created_at'] as String),
  updatedAt: DateTime.parse(json['updated_at'] as String),
  originalTotal: json['original_total'] as num,
  originalSubtotal: json['original_subtotal'] as num,
  originalTaxTotal: json['original_tax_total'] as num,
  itemTotal: json['item_total'] as num,
  isDiscountable: json['is_discountable'] as bool,
  itemTaxTotal: json['item_tax_total'] as num,
  total: json['total'] as num,
  subtotal: json['subtotal'] as num,
  taxTotal: json['tax_total'] as num,
  discountTotal: json['discount_total'] as num,
  discountTaxTotal: json['discount_tax_total'] as num,
  refundableTotal: json['refundable_total'] as num,
  refundableTotalPerUnit: json['refundable_total_per_unit'] as num,
  subtitle: json['subtitle'] as String?,
  thumbnail: json['thumbnail'] as String?,
  variantId: json['variant_id'] as String,
  productId: json['product_id'] as String,
  productTitle: json['product_title'] as String,
  productTypeId: json['product_type_id'] as String,
  productSubtitle: json['product_subtitle'] as String,
  productType: json['product_type'] as String,
  productCollection: json['product_collection'] as String,
  productHandle: json['product_handle'] as String,
  variantSku: json['variant_sku'] as String,
  variantBarcode: json['variant_barcode'] as String,
  variantTitle: json['variant_title'] as String,
  variantOptionValues: json['variant_option_values'],
  requiresShipping: json['requires_shipping'] as bool,
  productDescription: json['product_description'] as String,
  adjustments: (json['adjustments'] as List<dynamic>?)
      ?.map(
        (e) =>
            StoreOrderLineItemAdjustments.fromJson(e as Map<String, dynamic>),
      )
      .toList(),
  compareAtUnitPrice: json['compare_at_unit_price'] as num?,
  taxLines: (json['tax_lines'] as List<dynamic>?)
      ?.map(
        (e) => StoreOrderLineItemTaxLines.fromJson(e as Map<String, dynamic>),
      )
      .toList(),
  product: json['product'] == null
      ? null
      : StoreProduct.fromJson(json['product'] as Map<String, dynamic>),
  variant: json['variant'] == null
      ? null
      : StoreProductVariant.fromJson(json['variant'] as Map<String, dynamic>),
);

Map<String, dynamic> _$StoreOrderLineItemToJson(StoreOrderLineItem instance) =>
    <String, dynamic>{
      'variant': ?instance.variant,
      'product': ?instance.product,
      'tax_lines': ?instance.taxLines,
      'adjustments': ?instance.adjustments,
      'detail': instance.detail,
      'title': instance.title,
      'id': instance.id,
      'metadata': ?instance.metadata,
      'created_at': instance.createdAt.toIso8601String(),
      'updated_at': instance.updatedAt.toIso8601String(),
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
      'subtitle': ?instance.subtitle,
      'thumbnail': ?instance.thumbnail,
      'variant_id': instance.variantId,
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
      'product_type_id': instance.productTypeId,
    };
