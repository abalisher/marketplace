import 'messages.dart';

/// Русская локаль (основная).
class MessagesRu implements Messages {
  const MessagesRu();

  @override
  String get catalogTitle => 'Каталог';

  @override
  String get priceUnavailable => 'Цена по запросу';

  @override
  String get catalogLoadError => 'Не удалось загрузить каталог';

  @override
  String get retry => 'Повторить';

  @override
  String get catalogEmpty => 'Товары не найдены';

  @override
  String get productTitle => 'Товар';

  @override
  String get productLoadError => 'Не удалось загрузить товар';

  @override
  String get variantsTitle => 'Варианты';

  @override
  String get descriptionTitle => 'Описание';

  @override
  String get addToCart => 'В корзину';

  @override
  String get addedToCart => 'Добавлено в корзину';

  @override
  String get cartTitle => 'Корзина';

  @override
  String get cartEmpty => 'Корзина пуста';

  @override
  String get cartLoadError => 'Не удалось загрузить корзину';

  @override
  String get cartUpdateError => 'Не удалось обновить корзину';

  @override
  String get cartTotal => 'Итого';

  @override
  String get checkout => 'Оформить заказ';

  @override
  String get account => 'Аккаунт';

  @override
  String get guestModeTitle => 'Вы вошли как гость';

  @override
  String get guestModeDescription =>
      'Гость может подобрать материалы и оформить заказ. Вход нужен, чтобы '
      'заказы и документы были под рукой на всех устройствах.';

  @override
  String get legalEntitySection => 'Для юридических лиц';

  @override
  String get legalEntityVat => 'Оформление с НДС на БИН компании';

  @override
  String get legalEntityDocuments => 'Счета на оплату и акты — в заказах';

  @override
  String get legalEntityHistory => 'История компании на всех устройствах';

  @override
  String get registerTitle => 'Регистрация';

  @override
  String get emailLabel => 'Email';

  @override
  String get passwordLabel => 'Пароль';

  @override
  String get firstNameLabel => 'Имя';

  @override
  String get lastNameLabel => 'Фамилия';

  @override
  String get phoneLabel => 'Телефон';

  @override
  String get signInButton => 'Войти';

  @override
  String get registerButton => 'Зарегистрироваться';

  @override
  String get noAccountPrompt => 'Нет аккаунта? Зарегистрируйтесь';

  @override
  String get haveAccountPrompt => 'Уже есть аккаунт? Войдите';

  @override
  String get signOut => 'Выйти';

  @override
  String get fieldRequired => 'Обязательное поле';

  @override
  String get invalidEmail => 'Некорректный email';

  @override
  String get passwordTooShort => 'Минимум 6 символов';

  @override
  String get authInvalidCredentials => 'Неверный email или пароль';

  @override
  String get authEmailExists => 'Этот email уже зарегистрирован';

  @override
  String get authNetworkError => 'Нет соединения с сервером';

  @override
  String get authUnknownError => 'Не удалось выполнить. Попробуйте ещё раз';

  @override
  String get phoneLoginTitle => 'Вход по номеру';

  @override
  String get phoneLoginSubtitle =>
      'Введите номер телефона — пришлём одноразовый код в SMS';

  @override
  String get phoneNumberHint => 'Например, +7 701 234 56 78';

  @override
  String get requestCodeButton => 'Получить код';

  @override
  String codeSentTo(String phone) => 'Код отправлен на $phone';

  @override
  String get codeLabel => 'Код из SMS';

  @override
  String get resendCode => 'Выслать код снова';

  @override
  String resendCodeIn(int seconds) => 'Выслать снова можно через $seconds с';

  @override
  String get changePhone => 'Изменить номер';

  @override
  String devCodeHint(String code) => 'Код стенда: $code';

  @override
  String get emailLoginPrompt => 'Войти по email';

  @override
  String get invalidPhoneNumber =>
      'Укажите мобильный номер Казахстана: +7 701 234 56 78';

  @override
  String get authInvalidCode =>
      'Неверный код. Проверьте SMS и попробуйте снова';

  @override
  String get authCodeExpired => 'Код истёк — запросите новый';

  @override
  String get authTooManyAttempts =>
      'Слишком много попыток. Запросите новый код';

  @override
  String get authTooManyRequests => 'Код уже отправлен — дождитесь таймера';

  @override
  String get checkoutNeedsEmail =>
      'Оформление заказа ведёт ассистент в чате — он спросит всё нужное';

  @override
  String get checkoutTitle => 'Оформление заказа';

  @override
  String get deliveryAddressTitle => 'Адрес доставки';

  @override
  String get addressLine1Label => 'Адрес';

  @override
  String get cityLabel => 'Город';

  @override
  String get postalCodeLabel => 'Почтовый индекс';

  @override
  String get provinceLabel => 'Область (необязательно)';

  @override
  String get continueToDelivery => 'Далее';

  @override
  String get deliveryMethodTitle => 'Способ получения';

  @override
  String get continueToPayment => 'К оплате';

  @override
  String get noShippingOptions => 'Нет доступных способов получения';

  @override
  String get checkoutError => 'Не удалось сохранить данные заказа';

  @override
  String get paymentTitle => 'Оплата';

  @override
  String get kaspiScanHint =>
      'Отсканируйте код в приложении Kaspi на другом устройстве';

  @override
  String get kaspiPayInApp => 'Оплатить в Kaspi';

  @override
  String get kaspiCopyLink => 'Скопировать ссылку на оплату';

  @override
  String get kaspiLinkCopied => 'Ссылка на оплату скопирована';

  @override
  String get kaspiOpenFailed =>
      'Не удалось открыть Kaspi. Скопируйте ссылку на оплату или покажите QR-код.';

  @override
  String get kaspiShowQr => 'Оплатить с другого устройства';

  @override
  String get kaspiHideQr => 'Скрыть QR-код';

  @override
  String get checkPayment => 'Проверить оплату';

  @override
  String get paymentPending => 'Оплата ещё не поступила';

  @override
  String get orderPlaced => 'Заказ оформлен';

  @override
  String get orderNumber => 'Номер заказа';

  @override
  String get backToCatalog => 'На главную';

  @override
  String get myOrders => 'Мои заказы';

  @override
  String get ordersEmpty => 'У вас пока нет заказов';

  @override
  String get ordersFilterActive => 'Активные';

  @override
  String get ordersFilterAll => 'Все';

  @override
  String get ordersEmptyActive => 'Нет активных заказов';

  @override
  String orderItemsCount(int count) {
    // Русское склонение: 1 позиция; 2–4 позиции; 5–20, 0 — позиций.
    final mod100 = count % 100;
    final mod10 = count % 10;
    if (mod100 >= 11 && mod100 <= 14) return '$count позиций';
    if (mod10 == 1) return '$count позиция';
    if (mod10 >= 2 && mod10 <= 4) return '$count позиции';
    return '$count позиций';
  }

  @override
  String get ordersLoadError => 'Не удалось загрузить заказы';

  @override
  String get orderItemsTitle => 'Состав заказа';

  @override
  String get orderStatusTitle => 'Статус';

  @override
  String get orderStatusUnknown => 'Обрабатывается';

  @override
  String get deliverySlotTitle => 'Доставка';

  @override
  List<String> get shortMonths => const [
    'янв.',
    'февр.',
    'мар.',
    'апр.',
    'мая',
    'июн.',
    'июл.',
    'авг.',
    'сент.',
    'окт.',
    'нояб.',
    'дек.',
  ];

  @override
  String get deliveryCodeTitle => 'Код получения';

  @override
  String get deliveryCodeHint => 'Назовите курьеру при передаче';

  @override
  String get orderDocumentsTitle => 'Документы';

  @override
  String orderDocumentType(String type) => switch (type) {
    'invoice' => 'Счёт на оплату',
    'waybill' => 'Накладная',
    'internal_avr' => 'Акт выполненных работ',
    _ => type,
  };

  @override
  String get orderDocumentPdf => 'PDF';

  @override
  String get orderDocumentPending => 'после доставки';

  @override
  String get orderDocumentOpenError => 'Не удалось открыть документ';

  @override
  String get orderStageAccepted => 'Принят';

  @override
  String get orderStageAssembled => 'Собран';

  @override
  String get orderStageInDelivery => 'В доставке';

  @override
  String get orderStageDelivered => 'Доставлен';

  @override
  String orderStatusLabel(String status) => switch (status) {
    'new' => 'Новый',
    'confirmed' => 'Подтверждён',
    'assembling' => 'В сборке',
    'partially_assembled' => 'Частично собран',
    'assembled' => 'Собран',
    'in_delivery' => 'В доставке',
    'delivered' => 'Доставлен',
    'closed' => 'Закрыт',
    'canceled' => 'Отменён',
    _ => status,
  };

  @override
  String get cabinetTitle => 'Мой кабинет';

  @override
  String get cabinetNavOrders => 'Заказы';

  @override
  String get cabinetNavCart => 'Корзина';

  @override
  String get cabinetNavDocuments => 'Документы';

  @override
  String get cabinetNavProfile => 'Профиль';

  @override
  String get cabinetDocumentsTitle => 'Документы';

  @override
  String get cabinetDocumentsSubtitle =>
      'Счета, накладные и акты по всем вашим заказам.';

  @override
  String get cabinetDocumentsEmpty => 'Документов пока нет';

  @override
  String get cabinetDocumentsEmptyHint =>
      'Документ появляется после оформления заказа.';

  @override
  String get cabinetDocumentsLoadError => 'Не удалось загрузить документы';

  @override
  String cabinetDocumentOrder(String number) => 'Заказ $number';

  @override
  String get cabinetDocumentPreparing => 'готовится';

  @override
  String get cabinetCartTitle => 'Корзина';

  @override
  String get cabinetCartSubtitle => 'То, что ассистент собрал к этому моменту.';

  @override
  String get cabinetCartEmpty => 'Корзина пуста';

  @override
  String get cabinetCartEmptyHint =>
      'Опишите задачу в чате — ассистент сложит сюда материалы.';

  @override
  String get cabinetContinueInChat => 'Продолжить в чате';

  @override
  String get cabinetCartLoadError => 'Не удалось загрузить корзину';

  @override
  String get cabinetProfileTitle => 'Профиль';

  @override
  String get cabinetProfileLoadError => 'Не удалось загрузить профиль';

  @override
  String get cabinetProfileName => 'ФИО';

  @override
  String get cabinetProfilePhone => 'Телефон';

  @override
  String get cabinetProfileAddresses => 'Адреса доставки';

  @override
  String get cabinetProfileNoAddresses =>
      'Адресов пока нет — ассистент спросит адрес при оформлении.';

  @override
  String get cabinetProfileNotSet => 'Не указано';

  @override
  String get cabinetGuestTitle => 'Войдите, чтобы увидеть свои заказы';

  @override
  String get cabinetGuestDescription =>
      'Заказы, документы и текущая корзина привязаны к вашему номеру телефона.';

  @override
  String get bonuses => 'Бонусы';

  @override
  String get bonusBalance => 'Баланс бонусов';

  @override
  String get bonusEmpty => 'Пока нет бонусных операций';

  @override
  String get bonusLoadError => 'Не удалось загрузить бонусы';

  @override
  String bonusTypeLabel(String type) => switch (type) {
    'accrual' => 'Начисление',
    'spend' => 'Списание',
    'expiry' => 'Сгорание',
    'manual_credit' => 'Ручное начисление',
    'manual_debit' => 'Ручное списание',
    _ => type,
  };

  @override
  String get estimatorTitle => 'Расчёт материалов';

  @override
  String get estimatorIntro =>
      'Укажите параметры помещения или работ — рассчитаем нужные материалы '
      'и подберём товары по сегментам.';

  @override
  String get estimatorAreaLabel => 'Площадь, м²';

  @override
  String get estimatorVolumeLabel => 'Объём, м³';

  @override
  String get estimatorLengthLabel => 'Длина, м';

  @override
  String get estimatorHeightLabel => 'Высота, м';

  @override
  String get estimatorCountLabel => 'Количество, шт';

  @override
  String get estimatorNoteLabel => 'Заметка (необязательно)';

  @override
  String get estimatorCalculate => 'Рассчитать';

  @override
  String get estimatorParamsRequired => 'Укажите хотя бы один параметр';

  @override
  String get estimatorError => 'Не удалось выполнить расчёт';

  @override
  String get estimatorEmpty => 'По заданным параметрам материалы не подобраны';

  @override
  String get estimatorResultTitle => 'Необходимые материалы';

  @override
  String get estimatorNoOptions => 'Подходящие товары не найдены';

  @override
  String get estimatorInStock => 'В наличии';

  @override
  String get estimatorOutOfStock => 'Нет в наличии';

  @override
  String get estimatorDisclaimer => 'Расчёт носит рекомендательный характер';

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
  String get assistantGreeting => 'Чем помочь на стройке?';

  @override
  String get assistantIntro =>
      'Опишите задачу — подберу материалы, посчитаю количество и оформлю '
      'доставку по Астане.';

  @override
  String get assistantHint => 'Опишите задачу…';

  @override
  String get assistantSend => 'Отправить';

  @override
  String get assistantStop => 'Остановить ответ';

  @override
  String get assistantRailNewChat => 'Новый чат';

  @override
  String get assistantTyping => 'Печатает…';

  @override
  String get assistantError => 'Не удалось получить ответ';

  @override
  String get assistantSubtitle => 'ассистент';

  @override
  List<String> get assistantExamples => const [
    'Обшить комнату гипсокартоном, 18 м²',
    'Электрика в комнате: 6 розеток и свет',
    'Развести воду в санузле',
  ];

  @override
  String get assistantLangNote => 'Можно писать на русском или казахском';

  @override
  String get assistantHintActive => 'Сообщение…';

  @override
  String get assistantHistoryNote => 'Здесь появятся ваши диалоги';

  @override
  String get assistantHistoryDelete => 'Удалить диалог';

  @override
  String get assistantOrdersLink => 'Мои заказы';

  @override
  String get assistantSignIn => 'Войти в аккаунт';

  @override
  String get localeSwitchLabel => 'Қаз';

  @override
  String get localeSwitchHint => 'Переключить язык';

  @override
  String get assistantHistoryTooltip => 'История диалогов';

  @override
  String get assistantLogoMark => 'СМ';

  @override
  String get assistantRailSearchHint => 'Поиск по диалогам';

  @override
  String get assistantRailSearchClear => 'Очистить поиск';

  @override
  String get assistantRailSearchEmpty => 'Ничего не нашлось';

  @override
  String get assistantRailRecent => 'Недавние';

  @override
  String get assistantRailMore => 'Действия с диалогом';

  @override
  String get assistantRailRename => 'Переименовать';

  @override
  String get assistantRailRenameHint => 'Название диалога';

  @override
  String get assistantRailDeleteTitle => 'Удалить диалог?';

  @override
  String get assistantRailDeleteBody => 'Его нельзя восстановить';

  @override
  String get assistantRailDeleteConfirm => 'Удалить';

  @override
  String get assistantRailDeleteCancel => 'Отмена';

  @override
  String get assistantTurnCopy => 'Копировать';

  @override
  String get assistantTurnCopied => 'Скопировано';

  @override
  String get assistantTurnRegenerate => 'Повторить ответ';

  @override
  String get assistantComposerDisclaimer =>
      'Ассистент может ошибаться — проверяйте количества и цены';

  @override
  String get voiceStart => 'Голосовой ввод';

  @override
  String get voiceFinish => 'Закончить запись';

  @override
  String get voiceCancel => 'Отменить запись';

  @override
  String get voiceRecording => 'Идёт запись…';

  @override
  String get voiceTranscribing => 'Распознаём…';

  @override
  String get voiceFailureDenied =>
      'Нет доступа к микрофону. Разрешите запись в настройках — или наберите сообщение';

  @override
  String get voiceFailureFailed =>
      'Не удалось записать. Проверьте микрофон — или наберите сообщение';

  @override
  String get voiceFailureTooLarge =>
      'Запись слишком длинная. Попробуйте покороче';

  @override
  String get voiceFailureEmpty =>
      'Не расслышали. Попробуйте ещё раз или наберите сообщение';

  @override
  String get filesAttach => 'Прикрепить фото или PDF';

  @override
  String get filesSourceTitle => 'Что приложить';

  @override
  String get filesSourceCamera => 'Сделать фото';

  @override
  String get filesSourceGallery => 'Выбрать из галереи';

  @override
  String get filesSourceFile => 'Выбрать файл';

  @override
  String get filesRemove => 'Убрать вложение';

  @override
  String get filesSentPlaceholder => 'Вложение';

  @override
  String get filesReading => 'Читаем файл…';

  @override
  String get filesFailureDenied =>
      'Нет доступа к камере и фото. Разрешите его в настройках — '
      'или приложите файл';

  @override
  String get filesFailureType =>
      'Такой файл ассистент не прочитает. Пришлите фото (JPG, PNG, HEIC) или PDF';

  @override
  String get filesFailureTable =>
      'Таблицы и документы Word пока не читаем. Сфотографируйте лист '
      'или продиктуйте позиции голосом';

  @override
  String get filesFailureTooLarge =>
      'Файл больше 8 МБ. Пришлите снимок поменьше';

  @override
  String get filesFailureTurnTooLarge =>
      'Вложения не помещаются: вместе больше 12 МБ. Уберите один файл';

  @override
  String get filesFailureTooMany =>
      'За раз можно приложить не больше трёх файлов';

  @override
  String get filesFailureFailed =>
      'Файл не прочитался. Попробуйте выбрать его ещё раз';

  @override
  String get attachmentInStock => 'В наличии на складе';

  @override
  String get attachmentOnOrder => 'Под заказ';

  @override
  String attachmentPerUnit(String unit) => '/ $unit';

  @override
  String get attachmentPhotoOpen => 'Открыть фото';

  @override
  String get commonClose => 'Закрыть';

  @override
  String get attachmentPaid => 'Оплачено';

  @override
  String get paymentPaidReply => 'Я оплатил';

  @override
  String get attachmentAwaitingPayment => 'Ожидание оплаты';

  @override
  String get paymentFailed => 'Оплата не прошла';

  @override
  String get paymentStatusError => 'Не удалось обновить статус оплаты';

  @override
  String attachmentDocumentsTitle(int displayId) =>
      'Документы по заказу № $displayId';

  @override
  String get attachmentDocumentsFallbackTitle => 'Документы по заказу';

  @override
  String get attachmentDocumentOpen => 'Открыть PDF';

  @override
  String get attachmentDocumentPending => 'файл готовится';

  @override
  String get attachmentDocumentsHint =>
      'Файлы открываются по ссылке — сохраните их себе.';

  @override
  String attachmentOrderTitle(int displayId) => 'Заказ № $displayId';

  @override
  String get attachmentOrderFallbackTitle => 'Заказ';

  @override
  String get attachmentOrderProcessing => 'В обработке';

  @override
  String get attachmentOrderOpen => 'Открыть заказ';

  @override
  String get authPromptLoggedInReply => 'Я вошёл, продолжаем оформление';

  @override
  String get attachmentAuthPromptTitle => 'Войдите, чтобы оформить заказ';

  @override
  String get attachmentAuthPromptDescription =>
      'Вход по номеру телефона — придёт код в СМС. Корзина сохранится, '
      'повторять ничего не придётся.';

  @override
  String get attachmentAuthPromptAction => 'Войти по номеру';

  @override
  String get attachmentCartHint =>
      'Наберите нужное количество кнопками — или напишите словами';

  @override
  String get cartAdd => 'В корзину';

  @override
  String cartIncrease(String title) => 'Добавить: $title';

  @override
  String cartDecrease(String title) => 'Убрать одну единицу: $title';

  @override
  String cartQuantity(String title) => 'Количество: $title';

  @override
  String get cartExpand => 'Показать корзину';

  @override
  String get cartCollapse => 'Свернуть корзину';

  @override
  String get cartError => 'Не удалось изменить корзину. Попробуйте ещё раз.';

  @override
  String cartEventAdded(String title, int quantity) =>
      'Добавлено в корзину: $title × $quantity';

  @override
  String cartEventRemoved(String title) => 'Убрано из корзины: $title';

  @override
  String get companyTitle => 'Компания';

  @override
  String get companyFormTitle => 'Заявка юридического лица';

  @override
  String get companyFormIntro =>
      'Заказы будут оформляться на организацию: счёт на оплату, накладная и '
      'акт выполненных работ.';

  @override
  String get companyNameLabel => 'Название организации';

  @override
  String get companyBinLabel => 'БИН';

  @override
  String get companyBinHelper => '12 цифр';

  @override
  String get companyBinInvalid => 'БИН состоит из 12 цифр';

  @override
  String get companyDocumentsLabel => 'Учредительные документы';

  @override
  String get companyDocumentsHint =>
      'PDF, JPG или PNG — до 4 файлов по 3 МБ. Подойдут устав, справка о '
      'регистрации, приказ о назначении руководителя.';

  @override
  String get companyAddFiles => 'Выбрать файлы';

  @override
  String get companyRemoveFile => 'Убрать файл';

  @override
  String companyFileSize(int bytes) {
    if (bytes >= 1024 * 1024) {
      final megabytes = (bytes / (1024 * 1024)).toStringAsFixed(1);
      return '${megabytes.replaceAll('.', ',')} МБ';
    }
    return '${(bytes / 1024).ceil()} КБ';
  }

  @override
  String get companySubmit => 'Подать заявку';

  @override
  String get companySubmitted => 'Заявка отправлена на проверку';

  @override
  String get companyLoadError => 'Не удалось загрузить данные компании';

  @override
  String get companyStatusPending => 'На проверке';

  @override
  String get companyStatusApproved => 'Одобрена';

  @override
  String get companyStatusRejected => 'Отклонена';

  @override
  String get companyStatusUnknown => 'Статус уточняется';

  @override
  String get companyPendingNote =>
      'Заявку проверяет менеджер. Пока проверка идёт, заказы оформляются на '
      'вас как на частное лицо.';

  @override
  String get companyApprovedNote =>
      'Заказы оформляются на организацию: в документах — название и БИН '
      'компании, к заказу выпускается акт.';

  @override
  String get companyRejectedNote =>
      'Исправьте реквизиты по замечанию менеджера, приложите нужные документы '
      'и подайте заявку снова — она вернётся на проверку.';

  @override
  String get companyRejectedNoteMember =>
      'Заявку правит администратор компании — обратитесь к нему или напишите '
      'ассистенту.';

  @override
  String get companyRejectionReasonLabel => 'Причина отказа';

  @override
  String companyBinValue(String bin) => 'БИН $bin';

  @override
  String get companySubmittedAtLabel => 'Заявка подана';

  @override
  String get companyResubmittedAtLabel => 'Подана повторно';

  @override
  String get companyRoleLabel => 'Ваша роль';

  @override
  String get companyRoleAdmin => 'Администратор компании';

  @override
  String get companyRoleMember => 'Сотрудник';

  @override
  String get companyDocumentsTitle => 'Приложенные документы';

  @override
  String get companyNoDocuments => 'Документы не приложены';

  @override
  String get companyDocumentOpenError => 'Не удалось открыть документ';

  @override
  String get companyOrderInChat => 'Оформить заказ в чате';

  @override
  String get companyOpenChat => 'Написать ассистенту';

  @override
  String get companyResubmitTitle => 'Исправить и подать снова';

  @override
  String get companyResubmitIntro =>
      'Проверьте реквизиты, приложите документы, которые просил менеджер, — '
      'заявка снова встанет в очередь на проверку.';

  @override
  String get companyResubmitSubmit => 'Подать снова';

  @override
  String get companyResubmitted => 'Заявка снова на проверке';

  @override
  String get companyAddDocumentsTitle => 'Догрузить документы';

  @override
  String get companyAddDocumentsIntro =>
      'Приложите документы к поданной заявке — статус проверки при этом не '
      'меняется.';

  @override
  String get companyAddDocumentsSubmit => 'Отправить документы';

  @override
  String get companyDocumentsSent => 'Документы отправлены';

  @override
  String companyDocumentsSlots(int free) {
    // Русское склонение: можно приложить ещё 1 файл; 2–4 файла; 5, 0 — файлов.
    final mod10 = free % 10;
    final mod100 = free % 100;
    final word = (mod100 >= 11 && mod100 <= 14)
        ? 'файлов'
        : mod10 == 1
        ? 'файл'
        : (mod10 >= 2 && mod10 <= 4)
        ? 'файла'
        : 'файлов';
    return 'Можно приложить ещё $free $word';
  }

  @override
  String get companyDocumentsLimitNote =>
      'Приложены все 4 документа — больше файлов заявка не принимает. Если '
      'нужен ещё один, напишите ассистенту.';

  @override
  String get companyErrorTooManyFiles =>
      'Можно приложить не больше 4 файлов — лишние не добавлены';

  @override
  String get companyErrorFileTooLarge =>
      'Файл больше 3 МБ — приложите файл поменьше';

  @override
  String get companyErrorUnsupportedType =>
      'Подходят только файлы PDF, JPG и PNG';

  @override
  String get companyErrorRejected =>
      'Заявку не приняли. Проверьте название и БИН: возможно, компания с '
      'таким БИН уже зарегистрирована или вы уже состоите в компании.';

  @override
  String get companyErrorNothingToUpdate =>
      'Менять нечего: исправьте реквизиты или приложите хотя бы один документ.';

  @override
  String get companyErrorUpdateRejected =>
      'Правку не приняли. Проверьте название и БИН: у одобренной компании '
      'реквизиты менять нельзя, а документов у заявки не больше четырёх.';

  @override
  String get companyErrorNetwork =>
      'Нет связи с сервером. Проверьте интернет и повторите.';

  @override
  String get companyErrorUnknown =>
      'Не удалось отправить заявку. Попробуйте ещё раз.';
}
