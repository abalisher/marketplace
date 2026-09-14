import 'messages.dart';

/// Казахская локаль.
class MessagesKk implements Messages {
  const MessagesKk();

  @override
  String get catalogTitle => 'Каталог';

  @override
  String get priceUnavailable => 'Бағасы сұраныс бойынша';

  @override
  String get catalogLoadError => 'Каталогты жүктеу мүмкін болмады';

  @override
  String get retry => 'Қайталау';

  @override
  String get catalogEmpty => 'Тауарлар табылмады';

  @override
  String get productTitle => 'Тауар';

  @override
  String get productLoadError => 'Тауарды жүктеу мүмкін болмады';

  @override
  String get variantsTitle => 'Нұсқалар';

  @override
  String get descriptionTitle => 'Сипаттама';

  @override
  String get addToCart => 'Себетке';

  @override
  String get addedToCart => 'Себетке қосылды';

  @override
  String get cartTitle => 'Себет';

  @override
  String get cartEmpty => 'Себет бос';

  @override
  String get cartLoadError => 'Себетті жүктеу мүмкін болмады';

  @override
  String get cartUpdateError => 'Себетті жаңарту мүмкін болмады';

  @override
  String get cartTotal => 'Барлығы';

  @override
  String get checkout => 'Тапсырыс беру';

  @override
  String get account => 'Аккаунт';

  @override
  String get guestModeTitle => 'Сіз қонақ ретінде кірдіңіз';

  @override
  String get guestModeDescription =>
      'Қонақ материал таңдап, тапсырыс бере алады. Кіру тапсырыстар мен '
      'құжаттар барлық құрылғыда қолжетімді болу үшін қажет.';

  @override
  String get legalEntitySection => 'Заңды тұлғалар үшін';

  @override
  String get legalEntityVat => 'Компания БСН-іне ҚҚС-пен рәсімдеу';

  @override
  String get legalEntityDocuments =>
      'Төлем шоттары мен актілер — тапсырыстарда';

  @override
  String get legalEntityHistory => 'Компания тарихы барлық құрылғыда';

  @override
  String get registerTitle => 'Тіркелу';

  @override
  String get emailLabel => 'Email';

  @override
  String get passwordLabel => 'Құпия сөз';

  @override
  String get firstNameLabel => 'Аты';

  @override
  String get lastNameLabel => 'Тегі';

  @override
  String get phoneLabel => 'Телефон';

  @override
  String get signInButton => 'Кіру';

  @override
  String get registerButton => 'Тіркелу';

  @override
  String get noAccountPrompt => 'Аккаунт жоқ па? Тіркеліңіз';

  @override
  String get haveAccountPrompt => 'Аккаунт бар ма? Кіріңіз';

  @override
  String get signOut => 'Шығу';

  @override
  String get fieldRequired => 'Міндетті өріс';

  @override
  String get invalidEmail => 'Қате email';

  @override
  String get passwordTooShort => 'Кемінде 6 таңба';

  @override
  String get authInvalidCredentials => 'Email немесе құпия сөз қате';

  @override
  String get authEmailExists => 'Бұл email тіркелген';

  @override
  String get authNetworkError => 'Сервермен байланыс жоқ';

  @override
  String get authUnknownError => 'Орындалмады. Қайталап көріңіз';

  @override
  String get phoneLoginTitle => 'Нөмір арқылы кіру';

  @override
  String get phoneLoginSubtitle =>
      'Телефон нөміріңізді енгізіңіз — бір реттік кодты SMS-пен жібереміз';

  @override
  String get phoneNumberHint => 'Мысалы, +7 701 234 56 78';

  @override
  String get requestCodeButton => 'Кодты алу';

  @override
  String codeSentTo(String phone) => 'Код $phone нөміріне жіберілді';

  @override
  String get codeLabel => 'SMS-тегі код';

  @override
  String get resendCode => 'Кодты қайта жіберу';

  @override
  String resendCodeIn(int seconds) => 'Қайта жіберуге $seconds с қалды';

  @override
  String get changePhone => 'Нөмірді өзгерту';

  @override
  String devCodeHint(String code) => 'Стенд коды: $code';

  @override
  String get emailLoginPrompt => 'Email арқылы кіру';

  @override
  String get invalidPhoneNumber =>
      'Қазақстанның мобильді нөмірін көрсетіңіз: +7 701 234 56 78';

  @override
  String get authInvalidCode => 'Код дұрыс емес. SMS-ті тексеріп, қайталаңыз';

  @override
  String get authCodeExpired => 'Кодтың мерзімі өтті — жаңасын сұратыңыз';

  @override
  String get authTooManyAttempts => 'Тым көп әрекет. Жаңа код сұратыңыз';

  @override
  String get authTooManyRequests => 'Код жіберілді — таймерді күтіңіз';

  @override
  String get checkoutNeedsEmail =>
      'Тапсырысты чаттағы көмекші рәсімдейді — қажеттінің бәрін сұрайды';

  @override
  String get checkoutTitle => 'Тапсырыс беру';

  @override
  String get deliveryAddressTitle => 'Жеткізу мекенжайы';

  @override
  String get addressLine1Label => 'Мекенжай';

  @override
  String get cityLabel => 'Қала';

  @override
  String get postalCodeLabel => 'Пошта индексі';

  @override
  String get provinceLabel => 'Облыс (міндетті емес)';

  @override
  String get continueToDelivery => 'Әрі қарай';

  @override
  String get deliveryMethodTitle => 'Алу тәсілі';

  @override
  String get continueToPayment => 'Төлемге';

  @override
  String get noShippingOptions => 'Қолжетімді алу тәсілдері жоқ';

  @override
  String get checkoutError => 'Тапсырыс деректерін сақтау мүмкін болмады';

  @override
  String get paymentTitle => 'Төлем';

  @override
  String get kaspiScanHint =>
      'Кодты басқа құрылғыдағы Kaspi қосымшасында сканерлеңіз';

  @override
  String get kaspiPayInApp => 'Kaspi-де төлеу';

  @override
  String get kaspiCopyLink => 'Төлем сілтемесін көшіру';

  @override
  String get kaspiLinkCopied => 'Төлем сілтемесі көшірілді';

  @override
  String get kaspiOpenFailed =>
      'Kaspi ашылмады. Төлем сілтемесін көшіріңіз немесе QR-кодты көрсетіңіз.';

  @override
  String get kaspiShowQr => 'Басқа құрылғыдан төлеу';

  @override
  String get kaspiHideQr => 'QR-кодты жасыру';

  @override
  String get checkPayment => 'Төлемді тексеру';

  @override
  String get paymentPending => 'Төлем әлі түскен жоқ';

  @override
  String get orderPlaced => 'Тапсырыс рәсімделді';

  @override
  String get orderNumber => 'Тапсырыс нөмірі';

  @override
  String get backToCatalog => 'Басты бетке';

  @override
  String get myOrders => 'Менің тапсырыстарым';

  @override
  String get ordersEmpty => 'Сізде әзірше тапсырыстар жоқ';

  @override
  String get ordersFilterActive => 'Белсенді';

  @override
  String get ordersFilterAll => 'Барлығы';

  @override
  String get ordersEmptyActive => 'Белсенді тапсырыстар жоқ';

  @override
  String orderItemsCount(int count) => '$count позиция';

  @override
  String get ordersLoadError => 'Тапсырыстарды жүктеу мүмкін болмады';

  @override
  String get orderItemsTitle => 'Тапсырыс құрамы';

  @override
  String get orderStatusTitle => 'Күйі';

  @override
  String get orderStatusUnknown => 'Өңделуде';

  @override
  String get deliverySlotTitle => 'Жеткізу';

  @override
  List<String> get shortMonths => const [
    'қаң.',
    'ақп.',
    'нау.',
    'сәу.',
    'мам.',
    'мау.',
    'шіл.',
    'там.',
    'қыр.',
    'қаз.',
    'қар.',
    'жел.',
  ];

  @override
  String get deliveryCodeTitle => 'Алу коды';

  @override
  String get deliveryCodeHint => 'Тапсыру кезінде курьерге айтыңыз';

  @override
  String get orderDocumentsTitle => 'Құжаттар';

  @override
  String orderDocumentType(String type) => switch (type) {
    'invoice' => 'Төлем шоты',
    'waybill' => 'Жүкқұжат',
    'internal_avr' => 'Орындалған жұмыс актісі',
    _ => type,
  };

  @override
  String get orderDocumentPdf => 'PDF';

  @override
  String get orderDocumentPending => 'жеткізуден кейін';

  @override
  String get orderDocumentOpenError => 'Құжатты ашу мүмкін болмады';

  @override
  String get orderStageAccepted => 'Қабылданды';

  @override
  String get orderStageAssembled => 'Жиналды';

  @override
  String get orderStageInDelivery => 'Жеткізілуде';

  @override
  String get orderStageDelivered => 'Жеткізілді';

  @override
  String orderStatusLabel(String status) => switch (status) {
    'new' => 'Жаңа',
    'confirmed' => 'Расталды',
    'assembling' => 'Жиналуда',
    'partially_assembled' => 'Ішінара жиналды',
    'assembled' => 'Жиналды',
    'in_delivery' => 'Жеткізілуде',
    'delivered' => 'Жеткізілді',
    'closed' => 'Жабылды',
    'canceled' => 'Бас тартылды',
    _ => status,
  };

  @override
  String get cabinetTitle => 'Менің кабинетім';

  @override
  String get cabinetNavOrders => 'Тапсырыстар';

  @override
  String get cabinetNavCart => 'Себет';

  @override
  String get cabinetNavDocuments => 'Құжаттар';

  @override
  String get cabinetNavProfile => 'Профиль';

  @override
  String get cabinetDocumentsTitle => 'Құжаттар';

  @override
  String get cabinetDocumentsSubtitle =>
      'Барлық тапсырыс бойынша шот, жүкқұжат және акт.';

  @override
  String get cabinetDocumentsEmpty => 'Әзірге құжат жоқ';

  @override
  String get cabinetDocumentsEmptyHint =>
      'Құжат тапсырыс ресімделген соң пайда болады.';

  @override
  String get cabinetDocumentsLoadError => 'Құжаттарды жүктеу мүмкін болмады';

  @override
  String cabinetDocumentOrder(String number) => '$number тапсырыс';

  @override
  String get cabinetDocumentPreparing => 'дайындалуда';

  @override
  String get cabinetCartTitle => 'Себет';

  @override
  String get cabinetCartSubtitle => 'Ассистент осы уақытқа дейін жинағаны.';

  @override
  String get cabinetCartEmpty => 'Себет бос';

  @override
  String get cabinetCartEmptyHint =>
      'Чатта тапсырманы сипаттаңыз — ассистент материалдарды осында салады.';

  @override
  String get cabinetContinueInChat => 'Чатта жалғастыру';

  @override
  String get cabinetCartLoadError => 'Себетті жүктеу мүмкін болмады';

  @override
  String get cabinetProfileTitle => 'Профиль';

  @override
  String get cabinetProfileLoadError => 'Профильді жүктеу мүмкін болмады';

  @override
  String get cabinetProfileName => 'Аты-жөні';

  @override
  String get cabinetProfilePhone => 'Телефон';

  @override
  String get cabinetProfileAddresses => 'Жеткізу мекенжайлары';

  @override
  String get cabinetProfileNoAddresses =>
      'Әзірге мекенжай жоқ — ассистент ресімдеу кезінде сұрайды.';

  @override
  String get cabinetProfileNotSet => 'Көрсетілмеген';

  @override
  String get cabinetGuestTitle => 'Тапсырыстарыңызды көру үшін кіріңіз';

  @override
  String get cabinetGuestDescription =>
      'Тапсырыстар, құжаттар және ағымдағы себет телефон нөміріңізге байланған.';

  @override
  String get bonuses => 'Бонустар';

  @override
  String get bonusBalance => 'Бонус балансы';

  @override
  String get bonusEmpty => 'Бонус операциялары әзірше жоқ';

  @override
  String get bonusLoadError => 'Бонустарды жүктеу мүмкін болмады';

  @override
  String bonusTypeLabel(String type) => switch (type) {
    'accrual' => 'Есептеу',
    'spend' => 'Шығыс',
    'expiry' => 'Күйіп кету',
    'manual_credit' => 'Қолмен есептеу',
    'manual_debit' => 'Қолмен шығыс',
    _ => type,
  };

  @override
  String get estimatorTitle => 'Материал есебі';

  @override
  String get estimatorIntro =>
      'Бөлме немесе жұмыс параметрлерін көрсетіңіз — қажетті материалдарды '
      'есептеп, тауарларды сегменттер бойынша таңдаймыз.';

  @override
  String get estimatorAreaLabel => 'Ауданы, м²';

  @override
  String get estimatorVolumeLabel => 'Көлемі, м³';

  @override
  String get estimatorLengthLabel => 'Ұзындығы, м';

  @override
  String get estimatorHeightLabel => 'Биіктігі, м';

  @override
  String get estimatorCountLabel => 'Саны, дана';

  @override
  String get estimatorNoteLabel => 'Ескертпе (міндетті емес)';

  @override
  String get estimatorCalculate => 'Есептеу';

  @override
  String get estimatorParamsRequired => 'Кемінде бір параметр көрсетіңіз';

  @override
  String get estimatorError => 'Есептеу орындалмады';

  @override
  String get estimatorEmpty =>
      'Көрсетілген параметрлер бойынша материалдар табылмады';

  @override
  String get estimatorResultTitle => 'Қажетті материалдар';

  @override
  String get estimatorNoOptions => 'Сәйкес тауарлар табылмады';

  @override
  String get estimatorInStock => 'Қоймада бар';

  @override
  String get estimatorOutOfStock => 'Қоймада жоқ';

  @override
  String get estimatorDisclaimer => 'Есеп ұсыныстық сипатта';

  @override
  String segmentLabel(String segment) => switch (segment) {
    'economy' => 'Эконом',
    'comfort' => 'Комфорт',
    'business' => 'Бизнес',
    _ => segment,
  };

  @override
  String get assistantTitle => 'СтройМаркет';

  @override
  String get assistantGreeting => 'Құрылыста неге көмектесейін?';

  @override
  String get assistantIntro =>
      'Тапсырманы сипаттаңыз — материал таңдап, көлемін есептеп, Астана '
      'бойынша жеткізуді рәсімдеймін.';

  @override
  String get assistantHint => 'Тапсырманы сипаттаңыз…';

  @override
  String get assistantSend => 'Жіберу';

  @override
  String get assistantStop => 'Жауапты тоқтату';

  @override
  String get assistantRailNewChat => 'Жаңа чат';

  @override
  String get assistantTyping => 'Теруде…';

  @override
  String get assistantError => 'Жауап алынбады';

  @override
  String get assistantSubtitle => 'көмекші';

  @override
  List<String> get assistantExamples => const [
    'Бөлмені гипсокартонмен қаптау, 18 м²',
    'Бөлмедегі электрика: 6 розетка және жарық',
    'Санторапқа су құбырын тарту',
  ];

  @override
  String get assistantLangNote => 'Орысша да, қазақша да жазуға болады';

  @override
  String get assistantHintActive => 'Хабарлама…';

  @override
  String get assistantHistoryNote => 'Сұхбаттарыңыз осында көрінеді';

  @override
  String get assistantHistoryDelete => 'Сұхбатты жою';

  @override
  String get assistantOrdersLink => 'Менің тапсырыстарым';

  @override
  String get assistantSignIn => 'Аккаунтқа кіру';

  @override
  String get localeSwitchLabel => 'Рус';

  @override
  String get localeSwitchHint => 'Тілді ауыстыру';

  @override
  String get assistantHistoryTooltip => 'Сұхбаттар тарихы';

  @override
  String get assistantLogoMark => 'СМ';

  @override
  String get assistantRailSearchHint => 'Сұхбаттардан іздеу';

  @override
  String get assistantRailSearchClear => 'Іздеуді тазалау';

  @override
  String get assistantRailSearchEmpty => 'Ештеңе табылмады';

  @override
  String get assistantRailRecent => 'Жуықтағы';

  @override
  String get assistantRailMore => 'Сұхбат әрекеттері';

  @override
  String get assistantRailRename => 'Атын өзгерту';

  @override
  String get assistantRailRenameHint => 'Сұхбат атауы';

  @override
  String get assistantRailDeleteTitle => 'Сұхбатты жою керек пе?';

  @override
  String get assistantRailDeleteBody => 'Оны қалпына келтіру мүмкін емес';

  @override
  String get assistantRailDeleteConfirm => 'Жою';

  @override
  String get assistantRailDeleteCancel => 'Болдырмау';

  @override
  String get assistantTurnCopy => 'Көшіру';

  @override
  String get assistantTurnCopied => 'Көшірілді';

  @override
  String get assistantTurnRegenerate => 'Жауапты қайта жасау';

  @override
  String get assistantComposerDisclaimer =>
      'Көмекші қателесуі мүмкін — көлем мен бағаны тексеріңіз';

  @override
  String get voiceStart => 'Дауыспен енгізу';

  @override
  String get voiceFinish => 'Жазуды аяқтау';

  @override
  String get voiceCancel => 'Жазудан бас тарту';

  @override
  String get voiceRecording => 'Жазылып жатыр…';

  @override
  String get voiceTranscribing => 'Танып жатырмыз…';

  @override
  String get voiceFailureDenied =>
      'Микрофонға рұқсат жоқ. Баптауларда жазуға рұқсат беріңіз — немесе хабарламаны теріңіз';

  @override
  String get voiceFailureFailed =>
      'Жазу мүмкін болмады. Микрофонды тексеріңіз — немесе хабарламаны теріңіз';

  @override
  String get voiceFailureTooLarge => 'Жазба тым ұзын. Қысқарақ көріңіз';

  @override
  String get voiceFailureEmpty =>
      'Естімедік. Қайталап көріңіз немесе хабарламаны теріңіз';

  @override
  String get filesAttach => 'Фото немесе PDF тіркеу';

  @override
  String get filesSourceTitle => 'Нені тіркейміз';

  @override
  String get filesSourceCamera => 'Фото түсіру';

  @override
  String get filesSourceGallery => 'Галереядан таңдау';

  @override
  String get filesSourceFile => 'Файл таңдау';

  @override
  String get filesRemove => 'Тіркемені алып тастау';

  @override
  String get filesSentPlaceholder => 'Тіркеме';

  @override
  String get filesReading => 'Файлды оқып жатырмыз…';

  @override
  String get filesFailureDenied =>
      'Камера мен фотоға рұқсат жоқ. Оны параметрлерде беріңіз — '
      'немесе файл тіркеңіз';

  @override
  String get filesFailureType =>
      'Мұндай файлды ассистент оқи алмайды. Фото (JPG, PNG, HEIC) немесе PDF жіберіңіз';

  @override
  String get filesFailureTable =>
      'Кестелер мен Word құжаттарын әзірге оқымаймыз. Парақты суретке түсіріңіз '
      'немесе позицияларды дауыспен айтыңыз';

  @override
  String get filesFailureTooLarge =>
      'Файл 8 МБ-тан үлкен. Кішірек сурет жіберіңіз';

  @override
  String get filesFailureTurnTooLarge =>
      'Тіркемелер сыймайды: бірге 12 МБ-тан асады. Бір файлды алып тастаңыз';

  @override
  String get filesFailureTooMany =>
      'Бір жолы үш файлдан артық тіркеуге болмайды';

  @override
  String get filesFailureFailed => 'Файл оқылмады. Оны қайта таңдап көріңіз';

  @override
  String get attachmentInStock => 'Қоймада бар';

  @override
  String get attachmentOnOrder => 'Тапсырыспен';

  @override
  String attachmentPerUnit(String unit) => '/ $unit';

  @override
  String get attachmentPhotoOpen => 'Фотоны ашу';

  @override
  String get commonClose => 'Жабу';

  @override
  String get attachmentPaid => 'Төленді';

  @override
  String get paymentPaidReply => 'Мен төледім';

  @override
  String get attachmentAwaitingPayment => 'Төлем күтілуде';

  @override
  String get paymentFailed => 'Төлем өтпеді';

  @override
  String get paymentStatusError => 'Төлем күйін жаңарту мүмкін болмады';

  @override
  String attachmentDocumentsTitle(int displayId) =>
      '№ $displayId тапсырыс құжаттары';

  @override
  String get attachmentDocumentsFallbackTitle => 'Тапсырыс құжаттары';

  @override
  String get attachmentDocumentOpen => 'PDF ашу';

  @override
  String get attachmentDocumentPending => 'файл дайындалуда';

  @override
  String get attachmentDocumentsHint =>
      'Файлдар сілтеме арқылы ашылады — оларды сақтап қойыңыз.';

  @override
  String attachmentOrderTitle(int displayId) => 'Тапсырыс № $displayId';

  @override
  String get attachmentOrderFallbackTitle => 'Тапсырыс';

  @override
  String get attachmentOrderProcessing => 'Өңделуде';

  @override
  String get attachmentOrderOpen => 'Тапсырысты ашу';

  @override
  String get authPromptLoggedInReply => 'Кірдім, рәсімдеуді жалғастырайық';

  @override
  String get attachmentAuthPromptTitle => 'Тапсырысты рәсімдеу үшін кіріңіз';

  @override
  String get attachmentAuthPromptDescription =>
      'Телефон нөмірі арқылы кіру — SMS-пен код келеді. Себет сақталады, '
      'қайта жинаудың қажеті жоқ.';

  @override
  String get attachmentAuthPromptAction => 'Нөмір арқылы кіру';

  @override
  String get attachmentCartHint =>
      'Қажет мөлшерді батырмалармен жинаңыз — немесе сөзбен жазыңыз';

  @override
  String get cartAdd => 'Себетке';

  @override
  String cartIncrease(String title) => 'Қосу: $title';

  @override
  String cartDecrease(String title) => 'Бір бірлікті алу: $title';

  @override
  String cartQuantity(String title) => 'Мөлшері: $title';

  @override
  String get cartExpand => 'Себетті көрсету';

  @override
  String get cartCollapse => 'Себетті жию';

  @override
  String get cartError => 'Себетті өзгерту мүмкін болмады. Қайталап көріңіз.';

  @override
  String cartEventAdded(String title, int quantity) =>
      'Себетке қосылды: $title × $quantity';

  @override
  String cartEventRemoved(String title) => 'Себеттен алынды: $title';

  @override
  String get companyTitle => 'Компания';

  @override
  String get companyFormTitle => 'Заңды тұлғаның өтінімі';

  @override
  String get companyFormIntro =>
      'Тапсырыстар ұйымға рәсімделеді: төлеуге шот, жүкқұжат және орындалған '
      'жұмыстар актісі.';

  @override
  String get companyNameLabel => 'Ұйым атауы';

  @override
  String get companyBinLabel => 'БСН';

  @override
  String get companyBinHelper => '12 сан';

  @override
  String get companyBinInvalid => 'БСН 12 саннан тұрады';

  @override
  String get companyDocumentsLabel => 'Құрылтай құжаттары';

  @override
  String get companyDocumentsHint =>
      'PDF, JPG немесе PNG — 4 файлға дейін, әрқайсысы 3 МБ. Жарғы, тіркеу '
      'туралы анықтама, басшыны тағайындау бұйрығы жарайды.';

  @override
  String get companyAddFiles => 'Файлдарды таңдау';

  @override
  String get companyRemoveFile => 'Файлды алып тастау';

  @override
  String companyFileSize(int bytes) {
    if (bytes >= 1024 * 1024) {
      final megabytes = (bytes / (1024 * 1024)).toStringAsFixed(1);
      return '${megabytes.replaceAll('.', ',')} МБ';
    }
    return '${(bytes / 1024).ceil()} КБ';
  }

  @override
  String get companySubmit => 'Өтінім беру';

  @override
  String get companySubmitted => 'Өтінім тексеруге жіберілді';

  @override
  String get companyLoadError => 'Компания деректерін жүктеу мүмкін болмады';

  @override
  String get companyStatusPending => 'Тексеруде';

  @override
  String get companyStatusApproved => 'Мақұлданды';

  @override
  String get companyStatusRejected => 'Қабылданбады';

  @override
  String get companyStatusUnknown => 'Күйі нақтылануда';

  @override
  String get companyPendingNote =>
      'Өтінімді менеджер тексеріп жатыр. Тексеру аяқталғанша тапсырыстар '
      'жеке тұлғаға рәсімделеді.';

  @override
  String get companyApprovedNote =>
      'Тапсырыстар ұйымға рәсімделеді: құжаттарда компанияның атауы мен БСН '
      'болады, тапсырысқа акт шығарылады.';

  @override
  String get companyRejectedNote =>
      'Менеджердің ескертуі бойынша деректемелерді түзетіп, қажетті '
      'құжаттарды тіркеңіз және өтінімді қайта беріңіз — ол тексеруге '
      'қайтады.';

  @override
  String get companyRejectedNoteMember =>
      'Өтінімді компания әкімшісі түзетеді — оған хабарласыңыз немесе '
      'ассистентке жазыңыз.';

  @override
  String get companyRejectionReasonLabel => 'Қабылданбау себебі';

  @override
  String companyBinValue(String bin) => 'БСН $bin';

  @override
  String get companySubmittedAtLabel => 'Өтінім берілді';

  @override
  String get companyResubmittedAtLabel => 'Қайта берілді';

  @override
  String get companyRoleLabel => 'Сіздің рөліңіз';

  @override
  String get companyRoleAdmin => 'Компания әкімшісі';

  @override
  String get companyRoleMember => 'Қызметкер';

  @override
  String get companyDocumentsTitle => 'Тіркелген құжаттар';

  @override
  String get companyNoDocuments => 'Құжаттар тіркелмеген';

  @override
  String get companyDocumentOpenError => 'Құжатты ашу мүмкін болмады';

  @override
  String get companyOrderInChat => 'Чатта тапсырыс рәсімдеу';

  @override
  String get companyOpenChat => 'Ассистентке жазу';

  @override
  String get companyResubmitTitle => 'Түзетіп, қайта беру';

  @override
  String get companyResubmitIntro =>
      'Деректемелерді тексеріп, менеджер сұраған құжаттарды тіркеңіз — өтінім '
      'тексеру кезегіне қайта тұрады.';

  @override
  String get companyResubmitSubmit => 'Қайта беру';

  @override
  String get companyResubmitted => 'Өтінім қайта тексеруде';

  @override
  String get companyAddDocumentsTitle => 'Құжаттарды қосымша жүктеу';

  @override
  String get companyAddDocumentsIntro =>
      'Берілген өтінімге құжаттарды тіркеңіз — тексеру күйі бұдан өзгермейді.';

  @override
  String get companyAddDocumentsSubmit => 'Құжаттарды жіберу';

  @override
  String get companyDocumentsSent => 'Құжаттар жіберілді';

  @override
  String companyDocumentsSlots(int free) => 'Әлі $free файл тіркеуге болады';

  @override
  String get companyDocumentsLimitNote =>
      '4 құжаттың бәрі тіркелген — өтінім бұдан көп файл қабылдамайды. Тағы '
      'біреуі қажет болса, ассистентке жазыңыз.';

  @override
  String get companyErrorTooManyFiles =>
      '4 файлдан артық тіркеуге болмайды — артығы қосылмады';

  @override
  String get companyErrorFileTooLarge =>
      'Файл 3 МБ-тан үлкен — кішірек файл тіркеңіз';

  @override
  String get companyErrorUnsupportedType =>
      'Тек PDF, JPG және PNG файлдары жарайды';

  @override
  String get companyErrorRejected =>
      'Өтінім қабылданбады. Атауы мен БСН-ды тексеріңіз: мұндай БСН-мен '
      'компания тіркелген болуы немесе сіз компания құрамында болуыңыз мүмкін.';

  @override
  String get companyErrorNothingToUpdate =>
      'Өзгертетін нәрсе жоқ: деректемелерді түзетіңіз немесе кемінде бір '
      'құжат тіркеңіз.';

  @override
  String get companyErrorUpdateRejected =>
      'Түзету қабылданбады. Атауы мен БСН-ды тексеріңіз: мақұлданған '
      'компанияның деректемелерін өзгертуге болмайды, ал өтінімдегі құжат '
      'саны төрттен аспайды.';

  @override
  String get companyErrorNetwork =>
      'Сервермен байланыс жоқ. Интернетті тексеріп, қайталаңыз.';

  @override
  String get companyErrorUnknown =>
      'Өтінімді жіберу мүмкін болмады. Қайталап көріңіз.';
}
