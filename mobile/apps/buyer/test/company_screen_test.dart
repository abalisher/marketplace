import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_kit/app_error_view.dart';
import 'package:ui_kit/app_theme.dart';

import 'package:marketplace_buyer/features/company/data/company_file_picker.dart';
import 'package:marketplace_buyer/features/company/data/company_repository.dart';
import 'package:marketplace_buyer/features/company/domain/company.dart';
import 'package:marketplace_buyer/features/company/domain/company_application_file.dart';
import 'package:marketplace_buyer/features/company/domain/company_document.dart';
import 'package:marketplace_buyer/features/company/domain/company_exception.dart';
import 'package:marketplace_buyer/features/company/domain/company_membership.dart';
import 'package:marketplace_buyer/features/company/domain/company_status.dart';
import 'package:marketplace_buyer/features/company/providers/company_file_picker_provider.dart';
import 'package:marketplace_buyer/features/company/providers/company_repository_provider.dart';
import 'package:marketplace_buyer/features/company/screens/company_screen.dart';

/// Фейк раздела «Компания»: отдаёт заданное членство (или его отсутствие),
/// запоминает отправленную заявку и правку, умеет отказывать заданной причиной.
class _FakeCompanyRepository implements CompanyRepository {
  _FakeCompanyRepository({
    this.membership,
    this.loadFails = false,
    this.registerError,
    this.updateError,
  });

  CompanyMembership? membership;
  final bool loadFails;
  final Object? registerError;
  final Object? updateError;

  String? sentName;
  String? sentBin;
  List<CompanyApplicationFile> sentFiles = const [];
  int registerCalls = 0;

  String? updatedName;
  String? updatedBin;
  List<CompanyApplicationFile> updatedFiles = const [];
  int updateCalls = 0;

  @override
  Future<CompanyMembership?> fetchMyCompany() async {
    if (loadFails) throw Exception('boom');
    return membership;
  }

  @override
  Future<CompanyMembership> registerCompany({
    required String name,
    required String bin,
    required List<CompanyApplicationFile> files,
  }) async {
    registerCalls++;
    if (registerError != null) throw registerError!;
    sentName = name;
    sentBin = bin;
    sentFiles = files;
    final created = CompanyMembership(
      company: Company(name: name, bin: bin, status: CompanyStatus.pending),
      role: 'admin',
    );
    membership = created;
    return created;
  }

  @override
  Future<Company> updateApplication({
    String? name,
    String? bin,
    required List<CompanyApplicationFile> files,
  }) async {
    updateCalls++;
    if (updateError != null) throw updateError!;
    updatedName = name;
    updatedBin = bin;
    updatedFiles = files;
    final current = membership!.company;
    // Бэкенд возвращает отклонённую заявку в очередь модерации и ставит
    // отметку повторной подачи; догруженные файлы становятся документами.
    final resubmitted = current.status == CompanyStatus.rejected;
    final updated = Company(
      name: name ?? current.name,
      bin: bin ?? current.bin,
      status: CompanyStatus.pending,
      rejectionReason: current.rejectionReason,
      documents: [
        ...current.documents,
        for (final file in files)
          CompanyDocument(name: file.name, url: 'https://cdn/${file.name}'),
      ],
      createdAt: current.createdAt,
      resubmittedAt: resubmitted
          ? DateTime(2026, 8, 17)
          : current.resubmittedAt,
    );
    membership = CompanyMembership(company: updated, role: membership!.role);
    return updated;
  }
}

/// Фейк выбора файлов: отдаёт заранее заданный набор без системного диалога.
class _FakeFilePicker implements CompanyFilePicker {
  _FakeFilePicker(this.files);

  final List<CompanyApplicationFile> files;

  @override
  Future<List<CompanyApplicationFile>> pickFiles() async => files;
}

CompanyApplicationFile _file({
  String name = 'ustav.pdf',
  String mimeType = 'application/pdf',
  int size = 1024,
}) {
  return CompanyApplicationFile(
    name: name,
    mimeType: mimeType,
    bytes: Uint8List(size),
  );
}

/// Карточка статуса вместе с формой правки не влезает в 800×600 тестового
/// вьюпорта: прогоны, которые нажимают кнопки формы, поднимают высоту, иначе
/// тап уходит за пределы дерева рендера.
Future<void> _tallSurface(WidgetTester tester) async {
  await tester.binding.setSurfaceSize(const Size(800, 1600));
  addTearDown(() => tester.binding.setSurfaceSize(null));
}

Widget _harness(CompanyRepository repository, {CompanyFilePicker? picker}) {
  return ProviderScope(
    overrides: [
      companyRepositoryProvider.overrideWithValue(repository),
      if (picker != null) companyFilePickerProvider.overrideWithValue(picker),
    ],
    child: MaterialApp(theme: buildAppTheme(), home: const CompanyScreen()),
  );
}

void main() {
  testWidgets('без заявки показывается форма юрлица', (tester) async {
    await tester.pumpWidget(_harness(_FakeCompanyRepository()));
    await tester.pumpAndSettle();

    expect(find.text('Заявка юридического лица'), findsOneWidget);
    expect(find.text('Название организации'), findsOneWidget);
    expect(find.text('БИН'), findsOneWidget);
    expect(find.text('12 цифр'), findsOneWidget);
  });

  testWidgets('БИН не из 12 цифр — заявка не уходит', (tester) async {
    final repository = _FakeCompanyRepository();
    await tester.pumpWidget(_harness(repository));
    await tester.pumpAndSettle();

    await tester.enterText(find.byType(TextFormField).first, 'ТОО Астана');
    await tester.enterText(find.byType(TextFormField).last, '12345');
    await tester.tap(find.text('Подать заявку'));
    await tester.pumpAndSettle();

    expect(find.text('БИН состоит из 12 цифр'), findsOneWidget);
    expect(repository.registerCalls, 0);
  });

  testWidgets('заявка с файлом уходит и сменяется карточкой статуса', (
    tester,
  ) async {
    final repository = _FakeCompanyRepository();
    await tester.pumpWidget(
      _harness(repository, picker: _FakeFilePicker([_file()])),
    );
    await tester.pumpAndSettle();

    await tester.enterText(find.byType(TextFormField).first, 'ТОО Астана');
    await tester.enterText(find.byType(TextFormField).last, '123456789012');
    await tester.tap(find.text('Выбрать файлы'));
    await tester.pumpAndSettle();
    expect(find.text('ustav.pdf'), findsOneWidget);

    await tester.tap(find.text('Подать заявку'));
    await tester.pumpAndSettle();

    expect(repository.sentName, 'ТОО Астана');
    expect(repository.sentBin, '123456789012');
    expect(repository.sentFiles.length, 1);
    // Провайдер компании инвалидирован — на экране карточка «На проверке».
    expect(find.text('ТОО Астана'), findsOneWidget);
    expect(find.text('На проверке'), findsOneWidget);
  });

  testWidgets('отказ бэкенда показывает причину и сохраняет ввод', (
    tester,
  ) async {
    final repository = _FakeCompanyRepository(
      registerError: const CompanyException(CompanyErrorKind.rejected),
    );
    await tester.pumpWidget(_harness(repository));
    await tester.pumpAndSettle();

    await tester.enterText(find.byType(TextFormField).first, 'ТОО Астана');
    await tester.enterText(find.byType(TextFormField).last, '123456789012');
    await tester.tap(find.text('Подать заявку'));
    await tester.pumpAndSettle();

    expect(find.textContaining('Заявку не приняли'), findsOneWidget);
    expect(find.text('ТОО Астана'), findsOneWidget);
    expect(find.text('123456789012'), findsOneWidget);
  });

  testWidgets('файл больше 3 МБ не принимается', (tester) async {
    final picker = _FakeFilePicker([
      _file(name: 'big.pdf', size: CompanyApplicationFile.maxSizeBytes + 1),
    ]);
    await tester.pumpWidget(_harness(_FakeCompanyRepository(), picker: picker));
    await tester.pumpAndSettle();

    await tester.tap(find.text('Выбрать файлы'));
    await tester.pumpAndSettle();

    expect(find.textContaining('больше 3 МБ'), findsOneWidget);
    expect(find.text('big.pdf'), findsNothing);
  });

  testWidgets('лишние файлы сверх четырёх отсекаются', (tester) async {
    final picker = _FakeFilePicker([
      for (var i = 0; i < 5; i++) _file(name: 'doc$i.pdf'),
    ]);
    await tester.pumpWidget(_harness(_FakeCompanyRepository(), picker: picker));
    await tester.pumpAndSettle();

    await tester.tap(find.text('Выбрать файлы'));
    await tester.pumpAndSettle();

    expect(find.text('doc3.pdf'), findsOneWidget);
    expect(find.text('doc4.pdf'), findsNothing);
    // Четыре строки файлов уводят сообщение об отказе за нижний край вьюпорта.
    await tester.drag(find.byType(ListView), const Offset(0, -300));
    await tester.pumpAndSettle();
    expect(find.textContaining('не больше 4 файлов'), findsOneWidget);
  });

  testWidgets('чужой тип файла не принимается', (tester) async {
    final picker = _FakeFilePicker([_file(name: 'смета.xlsx', mimeType: '')]);
    await tester.pumpWidget(_harness(_FakeCompanyRepository(), picker: picker));
    await tester.pumpAndSettle();

    await tester.tap(find.text('Выбрать файлы'));
    await tester.pumpAndSettle();

    expect(find.textContaining('только файлы PDF, JPG и PNG'), findsOneWidget);
    expect(find.text('смета.xlsx'), findsNothing);
  });

  testWidgets('отклонённая заявка показывает причину модератора', (
    tester,
  ) async {
    final repository = _FakeCompanyRepository(
      membership: CompanyMembership(
        company: Company(
          name: 'ТОО Астана',
          bin: '123456789012',
          status: CompanyStatus.rejected,
          rejectionReason: 'Приложите справку о регистрации',
          documents: const [
            CompanyDocument(name: 'ustav.pdf', url: 'https://cdn/ustav.pdf'),
          ],
          createdAt: DateTime(2026, 8, 14),
        ),
        role: 'admin',
      ),
    );
    await tester.pumpWidget(_harness(repository));
    await tester.pumpAndSettle();

    expect(find.text('Отклонена'), findsOneWidget);
    expect(find.text('Причина отказа'), findsOneWidget);
    expect(find.text('Приложите справку о регистрации'), findsOneWidget);
    expect(find.text('14.08.2026'), findsOneWidget);
    expect(find.text('Администратор компании'), findsOneWidget);
    expect(find.text('ustav.pdf'), findsOneWidget);
    // Отказ администратор чинит формой ниже — в чат его больше не отправляют.
    expect(find.text('Написать ассистенту'), findsNothing);
    expect(find.text('Исправить и подать снова'), findsOneWidget);
  });

  testWidgets('отклонённая заявка правится и подаётся снова', (tester) async {
    final repository = _FakeCompanyRepository(
      membership: CompanyMembership(
        company: Company(
          name: 'ТОО Астана',
          bin: '123456789012',
          status: CompanyStatus.rejected,
          rejectionReason: 'Приложите справку о регистрации',
          createdAt: DateTime(2026, 8, 14),
        ),
        role: 'admin',
      ),
    );
    await _tallSurface(tester);
    await tester.pumpWidget(
      _harness(repository, picker: _FakeFilePicker([_file()])),
    );
    await tester.pumpAndSettle();

    // Реквизиты подставлены — покупатель правит только то, что просили.
    expect(find.text('ТОО Астана'), findsWidgets);
    await tester.enterText(
      find.widgetWithText(TextFormField, 'ТОО Астана'),
      'ТОО Астана Строй',
    );
    await tester.ensureVisible(find.text('Выбрать файлы'));
    await tester.tap(find.text('Выбрать файлы'));
    await tester.pumpAndSettle();
    await tester.ensureVisible(find.text('Подать снова'));
    await tester.tap(find.text('Подать снова'));
    await tester.pumpAndSettle();

    expect(repository.updatedName, 'ТОО Астана Строй');
    // БИН не меняли — его в правке нет вовсе.
    expect(repository.updatedBin, isNull);
    expect(repository.updatedFiles.length, 1);
    // Заявка вернулась в очередь модерации с отметкой повторной подачи.
    expect(find.text('На проверке'), findsOneWidget);
    expect(find.text('Подана повторно'), findsOneWidget);
    expect(find.text('17.08.2026'), findsOneWidget);
  });

  testWidgets('к заявке на модерации догружаются документы', (tester) async {
    final repository = _FakeCompanyRepository(
      membership: CompanyMembership(
        company: Company(
          name: 'ТОО Астана',
          bin: '123456789012',
          status: CompanyStatus.pending,
          documents: const [
            CompanyDocument(name: 'ustav.pdf', url: 'https://cdn/ustav.pdf'),
          ],
        ),
        role: 'admin',
      ),
    );
    await _tallSurface(tester);
    await tester.pumpWidget(
      _harness(
        repository,
        picker: _FakeFilePicker([_file(name: 'spravka.pdf')]),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Догрузить документы'), findsOneWidget);
    // Реквизиты у заявки на модерации не правятся — полей нет вовсе.
    expect(find.byType(TextFormField), findsNothing);
    // Счётчик свободных мест учитывает уже загруженный документ.
    expect(find.text('Можно приложить ещё 3 файла'), findsOneWidget);

    await tester.ensureVisible(find.text('Выбрать файлы'));
    await tester.tap(find.text('Выбрать файлы'));
    await tester.pumpAndSettle();
    expect(find.text('Можно приложить ещё 2 файла'), findsOneWidget);
    await tester.ensureVisible(find.text('Отправить документы'));
    await tester.tap(find.text('Отправить документы'));
    await tester.pumpAndSettle();

    expect(repository.updatedName, isNull);
    expect(repository.updatedBin, isNull);
    expect(repository.updatedFiles.single.name, 'spravka.pdf');
    // Статус проверки от догрузки не меняется.
    expect(find.text('На проверке'), findsOneWidget);
    expect(find.text('Подана повторно'), findsNothing);
  });

  testWidgets('пустая правка на бэкенд не уходит', (tester) async {
    final repository = _FakeCompanyRepository(
      membership: CompanyMembership(
        company: Company(
          name: 'ТОО Астана',
          bin: '123456789012',
          status: CompanyStatus.pending,
        ),
        role: 'admin',
      ),
    );
    await tester.pumpWidget(_harness(repository));
    await tester.pumpAndSettle();

    await tester.tap(find.text('Отправить документы'));
    await tester.pumpAndSettle();

    expect(repository.updateCalls, 0);
    expect(find.textContaining('Менять нечего'), findsOneWidget);
  });

  testWidgets('отказ бэкенда по правке показывает причину', (tester) async {
    final repository = _FakeCompanyRepository(
      membership: CompanyMembership(
        company: Company(
          name: 'ТОО Астана',
          bin: '123456789012',
          status: CompanyStatus.pending,
        ),
        role: 'admin',
      ),
      updateError: const CompanyException(CompanyErrorKind.rejected),
    );
    await _tallSurface(tester);
    await tester.pumpWidget(
      _harness(repository, picker: _FakeFilePicker([_file()])),
    );
    await tester.pumpAndSettle();

    await tester.ensureVisible(find.text('Выбрать файлы'));
    await tester.tap(find.text('Выбрать файлы'));
    await tester.pumpAndSettle();
    await tester.ensureVisible(find.text('Отправить документы'));
    await tester.tap(find.text('Отправить документы'));
    await tester.pumpAndSettle();

    expect(repository.updateCalls, 1);
    expect(find.textContaining('Правку не приняли'), findsOneWidget);
    // Выбранный файл остаётся — выбирать заново не надо.
    expect(find.text('ustav.pdf'), findsOneWidget);
  });

  testWidgets('при исчерпанном лимите выбор файла заменён объяснением', (
    tester,
  ) async {
    final repository = _FakeCompanyRepository(
      membership: CompanyMembership(
        company: Company(
          name: 'ТОО Астана',
          bin: '123456789012',
          status: CompanyStatus.pending,
          documents: [
            for (var i = 0; i < 4; i++)
              CompanyDocument(name: 'doc$i.pdf', url: 'https://cdn/doc$i.pdf'),
          ],
        ),
        role: 'admin',
      ),
    );
    await tester.pumpWidget(_harness(repository));
    await tester.pumpAndSettle();

    await tester.drag(find.byType(ListView), const Offset(0, -400));
    await tester.pumpAndSettle();

    expect(find.text('Выбрать файлы'), findsNothing);
    expect(find.textContaining('Приложены все 4 документа'), findsOneWidget);
  });

  testWidgets('сотрудник без прав администратора заявку не правит', (
    tester,
  ) async {
    final repository = _FakeCompanyRepository(
      membership: CompanyMembership(
        company: Company(
          name: 'ТОО Астана',
          bin: '123456789012',
          status: CompanyStatus.rejected,
          rejectionReason: 'Приложите справку о регистрации',
        ),
        role: 'member',
      ),
    );
    await tester.pumpWidget(_harness(repository));
    await tester.pumpAndSettle();

    expect(find.text('Исправить и подать снова'), findsNothing);
    expect(find.textContaining('Заявку правит администратор'), findsOneWidget);
    expect(find.text('Написать ассистенту'), findsOneWidget);
  });

  testWidgets('одобренная компания ведёт оформлять заказ в чат', (
    tester,
  ) async {
    final repository = _FakeCompanyRepository(
      membership: CompanyMembership(
        company: Company(
          name: 'ТОО Астана',
          bin: '123456789012',
          status: CompanyStatus.approved,
        ),
        role: 'member',
      ),
    );
    await tester.pumpWidget(_harness(repository));
    await tester.pumpAndSettle();

    expect(find.text('Одобрена'), findsOneWidget);
    expect(find.text('Сотрудник'), findsOneWidget);
    expect(find.text('Документы не приложены'), findsOneWidget);
    expect(find.text('Оформить заказ в чате'), findsOneWidget);
    // Реквизиты одобренной компании неизменяемы, догрузка не предлагается.
    expect(find.text('Исправить и подать снова'), findsNothing);
    expect(find.text('Догрузить документы'), findsNothing);
  });

  testWidgets('ошибка загрузки показывает AppErrorView', (tester) async {
    await tester.pumpWidget(_harness(_FakeCompanyRepository(loadFails: true)));
    await tester.pumpAndSettle();

    expect(find.byType(AppErrorView), findsOneWidget);
    expect(find.text('Не удалось загрузить данные компании'), findsOneWidget);
  });
}
