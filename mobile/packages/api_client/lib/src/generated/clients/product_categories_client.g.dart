// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'product_categories_client.dart';

// dart format off

// **************************************************************************
// RetrofitGenerator
// **************************************************************************

// ignore_for_file: unnecessary_brace_in_string_interps,no_leading_underscores_for_local_identifiers,unused_element,unnecessary_string_interpolations,unused_element_parameter,avoid_unused_constructor_parameters,unreachable_from_main,avoid_redundant_argument_values

class _ProductCategoriesClient implements ProductCategoriesClient {
  _ProductCategoriesClient(this._dio, {this.baseUrl, this.errorLogger});

  final Dio _dio;

  String? baseUrl;

  final ParseErrorLogger? errorLogger;

  @override
  Future<StoreProductCategoryListResponse> getProductCategories({
    required String xPublishableApiKey,
    String? xMedusaLocale,
    String? fields,
    num? offset,
    num? limit,
    String? order,
    String? q,
    dynamic id,
    dynamic description,
    dynamic handle,
    dynamic parentCategoryId,
    bool? includeAncestorsTree,
    bool? includeDescendantsTree,
    dynamic createdAt,
    dynamic updatedAt,
    List<dynamic>? and,
    List<dynamic>? or,
    dynamic name,
    bool? withDeleted,
    String? locale,
    dynamic externalId,
  }) async {
    final _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{
      r'fields': fields,
      r'offset': offset,
      r'limit': limit,
      r'order': order,
      r'q': q,
      r'id': id.toJson(),
      r'description': description.toJson(),
      r'handle': handle.toJson(),
      r'parent_category_id': parentCategoryId.toJson(),
      r'include_ancestors_tree': includeAncestorsTree,
      r'include_descendants_tree': includeDescendantsTree,
      r'created_at': createdAt.toJson(),
      r'updated_at': updatedAt.toJson(),
      r'$and': and,
      r'$or': or,
      r'name': name.toJson(),
      r'with_deleted': withDeleted,
      r'locale': locale,
      r'external_id': externalId.toJson(),
    };
    queryParameters.removeWhere((k, v) => v == null);
    final _headers = <String, dynamic>{
      r'x-publishable-api-key': xPublishableApiKey,
      r'x-medusa-locale': xMedusaLocale,
    };
    _headers.removeWhere((k, v) => v == null);
    const Map<String, dynamic>? _data = null;
    final _options = _setStreamType<StoreProductCategoryListResponse>(
      Options(method: 'GET', headers: _headers, extra: _extra)
          .compose(
            _dio.options,
            '/store/product-categories',
            queryParameters: queryParameters,
            data: _data,
          )
          .copyWith(baseUrl: _combineBaseUrls(_dio.options.baseUrl, baseUrl)),
    );
    final _result = await _dio.fetch<Map<String, Object?>>(_options);
    late StoreProductCategoryListResponse _value;
    try {
      _value = StoreProductCategoryListResponse.fromJson(_result.data!);
    } on Object catch (e, s) {
      errorLogger?.logError(e, s, _options, response: _result);
      rethrow;
    }
    return _value;
  }

  @override
  Future<StoreProductCategoryResponse> getProductCategoriesId({
    required String id,
    required String xPublishableApiKey,
    String? xMedusaLocale,
    String? fields,
    bool? includeAncestorsTree,
    bool? includeDescendantsTree,
    String? locale,
  }) async {
    final _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{
      r'fields': fields,
      r'include_ancestors_tree': includeAncestorsTree,
      r'include_descendants_tree': includeDescendantsTree,
      r'locale': locale,
    };
    queryParameters.removeWhere((k, v) => v == null);
    final _headers = <String, dynamic>{
      r'x-publishable-api-key': xPublishableApiKey,
      r'x-medusa-locale': xMedusaLocale,
    };
    _headers.removeWhere((k, v) => v == null);
    const Map<String, dynamic>? _data = null;
    final _options = _setStreamType<StoreProductCategoryResponse>(
      Options(method: 'GET', headers: _headers, extra: _extra)
          .compose(
            _dio.options,
            '/store/product-categories/${id}',
            queryParameters: queryParameters,
            data: _data,
          )
          .copyWith(baseUrl: _combineBaseUrls(_dio.options.baseUrl, baseUrl)),
    );
    final _result = await _dio.fetch<Map<String, Object?>>(_options);
    late StoreProductCategoryResponse _value;
    try {
      _value = StoreProductCategoryResponse.fromJson(_result.data!);
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
