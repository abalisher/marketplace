// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_gps_position_res.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminGpsPositionRes _$AdminGpsPositionResFromJson(Map<String, dynamic> json) =>
    AdminGpsPositionRes(
      position: json['position'] == null
          ? null
          : AdminGpsPing.fromJson(json['position'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$AdminGpsPositionResToJson(
  AdminGpsPositionRes instance,
) => <String, dynamic>{'position': ?instance.position};
