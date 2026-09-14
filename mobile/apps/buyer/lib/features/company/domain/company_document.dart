/// Учредительный документ компании, уже загруженный на бэкенд: имя для
/// человека и ссылка на файл.
class CompanyDocument {
  const CompanyDocument({required this.name, required this.url});

  /// Имя файла, как его видит модератор («ustav.pdf»).
  final String name;

  /// Ссылка на файл (File Module отдаёт http(s)).
  final String url;
}
