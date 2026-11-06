// Канонический словарь (форма Messages). ru/kk обязаны соответствовать этой
// структуре (типизируются как Messages). Расширяется по мере локализации экранов.
export const en = {
  common: {
    phoneIncomplete: "Enter the full number: +7 and 10 more digits",
    addressMap: {
      pointOnly: "Point marked — tap the building to fill in the address, or use the search",
      search: "Find on the map: street, house or complex",
      hint: "Tap your building on the map or find the address with the search",
      myLocation: "My location",
      detecting: "Finding the address…",
      notFound: "No address at this point — move the map or type the address below",
      outside: "This point is outside the Astana delivery area",
      failed: "The map is not responding — type the address instead",
      geoDenied: "No access to your location — find the address by search or on the map",
      title: "Address on the map",
    },
    language: "Language",
    theme: "Colour theme",
    edit: "Edit",
    close: "Close",
    pageNotFound: "Page not found",
    pageNotFoundDesc: "The page you tried to access does not exist.",
    cartNotFoundDesc:
      "The cart you tried to access does not exist. Clear your cookies and try again.",
    goToFrontpage: "Go to frontpage",
    // Подпись зачёркнутой цены позиции (line-item-price / line-item-unit-price).
    originalPrice: "Original:",
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
    qrStep1: "Open the Kaspi.kz app",
    qrStep2: "Tap «Kaspi QR» and point the camera at the code",
    qrStep3: "Confirm the payment",
    // Тестовая оплата — только при сборке с NEXT_PUBLIC_KASPI_MOCK=true
    // (lib/feature-flags.ts), на проде кнопки нет.
    mockPay: "Pay in test mode (Kaspi mock)",
    mockPaying: "Paying…",
    mockPayError: "Test payment failed",
  },
  // Способы оплаты продавца (Kaspi QR, перевод на номер Kaspi, «в долг»):
  // шаг оформления, страницы заказа и карточка оплаты в чате. Комментарий к
  // переводу «Заказ №N» в словарь не входит — его ищет продавец, он одинаков
  // во всех языках (`lib/util/payment-transfer.ts`).
  payment: {
    methods: {
      kaspi_qr: {
        title: "Kaspi QR",
        description: "Pay in the Kaspi app via QR code or button",
      },
      kaspi_transfer: {
        title: "Transfer to Kaspi",
        description:
          "Transfer to the seller's number after placing the order; the order goes into work once the seller sees the transfer",
      },
      debt: {
        title: "Pay later",
        description:
          "A request to the seller: they decide when confirming the order, term — {days} days",
        limit: "Up to {amount}",
      },
    },
    // Почему способ недоступен (код `reason` бэкенда).
    unavailable: {
      disabled: "The seller doesn't accept this method",
      kaspi_not_connected: "The seller hasn't connected Kaspi yet",
      transfer_no_phone: "The seller hasn't set a number for transfers",
      debt_over_limit: "The amount exceeds the seller's limit for paying later",
    },
    loadError: "Couldn't load payment methods. Refresh the page.",
    noMethods: "The seller hasn't set up payment methods yet.",
    // Свёрнутый шаг оплаты: что будет дальше.
    summary: {
      kaspi_qr: "QR code and Kaspi link on the next step",
      kaspi_transfer:
        "The number to transfer to appears after placing the order",
      debt: "The seller decides when confirming the order",
    },
    // Шаг подтверждения для перевода и долга.
    review: {
      toPay: "Amount due",
      transferHint:
        "After you place the order we'll show the seller's Kaspi number and the comment for the transfer. The order goes into work once the seller sees the transfer.",
      debtHint:
        "The seller will get a request to pay later: they'll approve it with a due date or cancel the order when confirming it.",
      placeOrder: "Place order",
      requestDebt: "Send the pay-later request",
    },
    status: {
      awaiting: "Awaiting payment",
      awaitingTransfer: "Waiting for the transfer",
      debt_requested: "Awaiting the seller's decision",
      debt: "Pay later",
      overdue: "Overdue",
      paid: "Paid",
      canceled: "Canceled",
      refund_due: "Refund pending",
      refunded: "Refunded",
      chosen: "Method selected",
    },
    transfer: {
      howTo: "How to transfer in Kaspi",
      steps: [
        "Kaspi → Transfers → By phone number",
        "Paste the number and amount, add the comment «{comment}»",
        "Send it and attach the receipt below",
      ],
      amount: "Amount to transfer",
      phone: "Seller's Kaspi number",
      recipient: "Recipient",
      comment: "Transfer comment",
      note: "Seller's note",
      copy: "Copy",
      copied: "Copied",
      inWork: "The order goes into work once the seller sees the transfer.",
      afterOrder:
        "The number to transfer to will appear after the order is placed.",
      repay: "Repay by transfer to the seller's Kaspi number:",
    },
    debt: {
      requestSent:
        "The pay-later request has been sent to the seller — they'll decide when confirming the order.",
      requestWillGo:
        "The request will go to the seller — they'll decide when confirming the order.",
      approved: "The seller has agreed to let you pay later.",
      dueBy: "Repay by {date}",
      overdue: "Repayment was due {date}",
    },
    order: {
      toPay: "To pay",
      paidBand: "Payment received",
      title: "Payment",
      method: "Method",
      bonus: "Bonuses",
      amount: "Order amount",
      paid: "Paid",
      outstanding: "Left to pay",
      paidFull: "The order is paid.",
      canceled: "Payment canceled.",
      refundDue: "The seller will refund {amount}.",
      refunded: "{amount} has been refunded.",
      openOrder: "Open order {id}",
      change: "Change payment method",
      changeTitle: "Pay with",
      changeCancel: "Keep as is",
      changeFailed:
        "Could not change the payment method. Refresh the page and try again.",
      receipt: {
        title: "Payment receipt",
        hint: "Sent the transfer? Attach the Kaspi receipt (screenshot or PDF) so the seller finds your payment faster.",
        send: "Attach Kaspi receipt",
        sending: "Checking the receipt…",
        tooBig: "The file is over 8 MB — send a screenshot of the receipt.",
        wrongType: "Send a screenshot (JPG, PNG) or a PDF of the receipt.",
        failed: "Could not send the receipt. Please try again.",
        status: {
          pending: "Receipt is being checked by the seller",
          flagged: "The receipt did not pass the check",
          accepted: "Receipt accepted",
          rejected: "Receipt rejected by the seller",
        },
        reason: "Reason: {note}",
        chatHint:
          "Transferred? Send a screenshot of the Kaspi receipt here and I will check it right away.",
      },
      changeHint: {
        kaspi_qr: "A Kaspi invoice with QR right on this page",
        kaspi_transfer: "Transfer to the seller's Kaspi number",
        debt: "A request to the seller, decided when confirming the order",
      },
      kaspiStaticHint:
        "This is the shop's QR: on a phone the button opens payment in Kaspi, on a computer scan the QR. Enter the amount yourself, then attach the receipt below — the seller will confirm the payment.",
      kaspiStaticAmount: "Enter in Kaspi: {amount}",
      kaspiHint:
        "Pay the invoice in the Kaspi app — the order will be marked paid automatically.",
    },
    chatPick: {
      title: "How to pay",
      reply: "Payment method: {method}",
      chosen: "Chosen: {method}",
      change: "Choose another payment method",
      changeReply: "I want to choose another payment method",
    },
    chatTitle: {
      kaspi_transfer: "Transfer to Kaspi",
      debt: "Pay later",
    },
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
    goToOrder: "Go to order {id}",
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
      progress: {
        title: "Where your order is",
        now: "Your order is",
        holder: {
          seller: "with the seller",
          warehouse: "at the seller's warehouse",
          driver: "with the driver",
          buyer: "with you",
        },
        steps: {
          new: {
            title: "Placed",
            hint: "The seller is checking the order and will confirm it",
          },
          confirmed: {
            title: "Confirmed by the seller",
            hint: "Handed to the warehouse for picking",
          },
          assembling: {
            title: "Being picked",
            hint: "A picker is gathering the items",
          },
          assembled: {
            title: "Picked",
            hint: "Packed and waiting for the truck",
          },
          in_delivery: {
            title: "On the way",
            hint: "The driver is bringing your order — tell them the pickup code",
          },
          delivered: { title: "Delivered", hint: "The order is with you" },
        },
        canceled: "Order canceled",
        returned: "Order returned",
      },
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
      problem: "Something wrong with the order?",
      cancel: {
        button: "Cancel order",
        title: "Cancel order {id}?",
        hint: "The seller has not confirmed the order yet — you can cancel it right away.",
        paidWarning:
          "If you have already transferred the money, the seller will return it — message them or the chat.",
        reasonLabel: "Reason (optional)",
        reasonPlaceholder: "E.g. I chose another payment method",
        confirm: "Yes, cancel",
        keep: "Keep order",
        failed: "Could not cancel the order. Please try again.",
        later:
          "The seller has already confirmed the order — write to the chat to cancel it.",
      },
      problemLink: "Write to the chat",
      problemPrompt: "Problem with order {id}",
    },
    review: {
      title: "Rate your order",
      subtitle: "Your rating helps the seller and other buyers.",
      supplier: "Products and seller",
      delivery: "Delivery",
      commentPlaceholder: "Comment — optional",
      submit: "Send review",
      sending: "Sending…",
      thanks: "Thank you for your review",
      pickRating: "Give at least one star rating.",
      failed: "Could not send the review. Please try again.",
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
      order: "Order {id}",
    },
    profile: {
      title: "Profile",
      subtitle: "Name, phone and delivery addresses.",
      name: "Name",
      phone: "Phone",
      addresses: "Delivery addresses",
      personal: "Personal details",
      fullName: "Full name",
      apartment: "apt. {value}",
      defaultAddress: "Default",
      makeDefault: "Make default",
      onMap: "Pinned on the map",
      emptyAddresses: "No addresses yet. Add one so you don't have to type it at checkout.",
      recipient: "Recipient",
    },
  },
  order: {
    itemsTitle: "Order items",
    positions: "{count} items",
    shippingFree: "Free",
    address: "Address",
    phone: "Phone",
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
    slots: {
      title: "When to deliver",
      other: "Another date",
      pickDay: "Choose a day",
      pickWindow: "Choose a time",
      back: "Back to the nearest",
      today: "Today",
      tomorrow: "Tomorrow",
      reply: "Delivery: {slot}",
      hint: "We deliver in three time windows within a week.",
    },
    deliveryForm: {
      title: "Delivery details",
      description: "Fill in what is missing — or just type it in the chat.",
      firstName: "First name",
      lastName: "Last name",
      phone: "Contact phone for the courier",
      address: "Street, building, apartment",
      addressHint: "Delivery within Astana",
      save: "Save",
      saving: "Saving…",
      saved: "Saved to your profile",
      required: "Fill in: {fields}",
      failed: "Could not save. Please try again.",
      reply: "My delivery details: {name}, {address}",
    },
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
      checkout: "Check out",
      checkoutReply: "Place the order",
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
      title: "Documents for order {id}",
      fallbackTitle: "Order documents",
      open: "Open PDF",
      pending: "file is being prepared",
      hint: "Files open in a new tab — save them for your records.",
    },
    order: {
      number: "Order {id}",
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
  tenant: {
    seller: "Seller",
    bin: "BIN",
    address: "Address",
    phone: "Phone",
    email: "Email",
    heroTitle: "Building materials from {name}",
    heroText:
      "Tell the AI assistant what you are building — it will pick the materials, calculate the quantity and place the order with delivery.",
    openChat: "Open the assistant",
    cabinet: "My orders",
    delivery: "Delivery within Astana — {price}",
    deliveryUnknown:
      "Delivery within Astana — the price is shown in the invoice",
    paymentNote:
      "Payment via Kaspi QR. Invoice and waybill are issued automatically.",
    requisites: "Company details",
    badge: "Seller on the StroyMarket platform · Astana",
    deliveryText:
      "Delivery from the company warehouse across Astana is run by the platform dispatch: a vehicle sized for the order, parking access, crane unloading.",
    city: "Astana",
    warehouse: "Warehouse: {name}",
    call: "Call",
    whatsapp: "WhatsApp",
    whatsappGreeting:
      "Hello! I am writing from the {name} page on StroyMarket.",
    menu: "Menu",
    navMore: {
      assortment: "Products",
      calculator: "Calculator",
      delivery: "Delivery",
    },
    stats: {
      inStock: "items in stock",
      delivery: "delivery within Astana",
      updated: "stock updated",
      kaspi: "or a bank transfer invoice with e-invoice",
    },
    chat: {
      title: "{name} consultant",
      subtitle: "AI consultant · Astana",
      example: "Sample estimate",
      question:
        "I need to line a wall with drywall, 18 m². What should I take and how much is it with delivery?",
      answerNote: "Frame and boards with a 10% margin — all in stock",
      units: { sheet: "{n} boards", piece: "{n} pcs", pack: "{n} pack" },
      materials: "Materials",
      delivery: "Delivery within Astana",
      total: "Total",
      order: "Place this order in chat",
      orderPrompt:
        "I want to line a wall with drywall, 18 m². Put together an order: {lines}. With delivery within Astana.",
      fallback:
        "I'll pick materials from the warehouse stock and work out the quantities and the total with delivery.",
      livePrices: "Today's prices and stock",
    },
    showcase: {
      tag: "Products",
      title: "What is in the warehouse now",
      text: "Platform prices and the company warehouse stock right now. Can't find what you need — ask the assistant, it will check availability on order.",
      inStock: "In stock: {qty}",
      onOrder: "On order",
      from: "from {price}",
      order: "Order",
      orderPrompt:
        "I want to order “{title}”. Help me calculate the quantity and arrange delivery.",
      all: "Full range — ask the assistant",
      allPrompt:
        "Show me what {name} has in stock and help me put an order together.",
      empty:
        "The company catalog is empty for now — the assistant will tell what can be delivered on order.",
    },
    cta: {
      title: "We will calculate materials for your site",
      text: "Describe the job to the assistant or message the company manager on WhatsApp — and get an invoice with delivery.",
      chat: "Calculate with the assistant",
    },
    footer: {
      contacts: "Contacts",
      sections: "Sections",
      platform:
        "Orders, payment and documents go through the StroyMarket platform.",
    },
    nav: {
      process: "How to order",
      transparency: "Accounting",
      requisites: "Details",
    },
    facts: {
      kaspi: "Kaspi QR or a bank invoice with an e-invoice",
      documents: "Invoice and waybill are issued automatically",
      code: "Acceptance on site by the pickup code",
    },
    transparency: {
      tag: "Live warehouse",
      title: "{name} warehouse and orders in numbers",
      text: "Updated automatically: incoming stock, what is on hand, shipments and vehicles en route. All figures are real — no rounding, no samples.",
      panelTitle: "Company warehouse accounting",
      live: "Live data",
      noLocations: "The company warehouse is not connected yet",
      inflow: "Received in {days} days",
      inflowReceipts: "{count} deliveries",
      stock: "Items in stock",
      stockOf: "{inStock} of {skus}",
      shipped: "Shipped in {days} days",
      shippedValue: "{count} orders",
      delivered: "delivered: {count}",
      drivers: "Vehicles on the road",
      driversValue: "{count} now",
      log: "Movement log (latest events)",
      updated: "updated {time}",
      empty:
        "No events yet — the log fills up with the first receipt or order.",
      receipt: "Received: {title} — {quantity} {unit}",
      receiptMore: " and {count} more",
      receiptUntitled: "untitled item",
      posted: "Posted",
      privacy: "Buyers, addresses and amounts are not shown in the summary.",
      unavailable:
        "The summary is temporarily unavailable — check back a bit later.",
    },
    prompts: {
      screed: "Calculate materials for a 40 m² floor screed",
      plaster: "What do I need to plaster 60 m² of walls?",
      delivery: "When can you deliver an order?",
    },
  },
}

export type Messages = typeof en
