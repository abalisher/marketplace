// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_claim_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminClaimResponse _$AdminClaimResponseFromJson(Map<String, dynamic> json) =>
    AdminClaimResponse(
      claim: AdminClaim.fromJson(json['claim'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$AdminClaimResponseToJson(AdminClaimResponse instance) =>
    <String, dynamic>{'claim': instance.claim};
