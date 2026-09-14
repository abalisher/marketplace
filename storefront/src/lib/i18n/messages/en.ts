// Канонический словарь (форма Messages). ru/kk обязаны соответствовать этой
// структуре (типизируются как Messages). Расширяется по мере локализации экранов.
export const en = {
  common: {
    language: "Language",
    theme: "Colour theme",
    edit: "Edit",
    close: "Close",
    pageNotFound: "Page not found",
    pageNotFoundDesc: "The page you tried to access does not exist.",
    cartNotFoundDesc:
      "The cart you tried to access does not exist. Clear your cookies and try again.",
    goToFrontpage: "Go to frontpage",
    address: {
      firstName: "First name",
      lastName: "Last name",
      company: "Company",
      address: "Address",
      apartment: "Apartment, suite, etc.",
      postalCode: "Postal code",
      city: "City",
      province: "State / Province",
      country: "Country",
      phone: "Phone",
      email: "Email",
      billingSameAsShipping: "Billing address same as shipping address",
      validEmail: "Enter a valid email address.",
    },
    // Слот доставки (T5.6a): подпись строки и короткие месяцы для
    // «6 Sep, 13:00–17:00». Часы окон — в `lib/util/delivery-slot.ts`.
    deliverySlot: {
      title: "Delivery",
      months: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
    },
  },
  cart: {
    totals: {
      subtotal: "Subtotal (excl. shipping and taxes)",
      shipping: "Shipping",
      discount: "Discount",
      bonuses: "Bonuses",
      taxes: "Taxes",
      total: "Total",
    },
    title: "Cart",
    summary: "Summary",
    goToCheckout: "Go to checkout",
    emptyDescription:
      "You don't have anything in your cart. Let's change that, use the link below to start browsing our products.",
    exploreProducts: "Explore products",
    signInTitle: "Already have an account?",
    signInSubtitle: "Sign in for a better experience.",
    signIn: "Sign in",
    columns: {
      item: "Item",
      quantity: "Quantity",
      price: "Price",
      total: "Total",
    },
    remove: "Remove",
    subtotal: "Subtotal",
    exclTaxes: "(excl. taxes)",
    goToCart: "Go to cart",
    emptyBag: "Your shopping bag is empty.",
  },
  nav: {
    account: "Account",
    orders: "Orders",
    menu: "Menu",
    home: "Home",
    store: "Catalogue",
  },
  home: {
    heroTitle: "Basic building materials in Astana",
    heroSubtitle:
      "Finishing materials, electrical, plumbing and fasteners — delivered or picked up from our Astana warehouse",
    goToCatalogue: "Go to catalogue",
    popular: "Popular products",
    wholeCatalogue: "Whole catalogue →",
  },
  // Подписи переключателя темы (ключи = значения Theme из lib/theme/config).
  theme: {
    system: "Auto",
    light: "Light",
    dark: "Dark",
  },
  footer: {
    categories: "Categories",
    collections: "Collections",
    allRightsReserved: "All rights reserved.",
  },
  store: {
    allProducts: "All products",
    sort: {
      title: "Sort by",
      latest: "Latest Arrivals",
      priceAsc: "Price: Low -> High",
      priceDesc: "Price: High -> Low",
    },
  },
  product: {
    addToCart: "Add to cart",
    outOfStock: "Out of stock",
    selectVariant: "Select variant",
    demoProductCreated: "Your demo product was successfully created! 🎉",
    continueSetupPrompt:
      "You can now continue setting up your store in the admin.",
    continueSetupButton: "Continue setup in admin",
    relatedProducts: "Related products",
    relatedSubtitle: "You might also want to check out these products.",
    tabs: {
      info: "Product Information",
      shippingReturns: "Shipping & Returns",
    },
    info: {
      material: "Material",
      countryOfOrigin: "Country of origin",
      type: "Type",
      weight: "Weight",
      dimensions: "Dimensions",
    },
    shipping: {
      fastDelivery: "Fast delivery",
      fastDeliveryDesc:
        "Your package will arrive in 3-5 business days at your pick up location or in the comfort of your home.",
      simpleExchanges: "Simple exchanges",
      simpleExchangesDesc:
        "Is the fit not quite right? No worries - we'll exchange your product for a new one.",
      easyReturns: "Easy returns",
      easyReturnsDesc:
        "Just return your product and we'll refund your money. No questions asked – we'll do our best to make sure your return is hassle-free.",
    },
  },
  checkout: {
    addresses: {
      shippingTitle: "Shipping Address",
      savedPrompt: "Hi {name}, do you want to use one of your saved addresses?",
      billingTitle: "Billing address",
      continueToDelivery: "Continue to delivery",
      contact: "Contact",
      sameBillingNote: "Billing and delivery address are the same.",
    },
    bonus: {
      payWithBonuses: "Pay with bonuses",
      available: "available",
      apply: "Apply",
      invalidAmount: "Enter a whole positive amount",
      applied: "Bonuses applied:",
      remove: "Remove bonuses from order",
    },
    payment: {
      title: "Payment",
      giftCard: "Gift card",
      selectMethod: "Select a payment method",
      canceled: "canceled",
      declined: "declined",
      paymentFailed:
        "Payment was {status}. Go back to the Payment step to try again.",
      placingOrder: "Placing order",
      paymentReceived: "Payment received",
      waitingForPayment: "Waiting for payment",
      enterCardDetails: "Enter card details",
      continueToReview: "Continue to review",
      methodLabel: "Payment method",
      detailsLabel: "Payment details",
      anotherStep: "Another step will appear",
    },
    shipping: {
      title: "Delivery",
      store: "Store",
      methodLabel: "Shipping method",
      howDelivered: "How would you like your order delivered?",
      pickUpYourOrder: "Pick up your order",
      chooseStore: "Choose a store near you",
      continueToPayment: "Continue to payment",
    },
    review: {
      title: "Review",
      terms:
        "By clicking the Place Order button, you confirm that you have read, understand and accept the Terms of Use, Terms of Sale and Returns Policy and acknowledge that you have read the Privacy Policy.",
    },
    promo: {
      addCodes: "Add Promotion Code(s)",
      applied: "Promotion(s) applied:",
      removeCode: "Remove discount code from order",
    },
  },
  // Общий блок счёта Kaspi (вставка чата и шаг оформления) — см.
  // `modules/common/components/kaspi-pay-panel`.
  kaspiPay: {
    payInApp: "Pay in Kaspi",
    shareLink: "Send the payment link",
    copyLink: "Copy the payment link",
    linkCopied: "Link copied",
    showQr: "Pay from another device",
    hideQr: "Hide the QR code",
    scanQr: "Scan the QR code in the Kaspi.kz app",
  },
  account: {
    phone: {
      title: "Sign in",
      subtitle: "Enter your phone number — we will text you a one-time code.",
      phoneLabel: "Phone number",
      phoneHint: "Kazakhstan mobile number, e.g. +7 701 234 56 78.",
      requestCode: "Get the code",
      codeSubtitle: "We sent a code to {phone}. Enter it below.",
      codeLabel: "Code from the text message",
      signIn: "Sign in",
      resend: "Send the code again",
      resendIn: "You can resend the code in {seconds} s",
      changePhone: "Change the number",
      devCode: "Stand: there is no SMS provider yet, your code is {code}",
      emailLogin: "Sign in with email instead",
      backToPhone: "Sign in with a phone number",
      errorPhone: "Enter a Kazakhstan mobile number: +7 701 234 56 78.",
      errorTooManyRequests:
        "The code has already been sent — wait for the timer.",
      errorCode: "Wrong code. Check the text message and try again.",
      errorExpired: "The code has expired — request a new one.",
      errorAttempts: "Too many attempts. Request a new code.",
      errorUnknown: "Could not sign in. Try again in a moment.",
    },
    welcomeBack: "Welcome back",
    loginSubtitle: "Sign in to access an enhanced shopping experience.",
    signIn: "Sign in",
    notAMember: "Not a member?",
    joinUs: "Join us",
    registerTitle: "Become a СтройМаркет Member",
    registerSubtitle:
      "Create your СтройМаркет Member profile, and get access to an enhanced shopping experience.",
    password: "Password",
    byCreatingAccount: "By creating an account, you agree to СтройМаркет's",
    privacyPolicy: "Privacy Policy",
    and: "and",
    termsOfUse: "Terms of Use",
    join: "Join",
    alreadyMember: "Already a member?",
    account: "Account",
    hello: "Hello {name}",
    profile: "Profile",
    addresses: "Addresses",
    orders: "Orders",
    logout: "Log out",
    overview: "Overview",
    company: {
      nav: "Company",
      title: "Company",
      subtitle:
        "Register your organisation to order on its behalf — with an invoice, a waybill and a certificate of completion.",
      subtitleExisting:
        "Orders are placed on behalf of the company as soon as it is approved.",
      name: "Organisation name",
      bin: "BIN",
      binHint: "12 digits, as in the certificate of registration.",
      documents: "Incorporation documents",
      documentsHint:
        "PDF or photo — up to {count} files, 3 MB each. Optional: the moderator will ask if anything is missing.",
      submit: "Submit application",
      statusPending: "In review",
      statusApproved: "Approved",
      statusRejected: "Rejected",
      pendingNote:
        "The application is in review. Until it is approved, orders are placed as an individual — the invoice is still issued.",
      approvedNote:
        "The company is approved. Orders you place in the chat go to the organisation: invoice, waybill and the internal certificate of completion are issued for it.",
      rejectedNote:
        "The application was rejected. Correct the details below and submit it again — orders are placed as an individual in the meantime.",
      rejectionReason: "Reason",
      binShort: "BIN",
      appliedAt: "Applied on",
      resubmittedAt: "Resubmitted on",
      resubmitTitle: "Correct and submit again",
      resubmitHint:
        "Fix the requisites or attach the missing documents — the application goes back to review.",
      resubmitSubmit: "Submit again",
      addDocumentsTitle: "Attach documents",
      addDocumentsHint:
        "Attach the missing files — the moderator will see them in the application.",
      addDocumentsSubmit: "Send documents",
      documentsRemainingHint:
        "PDF or photo, up to 3 MB each — {count} more file(s) can be attached.",
      documentsLimitReached:
        "All 4 document slots are taken — write to us if another file is needed.",
      roleLabel: "Your role",
      roleAdmin: "Company administrator",
      roleMember: "Company employee",
      attachedDocuments: "Attached documents",
      noDocuments: "No documents attached.",
      goToChat: "Order in the chat",
      support: "Contact us",
      overviewEmpty: "No organisation registered",
      overviewRegister: "Register a company",
      errors: {
        unauthenticated: "Please sign in to register a company.",
        nameRequired: "Enter the organisation name.",
        binInvalid: "The BIN must be exactly 12 digits.",
        binTaken:
          "A company with this BIN is already registered. Contact us if it is yours.",
        tooManyDocuments: "Attach at most 4 files.",
        documentTooLarge: "Each file must be at most 3 MB.",
        documentTypeNotSupported: "Attach a PDF or a photo (JPEG, PNG).",
        submitFailed: "Could not submit the application. Please try again.",
        nothingToUpdate: "Attach a file or change the requisites first.",
        tooManyDocumentsTotal:
          "A company keeps at most 4 documents — some are already attached.",
        requisitesLocked:
          "The requisites of an approved company cannot be changed — please contact us.",
        updateFailed: "Could not send the changes. Please try again.",
      },
    },
    signedInAs: "Signed in as:",
    completed: "Completed",
    saved: "Saved",
    recentOrders: "Recent orders",
    datePlaced: "Date placed",
    orderNumber: "Order number",
    totalAmount: "Total amount",
    goToOrder: "Go to order #{id}",
    noRecentOrders: "No recent orders",
    cancel: "Cancel",
    saveChanges: "Save changes",
    updatedSuccessfully: "updated succesfully",
    errorOccurred: "An error occurred, please try again",
    name: "Name",
    passwordNotShown: "The password is not shown for security reasons",
    oldPassword: "Old password",
    newPassword: "New password",
    confirmPassword: "Confirm password",
    passwordUpdateNotImplemented: "Password update is not implemented",
    noBillingAddress: "No billing address",
    billingAddress: "Billing address",
    newAddress: "New address",
    addAddress: "Add address",
    editAddress: "Edit address",
    provinceState: "Province / State",
    save: "Save",
    remove: "Remove",
    itemsUnit: "items",
    more: "more",
    seeDetails: "See details",
    noOrdersTitle: "Nothing to see here",
    noOrdersDescription: "You don't have any orders yet, let us change that :)",
    continueShopping: "Continue shopping",
    gotQuestions: "Got questions?",
    faqText:
      "You can find frequently asked questions and answers on our customer service page.",
    customerService: "Customer Service",
    shippingAddresses: "Shipping Addresses",
    shippingAddressesDesc:
      "View and update your shipping addresses, you can add as many as you like. Saving your addresses will make them available during checkout.",
    profileDesc:
      "View and update your profile information, including your name, email, and phone number. You can also update your billing address, or change your password.",
    ordersDesc:
      "View your previous orders and their status. You can also create returns or exchanges for your orders if needed.",
  },
  // Кабинет клиента (T10.6): заказы, корзина, документы и профиль рядом с
  // историей диалогов.
  cabinet: {
    title: "My account",
    signOut: "Sign out",
    nav: {
      orders: "Orders",
      cart: "Cart",
      documents: "Documents",
      profile: "Profile",
    },
    guest: {
      title: "Sign in to see your orders",
      description:
        "Orders, documents and the current cart are tied to your phone number.",
      action: "Sign in by phone",
    },
    orders: {
      title: "Orders",
      subtitle: "Everything you have ordered, newest first.",
      empty: "No orders yet",
      emptyHint:
        "Tell the assistant what you are building — the order will show up here.",
      items: "{count} items",
      open: "Open order",
      toChat: "Ask the assistant",
    },
    order: {
      back: "All orders",
      notFound: "Order not found",
      placed: "Placed",
      delivery: "Delivery",
      method: "Method",
      methodPickup: "Pickup",
      methodDelivery: "Delivery to address",
      code: "Pickup code",
      codeHint: "Give this code to the driver when you receive the order.",
      documentsEmpty: "Documents will appear once the order is processed.",
    },
    cart: {
      title: "Cart",
      subtitle: "What the assistant has collected so far.",
      empty: "The cart is empty",
      emptyHint:
        "Describe the job in the chat — the assistant will put materials here.",
      continue: "Continue in the chat",
      total: "Total",
      quantity: "Qty",
    },
    documents: {
      title: "Documents",
      subtitle: "Invoices, waybills and acts for all of your orders.",
      empty: "No documents yet",
      emptyHint: "A document appears once an order is placed.",
      order: "Order #{id}",
    },
    profile: {
      title: "Profile",
      subtitle: "Name, phone and delivery addresses.",
      name: "Name",
      phone: "Phone",
      addresses: "Delivery addresses",
    },
  },
  order: {
    orderSummary: "Order Summary",
    summary: "Summary",
    itemsTotal: "Items",
    needHelp: "Need help?",
    contact: "Contact",
    returnsExchanges: "Returns & Exchanges",
    method: "Method",
    paidAt: "paid at",
    thankYou: "Thank you!",
    orderPlacedSuccess: "Your order was placed successfully.",
    confirmationSent: "We have sent the order confirmation details to",
    orderDate: "Order date",
    orderNumber: "Order number",
    orderStatus: "Order status",
    paymentStatus: "Payment status",
    orderDetails: "Order details",
    backToOverview: "Back to overview",
    // Статусы ядра Medusa человеческим языком: покупателю нельзя показывать
    // «Not fulfilled»/«Authorized» — незнакомый ему технический словарь.
    fulfillmentStatus: {
      not_fulfilled: "Not picked yet",
      partially_fulfilled: "Partially picked",
      fulfilled: "Picked",
      partially_shipped: "Partially shipped",
      shipped: "Shipped",
      partially_delivered: "Partially delivered",
      delivered: "Delivered",
      canceled: "Canceled",
    },
    paymentStatusValue: {
      not_paid: "Not paid",
      awaiting: "Awaiting payment",
      authorized: "Paid",
      partially_authorized: "Partially paid",
      captured: "Paid",
      partially_captured: "Partially paid",
      partially_refunded: "Partially refunded",
      refunded: "Refunded",
      canceled: "Canceled",
      requires_action: "Needs action",
    },
    // Закрывающие документы заказа (для юрлиц — счёт и АВР).
    documents: {
      title: "Documents",
      download: "Download PDF",
      preparing: "Being prepared…",
      type: {
        invoice: "Invoice",
        waybill: "Waybill",
        internal_avr: "Acceptance certificate",
      },
    },
    transferSuccess: "Order transferred successfully!",
    transferDeclined: "Order transfer declined successfully!",
    acceptTransfer: "Accept transfer",
    declineTransfer: "Decline transfer",
    testOrderCreated: "Your test order was successfully created! 🎉",
    completeSetupPrompt:
      "You can now complete setting up your store in the admin.",
    completeSetupButton: "Complete setup in admin",
  },
  assistant: {
    navLink: "Assistant",
    title: "Assistant",
    greeting: "How can I help on site?",
    inputPlaceholder: "Write a message…",
    send: "Send",
    typing: "Typing…",
    error: "Couldn't get a reply. Check your connection and try again.",
    retry: "Retry",
    reset: "New chat",
    // Примеры-подсказки на пустом экране (1a): текст чипа отправляется как есть.
    examples: [
      "Line a room with drywall, 18 m²",
      "Wiring for a room: 6 sockets and lighting",
      "Run water lines in a bathroom",
    ],
    // Метка-аватар ответа ассистента (эталон Gemini, бриф T10.1a).
    mark: "SM",
    // Локальная история диалогов и вход для юрлица.
    history: {
      empty: "No chats yet.",
      remove: "Delete chat",
      note: "Chats are stored on this device only.",
    },
    // Рельс истории по эталону Gemini (бриф T10.1a, раздел 3.1).
    rail: {
      newChat: "New chat",
      searchPlaceholder: "Search chats",
      searchEmpty: "Nothing found",
      searchClear: "Clear search",
      recent: "Recent",
      menu: "Chat actions",
      rename: "Rename",
      renameHint: "Enter to save, Esc to cancel",
      deleteTitle: "Delete this chat?",
      deleteBody:
        "The chat will be removed from this device and cannot be restored.",
      deleteConfirm: "Delete",
      cancel: "Cancel",
      collapse: "Collapse panel",
      expand: "Expand panel",
      open: "Chats",
      guest: "Guest",
    },
    // Действия на ответе ассистента (бриф T10.1a, раздел 3.4).
    turn: {
      copy: "Copy reply",
      copied: "Copied",
      regenerate: "Regenerate reply",
    },
    composer: {
      placeholder: "Describe what you need…",
      stop: "Stop generating",
      disclaimer:
        "The assistant can make mistakes — double-check quantities and prices.",
    },
    // Голосовой ввод композера (T10.3). Ошибки названы причинами, а не одним
    // «не получилось»: покупателю нужно знать, что делать дальше — разрешить
    // микрофон, открыть по https или просто набрать текст.
    voice: {
      start: "Voice input",
      finish: "Finish recording",
      cancel: "Cancel recording",
      recording: "Recording…",
      transcribing: "Transcribing…",
      errors: {
        denied:
          "No access to the microphone. Allow recording in the browser settings — or type your message.",
        unsupported:
          "This browser cannot record audio. Please type your message.",
        insecure:
          "Voice input needs a secure connection (https). Please type your message.",
        failed:
          "Could not record. Check the microphone — or type your message.",
        tooLarge: "The recording is too long. Try a shorter one.",
        empty: "Did not catch that. Try again or type your message.",
      },
    },
    // Вложения композера (T10.4b). Отказ называет причину и говорит, что
    // делать дальше.
    files: {
      attach: "Attach a photo or PDF",
      remove: "Remove attachment",
      reading: "Reading the file…",
      errors: {
        type: "The assistant cannot read this file. Send a photo (JPG, PNG, HEIC) or a PDF.",
        table:
          "Spreadsheets and Word documents are not supported yet. Take a photo of the sheet or dictate the items.",
        tooLarge: "The file is over 8 MB. Send a smaller photo.",
        turnTooLarge:
          "The attachments do not fit: over 12 MB together. Remove one file.",
        tooMany: "You can attach up to three files at a time.",
        failed: "Could not read the file. Try picking it again.",
      },
    },
    legalEntity: {
      // Ведёт в раздел «Компания» аккаунта: там и заявка, и статус модерации.
      company: "Company",
    },
    // Read-only вставки в ленте (1b/1c).
    auth: {
      title: "Sign in to place the order",
      description:
        "Sign in with your phone number — the code arrives by SMS. Your cart is kept, nothing to redo.",
      action: "Sign in with phone",
      loggedInReply: "I have signed in, let's continue",
    },
    attachment: {
      payment: "Payment",
      orderStatus: "Order",
    },
    product: {
      // Счётчик в полосе корзины (T10.15) — метки для screen-reader'ов.
      add: "Add",
      increase: "Add one more: {title}",
      decrease: "Remove one: {title}",
      quantity: "Quantity: {title}",
    },
    cart: {
      title: "Cart",
      expand: "Show cart",
      collapse: "Hide cart",
      // Видимые подписи кнопки полосы (T10.19): стрелка без слова на демо не
      // читалась как «здесь можно поменять количество».
      edit: "Edit",
      done: "Done",
      error: "Could not update the cart. Please try again.",
      added: "Added to cart: {title} × {quantity}",
      removed: "Removed from cart: {title}",
    },
    payment: {
      title: "Kaspi payment",
      waiting: "Waiting for payment",
      paid: "Paid",
      // Reply the client sends itself once polling sees the payment.
      paidReply: "I have paid",
      failed: "Payment failed",
      statusError: "Couldn't refresh the payment status.",
      refresh: "Refresh",
      amount: "Amount",
    },
    documents: {
      title: "Documents for order #{id}",
      fallbackTitle: "Order documents",
      open: "Open PDF",
      pending: "file is being prepared",
      hint: "Files open in a new tab — save them for your records.",
    },
    order: {
      number: "Order #{id}",
      code: "Pickup code",
      open: "Open order",
      stage: {
        new: "Placed",
        confirmed: "Confirmed",
        assembling: "Being picked",
        partially_assembled: "Partially picked",
        assembled: "Picked",
        in_delivery: "Out for delivery",
        delivered: "Delivered",
        closed: "Completed",
        canceled: "Canceled",
        returned: "Returned",
      },
    },
  },
}

export type Messages = typeof en
