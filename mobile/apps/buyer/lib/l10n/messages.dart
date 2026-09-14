/// Контракт строк приложения покупателя. Реализуется по одной локали на класс
/// ([MessagesRu], [MessagesKk]). Лёгкий словарь вместо `flutter gen-l10n`/ARB:
/// на текущем объёме экранов проще и не тянет кодоген (см. DECISIONS 2026-07-21).
abstract interface class Messages {
  /// Заголовок экрана каталога.
  String get catalogTitle;

  /// Подпись при отсутствии цены у товара.
  String get priceUnavailable;

  /// Сообщение об ошибке загрузки каталога.
  String get catalogLoadError;

  /// Подпись кнопки повтора загрузки.
  String get retry;

  /// Сообщение при пустом каталоге.
  String get catalogEmpty;

  /// Заголовок экрана деталей товара.
  String get productTitle;

  /// Сообщение об ошибке загрузки товара.
  String get productLoadError;

  /// Заголовок блока вариантов товара.
  String get variantsTitle;

  /// Заголовок блока описания товара.
  String get descriptionTitle;

  /// Подпись кнопки добавления в корзину.
  String get addToCart;

  /// Уведомление об успешном добавлении товара в корзину.
  String get addedToCart;

  /// Заголовок экрана корзины.
  String get cartTitle;

  /// Сообщение при пустой корзине.
  String get cartEmpty;

  /// Сообщение об ошибке загрузки корзины.
  String get cartLoadError;

  /// Сообщение об ошибке изменения корзины.
  String get cartUpdateError;

  /// Подпись строки итога корзины.
  String get cartTotal;

  /// Подпись кнопки перехода к оформлению заказа.
  String get checkout;

  // --- Авторизация ---

  /// Подпись/тултип кнопки аккаунта в шапке.
  String get account;

  // --- Экран 1e «аккаунт/вход» (гостевой контекст) ---

  /// Заголовок карточки гостя на экране входа («Вы вошли как гость»).
  String get guestModeTitle;

  /// Пояснение под заголовком гостя: что доступно гостю и зачем вход.
  String get guestModeDescription;

  /// Метка блока «Для юридических лиц».
  String get legalEntitySection;

  /// Пункт для юрлиц: оформление с НДС на БИН компании.
  String get legalEntityVat;

  /// Пункт для юрлиц: счета на оплату и акты в заказах.
  String get legalEntityDocuments;

  /// Пункт для юрлиц: история компании на всех устройствах.
  String get legalEntityHistory;

  /// Заголовок экрана регистрации.
  String get registerTitle;

  /// Метка поля email.
  String get emailLabel;

  /// Метка поля пароля.
  String get passwordLabel;

  /// Метка поля имени.
  String get firstNameLabel;

  /// Метка поля фамилии.
  String get lastNameLabel;

  /// Метка поля телефона.
  String get phoneLabel;

  /// Подпись кнопки входа.
  String get signInButton;

  /// Подпись кнопки регистрации.
  String get registerButton;

  /// Ссылка-переход с экрана входа на регистрацию.
  String get noAccountPrompt;

  /// Ссылка-переход с экрана регистрации на вход.
  String get haveAccountPrompt;

  /// Подпись кнопки выхода из аккаунта.
  String get signOut;

  /// Ошибка валидации: обязательное поле.
  String get fieldRequired;

  /// Ошибка валидации: некорректный email.
  String get invalidEmail;

  /// Ошибка валидации: слишком короткий пароль.
  String get passwordTooShort;

  /// Ошибка авторизации: неверные учётные данные.
  String get authInvalidCredentials;

  /// Ошибка авторизации: email уже занят.
  String get authEmailExists;

  /// Ошибка авторизации: нет соединения.
  String get authNetworkError;

  /// Ошибка авторизации: прочее.
  String get authUnknownError;

  // --- Вход по номеру телефона (T10.7) ---

  /// Заголовок экрана входа по номеру.
  String get phoneLoginTitle;

  /// Пояснение на шаге ввода номера.
  String get phoneLoginSubtitle;

  /// Подсказка под полем номера (какой номер ждём).
  String get phoneNumberHint;

  /// Подпись кнопки запроса кода.
  String get requestCodeButton;

  /// Пояснение на шаге ввода кода: куда отправлен код.
  String codeSentTo(String phone);

  /// Метка поля кода из SMS.
  String get codeLabel;

  /// Подпись кнопки «выслать снова», когда пауза истекла.
  String get resendCode;

  /// Подпись кнопки «выслать снова» с таймером.
  String resendCodeIn(int seconds);

  /// Ссылка «изменить номер» на шаге ввода кода.
  String get changePhone;

  /// Подсказка dev-канала стенда: код, пока нет SMS-провайдера.
  String devCodeHint(String code);

  /// Ссылка-переход на вход по email (учётки, заведённые раньше).
  String get emailLoginPrompt;

  /// Ошибка валидации: номер не похож на мобильный номер Казахстана.
  String get invalidPhoneNumber;

  /// Ошибка авторизации: неверный код.
  String get authInvalidCode;

  /// Ошибка авторизации: код истёк.
  String get authCodeExpired;

  /// Ошибка авторизации: исчерпаны попытки ввода кода.
  String get authTooManyAttempts;

  /// Ошибка авторизации: код запрошен слишком часто.
  String get authTooManyRequests;

  /// Оформление недоступно без email в профиле (вход по номеру): путь — чат.
  String get checkoutNeedsEmail;

  // --- Чекаут ---

  /// Заголовок экрана оформления заказа.
  String get checkoutTitle;

  /// Заголовок блока адреса доставки.
  String get deliveryAddressTitle;

  /// Метка поля адреса (улица/дом).
  String get addressLine1Label;

  /// Метка поля города.
  String get cityLabel;

  /// Метка поля почтового индекса.
  String get postalCodeLabel;

  /// Метка поля области (необязательное).
  String get provinceLabel;

  /// Подпись кнопки перехода к выбору способа получения.
  String get continueToDelivery;

  /// Заголовок блока выбора способа получения.
  String get deliveryMethodTitle;

  /// Подпись кнопки перехода к оплате.
  String get continueToPayment;

  /// Сообщение при отсутствии доступных способов получения.
  String get noShippingOptions;

  /// Сообщение об ошибке сохранения данных чекаута.
  String get checkoutError;

  /// Заголовок шага оплаты.
  String get paymentTitle;

  /// Подсказка под QR: отсканируйте его В ДРУГОМ устройстве.
  String get kaspiScanHint;

  /// Главное действие счёта: открыть его в приложении Kaspi.
  String get kaspiPayInApp;

  /// Передать ссылку на оплату тому, кто платит (буфер обмена).
  String get kaspiCopyLink;

  /// Подтверждение: ссылка на оплату скопирована.
  String get kaspiLinkCopied;

  /// Не удалось открыть приложение Kaspi (не установлено и т. п.).
  String get kaspiOpenFailed;

  /// Раскрывашка QR: оплатить с другого устройства.
  String get kaspiShowQr;

  /// Свернуть QR.
  String get kaspiHideQr;

  /// Подпись кнопки проверки оплаты и оформления.
  String get checkPayment;

  /// Уведомление: оплата ещё не поступила.
  String get paymentPending;

  /// Заголовок экрана подтверждения: заказ оформлен.
  String get orderPlaced;

  /// Подпись «Номер заказа».
  String get orderNumber;

  /// Подпись кнопки возврата в каталог с экрана подтверждения.
  String get backToCatalog;

  // --- Заказы ---

  /// Заголовок раздела/экрана «Мои заказы» (и пункт в аккаунте).
  String get myOrders;

  /// Сообщение при отсутствии заказов.
  String get ordersEmpty;

  /// Фильтр списка заказов: активные (ещё в работе).
  String get ordersFilterActive;

  /// Фильтр списка заказов: все.
  String get ordersFilterAll;

  /// Сообщение при отсутствии активных заказов (фильтр «Активные»).
  String get ordersEmptyActive;

  /// Число позиций в заказе с правильным склонением («1 позиция»/«2 позиции»/
  /// «5 позиций»).
  String orderItemsCount(int count);

  /// Сообщение об ошибке загрузки заказов.
  String get ordersLoadError;

  /// Заголовок блока состава заказа.
  String get orderItemsTitle;

  /// Подпись «Статус».
  String get orderStatusTitle;

  /// Статус заказа, когда бизнес-статус ещё не заведён/недоступен.
  String get orderStatusUnknown;

  /// Подпись строки слота доставки: «Доставка».
  String get deliverySlotTitle;

  /// Короткие названия месяцев (12, с января) для подписи слота
  /// «6 сент., 13:00–17:00». Часы окон — в `shared/delivery_slot_label.dart`.
  List<String> get shortMonths;

  /// Подпись «Код получения».
  String get deliveryCodeTitle;

  /// Подсказка под кодом получения: назвать курьеру при передаче.
  String get deliveryCodeHint;

  /// Заголовок блока документов заказа.
  String get orderDocumentsTitle;

  /// Локализованное название типа документа по коду (invoice|waybill|
  /// internal_avr); для неизвестного — сам код.
  String orderDocumentType(String type);

  /// Метка «PDF» у документа с файлом.
  String get orderDocumentPdf;

  /// Метка у документа без файла (ещё не выпущен, напр. акт до доставки).
  String get orderDocumentPending;

  /// Сообщение об ошибке открытия PDF документа.
  String get orderDocumentOpenError;

  // --- Стадии заказа (таймлайн 1g) ---

  /// Стадия: заказ принят.
  String get orderStageAccepted;

  /// Стадия: заказ собран.
  String get orderStageAssembled;

  /// Стадия: заказ в доставке.
  String get orderStageInDelivery;

  /// Стадия: заказ доставлен.
  String get orderStageDelivered;

  /// Локализованная подпись статуса жизненного цикла заказа по коду
  /// (new|confirmed|assembled|in_delivery|delivered|closed|canceled); для
  /// неизвестного кода — сам код.
  String orderStatusLabel(String status);

  // --- Кабинет клиента (T10.6) ---

  /// Заголовок кабинета (шапка экрана и подпись рельса истории).
  String get cabinetTitle;

  /// Подпись раздела кабинета: заказы.
  String get cabinetNavOrders;

  /// Подпись раздела кабинета: корзина.
  String get cabinetNavCart;

  /// Подпись раздела кабинета: документы.
  String get cabinetNavDocuments;

  /// Подпись раздела кабинета: профиль.
  String get cabinetNavProfile;

  /// Заголовок раздела «Документы».
  String get cabinetDocumentsTitle;

  /// Пояснение под заголовком раздела «Документы».
  String get cabinetDocumentsSubtitle;

  /// Сообщение при отсутствии документов.
  String get cabinetDocumentsEmpty;

  /// Подсказка под пустым списком документов.
  String get cabinetDocumentsEmptyHint;

  /// Сообщение об ошибке загрузки документов.
  String get cabinetDocumentsLoadError;

  /// Ссылка на заказ-основание документа («Заказ #53»).
  String cabinetDocumentOrder(String number);

  /// Метка документа, PDF которого ещё не выпущен. В ленте чата для этого есть
  /// «после доставки» (там речь про акт), но в общем списке кабинета документы
  /// разные, и обещать доставку нельзя.
  String get cabinetDocumentPreparing;

  /// Заголовок раздела «Корзина» кабинета.
  String get cabinetCartTitle;

  /// Пояснение под заголовком раздела «Корзина».
  String get cabinetCartSubtitle;

  /// Сообщение при пустой корзине в кабинете.
  String get cabinetCartEmpty;

  /// Подсказка под пустой корзиной: собрать заказ можно в чате.
  String get cabinetCartEmptyHint;

  /// Кнопка возврата в чат из кабинета.
  String get cabinetContinueInChat;

  /// Сообщение об ошибке загрузки корзины.
  String get cabinetCartLoadError;

  /// Заголовок раздела «Профиль».
  String get cabinetProfileTitle;

  /// Сообщение об ошибке загрузки профиля.
  String get cabinetProfileLoadError;

  /// Подпись поля ФИО в профиле.
  String get cabinetProfileName;

  /// Подпись поля телефона в профиле.
  String get cabinetProfilePhone;

  /// Заголовок блока адресов доставки.
  String get cabinetProfileAddresses;

  /// Сообщение при отсутствии сохранённых адресов.
  String get cabinetProfileNoAddresses;

  /// Значение поля профиля, которое покупатель ещё не назвал.
  String get cabinetProfileNotSet;

  /// Заголовок приглашения войти (кабинет гостю).
  String get cabinetGuestTitle;

  /// Пояснение, зачем входить, чтобы увидеть кабинет.
  String get cabinetGuestDescription;

  // --- Бонусы ---

  /// Заголовок раздела/экрана «Бонусы» (и пункт в аккаунте).
  String get bonuses;

  /// Подпись «Баланс бонусов».
  String get bonusBalance;

  /// Сообщение при отсутствии бонусных операций.
  String get bonusEmpty;

  /// Сообщение об ошибке загрузки бонусов.
  String get bonusLoadError;

  /// Локализованная подпись типа бонусной операции по коду
  /// (accrual|spend|expiry|manual_credit|manual_debit); для неизвестного — код.
  String bonusTypeLabel(String type);

  // --- Расчёт материалов ---

  /// Заголовок раздела/экрана «Расчёт материалов» (и тултип в шапке каталога).
  String get estimatorTitle;

  /// Пояснение над формой расчёта.
  String get estimatorIntro;

  /// Метка поля площади (м²).
  String get estimatorAreaLabel;

  /// Метка поля объёма (м³).
  String get estimatorVolumeLabel;

  /// Метка поля длины (м).
  String get estimatorLengthLabel;

  /// Метка поля высоты (м).
  String get estimatorHeightLabel;

  /// Метка поля количества (шт).
  String get estimatorCountLabel;

  /// Метка поля заметки (необязательно).
  String get estimatorNoteLabel;

  /// Подпись кнопки запуска расчёта.
  String get estimatorCalculate;

  /// Ошибка валидации: не задан ни один параметр.
  String get estimatorParamsRequired;

  /// Сообщение об ошибке расчёта.
  String get estimatorError;

  /// Сообщение при пустом результате расчёта.
  String get estimatorEmpty;

  /// Заголовок блока результата (необходимые материалы).
  String get estimatorResultTitle;

  /// Подпись при отсутствии подобранных товаров под позицию.
  String get estimatorNoOptions;

  /// Подпись «В наличии».
  String get estimatorInStock;

  /// Подпись «Нет в наличии».
  String get estimatorOutOfStock;

  /// Дисклеймер: расчёт носит рекомендательный характер.
  String get estimatorDisclaimer;

  /// Локализованная подпись сегмента по коду (economy|comfort|business);
  /// для неизвестного — сам код.
  String segmentLabel(String segment);

  /// Заголовок экрана ассистента покупателя.
  String get assistantTitle;

  /// Крупное приветствие на пустом экране ассистента.
  String get assistantGreeting;

  /// Подзаголовок приветствия — что умеет ассистент.
  String get assistantIntro;

  /// Плейсхолдер поля ввода реплики.
  String get assistantHint;

  /// Подпись/подсказка кнопки отправки реплики.
  String get assistantSend;

  /// Подпись/подсказка кнопки «Стоп» — прервать печатающийся ответ (T10.1d).
  String get assistantStop;

  /// Подпись кнопки «Новый чат» в рельсе истории.
  String get assistantRailNewChat;

  /// Подпись-заглушка «ассистент печатает».
  String get assistantTyping;

  /// Сообщение об ошибке хода диалога с ассистентом.
  String get assistantError;

  /// Подзаголовок шапки чата — роль под брендом («ассистент»).
  String get assistantSubtitle;

  /// Примеры реплик на пустом экране (чипы-подсказки, тап отправляет пример).
  List<String> get assistantExamples;

  /// Подпись под примерами: писать можно на русском или казахском.
  String get assistantLangNote;

  /// Плейсхолдер поля ввода в активном диалоге (на пустом — [assistantHint]).
  String get assistantHintActive;

  /// Заметка панели истории: диалоги хранятся на этом устройстве.
  String get assistantHistoryNote;

  /// Тултип кнопки удаления диалога из истории.
  String get assistantHistoryDelete;

  /// Пункт боковой панели: список заказов покупателя.
  String get assistantOrdersLink;

  /// Пункт боковой панели для гостя: вход в аккаунт.
  String get assistantSignIn;

  /// Подпись чипа переключателя языка в шапке — название ДРУГОЙ локали
  /// (в русской — «Қаз», в казахской — «Рус»).
  String get localeSwitchLabel;

  /// Семантика/подсказка чипа переключателя языка («Переключить язык»).
  String get localeSwitchHint;

  /// Tooltip кнопки меню в шапке — открывает панель истории диалогов.
  String get assistantHistoryTooltip;

  /// Литеры логотипа-плашки на пустом экране и метки-аватара ответа («СМ»).
  String get assistantLogoMark;

  // --- Рельс истории диалогов (бриф T10.1 §3.1) ---

  /// Подсказка поля поиска по истории диалогов.
  String get assistantRailSearchHint;

  /// Озвучка крестика очистки поиска.
  String get assistantRailSearchClear;

  /// Сообщение, когда поиск по истории ничего не нашёл.
  String get assistantRailSearchEmpty;

  /// Заголовок группы списка диалогов («Недавние»).
  String get assistantRailRecent;

  /// Озвучка/tooltip кнопки меню строки диалога («⋮»).
  String get assistantRailMore;

  /// Пункт меню строки: переименовать диалог.
  String get assistantRailRename;

  /// Подсказка поля инлайн-переименования диалога.
  String get assistantRailRenameHint;

  /// Заголовок подтверждения удаления диалога.
  String get assistantRailDeleteTitle;

  /// Пояснение подтверждения удаления: восстановить нельзя.
  String get assistantRailDeleteBody;

  /// Подпись кнопки подтверждения удаления.
  String get assistantRailDeleteConfirm;

  /// Подпись кнопки отмены в подтверждении удаления.
  String get assistantRailDeleteCancel;

  // --- Ход разговора и композер (бриф T10.1 §3.3, §3.4) ---

  /// Озвучка/tooltip действия «копировать ответ».
  String get assistantTurnCopy;

  /// Уведомление после копирования ответа.
  String get assistantTurnCopied;

  /// Озвучка/tooltip действия «повторить ответ».
  String get assistantTurnRegenerate;

  /// Дисклеймер под композером: ассистент может ошибаться.
  String get assistantComposerDisclaimer;

  // --- Голосовой ввод композера (T10.3) ---

  /// Озвучка/tooltip кнопки микрофона в состоянии покоя.
  String get voiceStart;

  /// Озвучка той же кнопки во время записи: закончить и распознать.
  String get voiceFinish;

  /// Озвучка кнопки отмены записи.
  String get voiceCancel;

  /// Подпись индикатора: микрофон слушает.
  String get voiceRecording;

  /// Подпись индикатора: запись ушла на распознавание.
  String get voiceTranscribing;

  /// Отказ в доступе к микрофону: что делать дальше.
  String get voiceFailureDenied;

  /// Записать не удалось (микрофона нет, занят, платформа не тянет).
  String get voiceFailureFailed;

  /// Запись не влезла в предел бэкенда (8 МБ).
  String get voiceFailureTooLarge;

  /// Модель ничего не разобрала — «не расслышали» (это не сбой).
  String get voiceFailureEmpty;

  // --- Вложения композера (T10.4c) ---

  /// Озвучка/tooltip скрепки в композере.
  String get filesAttach;

  /// Заголовок листа выбора источника вложения.
  String get filesSourceTitle;

  /// Источник вложения: снять прямо сейчас камерой.
  String get filesSourceCamera;

  /// Источник вложения: кадр из галереи.
  String get filesSourceGallery;

  /// Источник вложения: произвольный файл (PDF-смета, счёт).
  String get filesSourceFile;

  /// Озвучка крестика на чипе вложения.
  String get filesRemove;

  /// Подпись вместо текста у реплики, которая была ОДНИМ вложением: превью
  /// живёт в памяти вкладки, и в возобновлённом из истории диалоге на его месте
  /// стоит эта подпись — пустой пузырь читался бы как сбой.
  String get filesSentPlaceholder;

  /// Подпись ожидания, пока файл читается с устройства.
  String get filesReading;

  /// Нет доступа к камере или галерее: что делать дальше.
  String get filesFailureDenied;

  /// Формат, который ассистент не прочитает (видео, архив).
  String get filesFailureType;

  /// Таблица или документ Word: их читает парсер, а не зрительная модель.
  String get filesFailureTable;

  /// Один файл больше 8 МБ.
  String get filesFailureTooLarge;

  /// Вложения хода суммарно больше 12 МБ.
  String get filesFailureTurnTooLarge;

  /// Файлов за раз больше трёх.
  String get filesFailureTooMany;

  /// Файл не прочитался (пустой файл, ошибка устройства).
  String get filesFailureFailed;

  // --- Вставки ленты ассистента (карточка товара / оплата / статус заказа) ---

  /// Метка наличия на карточке товара: есть на складе.
  String get attachmentInStock;

  /// Метка наличия на карточке товара: под заказ.
  String get attachmentOnOrder;

  /// Подпись единицы рядом с ценой на карточке товара: «/ тонна», «/ мешок».
  /// Единица приходит из данных товара в именительном падеже, поэтому подпись
  /// строится через слэш: русское «за тонна» было бы неграмотным (находка
  /// Ф-прогона 2026-08-13).
  String attachmentPerUnit(String unit);

  /// Подсказка/метка доступности миниатюры на карточке товара: открыть фото.
  String get attachmentPhotoOpen;

  /// Метка кнопки закрытия просмотра фото.
  String get commonClose;

  /// Статус платёжного блока Kaspi: оплата получена.
  String get attachmentPaid;

  /// Реплика, которую приложение отправляет САМО, когда поллинг увидел оплату:
  /// покупатель вернулся из Kaspi, и диалог продолжается без его действий.
  String get paymentPaidReply;

  /// Статус платёжного блока Kaspi: ожидание оплаты.
  String get attachmentAwaitingPayment;

  /// Статус платёжного блока Kaspi: оплата не прошла.
  String get paymentFailed;

  /// Баннер ошибки авто-поллинга статуса оплаты (экран 1c) + «Повторить».
  String get paymentStatusError;

  /// Заголовок блока статуса заказа с человекочитаемым номером («Заказ № 4821»).
  String attachmentOrderTitle(int displayId);

  /// Заголовок блока статуса заказа, когда номер ещё неизвестен.
  String get attachmentOrderFallbackTitle;

  /// Статус заказа по умолчанию, пока бэкенд не прислал текст статуса.
  String get attachmentOrderProcessing;

  /// Действие блока статуса заказа: перейти на экран заказа (состав, документы).
  String get attachmentOrderOpen;

  /// Заголовок карточки документов заказа («Документы по заказу № 24»).
  String attachmentDocumentsTitle(int displayId);

  /// Заголовок карточки документов, когда номер заказа неизвестен.
  String get attachmentDocumentsFallbackTitle;

  /// Действие «открыть PDF» в карточке документов.
  String get attachmentDocumentOpen;

  /// Подпись документа, файл которого ещё готовится.
  String get attachmentDocumentPending;

  /// Подсказка под карточкой документов: файлы открываются по ссылке.
  String get attachmentDocumentsHint;

  /// Реплика, которую чат отправляет сам после входа по кнопке из ленты.
  String get authPromptLoggedInReply;

  /// Заголовок карточки входа в ленте («Войдите, чтобы оформить заказ»).
  String get attachmentAuthPromptTitle;

  /// Пояснение карточки входа: вход по номеру, корзина сохранится.
  String get attachmentAuthPromptDescription;

  /// Кнопка карточки входа («Войти по номеру»).
  String get attachmentAuthPromptAction;

  /// Подсказка под карточками подбора: количество набирают кнопками или словами.
  String get attachmentCartHint;

  // --- Корзина чата: счётчики «−/+» на карточках и полоса корзины (T10.15) ---

  /// Подпись кнопки нулевого состояния счётчика («В корзину»).
  String get cartAdd;

  /// Метки доступности счётчика: «+», «−» и само число.
  String cartIncrease(String title);
  String cartDecrease(String title);
  String cartQuantity(String title);

  /// Метки доступности полосы корзины (раскрыть/свернуть).
  String get cartExpand;
  String get cartCollapse;

  /// Ошибка записи в корзину — счётчик откачен к подтверждённому количеству.
  String get cartError;

  /// Тихая отметка в ленте о нажатии счётчика. Количество пишем через «×»,
  /// чтобы не склонять единицу товара («12 мешок»).
  String cartEventAdded(String title, int quantity);
  String cartEventRemoved(String title);

  // --- Раздел «Компания» (заявка юрлица и статус модерации, T2.12) ---

  /// Заголовок раздела и пункт в аккаунте.
  String get companyTitle;

  /// Заголовок формы заявки.
  String get companyFormTitle;

  /// Пояснение под заголовком формы: зачем заявка.
  String get companyFormIntro;

  /// Метка поля «Название организации».
  String get companyNameLabel;

  /// Метка поля «БИН».
  String get companyBinLabel;

  /// Подсказка под полем БИН («12 цифр»).
  String get companyBinHelper;

  /// Ошибка валидации БИН.
  String get companyBinInvalid;

  /// Заголовок блока учредительных документов.
  String get companyDocumentsLabel;

  /// Подсказка блока документов: типы и ограничения файлов.
  String get companyDocumentsHint;

  /// Подпись кнопки выбора файлов.
  String get companyAddFiles;

  /// Подпись/семантика кнопки удаления выбранного файла.
  String get companyRemoveFile;

  /// Размер выбранного файла человекочитаемо («2,4 МБ», «180 КБ»).
  String companyFileSize(int bytes);

  /// Подпись кнопки отправки заявки.
  String get companySubmit;

  /// Сообщение об успешной подаче заявки.
  String get companySubmitted;

  /// Ошибка загрузки данных компании.
  String get companyLoadError;

  /// Статус модерации: на проверке.
  String get companyStatusPending;

  /// Статус модерации: одобрена.
  String get companyStatusApproved;

  /// Статус модерации: отклонена.
  String get companyStatusRejected;

  /// Статус модерации: неизвестный код от бэкенда.
  String get companyStatusUnknown;

  /// Что означает статус «на модерации» для заказов.
  String get companyPendingNote;

  /// Что означает статус «одобрена» для заказов.
  String get companyApprovedNote;

  /// Что делать при отказе администратору компании (правит заявку сам).
  String get companyRejectedNote;

  /// Что делать при отказе сотруднику без прав администратора.
  String get companyRejectedNoteMember;

  /// Подпись блока с причиной отказа модератора.
  String get companyRejectionReasonLabel;

  /// Строка с БИН компании («БИН 123456789012»).
  String companyBinValue(String bin);

  /// Подпись даты подачи заявки.
  String get companySubmittedAtLabel;

  /// Подпись даты повторной подачи заявки после отказа.
  String get companyResubmittedAtLabel;

  /// Подпись роли покупателя в компании.
  String get companyRoleLabel;

  /// Роль: подавший заявку администратор компании.
  String get companyRoleAdmin;

  /// Роль: принятый сотрудник компании.
  String get companyRoleMember;

  /// Заголовок списка приложенных документов.
  String get companyDocumentsTitle;

  /// Подпись, когда к заявке не приложены документы.
  String get companyNoDocuments;

  /// Ошибка открытия документа компании.
  String get companyDocumentOpenError;

  /// Действие одобренной компании: оформить заказ в чате.
  String get companyOrderInChat;

  /// Действие при отказе: написать ассистенту.
  String get companyOpenChat;

  // --- Правка заявки: повторная подача и догрузка документов (T2.14) ---

  /// Заголовок формы повторной подачи отклонённой заявки.
  String get companyResubmitTitle;

  /// Пояснение формы повторной подачи: заявка вернётся на проверку.
  String get companyResubmitIntro;

  /// Подпись кнопки повторной подачи.
  String get companyResubmitSubmit;

  /// Сообщение об успешной повторной подаче.
  String get companyResubmitted;

  /// Заголовок формы догрузки документов к заявке на модерации.
  String get companyAddDocumentsTitle;

  /// Пояснение формы догрузки: статус заявки не меняется.
  String get companyAddDocumentsIntro;

  /// Подпись кнопки отправки догруженных документов.
  String get companyAddDocumentsSubmit;

  /// Сообщение об успешной догрузке документов.
  String get companyDocumentsSent;

  /// Сколько документов ещё можно приложить (общий лимит на компанию — 4).
  String companyDocumentsSlots(int free);

  /// Объяснение вместо выбора файла, когда все 4 места заняты.
  String get companyDocumentsLimitNote;

  /// Отказ: файлов больше, чем принимает заявка.
  String get companyErrorTooManyFiles;

  /// Отказ: файл тяжелее допустимого.
  String get companyErrorFileTooLarge;

  /// Отказ: неподдерживаемый тип файла.
  String get companyErrorUnsupportedType;

  /// Отказ бэкенда: заявка не принята.
  String get companyErrorRejected;

  /// Отказ: правка пустая — ни реквизиты, ни документы не изменились.
  String get companyErrorNothingToUpdate;

  /// Отказ бэкенда: правку заявки не приняли.
  String get companyErrorUpdateRejected;

  /// Отказ: нет связи.
  String get companyErrorNetwork;

  /// Отказ: прочий сбой отправки.
  String get companyErrorUnknown;
}
