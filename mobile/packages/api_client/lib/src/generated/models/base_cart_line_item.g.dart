// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'base_cart_line_item.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

BaseCartLineItem _$BaseCartLineItemFromJson(
  Map<String, dynamic> json,
) => BaseCartLineItem(
  cartId: json['cart_id'] as String,
  title: json['title'] as String,
  quantity: json['quantity'] as num,
  isTaxInclusive: json['is_tax_inclusive'] as bool,
  id: json['id'] as String,
  requiresShipping: json['requires_shipping'] as bool,
  isDiscountable: json['is_discountable'] as bool,
  unitPrice: json['unit_price'] as num,
  cart: BaseCart.fromJson(json['cart'] as Map<String, dynamic>),
  variantId: json['variant_id'] as String?,
  productType: json['product_type'] as String?,
  productCollection: json['product_collection'] as String?,
  productHandle: json['product_handle'] as String?,
  variant: json['variant'] == null
      ? null
      : BaseProductVariant.fromJson(json['variant'] as Map<String, dynamic>),
  subtitle: json['subtitle'] as String?,
  variantSku: json['variant_sku'] as String?,
  variantBarcode: json['variant_barcode'] as String?,
  variantTitle: json['variant_title'] as String?,
  variantOptionValues: json['variant_option_values'],
  product: json['product'] == null
      ? null
      : BaseProduct.fromJson(json['product'] as Map<String, dynamic>),
  productId: json['product_id'] as String?,
  productTitle: json['product_title'] as String?,
  compareAtUnitPrice: json['compare_at_unit_price'] as num?,
  thumbnail: json['thumbnail'] as String?,
  taxLines: json['tax_lines'] as List<dynamic>?,
  adjustments: (json['adjustments'] as List<dynamic>?)
      ?.map((e) => BaseLineItemAdjustment.fromJson(e as Map<String, dynamic>))
      .toList(),
  productDescription: json['product_description'] as String?,
  productSubtitle: json['product_subtitle'] as String?,
  discountTaxTotal: json['discount_tax_total'] as num?,
  createdAt: json['created_at'] == null
      ? null
      : DateTime.parse(json['created_at'] as String),
  updatedAt: json['updated_at'] == null
      ? null
      : DateTime.parse(json['updated_at'] as String),
  deletedAt: json['deleted_at'] == null
      ? null
      : DateTime.parse(json['deleted_at'] as String),
  originalTotal: json['original_total'] as num?,
  originalSubtotal: json['original_subtotal'] as num?,
  originalTaxTotal: json['original_tax_total'] as num?,
  itemTotal: json['item_total'] as num?,
  itemSubtotal: json['item_subtotal'] as num?,
  itemTaxTotal: json['item_tax_total'] as num?,
  total: json['total'] as num?,
  subtotal: json['subtotal'] as num?,
  taxTotal: json['tax_total'] as num?,
  discountTotal: json['discount_total'] as num?,
  metadata: json['metadata'],
);

Map<String, dynamic> _$BaseCartLineItemToJson(BaseCartLineItem instance) =>
    <String, dynamic>{
      'id': instance.id,
      'title': instance.title,
      'subtitle': ?instance.subtitle,
      'thumbnail': ?instance.thumbnail,
      'quantity': instance.quantity,
      'product': ?instance.product,
      'product_id': ?instance.productId,
      'product_title': ?instance.productTitle,
      'product_description': ?instance.productDescription,
      'product_subtitle': ?instance.productSubtitle,
      'product_type': ?instance.productType,
      'product_collection': ?instance.productCollection,
      'product_handle': ?instance.productHandle,
      'variant': ?instance.variant,
      'variant_id': ?instance.variantId,
      'variant_sku': ?instance.variantSku,
      'variant_barcode': ?instance.variantBarcode,
      'variant_title': ?instance.variantTitle,
      'variant_option_values': ?instance.variantOptionValues,
      'requires_shipping': instance.requiresShipping,
      'is_discountable': instance.isDiscountable,
      'is_tax_inclusive': instance.isTaxInclusive,
      'compare_at_unit_price': ?instance.compareAtUnitPrice,
      'unit_price': instance.unitPrice,
      'tax_lines': ?instance.taxLines,
      'adjustments': ?instance.adjustments,
      'cart': instance.cart,
      'cart_id': instance.cartId,
      'metadata': ?instance.metadata,
      'created_at': ?instance.createdAt?.toIso8601String(),
      'updated_at': ?instance.updatedAt?.toIso8601String(),
      'deleted_at': ?instance.deletedAt?.toIso8601String(),
      'original_total': ?instance.originalTotal,
      'original_subtotal': ?instance.originalSubtotal,
      'original_tax_total': ?instance.originalTaxTotal,
      'item_total': ?instance.itemTotal,
      'item_subtotal': ?instance.itemSubtotal,
      'item_tax_total': ?instance.itemTaxTotal,
      'total': ?instance.total,
      'subtotal': ?instance.subtotal,
      'tax_total': ?instance.taxTotal,
      'discount_total': ?instance.discountTotal,
      'discount_tax_total': ?instance.discountTaxTotal,
    };
