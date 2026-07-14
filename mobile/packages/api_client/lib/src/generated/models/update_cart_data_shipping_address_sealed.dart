// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'create_address.dart';
import 'update_address.dart';

part 'update_cart_data_shipping_address_sealed.g.dart';

@JsonSerializable(createFactory: false)
sealed class UpdateCartDataShippingAddressSealed {
  const UpdateCartDataShippingAddressSealed();

  factory UpdateCartDataShippingAddressSealed.fromJson(
    Map<String, dynamic> json,
  ) => UpdateCartDataShippingAddressSealedDeserializer.tryDeserialize(json);

  Map<String, dynamic> toJson();
}

extension UpdateCartDataShippingAddressSealedDeserializer
    on UpdateCartDataShippingAddressSealed {
  static UpdateCartDataShippingAddressSealed tryDeserialize(
    Map<String, dynamic> json,
  ) {
    try {
      return UpdateCartDataShippingAddressSealedCreateAddress.fromJson(json);
    } catch (_) {}
    try {
      return UpdateCartDataShippingAddressSealedUpdateAddress.fromJson(json);
    } catch (_) {}

    throw FormatException(
      'Could not determine the correct type for UpdateCartDataShippingAddressSealed from: $json',
    );
  }
}

@JsonSerializable()
class UpdateCartDataShippingAddressSealedCreateAddress
    extends UpdateCartDataShippingAddressSealed
    implements CreateAddress {
  @override
  final String? customerId;
  @override
  final String? company;
  @override
  final String? firstName;
  @override
  final String? lastName;
  @override
  final String? address1;
  @override
  final String? address2;
  @override
  final String? city;
  @override
  final String? countryCode;
  @override
  final String? province;
  @override
  final String? postalCode;
  @override
  final String? phone;
  @override
  final dynamic metadata;

  const UpdateCartDataShippingAddressSealedCreateAddress({
    required this.customerId,
    required this.company,
    required this.firstName,
    required this.lastName,
    required this.address1,
    required this.address2,
    required this.city,
    required this.countryCode,
    required this.province,
    required this.postalCode,
    required this.phone,
    required this.metadata,
  });

  factory UpdateCartDataShippingAddressSealedCreateAddress.fromJson(
    Map<String, dynamic> json,
  ) => _$UpdateCartDataShippingAddressSealedCreateAddressFromJson(json);

  @override
  Map<String, dynamic> toJson() =>
      _$UpdateCartDataShippingAddressSealedCreateAddressToJson(this);
}

@JsonSerializable()
class UpdateCartDataShippingAddressSealedUpdateAddress
    extends UpdateCartDataShippingAddressSealed
    implements UpdateAddress {
  @override
  final String id;
  @override
  final String? customerId;
  @override
  final String? company;
  @override
  final String? firstName;
  @override
  final String? lastName;
  @override
  final String? address1;
  @override
  final String? address2;
  @override
  final String? city;
  @override
  final String? countryCode;
  @override
  final String? province;
  @override
  final String? postalCode;
  @override
  final String? phone;
  @override
  final dynamic metadata;

  const UpdateCartDataShippingAddressSealedUpdateAddress({
    required this.id,
    required this.customerId,
    required this.company,
    required this.firstName,
    required this.lastName,
    required this.address1,
    required this.address2,
    required this.city,
    required this.countryCode,
    required this.province,
    required this.postalCode,
    required this.phone,
    required this.metadata,
  });

  factory UpdateCartDataShippingAddressSealedUpdateAddress.fromJson(
    Map<String, dynamic> json,
  ) => _$UpdateCartDataShippingAddressSealedUpdateAddressFromJson(json);

  @override
  Map<String, dynamic> toJson() =>
      _$UpdateCartDataShippingAddressSealedUpdateAddressToJson(this);
}
