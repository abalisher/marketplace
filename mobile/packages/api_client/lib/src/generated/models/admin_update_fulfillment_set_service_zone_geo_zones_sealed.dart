// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_update_fulfillment_set_service_zone_geo_zones_sealed.g.dart';

@JsonSerializable(createFactory: false)
sealed class AdminUpdateFulfillmentSetServiceZoneGeoZonesSealed {
  const AdminUpdateFulfillmentSetServiceZoneGeoZonesSealed();

  factory AdminUpdateFulfillmentSetServiceZoneGeoZonesSealed.fromJson(
    Map<String, dynamic> json,
  ) =>
      AdminUpdateFulfillmentSetServiceZoneGeoZonesSealedDeserializer.tryDeserialize(
        json,
      );

  Map<String, dynamic> toJson();
}

extension AdminUpdateFulfillmentSetServiceZoneGeoZonesSealedDeserializer
    on AdminUpdateFulfillmentSetServiceZoneGeoZonesSealed {
  static AdminUpdateFulfillmentSetServiceZoneGeoZonesSealed tryDeserialize(
    Map<String, dynamic> json,
  ) {
    try {
      return AdminUpdateFulfillmentSetServiceZoneGeoZonesSealedVariant1.fromJson(
        json,
      );
    } catch (_) {}
    try {
      return AdminUpdateFulfillmentSetServiceZoneGeoZonesSealedVariant2.fromJson(
        json,
      );
    } catch (_) {}
    try {
      return AdminUpdateFulfillmentSetServiceZoneGeoZonesSealedVariant3.fromJson(
        json,
      );
    } catch (_) {}
    try {
      return AdminUpdateFulfillmentSetServiceZoneGeoZonesSealedVariant4.fromJson(
        json,
      );
    } catch (_) {}

    throw FormatException(
      'Could not determine the correct type for AdminUpdateFulfillmentSetServiceZoneGeoZonesSealed from: $json',
    );
  }
}

@JsonSerializable()
class AdminUpdateFulfillmentSetServiceZoneGeoZonesSealedVariant1
    extends AdminUpdateFulfillmentSetServiceZoneGeoZonesSealed {
  @override
  final String type;
  @override
  final dynamic metadata;
  @override
  final String countryCode;
  @override
  final String? id;

  const AdminUpdateFulfillmentSetServiceZoneGeoZonesSealedVariant1({
    required this.type,
    required this.metadata,
    required this.countryCode,
    required this.id,
  });

  factory AdminUpdateFulfillmentSetServiceZoneGeoZonesSealedVariant1.fromJson(
    Map<String, dynamic> json,
  ) => _$AdminUpdateFulfillmentSetServiceZoneGeoZonesSealedVariant1FromJson(
    json,
  );

  @override
  Map<String, dynamic> toJson() =>
      _$AdminUpdateFulfillmentSetServiceZoneGeoZonesSealedVariant1ToJson(this);
}

@JsonSerializable()
class AdminUpdateFulfillmentSetServiceZoneGeoZonesSealedVariant2
    extends AdminUpdateFulfillmentSetServiceZoneGeoZonesSealed {
  @override
  final String type;
  @override
  final dynamic metadata;
  @override
  final String countryCode;
  @override
  final String provinceCode;
  @override
  final String? id;

  const AdminUpdateFulfillmentSetServiceZoneGeoZonesSealedVariant2({
    required this.type,
    required this.metadata,
    required this.countryCode,
    required this.provinceCode,
    required this.id,
  });

  factory AdminUpdateFulfillmentSetServiceZoneGeoZonesSealedVariant2.fromJson(
    Map<String, dynamic> json,
  ) => _$AdminUpdateFulfillmentSetServiceZoneGeoZonesSealedVariant2FromJson(
    json,
  );

  @override
  Map<String, dynamic> toJson() =>
      _$AdminUpdateFulfillmentSetServiceZoneGeoZonesSealedVariant2ToJson(this);
}

@JsonSerializable()
class AdminUpdateFulfillmentSetServiceZoneGeoZonesSealedVariant3
    extends AdminUpdateFulfillmentSetServiceZoneGeoZonesSealed {
  @override
  final String type;
  @override
  final dynamic metadata;
  @override
  final String city;
  @override
  final String countryCode;
  @override
  final String provinceCode;
  @override
  final String? id;

  const AdminUpdateFulfillmentSetServiceZoneGeoZonesSealedVariant3({
    required this.type,
    required this.metadata,
    required this.city,
    required this.countryCode,
    required this.provinceCode,
    required this.id,
  });

  factory AdminUpdateFulfillmentSetServiceZoneGeoZonesSealedVariant3.fromJson(
    Map<String, dynamic> json,
  ) => _$AdminUpdateFulfillmentSetServiceZoneGeoZonesSealedVariant3FromJson(
    json,
  );

  @override
  Map<String, dynamic> toJson() =>
      _$AdminUpdateFulfillmentSetServiceZoneGeoZonesSealedVariant3ToJson(this);
}

@JsonSerializable()
class AdminUpdateFulfillmentSetServiceZoneGeoZonesSealedVariant4
    extends AdminUpdateFulfillmentSetServiceZoneGeoZonesSealed {
  @override
  final String type;
  @override
  final dynamic metadata;
  @override
  final String city;
  @override
  final String countryCode;
  @override
  final String provinceCode;
  @override
  final dynamic postalExpression;
  @override
  final String? id;

  const AdminUpdateFulfillmentSetServiceZoneGeoZonesSealedVariant4({
    required this.type,
    required this.metadata,
    required this.city,
    required this.countryCode,
    required this.provinceCode,
    required this.postalExpression,
    required this.id,
  });

  factory AdminUpdateFulfillmentSetServiceZoneGeoZonesSealedVariant4.fromJson(
    Map<String, dynamic> json,
  ) => _$AdminUpdateFulfillmentSetServiceZoneGeoZonesSealedVariant4FromJson(
    json,
  );

  @override
  Map<String, dynamic> toJson() =>
      _$AdminUpdateFulfillmentSetServiceZoneGeoZonesSealedVariant4ToJson(this);
}
