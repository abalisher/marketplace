import 'messages.dart';

/// Казахская локаль.
class MessagesKk implements Messages {
  const MessagesKk();

  @override
  String get appTitle => 'СтройМаркет · Жинау';

  @override
  String get retry => 'Қайталау';

  @override
  String get cancel => 'Болдырмау';

  @override
  String get save => 'Сақтау';

  @override
  String get signOut => 'Шығу';

  @override
  String get signInTitle => 'Қызметкер кірісі';

  @override
  String get signInSubtitle =>
      'Қойманың жұмыс тіркелгісі. Тапсырмалар сіздің санатыңыз бойынша келеді.';

  @override
  String get emailLabel => 'Email';

  @override
  String get passwordLabel => 'Құпия сөз';

  @override
  String get signInButton => 'Кіру';

  @override
  String get emailRequired => 'Email енгізіңіз';

  @override
  String get emailInvalid => 'Бұл email-ге ұқсамайды';

  @override
  String get passwordRequired => 'Құпия сөзді енгізіңіз';

  @override
  String get errorInvalidCredentials => 'Email немесе құпия сөз дұрыс емес';

  @override
  String get errorNetwork => 'Сервермен байланыс жоқ. Желіні тексеріңіз';

  @override
  String get errorUnknown => 'Бірдеңе дұрыс болмады, қайта көріңіз';

  @override
  String get tasksTitle => 'Менің тапсырмаларым';

  @override
  String get filterActive => 'Істе';

  @override
  String get statusPending => 'Күтуде';

  @override
  String get statusPicking => 'Жинаудамын';

  @override
  String get statusAssembled => 'Жиналды';

  @override
  String get statusShortage => 'Жетіспеушілік';

  @override
  String get tasksEmpty => 'Тапсырма жоқ';

  @override
  String get tasksLoadError => 'Тапсырмаларды жүктеу мүмкін болмады';

  @override
  String get groupMissing =>
      'Тіркелгіге санат берілмеген — тапсырма болмайды. Басқарушыға айтыңыз.';

  @override
  String orderNumber(int? displayId) =>
      displayId == null ? 'Тапсырыс' : 'Тапсырыс №$displayId';

  @override
  String itemsProgress(int marked, int total) => 'Белгіленді: $marked / $total';

  @override
  String shortageCount(int count) => 'Жетіспейді: $count';

  @override
  String get taskTitle => 'Тапсырма';

  @override
  String get taskLoadError => 'Тапсырманы жүктеу мүмкін болмады';

  @override
  String get startTask => 'Жұмысқа алу';

  @override
  String get resumeTask => 'Жинауға оралу';

  @override
  String get completeTask => 'Жиналды';

  @override
  String get completeBlockedHint => 'Әр позицияны белгілеңіз';

  @override
  String get markBlockedHint => 'Алдымен тапсырманы жұмысқа алыңыз';

  @override
  String requiredQuantity(int quantity) => 'Керек: $quantity';

  @override
  String sku(String value) => 'Артикул $value';

  @override
  String get markPicked => 'Алдым';

  @override
  String get markPartial => 'Ішінара';

  @override
  String get markMissing => 'Жоқ';

  @override
  String get itemPicked => 'Толық жиналды';

  @override
  String itemPartial(int picked, int quantity) =>
      'Жиналды: $picked / $quantity';

  @override
  String get itemMissing => 'Қоймада жоқ';

  @override
  String get itemPending => 'Белгіленбеген';

  @override
  String get partialTitle => 'Қанша жинадыңыз?';

  @override
  String get quantityLabel => 'Саны';

  @override
  String partialRange(int max) => '1-ден $max-ге дейін';

  @override
  String get taskDoneAssembled => 'Тапсырма жиналды';

  @override
  String get taskDoneShortage => 'Тапсырма жетіспеушілікпен жабылды';

  @override
  String get orderFinished => 'Тапсырыс бойынша барлық санат аяқталды';

  @override
  String orderRemaining(int remaining) =>
      'Тапсырыс бойынша қалған санат: $remaining';

  @override
  String get markQueuedOffline => 'Желі жоқ — белгі сақталды, өзі жіберіледі';

  @override
  String pendingMarks(int count) => 'Желіні күтіп тұрған белгі: $count';

  @override
  String get sendPending => 'Жіберу';

  @override
  String get completeOfflineBlocked =>
      'Желісіз тапсырманы жабу мүмкін емес — алдымен белгілерді жіберіңіз';

  @override
  String get actionFailed => 'Орындалмады, қайта көріңіз';
}
