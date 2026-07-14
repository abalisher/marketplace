// Смоук-тест конвейера кодогена: компилируется ли сгенерированный клиент
// и экспортируется ли он через входную точку пакета.
import 'package:api_client/api_client.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('generated API is exported from the package entry point', () {
    expect(MedusaStoreApi, isNotNull);
    expect(ProductsClient, isNotNull);
    expect(CartsClient, isNotNull);
  });
}
