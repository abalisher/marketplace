// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'products_client.dart';

// dart format off

// **************************************************************************
// RetrofitGenerator
// **************************************************************************

// ignore_for_file: unnecessary_brace_in_string_interps,no_leading_underscores_for_local_identifiers,unused_element,unnecessary_string_interpolations,unused_element_parameter,avoid_unused_constructor_parameters,unreachable_from_main,avoid_redundant_argument_values

class _ProductsClient implements ProductsClient {
  _ProductsClient(this._dio, {this.baseUrl, this.errorLogger});

  final Dio _dio;

  String? baseUrl;

  final ParseErrorLogger? errorLogger;

  @override
  Future<StoreProductListResponse> getProducts({
    required String xPublishableApiKey,
    String? xMedusaLocale,
    String? fields,
    num? offset,
    num? limit,
    String? order,
    List<dynamic>? and,
    List<dynamic>? or,
    String? q,
    dynamic id,
    dynamic title,
    dynamic handle,
    bool? isGiftcard,
    dynamic collectionId,
    dynamic tagId,
    dynamic typeId,
    dynamic createdAt,
    dynamic updatedAt,
    String? regionId,
    String? province,
    dynamic salesChannelId,
    dynamic categoryId,
    dynamic variants,
    String? countryCode,
    String? cartId,
    String? locale,
    dynamic externalId,
    dynamic optionValueId,
    dynamic optionId,
  }) async {
    final _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{
      r'fields': fields,
      r'offset': offset,
      r'limit': limit,
      r'order': order,
      r'$and': and,
      r'$or': or,
      r'q': q,
      r'id': id.toJson(),
      r'title': title.toJson(),
      r'handle': handle.toJson(),
      r'is_giftcard': isGiftcard,
      r'collection_id': collectionId.toJson(),
      r'tag_id': tagId.toJson(),
      r'type_id': typeId.toJson(),
      r'created_at': createdAt.toJson(),
      r'updated_at': updatedAt.toJson(),
      r'region_id': regionId,
      r'province': province,
      r'sales_channel_id': salesChannelId.toJson(),
      r'category_id': categoryId.toJson(),
      r'variants': variants.toJson(),
      r'country_code': countryCode,
      r'cart_id': cartId,
      r'locale': locale,
      r'external_id': externalId.toJson(),
      r'option_value_id': optionValueId.toJson(),
      r'option_id': optionId.toJson(),
    };
    queryParameters.removeWhere((k, v) => v == null);
    final _headers = <String, dynamic>{
      r'x-publishable-api-key': xPublishableApiKey,
      r'x-medusa-locale': xMedusaLocale,
    };
    _headers.removeWhere((k, v) => v == null);
    const Map<String, dynamic>? _data = null;
    final _options = _setStreamType<StoreProductListResponse>(
      Options(method: 'GET', headers: _headers, extra: _extra)
          .compose(
            _dio.options,
            '/store/products',
            queryParameters: queryParameters,
            data: _data,
          )
          .copyWith(baseUrl: _combineBaseUrls(_dio.options.baseUrl, baseUrl)),
    );
    final _result = await _dio.fetch<Map<String, Object?>>(_options);
    late StoreProductListResponse _value;
    try {
      _value = StoreProductListResponse.fromJson(_result.data!);
    } on Object catch (e, s) {
      errorLogger?.logError(e, s, _options, response: _result);
      rethrow;
    }
    return _value;
  }

  @override
  Future<StoreProductResponse> getProductsId({
    required String id,
    required String xPublishableApiKey,
    String? xMedusaLocale,
    String? fields,
    String? regionId,
    String? countryCode,
    String? province,
    String? cartId,
    String? locale,
  }) async {
    final _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{
      r'fields': fields,
      r'region_id': regionId,
      r'country_code': countryCode,
      r'province': province,
      r'cart_id': cartId,
      r'locale': locale,
    };
    queryParameters.removeWhere((k, v) => v == null);
    final _headers = <String, dynamic>{
      r'x-publishable-api-key': xPublishableApiKey,
      r'x-medusa-locale': xMedusaLocale,
    };
    _headers.removeWhere((k, v) => v == null);
    const Map<String, dynamic>? _data = null;
    final _options = _setStreamType<StoreProductResponse>(
      Options(method: 'GET', headers: _headers, extra: _extra)
          .compose(
            _dio.options,
            '/store/products/${id}',
            queryParameters: queryParameters,
            data: _data,
          )
          .copyWith(baseUrl: _combineBaseUrls(_dio.options.baseUrl, baseUrl)),
    );
    final _result = await _dio.fetch<Map<String, Object?>>(_options);
    late StoreProductResponse _value;
    try {
      _value = StoreProductResponse.fromJson(_result.data!);
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
