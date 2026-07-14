// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_create_fulfillment_set_service_zone_geo_zones_sealed.g.dart';

@JsonSerializable(createFactory: false)
sealed class AdminCreateFulfillmentSetServiceZoneGeoZonesSealed {
  const AdminCreateFulfillmentSetServiceZoneGeoZonesSealed();

  factory AdminCreateFulfillmentSetServiceZoneGeoZonesSealed.fromJson(
    Map<String, dynamic> json,
  ) =>
      AdminCreateFulfillmentSetServiceZoneGeoZonesSealedDeserializer.tryDeserialize(
        json,
      );

  Map<String, dynamic> toJson();
}

extension AdminCreateFulfillmentSetServiceZoneGeoZonesSealedDeserializer
    on AdminCreateFulfillmentSetServiceZoneGeoZonesSealed {
  static AdminCreateFulfillmentSetServiceZoneGeoZonesSealed tryDeserialize(
    Map<String, dynamic> json,
  ) {
    try {
      return AdminCreateFulfillmentSetServiceZoneGeoZonesSealedVariant1.fromJson(
        json,
      );
    } catch (_) {}
    try {
      return AdminCreateFulfillmentSetServiceZoneGeoZonesSealedVariant2.fromJson(
        json,
      );
    } catch (_) {}
    try {
      return AdminCreateFulfillmentSetServiceZoneGeoZonesSealedVariant3.fromJson(
        json,
      );
    } catch (_) {}
    try {
      return AdminCreateFulfillmentSetServiceZoneGeoZonesSealedVariant4.fromJson(
        json,
      );
    } catch (_) {}

    throw FormatException(
      'Could not determine the correct type for AdminCreateFulfillmentSetServiceZoneGeoZonesSealed from: $json',
    );
  }
}

@JsonSerializable()
class AdminCreateFulfillmentSetServiceZoneGeoZonesSealedVariant1
    extends AdminCreateFulfillmentSetServiceZoneGeoZonesSealed {
  @override
  final dynamic metadata;
  @override
  final String countryCode;
  @override
  final String type;

  const AdminCreateFulfillmentSetServiceZoneGeoZonesSealedVariant1({
    required this.metadata,
    required this.countryCode,
    required this.type,
  });

  factory AdminCreateFulfillmentSetServiceZoneGeoZonesSealedVariant1.fromJson(
    Map<String, dynamic> json,
  ) => _$AdminCreateFulfillmentSetServiceZoneGeoZonesSealedVariant1FromJson(
    json,
  );

  @override
  Map<String, dynamic> toJson() =>
      _$AdminCreateFulfillmentSetServiceZoneGeoZonesSealedVariant1ToJson(this);
}

@JsonSerializable()
class AdminCreateFulfillmentSetServiceZoneGeoZonesSealedVariant2
    extends AdminCreateFulfillmentSetServiceZoneGeoZonesSealed {
  @override
  final dynamic metadata;
  @override
  final String countryCode;
  @override
  final String type;
  @override
  final String provinceCode;

  const AdminCreateFulfillmentSetServiceZoneGeoZonesSealedVariant2({
    required this.metadata,
    required this.countryCode,
    required this.type,
    required this.provinceCode,
  });

  factory AdminCreateFulfillmentSetServiceZoneGeoZonesSealedVariant2.fromJson(
    Map<String, dynamic> json,
  ) => _$AdminCreateFulfillmentSetServiceZoneGeoZonesSealedVariant2FromJson(
    json,
  );

  @override
  Map<String, dynamic> toJson() =>
      _$AdminCreateFulfillmentSetServiceZoneGeoZonesSealedVariant2ToJson(this);
}

@JsonSerializable()
class AdminCreateFulfillmentSetServiceZoneGeoZonesSealedVariant3
    extends AdminCreateFulfillmentSetServiceZoneGeoZonesSealed {
  @override
  final dynamic metadata;
  @override
  final String countryCode;
  @override
  final String type;
  @override
  final String provinceCode;
  @override
  final String city;

  const AdminCreateFulfillmentSetServiceZoneGeoZonesSealedVariant3({
    required this.metadata,
    required this.countryCode,
    required this.type,
    required this.provinceCode,
    required this.city,
  });

  factory AdminCreateFulfillmentSetServiceZoneGeoZonesSealedVariant3.fromJson(
    Map<String, dynamic> json,
  ) => _$AdminCreateFulfillmentSetServiceZoneGeoZonesSealedVariant3FromJson(
    json,
  );

  @override
  Map<String, dynamic> toJson() =>
      _$AdminCreateFulfillmentSetServiceZoneGeoZonesSealedVariant3ToJson(this);
}

@JsonSerializable()
class AdminCreateFulfillmentSetServiceZoneGeoZonesSealedVariant4
    extends AdminCreateFulfillmentSetServiceZoneGeoZonesSealed {
  @override
  final dynamic metadata;
  @override
  final String countryCode;
  @override
  final String type;
  @override
  final String provinceCode;
  @override
  final String city;
  @override
  final dynamic postalExpression;

  const AdminCreateFulfillmentSetServiceZoneGeoZonesSealedVariant4({
    required this.metadata,
    required this.countryCode,
    required this.type,
    required this.provinceCode,
    required this.city,
    required this.postalExpression,
  });

  factory AdminCreateFulfillmentSetServiceZoneGeoZonesSealedVariant4.fromJson(
    Map<String, dynamic> json,
  ) => _$AdminCreateFulfillmentSetServiceZoneGeoZonesSealedVariant4FromJson(
    json,
  );

  @override
  Map<String, dynamic> toJson() =>
      _$AdminCreateFulfillmentSetServiceZoneGeoZonesSealedVariant4ToJson(this);
}
