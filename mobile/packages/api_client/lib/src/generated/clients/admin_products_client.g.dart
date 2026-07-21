// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_products_client.dart';

// dart format off

// **************************************************************************
// RetrofitGenerator
// **************************************************************************

// ignore_for_file: unnecessary_brace_in_string_interps,no_leading_underscores_for_local_identifiers,unused_element,unnecessary_string_interpolations,unused_element_parameter,avoid_unused_constructor_parameters,unreachable_from_main,avoid_redundant_argument_values

class _AdminProductsClient implements AdminProductsClient {
  _AdminProductsClient(this._dio, {this.baseUrl, this.errorLogger});

  final Dio _dio;

  String? baseUrl;

  final ParseErrorLogger? errorLogger;

  @override
  Future<GetAdminProductsResponse> adminGetProducts({
    String? fields,
    num? offset,
    num? limit,
    String? order,
    dynamic priceListId,
    String? q,
    dynamic status,
    dynamic salesChannelId,
    dynamic title,
    dynamic handle,
    dynamic id,
    bool? isGiftcard,
    dynamic typeId,
    dynamic categoryId,
    dynamic createdAt,
    dynamic updatedAt,
    dynamic deletedAt,
    List<dynamic>? and,
    List<dynamic>? or,
    dynamic collectionId,
    dynamic variants,
    bool? withDeleted,
    dynamic externalId,
    dynamic tagId,
    dynamic optionId,
    dynamic optionValueId,
  }) async {
    final _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{
      r'fields': fields,
      r'offset': offset,
      r'limit': limit,
      r'order': order,
      r'price_list_id': priceListId.toJson(),
      r'q': q,
      r'status': status.toJson(),
      r'sales_channel_id': salesChannelId.toJson(),
      r'title': title.toJson(),
      r'handle': handle.toJson(),
      r'id': id.toJson(),
      r'is_giftcard': isGiftcard,
      r'type_id': typeId.toJson(),
      r'category_id': categoryId.toJson(),
      r'created_at': createdAt.toJson(),
      r'updated_at': updatedAt.toJson(),
      r'deleted_at': deletedAt.toJson(),
      r'$and': and,
      r'$or': or,
      r'collection_id': collectionId.toJson(),
      r'variants': variants.toJson(),
      r'with_deleted': withDeleted,
      r'external_id': externalId.toJson(),
      r'tag_id': tagId.toJson(),
      r'option_id': optionId.toJson(),
      r'option_value_id': optionValueId.toJson(),
    };
    queryParameters.removeWhere((k, v) => v == null);
    final _headers = <String, dynamic>{};
    const Map<String, dynamic>? _data = null;
    final _options = _setStreamType<GetAdminProductsResponse>(
      Options(method: 'GET', headers: _headers, extra: _extra)
          .compose(
            _dio.options,
            '/admin/products',
            queryParameters: queryParameters,
            data: _data,
          )
          .copyWith(baseUrl: _combineBaseUrls(_dio.options.baseUrl, baseUrl)),
    );
    final _result = await _dio.fetch<Map<String, Object?>>(_options);
    late GetAdminProductsResponse _value;
    try {
      _value = GetAdminProductsResponse.fromJson(_result.data!);
    } on Object catch (e, s) {
      errorLogger?.logError(e, s, _options, response: _result);
      rethrow;
    }
    return _value;
  }

  @override
  Future<AdminProductResponse> adminGetProductsId({
    required String id,
    String? fields,
  }) async {
    final _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{r'fields': fields};
    queryParameters.removeWhere((k, v) => v == null);
    final _headers = <String, dynamic>{};
    const Map<String, dynamic>? _data = null;
    final _options = _setStreamType<AdminProductResponse>(
      Options(method: 'GET', headers: _headers, extra: _extra)
          .compose(
            _dio.options,
            '/admin/products/${id}',
            queryParameters: queryParameters,
            data: _data,
          )
          .copyWith(baseUrl: _combineBaseUrls(_dio.options.baseUrl, baseUrl)),
    );
    final _result = await _dio.fetch<Map<String, Object?>>(_options);
    late AdminProductResponse _value;
    try {
      _value = AdminProductResponse.fromJson(_result.data!);
    } on Object catch (e, s) {
      errorLogger?.logError(e, s, _options, response: _result);
      rethrow;
    }
    return _value;
  }

  RequestOptions _setStreamType<T>(RequestOptions requestOptions) {
    if (T != dynamic &&
        !(requestOptions.responseType == ResponseType.bytes ||
            requestOptions.responseType == ResponseType.stream)) {
      if (T == String) {
        requestOptions.responseType = ResponseType.plain;
      } else {
        requestOptions.responseType = ResponseType.json;
      }
    }
    return requestOptions;
  }

  String _combineBaseUrls(String dioBaseUrl, String? baseUrl) {
    if (baseUrl == null || baseUrl.trim().isEmpty) {
      return dioBaseUrl;
    }

    final url = Uri.parse(baseUrl);

    if (url.isAbsolute) {
      return url.toString();
    }

    return Uri.parse(dioBaseUrl).resolveUri(url).toString();
  }
}

// dart format on
