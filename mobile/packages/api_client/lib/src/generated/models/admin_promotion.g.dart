// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_promotion.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminPromotion _$AdminPromotionFromJson(Map<String, dynamic> json) =>
    AdminPromotion(
      id: json['id'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
      deletedAt: DateTime.parse(json['deleted_at'] as String),
      applicationMethod: json['application_method'] == null
          ? null
          : AdminApplicationMethod.fromJson(
              json['application_method'] as Map<String, dynamic>,
            ),
      rules: (json['rules'] as List<dynamic>?)
          ?.map((e) => AdminPromotionRule.fromJson(e as Map<String, dynamic>))
          .toList(),
      code: json['code'] as String?,
      type: json['type'] == null
          ? null
          : AdminPromotionType.fromJson(json['type'] as String),
      isAutomatic: json['is_automatic'] as bool?,
      campaignId: json['campaign_id'] as String?,
      campaign: json['campaign'] == null
          ? null
          : AdminCampaign.fromJson(json['campaign'] as Map<String, dynamic>),
      status: json['status'] == null
          ? null
          : AdminPromotionStatus.fromJson(json['status'] as String),
      isTaxInclusive: json['is_tax_inclusive'] as bool?,
      limit: json['limit'] as num?,
      used: json['used'] as num?,
    );

Map<String, dynamic> _$AdminPromotionToJson(AdminPromotion instance) =>
    <String, dynamic>{
      'application_method': instance.applicationMethod,
      'rules': instance.rules,
      'id': instance.id,
      'code': instance.code,
      'type': _$AdminPromotionTypeEnumMap[instance.type],
      'is_automatic': instance.isAutomatic,
      'campaign_id': instance.campaignId,
      'campaign': instance.campaign,
      'created_at': instance.createdAt.toIso8601String(),
      'updated_at': instance.updatedAt.toIso8601String(),
      'deleted_at': instance.deletedAt.toIso8601String(),
      'status': _$AdminPromotionStatusEnumMap[instance.status],
      'is_tax_inclusive': instance.isTaxInclusive,
      'limit': instance.limit,
      'used': instance.used,
    };

const _$AdminPromotionTypeEnumMap = {
  AdminPromotionType.standard: 'standard',
  AdminPromotionType.buyget: 'buyget',
  AdminPromotionType.$unknown: r'$unknown',
};

const _$AdminPromotionStatusEnumMap = {
  AdminPromotionStatus.draft: 'draft',
  AdminPromotionStatus.active: 'active',
  AdminPromotionStatus.inactive: 'inactive',
  AdminPromotionStatus.$unknown: r'$unknown',
};
