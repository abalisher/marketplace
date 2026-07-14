// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_create_product_option.dart';

part 'admin_create_product_options_sealed.g.dart';

/// The product option's details.
@JsonSerializable(createFactory: false)
sealed class AdminCreateProductOptionsSealed {
  const AdminCreateProductOptionsSealed();

  factory AdminCreateProductOptionsSealed.fromJson(Map<String, dynamic> json) =>
      AdminCreateProductOptionsSealedDeserializer.tryDeserialize(json);

  Map<String, dynamic> toJson();
}

extension AdminCreateProductOptionsSealedDeserializer
    on AdminCreateProductOptionsSealed {
  static AdminCreateProductOptionsSealed tryDeserialize(
    Map<String, dynamic> json,
  ) {
    try {
      return AdminCreateProductOptionsSealedAdminCreateProductOption.fromJson(
        json,
      );
    } catch (_) {}
    try {
      return AdminCreateProductOptionsSealedVariant2.fromJson(json);
    } catch (_) {}

    throw FormatException(
      'Could not determine the correct type for AdminCreateProductOptionsSealed from: $json',
    );
  }
}

@JsonSerializable()
class AdminCreateProductOptionsSealedAdminCreateProductOption
    extends AdminCreateProductOptionsSealed
    implements AdminCreateProductOption {
  @override
  final String title;
  @override
  final List<String> values;
  @override
  final dynamic ranks;
  @override
  final bool? isExclusive;

  const AdminCreateProductOptionsSealedAdminCreateProductOption({
    required this.title,
    required this.values,
    required this.ranks,
    required this.isExclusive,
  });

  factory AdminCreateProductOptionsSealedAdminCreateProductOption.fromJson(
    Map<String, dynamic> json,
  ) => _$AdminCreateProductOptionsSealedAdminCreateProductOptionFromJson(json);

  @override
  Map<String, dynamic> toJson() =>
      _$AdminCreateProductOptionsSealedAdminCreateProductOptionToJson(this);
}

@JsonSerializable()
class AdminCreateProductOptionsSealedVariant2
    extends AdminCreateProductOptionsSealed {
  @override
  final String id;
  @override
  final List<String>? valueIds;

  const AdminCreateProductOptionsSealedVariant2({
    required this.id,
    required this.valueIds,
  });

  factory AdminCreateProductOptionsSealedVariant2.fromJson(
    Map<String, dynamic> json,
  ) => _$AdminCreateProductOptionsSealedVariant2FromJson(json);

  @override
  Map<String, dynamic> toJson() =>
      _$AdminCreateProductOptionsSealedVariant2ToJson(this);
}
