// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'create_address.dart';
import 'update_address.dart';

part 'update_cart_data_billing_address_sealed.g.dart';

@JsonSerializable(createFactory: false)
sealed class UpdateCartDataBillingAddressSealed {
  const UpdateCartDataBillingAddressSealed();

  factory UpdateCartDataBillingAddressSealed.fromJson(
    Map<String, dynamic> json,
  ) => UpdateCartDataBillingAddressSealedDeserializer.tryDeserialize(json);

  Map<String, dynamic> toJson();
}

extension UpdateCartDataBillingAddressSealedDeserializer
    on UpdateCartDataBillingAddressSealed {
  static UpdateCartDataBillingAddressSealed tryDeserialize(
    Map<String, dynamic> json,
  ) {
    try {
      return UpdateCartDataBillingAddressSealedCreateAddress.fromJson(json);
    } catch (_) {}
    try {
      return UpdateCartDataBillingAddressSealedUpdateAddress.fromJson(json);
    } catch (_) {}

    throw FormatException(
      'Could not determine the correct type for UpdateCartDataBillingAddressSealed from: $json',
    );
  }
}

@JsonSerializable()
class UpdateCartDataBillingAddressSealedCreateAddress
    extends UpdateCartDataBillingAddressSealed
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

  const UpdateCartDataBillingAddressSealedCreateAddress({
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

  factory UpdateCartDataBillingAddressSealedCreateAddress.fromJson(
    Map<String, dynamic> json,
  ) => _$UpdateCartDataBillingAddressSealedCreateAddressFromJson(json);

  @override
  Map<String, dynamic> toJson() =>
      _$UpdateCartDataBillingAddressSealedCreateAddressToJson(this);
}

@JsonSerializable()
class UpdateCartDataBillingAddressSealedUpdateAddress
    extends UpdateCartDataBillingAddressSealed
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

  const UpdateCartDataBillingAddressSealedUpdateAddress({
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

  factory UpdateCartDataBillingAddressSealedUpdateAddress.fromJson(
    Map<String, dynamic> json,
  ) => _$UpdateCartDataBillingAddressSealedUpdateAddressFromJson(json);

  @override
  Map<String, dynamic> toJson() =>
      _$UpdateCartDataBillingAddressSealedUpdateAddressToJson(this);
}
