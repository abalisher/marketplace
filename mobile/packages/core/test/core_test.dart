import 'package:api_client/api_client.dart' show MedusaStoreApi;
import 'package:core/config/app_config.dart';
import 'package:core/config/app_config_provider.dart';
import 'package:core/network/dio_provider.dart';
import 'package:core/network/medusa_api_provider.dart';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('dioProvider применяет baseUrl и публикуемый ключ из конфига', () {
    final container = ProviderContainer(
      overrides: [
        appConfigProvider.overrideWithValue(
          const AppConfig(
            baseUrl: 'https://api.example.test',
            publishableKey: 'pk_test_123',
          ),
        ),
      ],
    );
    addTearDown(container.dispose);

    final dio = container.read(dioProvider);

    expect(dio.options.baseUrl, 'https://api.example.test');
    expect(dio.options.headers['x-publishable-api-key'], 'pk_test_123');
  });

  test('пустой публикуемый ключ не добавляет заголовок', () {
    final container = ProviderContainer(
      overrides: [
        appConfigProvider.overrideWithValue(
          const AppConfig(baseUrl: 'http://localhost:9000', publishableKey: ''),
        ),
      ],
    );
    addTearDown(container.dispose);

    final dio = container.read(dioProvider);

    expect(dio.options.headers.containsKey('x-publishable-api-key'), isFalse);
  });

  test('medusaApiProvider отдаёт клиент поверх настроенного Dio', () {
    final container = ProviderContainer(
      overrides: [
        appConfigProvider.overrideWithValue(
          const AppConfig(baseUrl: 'http://localhost:9000', publishableKey: ''),
        ),
      ],
    );
    addTearDown(container.dispose);

    final api = container.read(medusaApiProvider);

    expect(api, isA<MedusaStoreApi>());
    expect(container.read(dioProvider), isA<Dio>());
  });
}
