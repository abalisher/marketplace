// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_create_product_variant_inventory_kit.dart';
import 'admin_create_product_variant_price.dart';
import 'admin_create_product_variant.dart';
import 'admin_update_product_variant.dart';

part 'admin_update_product_variants_sealed.g.dart';

@JsonSerializable(createFactory: false)
sealed class AdminUpdateProductVariantsSealed {
  const AdminUpdateProductVariantsSealed();

  factory AdminUpdateProductVariantsSealed.fromJson(
    Map<String, dynamic> json,
  ) => AdminUpdateProductVariantsSealedDeserializer.tryDeserialize(json);

  Map<String, dynamic> toJson();
}

extension AdminUpdateProductVariantsSealedDeserializer
    on AdminUpdateProductVariantsSealed {
  static AdminUpdateProductVariantsSealed tryDeserialize(
    Map<String, dynamic> json,
  ) {
    try {
      return AdminUpdateProductVariantsSealedAdminCreateProductVariant.fromJson(
        json,
      );
    } catch (_) {}
    try {
      return AdminUpdateProductVariantsSealedAdminUpdateProductVariant.fromJson(
        json,
      );
    } catch (_) {}

    throw FormatException(
      'Could not determine the correct type for AdminUpdateProductVariantsSealed from: $json',
    );
  }
}

@JsonSerializable()
class AdminUpdateProductVariantsSealedAdminCreateProductVariant
    extends AdminUpdateProductVariantsSealed
    implements AdminCreateProductVariant {
  @override
  final String title;
  @override
  final String? sku;
  @override
  final String? ean;
  @override
  final String? upc;
  @override
  final String? barcode;
  @override
  final String? hsCode;
  @override
  final String? midCode;
  @override
  final bool? allowBackorder;
  @override
  final bool? manageInventory;
  @override
  final num? variantRank;
  @override
  final num? weight;
  @override
  final num? length;
  @override
  final num? height;
  @override
  final num? width;
  @override
  final String? originCountry;
  @override
  final String? material;
  @override
  final dynamic metadata;
  @override
  final List<AdminCreateProductVariantPrice> prices;
  @override
  final dynamic options;
  @override
  final List<AdminCreateProductVariantInventoryKit>? inventoryItems;

  const AdminUpdateProductVariantsSealedAdminCreateProductVariant({
    required this.title,
    required this.sku,
    required this.ean,
    required this.upc,
    required this.barcode,
    required this.hsCode,
    required this.midCode,
    required this.allowBackorder,
    required this.manageInventory,
    required this.variantRank,
    required this.weight,
    required this.length,
    required this.height,
    required this.width,
    required this.originCountry,
    required this.material,
    required this.metadata,
    required this.prices,
    required this.options,
    required this.inventoryItems,
  });

  factory AdminUpdateProductVariantsSealedAdminCreateProductVariant.fromJson(
    Map<String, dynamic> json,
  ) =>
      _$AdminUpdateProductVariantsSealedAdminCreateProductVariantFromJson(json);

  @override
  Map<String, dynamic> toJson() =>
      _$AdminUpdateProductVariantsSealedAdminCreateProductVariantToJson(this);
}

@JsonSerializable()
class AdminUpdateProductVariantsSealedAdminUpdateProductVariant
    extends AdminUpdateProductVariantsSealed
    implements AdminUpdateProductVariant {
  @override
  final String? title;
  @override
  final String? sku;
  @override
  final String? ean;
  @override
  final String? upc;
  @override
  final String? barcode;
  @override
  final String? hsCode;
  @override
  final String? midCode;
  @override
  final bool? allowBackorder;
  @override
  final bool? manageInventory;
  @override
  final num? variantRank;
  @override
  final num? weight;
  @override
  final num? length;
  @override
  final num? height;
  @override
  final num? width;
  @override
  final String? originCountry;
  @override
  final String? material;
  @override
  final dynamic metadata;
  @override
  final List<AdminCreateProductVariantPrice>? prices;
  @override
  final dynamic options;

  const AdminUpdateProductVariantsSealedAdminUpdateProductVariant({
    required this.title,
    required this.sku,
    required this.ean,
    required this.upc,
    required this.barcode,
    required this.hsCode,
    required this.midCode,
    required this.allowBackorder,
    required this.manageInventory,
    required this.variantRank,
    required this.weight,
    required this.length,
    required this.height,
    required this.width,
    required this.originCountry,
    required this.material,
    required this.metadata,
    required this.prices,
    required this.options,
  });

  factory AdminUpdateProductVariantsSealedAdminUpdateProductVariant.fromJson(
    Map<String, dynamic> json,
  ) =>
      _$AdminUpdateProductVariantsSealedAdminUpdateProductVariantFromJson(json);

  @override
  Map<String, dynamic> toJson() =>
      _$AdminUpdateProductVariantsSealedAdminUpdateProductVariantToJson(this);
}
