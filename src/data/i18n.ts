import type {
  DurationFilter,
  JournalCategory,
  RegionZone,
  TourCategory,
} from './travelData';

export type Language = 'vi' | 'en';

export const UI_COPY = {
  vi: {
    pageTitle: 'Mây Lang Thang – Đi chậm, sống nhiều | Tour Du Lịch & Trải Nghiệm Bản Địa',
    metaDescription:
      'Đi chậm, sống nhiều. Khám phá tour du lịch tinh tế, du thuyền Hạ Long, đèo Mã Pí Lèng, phố cổ Hội An, Đà Lạt, Phú Quốc và Sapa cùng 120 hướng dẫn viên bản địa.',
    nav: {
      destinations: 'Điểm đến',
      tours: 'Tour',
      experiences: 'Trải nghiệm',
      journal: 'Nhật ký',
      process: 'Cách đặt',
      faq: 'Hỏi đáp',
      bookCta: 'Đặt tour',
      bookMobile: 'Đặt tour ngay',
      openMenu: 'Mở menu điều hướng',
      closeMenu: 'Đóng menu',
      toDark: 'Chuyển sang giao diện tối',
      toLight: 'Chuyển sang giao diện sáng',
      adminPortal: 'Trang quản trị',
    },
    hero: {
      scrollLabel: 'Cuộn xuống',
      scrollAria: 'Cuộn xuống để tìm kiếm tour',
      pauseVideo: 'Tạm dừng video nền',
      playVideo: 'Phát video nền',
      videoCaption: 'Thước phim Việt Nam',
    },
    search: {
      destination: 'Điểm đến',
      allDestinations: (count: number) => `Tất cả (${count} nơi)`,
      category: 'Kiểu chuyến đi',
      allCategories: 'Mọi loại hình',
      duration: 'Thời lượng',
      allDurations: 'Mọi thời lượng',
      date: 'Ngày khởi hành',
      guests: 'Số khách',
      guestOptions: ['1 khách', '2 khách', '3–5 khách', '6+ khách (nhóm riêng)'],
      submit: 'Tìm tour',
    },
    intro: {
      eyebrow: 'Triết lý Mây Lang Thang',
      heading: 'Không vội vã qua những miền đất đẹp.',
      p1: 'Thay vì nhồi nhét sáu điểm đến trong hai ngày, chúng tôi thiết kế từng hành trình để bạn kịp nghe tiếng gà gáy trong sương Sapa, kịp ngồi uống tách trà nóng với người dân Hà Giang và nhớ rõ hương vị bữa cơm vườn rau ở Hội An.',
      p2: 'Mỗi đoàn luôn giới hạn tối đa 8–10 khách, đi cùng hướng dẫn viên sinh ra và lớn lên ngay tại vùng đất đó — những người biết con đường nhỏ nào vắng người và quán ăn nào ngon từ đời ông bà.',
    },
    destinations: {
      eyebrow: 'Điểm đến nổi bật',
      heading: 'Mười bảy miền nhớ trải dọc ba miền',
      prevAria: 'Xem điểm đến trước',
      nextAria: 'Xem điểm đến tiếp theo',
      mapEyebrow: 'Bản đồ hành trình Việt Nam',
      mapHeading: 'Chạm vào một tọa độ để xem và lọc tour',
      mapSubtitle: (count: number) =>
        `Rê chuột qua ${count} điểm đến từ Bắc vào Nam để xem mùa đẹp nhất, hoặc nhấn trực tiếp vào tọa độ để cuộn xuống hành trình tương ứng.`,
      mapProjection: 'Phép chiếu Mercator · Dữ liệu từ travelData.ts',
      mapShowing: (visible: number, total: number) =>
        `Đang hiển thị ${visible}/${total} điểm đến`,
      bestSeason: 'Mùa đẹp nhất',
      coordinates: 'Tọa độ',
      featuredTourAt: (name: string) => `Hành trình tiêu biểu tại ${name}`,
      packagesCount: (count: number) => `${count} gói lựa chọn`,
      perGuest: '/ khách',
      fromPrice: 'Từ',
      viewToursAt: (name: string) => `Xem tour tại ${name}`,
      hoangSa: 'Quần đảo Hoàng Sa',
      truongSa: 'Quần đảo Trường Sa',
    },
    tours: {
      eyebrow: 'Hành trình chọn lọc',
      heading: 'Mười bảy chuyến đi vừa vặn từng nhịp thở',
      quickOptions: 'Tùy chọn nhanh:',
      allLocations: (count: number) => `Tất cả ${count} địa điểm`,
      anyDuration: 'Mọi ngày',
      clearFilters: (count: number) => `Xóa bộ lọc (${count} kết quả)`,
      optionsTag: (count: number) => `Tùy chọn ${count} gói`,
      choosePackage: 'Chọn gói',
      bookThisTour: 'Đặt tour này',
      emptyTitle: 'Chưa có tour trùng khớp hoàn toàn với bộ lọc này',
      emptyDesc:
        'Bạn có thể xem toàn bộ hành trình sẵn có hoặc gửi yêu cầu để chúng tôi thiết kế tuyến riêng theo ngày khởi hành mong muốn.',
      showAllTours: 'Hiển thị tất cả tour',
      highlightsTitle: 'Điểm nhấn trong hành trình',
      step1Title: '1. Chọn gói lưu trú & hình thức đi',
      standardPrice: 'Giá tiêu chuẩn',
      step2Title: '2. Tiện ích chọn thêm (không bắt buộc)',
      estimateLabel: (pkgLabel: string) => `Tạm tính (${pkgLabel})`,
      bookSelectedBtn: 'Đặt tour với lựa chọn này',
      closeModal: 'Đóng cửa sổ chi tiết',
      showMore: (remaining: number, total: number) =>
        `Xem thêm ${remaining} hành trình (${total} tour)`,
      showLess: 'Thu gọn còn 6 hành trình tiêu biểu',
    },
    experiences: {
      eyebrow: 'Trải nghiệm bản địa',
      heading: 'Những khoảnh khắc nhỏ làm nên chuyến đi lớn',
      subtitle:
        'Bạn có thể đặt riêng từng hoạt động lẻ trong ngày hoặc ghép thêm vào hành trình dài ngày của mình. Chọn bất kỳ trải nghiệm nào để thêm nhanh vào ghi chú giữ chỗ.',
      addToBooking: 'Thêm vào yêu cầu đặt tour',
    },
    process: {
      eyebrow: 'Quy trình đặt tour',
      heading: 'Bốn bước nhẹ nhàng trước khi lên đường',
      subtitle:
        'Chúng tôi không dùng hệ thống đặt tự động lạnh lẽo. Mỗi yêu cầu đều được một chuyên viên nắm rõ từng cung đường trực tiếp lắng nghe và tinh chỉnh.',
    },
    testimonials: {
      eyebrow: 'Lời kể sau chuyến đi',
      heading: 'Điều đọng lại khi trở về',
      traveledLabel: 'Đã đi:',
    },
    journal: {
      eyebrow: 'Nhật ký Mây',
      heading: 'Ghi chép từ những chuyến đi chậm và nếp sống bản địa',
      readFull: 'Đọc trọn bài',
      closeArticle: 'Đóng bài viết',
      writtenBy: 'Bút ký bởi',
      ctaQuestion: (dest: string) =>
        `Bạn muốn tự mình bước vào hành trình tại ${dest}?`,
      ctaButton: (dest: string) => `Xem tour ${dest}`,
    },
    booking: {
      eyebrow: 'Đặt tour & giữ chỗ',
      heading: 'Để lại lời nhắn cho chuyến đi sắp tới',
      subtitle:
        'Bạn chưa cần chốt ngày hay thanh toán ngay. Hãy chọn điểm đến và gói trải nghiệm mong muốn, chuyên viên tuyến điểm sẽ gọi lại tư vấn chi tiết phòng nghỉ, thời tiết và lịch trình phù hợp nhất.',
      hotlineLabel: 'Tổng đài tư vấn nhanh:',
      fullNameLabel: 'Họ và tên',
      fullNamePlaceholder: 'Ví dụ: Nguyễn Minh Anh',
      fullNameError: 'Vui lòng nhập họ và tên của bạn.',
      phoneLabel: 'Số điện thoại',
      phonePlaceholder: '0912 345 678',
      phoneError: 'Số điện thoại chưa hợp lệ (ví dụ: 0912 345 678).',
      tourLabel: 'Chọn tour quan tâm',
      customTourOption: 'Thiết kế lịch trình riêng cho gia đình / công ty',
      packageLabel: 'Lựa chọn gói',
      noteLabel: 'Ghi chú thêm (ngày dự kiến, số khách, dịch vụ chọn thêm)',
      notePlaceholder:
        'Ví dụ: Nhóm mình có 4 người lớn, dự kiến đi vào cuối tháng sau, muốn thêm nhiếp ảnh gia...',
      privacyNote: 'Thông tin của bạn chỉ dùng để tư vấn hành trình này.',
      submitBtn: 'Gửi yêu cầu giữ chỗ',
      submittingBtn: 'Đang lưu yêu cầu...',
      submitError: 'Chưa thể lưu yêu cầu lúc này. Vui lòng kiểm tra kết nối và thử lại.',
      cooldownError: 'Yêu cầu của bạn vừa được ghi nhận. Vui lòng đợi vài giây trước khi gửi thêm yêu cầu mới.',
      toastMessage: 'Đã lưu yêu cầu giữ chỗ, chúng tôi sẽ gọi lại trong 2 giờ làm việc',
      closeToast: 'Đóng thông báo',
      confirmedTitle: (name: string, tour: string, pkg: string) =>
        `Cảm ơn ${name}, yêu cầu cho “${tour}” (${pkg}) đã được lưu.`,
      confirmedSub:
        'Chuyên viên tuyến điểm của Mây Lang Thang sẽ liên hệ trong vòng 2 giờ làm việc.',
      referenceCodeLabel: 'Mã tham chiếu:',
      dismissReceipt: 'Ẩn xác nhận này',
      deskToggle: 'Theo dõi giữ chỗ & Quản lý',
      deskSignIn: 'Đăng nhập Google để xem yêu cầu của bạn',
      deskSignInAdmin: 'Quản trị viên hoặc khách đã đặt chỗ có thể đăng nhập bằng Google để xem và cập nhật trạng thái trực tiếp.',
      deskSignOut: 'Đăng xuất',
      deskAdminTitle: 'Bảng tiếp nhận giữ chỗ (Admin)',
      deskMyTitle: 'Yêu cầu giữ chỗ của bạn',
      deskEmpty: 'Chưa có yêu cầu giữ chỗ nào được lưu.',
      deskDelete: 'Xóa',
      statuses: {
        pending: 'Chờ liên hệ',
        contacted: 'Đã gọi tư vấn',
        confirmed: 'Đã giữ chỗ',
        archived: 'Lưu trữ',
      },
    },
    faq: {
      eyebrow: 'Hỏi đáp thường gặp',
      heading: 'Những điều khách thường hỏi trước khi đặt chỗ',
    },
    footer: {
      description:
        'Hành trình du lịch chậm và trải nghiệm văn hóa bản địa trên khắp Việt Nam, thiết kế cho những tâm hồn muốn đi sâu thay vì đi nhiều.',
      officeTitle: 'Văn phòng & Liên hệ',
      hanoiPrefix: 'VP Hà Nội:',
      hotlinePrefix: 'Hotline:',
      connectTitle: 'Kết nối',
      journalLink: 'Nhật ký Mây',
      adminLink: 'Trang quản trị (Admin)',
      rights: 'Bảo lưu mọi quyền.',
    },
    admin: {
      pageTitle: 'Trang quản trị',
      backToSite: 'Về trang chủ',
      openFullAdmin: 'Mở trang quản trị đầy đủ',
      loadingAuth: 'Đang kiểm tra phiên đăng nhập...',
      loginTitle: 'Cổng quản trị Mây Lang Thang',
      loginSubtitle:
        'Đăng nhập bằng tài khoản Google quản trị viên để tiếp nhận yêu cầu giữ chỗ, cập nhật trạng thái tư vấn và xuất danh sách khách hàng.',
      authorizedEmailHint: 'Email quản trị được cấp quyền:',
      loginButton: 'Đăng nhập Google Quản trị',
      unauthorizedTitle: 'Tài khoản chưa được cấp quyền quản trị',
      unauthorizedBody: (current: string, expected: string) =>
        `Bạn đang đăng nhập bằng ${current}. Vui lòng chuyển sang tài khoản ${expected} để truy cập bảng điều hành giữ chỗ.`,
      switchAccount: 'Đổi tài khoản Google',
      signedInAs: 'Quản trị viên:',
      dashboardHeading: 'Điều phối giữ chỗ & Hành trình',
      workspaceTabsAria: 'Chuyển mục quản trị',
      tabInquiries: 'Yêu cầu giữ chỗ',
      tabTours: 'Quản lý Tour',
      tabDestinations: 'Điểm đến',
      tabExperiences: 'Trải nghiệm',
      tabJournal: 'Nhật ký Mây',
      tabSettings: 'Hero & Liên hệ',
      kpiTotal: 'Tổng yêu cầu',
      filterAll: 'Tất cả',
      searchPlaceholder: 'Tìm tên khách, SĐT, tour, mã...',
      exportCsv: 'Xuất CSV',
      loadingList: 'Đang đồng bộ danh sách giữ chỗ từ Firestore...',
      emptyTitle: 'Chưa có yêu cầu nào khớp bộ lọc',
      emptySub: 'Các yêu cầu giữ chỗ mới từ khách hàng sẽ xuất hiện tự động tại đây.',
      copyPhone: 'Sao chép SĐT',
      copied: 'Đã sao chép',
      statusSelectAria: 'Cập nhật trạng thái giữ chỗ',
      confirmDelete: 'Xóa vĩnh viễn',
      cancelDelete: 'Hủy',
      catalogDestinations: 'Điểm đến',
      catalogTours: 'Tour thiết kế',
      catalogExperiences: 'Trải nghiệm lẻ',
      catalogJournal: 'Bài Nhật ký Mây',
      cmsAddTour: 'Thêm tour mới',
      cmsAddDestination: 'Thêm điểm đến',
      cmsAddExperience: 'Thêm trải nghiệm',
      cmsAddJournal: 'Viết bài mới',
      cmsEdit: 'Chỉnh sửa',
      cmsHide: 'Ẩn khỏi trang',
      cmsShow: 'Hiện lên trang',
      cmsResetDefault: 'Khôi phục mặc định',
      cmsBadgeHidden: 'Đang ẩn',
      cmsBadgeCustom: 'Tạo mới (Firestore)',
      cmsBadgeEdited: 'Đã tùy chỉnh (Firestore)',
      cmsBadgeDefault: 'Mặc định',
      cmsSave: 'Lưu lên Firestore',
      cmsSaving: 'Đang lưu...',
      cmsSaved: 'Đã lưu và đồng bộ lên trang chủ.',
      cmsSearchContent: 'Tìm kiếm nội dung...',
      cmsSettingsHeroTitle: 'Nội dung Hero đầu trang',
      cmsSettingsContactTitle: 'Thông tin văn phòng & Liên hệ',
      cmsResetSettings: 'Khôi phục mặc định',
    },
    chat: {
      launcherLabel: 'Tư vấn & Chốt tour',
      launcherAria: 'Mở trợ lý tư vấn tour Mây Lang Thang',
      panelTitle: 'Trợ lý Hành trình Mây',
      panelSubtitle: 'Tư vấn tuyến điểm & giữ chỗ trực tiếp',
      closeAria: 'Đóng khung tư vấn',
      resetAria: 'Cuộc trò chuyện mới',
      welcome:
        'Chào bạn, mình là trợ lý tư vấn của Mây Lang Thang. Bạn đang muốn đi biển đảo, lên núi săn mây hay tìm một hành trình cuối tuần nhẹ nhàng? Cứ chia sẻ số ngày và sở thích, mình gợi ý tuyến hợp nhất hoặc hỗ trợ giữ chỗ ngay tại đây nhé.',
      quickPrompts: [
        'Gợi ý tour 2 ngày 1 đêm cuối tuần',
        'Tour biển đảo hoặc nghỉ dưỡng nhẹ nhàng',
        'Mình muốn giữ chỗ cho nhóm 4 người',
      ],
      inputPlaceholder: 'Hỏi lịch trình, giá gói hoặc nhắn tên + SĐT để giữ chỗ...',
      sendAria: 'Gửi tin nhắn',
      thinking: 'Đang tra cứu hành trình phù hợp...',
      selectToBook: 'Điền vào form đặt',
      askToClose: 'Chốt tour này',
      bookingConfirmedBadge: 'Đã lưu yêu cầu giữ chỗ vào hệ thống',
      bookingRefLabel: 'Mã giữ chỗ:',
      bookingGuestLabel: 'Khách hàng:',
      bookingTourLabel: 'Hành trình:',
      bookingWaitNote: 'Chuyên viên tuyến điểm sẽ gọi lại xác nhận trong 2 giờ làm việc.',
      retryLabel: 'Thử lại',
      errorFallback: 'Chưa thể kết nối trợ lý tư vấn lúc này. Vui lòng thử lại sau ít giây.',
    },
    zones: {
      'Tất cả': 'Tất cả',
      'Miền Bắc': 'Miền Bắc',
      'Miền Trung': 'Miền Trung',
      'Miền Nam': 'Miền Nam',
      'Quốc tế': 'Quốc tế',
    } as Record<RegionZone, string>,
    categories: {
      'Tất cả': 'Tất cả',
      'Biển đảo': 'Biển đảo',
      'Núi rừng': 'Núi rừng',
      'Văn hóa': 'Văn hóa',
      'Ẩm thực': 'Ẩm thực',
    } as Record<TourCategory, string>,
    durations: {
      'Tất cả': 'Tất cả',
      '2 ngày 1 đêm': '2 ngày 1 đêm',
      '3 ngày 2 đêm': '3 ngày 2 đêm',
      '4 ngày 3 đêm': '4 ngày 3 đêm',
      '5 ngày 4 đêm': '5 ngày 4 đêm',
      '6 ngày 5 đêm': '6 ngày 5 đêm',
      '7 ngày 6 đêm': '7 ngày 6 đêm',
      '9 ngày 8 đêm': '9 ngày 8 đêm',
      '10 ngày 9 đêm': '10 ngày 9 đêm',
    } as Record<DurationFilter, string>,
    journalCategories: {
      'Tất cả': 'Tất cả',
      'Ký sự khách hàng': 'Ký sự khách hàng',
      'Văn hóa bản địa': 'Văn hóa bản địa',
      'Ẩm thực & Làng nghề': 'Ẩm thực & Làng nghề',
    } as Record<JournalCategory, string>,
  },
  en: {
    pageTitle: 'Mây Lang Thang – Travel Slow, Live Deeply | Vietnam Curated Tours',
    metaDescription:
      'Travel slow, live deeply. Explore curated small-group tours across Ha Long Bay, Ha Giang, Hoi An, Da Lat, Phu Quoc, Hanoi, and Saigon with 120 local guides.',
    nav: {
      destinations: 'Destinations',
      tours: 'Tours',
      experiences: 'Experiences',
      journal: 'Journal',
      process: 'How to Book',
      faq: 'FAQ',
      bookCta: 'Book Tour',
      bookMobile: 'Book a Tour',
      openMenu: 'Open navigation menu',
      closeMenu: 'Close menu',
      toDark: 'Switch to dark theme',
      toLight: 'Switch to light theme',
      adminPortal: 'Admin Portal',
    },
    hero: {
      scrollLabel: 'Scroll down',
      scrollAria: 'Scroll down to find a tour',
      pauseVideo: 'Pause background film',
      playVideo: 'Play background film',
      videoCaption: 'Vietnam Atmospheric Reel',
    },
    search: {
      destination: 'Destination',
      allDestinations: (count: number) => `All (${count} places)`,
      category: 'Travel Style',
      allCategories: 'All styles',
      duration: 'Duration',
      allDurations: 'Any length',
      date: 'Departure Date',
      guests: 'Guests',
      guestOptions: ['1 guest', '2 guests', '3–5 guests', '6+ guests (private)'],
      submit: 'Find Tours',
    },
    intro: {
      eyebrow: 'The Mây Lang Thang Ethos',
      heading: 'Never rush through places meant to be remembered.',
      p1: 'Instead of cramming six check-in stops into forty-eight hours, we craft journeys that let you hear roosters crowing through Sapa mist, share hot tea with families in Ha Giang, and savor garden-to-table dinners in Hoi An.',
      p2: 'Each departure is capped at 8–10 travelers and led by local storytellers born and raised in that very region — people who know which quiet trails stay untouched and which family kitchens hold recipes generations old.',
    },
    destinations: {
      eyebrow: 'Featured Regions',
      heading: 'Seventeen unforgettable regions across Vietnam',
      prevAria: 'Previous destinations',
      nextAria: 'Next destinations',
      mapEyebrow: 'Interactive Vietnam Atlas',
      mapHeading: 'Tap any coordinate to preview and filter tours',
      mapSubtitle: (count: number) =>
        `Hover across ${count} destinations from North to South to check best seasons, or click a pin directly to jump to matching tours below.`,
      mapProjection: 'Mercator Projection · Powered by travelData.ts',
      mapShowing: (visible: number, total: number) =>
        `Showing ${visible}/${total} destinations`,
      bestSeason: 'Best season',
      coordinates: 'Coordinates',
      featuredTourAt: (name: string) => `Signature journey in ${name}`,
      packagesCount: (count: number) => `${count} tier options`,
      perGuest: '/ guest',
      fromPrice: 'From',
      viewToursAt: (name: string) => `Explore tours in ${name}`,
      hoangSa: 'Paracel Islands (Hoàng Sa)',
      truongSa: 'Spratly Islands (Trường Sa)',
    },
    tours: {
      eyebrow: 'Curated Journeys',
      heading: 'Seventeen journeys paced for unhurried discovery',
      quickOptions: 'Quick filters:',
      allLocations: (count: number) => `All ${count} destinations`,
      anyDuration: 'Any length',
      clearFilters: (count: number) => `Reset filters (${count} results)`,
      optionsTag: (count: number) => `${count} package tiers`,
      choosePackage: 'Customize',
      bookThisTour: 'Book this tour',
      emptyTitle: 'No tours match this exact filter combination',
      emptyDesc:
        'Browse all available journeys or leave us a note so our local specialists can tailor a private itinerary for your preferred dates.',
      showAllTours: 'Show all tours',
      highlightsTitle: 'Journey highlights',
      step1Title: '1. Select stay tier & travel format',
      standardPrice: 'Base rate',
      step2Title: '2. Optional add-on services',
      estimateLabel: (pkgLabel: string) => `Estimated (${pkgLabel})`,
      bookSelectedBtn: 'Book with this selection',
      closeModal: 'Close details modal',
      showMore: (remaining: number, total: number) =>
        `Show ${remaining} more journeys (${total} total)`,
      showLess: 'Show 6 featured journeys only',
    },
    experiences: {
      eyebrow: 'Local Experiences',
      heading: 'Small moments that define the entire journey',
      subtitle:
        'Book any activity as a standalone half-day outing or weave it into a longer itinerary. Click an experience to pre-fill your reservation request.',
      addToBooking: 'Add to booking inquiry',
    },
    process: {
      eyebrow: 'Booking Process',
      heading: 'Four calm steps before you set off',
      subtitle:
        'We never leave you with an impersonal automated checkout. Every inquiry is reviewed by a regional specialist who knows every mile of the route.',
    },
    testimonials: {
      eyebrow: 'Traveler Notes',
      heading: 'What stays long after returning home',
      traveledLabel: 'Journey:',
    },
    journal: {
      eyebrow: 'Mây Journal',
      heading: 'Field notes on slow travel and indigenous culture',
      readFull: 'Read story',
      closeArticle: 'Close story',
      writtenBy: 'Written by',
      ctaQuestion: (dest: string) =>
        `Ready to experience ${dest} at your own pace?`,
      ctaButton: (dest: string) => `View ${dest} tours`,
    },
    booking: {
      eyebrow: 'Reservations & Inquiries',
      heading: 'Leave a note for your upcoming journey',
      subtitle:
        'No upfront payment or fixed dates required yet. Share the route and stay tier catching your eye, and our regional specialist will call back with weather notes, room availability, and tailored recommendations.',
      hotlineLabel: 'Direct advisory hotline:',
      fullNameLabel: 'Full name',
      fullNamePlaceholder: 'e.g. Minh Anh Nguyen',
      fullNameError: 'Please enter your full name.',
      phoneLabel: 'Phone number',
      phonePlaceholder: '+84 912 345 678',
      phoneError: 'Please enter a valid Vietnamese phone number (e.g. 0912 345 678).',
      tourLabel: 'Preferred journey',
      customTourOption: 'Tailor a private family or corporate itinerary',
      packageLabel: 'Stay tier',
      noteLabel: 'Additional notes (preferred dates, group size, add-ons)',
      notePlaceholder:
        'e.g. 4 adults traveling late next month, vegetarian meals for 1 guest...',
      privacyNote: 'Your contact details are used solely to plan this journey.',
      submitBtn: 'Send booking request',
      submittingBtn: 'Saving request...',
      submitError: 'Could not save your inquiry right now. Please check your connection and try again.',
      cooldownError: 'Your inquiry was just saved. Please wait a few seconds before sending another request.',
      toastMessage: 'Booking request saved — our specialist will call back within 2 working hours',
      closeToast: 'Dismiss notification',
      confirmedTitle: (name: string, tour: string, pkg: string) =>
        `Thank you ${name}, your request for “${tour}” (${pkg}) has been saved.`,
      confirmedSub:
        'A Mây Lang Thang local route specialist will reach out within 2 working hours.',
      referenceCodeLabel: 'Reference ID:',
      dismissReceipt: 'Dismiss confirmation',
      deskToggle: 'My Inquiries & Booking Desk',
      deskSignIn: 'Sign in with Google to view your inquiries',
      deskSignInAdmin: 'Travelers or booking desk admins can sign in with Google to track and manage persisted requests.',
      deskSignOut: 'Sign out',
      deskAdminTitle: 'Booking Intake Desk (Admin)',
      deskMyTitle: 'Your Saved Inquiries',
      deskEmpty: 'No saved booking inquiries found yet.',
      deskDelete: 'Remove',
      statuses: {
        pending: 'Pending call',
        contacted: 'Contacted',
        confirmed: 'Confirmed',
        archived: 'Archived',
      },
    },
    faq: {
      eyebrow: 'Frequently Asked Questions',
      heading: 'Everything travelers ask before reserving',
    },
    footer: {
      description:
        'Slow travel journeys and authentic local encounters across Vietnam, thoughtfully crafted for travelers seeking depth over speed.',
      officeTitle: 'Offices & Contact',
      hanoiPrefix: 'Hanoi Office:',
      hotlinePrefix: 'Hotline:',
      connectTitle: 'Connect',
      journalLink: 'Mây Journal',
      adminLink: 'Admin Portal',
      rights: 'All rights reserved.',
    },
    admin: {
      pageTitle: 'Admin Portal',
      backToSite: 'Back to site',
      openFullAdmin: 'Open full Admin Portal',
      loadingAuth: 'Checking sign-in session...',
      loginTitle: 'Mây Lang Thang Admin Desk',
      loginSubtitle:
        'Sign in with the authorized Google admin account to manage incoming booking inquiries, update consultation statuses, and export guest records.',
      authorizedEmailHint: 'Authorized admin email:',
      loginButton: 'Sign in with Google Admin',
      unauthorizedTitle: 'Admin access required',
      unauthorizedBody: (current: string, expected: string) =>
        `Currently signed in as ${current}. Please switch to ${expected} to manage all customer inquiries.`,
      switchAccount: 'Switch Google account',
      signedInAs: 'Signed in as:',
      dashboardHeading: 'Reservations & Catalog Control',
      workspaceTabsAria: 'Admin workspace tabs',
      tabInquiries: 'Booking Inquiries',
      tabTours: 'Manage Tours',
      tabDestinations: 'Destinations',
      tabExperiences: 'Experiences',
      tabJournal: 'Journal',
      tabSettings: 'Hero & Contact',
      kpiTotal: 'Total Inquiries',
      filterAll: 'All',
      searchPlaceholder: 'Search guest, phone, tour, ID...',
      exportCsv: 'Export CSV',
      loadingList: 'Syncing live inquiries from Firestore...',
      emptyTitle: 'No matching booking inquiries',
      emptySub: 'New reservation requests submitted by guests appear here in real time.',
      copyPhone: 'Copy phone',
      copied: 'Copied',
      statusSelectAria: 'Update booking status',
      confirmDelete: 'Confirm delete',
      cancelDelete: 'Cancel',
      catalogDestinations: 'Destinations',
      catalogTours: 'Curated Tours',
      catalogExperiences: 'Local Experiences',
      catalogJournal: 'Journal Stories',
      cmsAddTour: 'Add New Tour',
      cmsAddDestination: 'Add Destination',
      cmsAddExperience: 'Add Experience',
      cmsAddJournal: 'Write Story',
      cmsEdit: 'Edit',
      cmsHide: 'Hide from site',
      cmsShow: 'Show on site',
      cmsResetDefault: 'Reset default',
      cmsBadgeHidden: 'Hidden',
      cmsBadgeCustom: 'Custom (Firestore)',
      cmsBadgeEdited: 'Edited (Firestore)',
      cmsBadgeDefault: 'Built-in',
      cmsSave: 'Save to Firestore',
      cmsSaving: 'Saving...',
      cmsSaved: 'Saved and synced live to the storefront.',
      cmsSearchContent: 'Filter items...',
      cmsSettingsHeroTitle: 'Hero Section Content',
      cmsSettingsContactTitle: 'Office & Contact Details',
      cmsResetSettings: 'Restore Defaults',
    },
    chat: {
      launcherLabel: 'Trip Concierge',
      launcherAria: 'Open Mây Lang Thang AI travel concierge',
      panelTitle: 'Mây Journey Concierge',
      panelSubtitle: 'Tailored advice & direct tour reservation',
      closeAria: 'Close chat assistant',
      resetAria: 'Start new conversation',
      welcome:
        'Hello, I am your Mây Lang Thang journey specialist. Whether you are looking for calm emerald bays, highland cloud trails, or a 2-day escape, tell me your pace and preferences—I can recommend routes and help reserve your spot right here.',
      quickPrompts: [
        'Suggest a 2D1N weekend escape',
        'Calm sea & island slow-travel tours',
        'I want to reserve for a group of 4',
      ],
      inputPlaceholder: 'Ask about routes, stay tiers, or share name + phone to book...',
      sendAria: 'Send message',
      thinking: 'Checking curated journeys...',
      selectToBook: 'Fill booking form',
      askToClose: 'Reserve this tour',
      bookingConfirmedBadge: 'Reservation request saved',
      bookingRefLabel: 'Reference ID:',
      bookingGuestLabel: 'Guest:',
      bookingTourLabel: 'Journey:',
      bookingWaitNote: 'Our local route specialist will call back within 2 working hours.',
      retryLabel: 'Retry',
      errorFallback: 'Could not reach the travel concierge right now. Please try again shortly.',
    },
    zones: {
      'Tất cả': 'All Regions',
      'Miền Bắc': 'Northern Vietnam',
      'Miền Trung': 'Central & Highlands',
      'Miền Nam': 'Southern Vietnam',
      'Quốc tế': 'International',
    } as Record<RegionZone, string>,
    categories: {
      'Tất cả': 'All',
      'Biển đảo': 'Sea & Islands',
      'Núi rừng': 'Mountains',
      'Văn hóa': 'Culture',
      'Ẩm thực': 'Culinary',
    } as Record<TourCategory, string>,
    durations: {
      'Tất cả': 'All',
      '2 ngày 1 đêm': '2 Days 1 Night',
      '3 ngày 2 đêm': '3 Days 2 Nights',
      '4 ngày 3 đêm': '4 Days 3 Nights',
      '5 ngày 4 đêm': '5 Days 4 Nights',
      '6 ngày 5 đêm': '6 Days 5 Nights',
      '7 ngày 6 đêm': '7 Days 6 Nights',
      '9 ngày 8 đêm': '9 Days 8 Nights',
      '10 ngày 9 đêm': '10 Days 9 Nights',
    } as Record<DurationFilter, string>,
    journalCategories: {
      'Tất cả': 'All Stories',
      'Ký sự khách hàng': 'Traveler Diaries',
      'Văn hóa bản địa': 'Local Heritage',
      'Ẩm thực & Làng nghề': 'Food & Crafts',
    } as Record<JournalCategory, string>,
  },
};

export const EN_CONTENT = {
  hero: {
    eyebrow: 'Vietnam Slow-Travel Journal · 17 Regions & Intimate Groups up to 10 Guests',
    headline: 'Travel slow, live deeply.',
    subtitle:
      'We never chase crowded checklists. Each Mây Lang Thang journey is an unhurried window into misty emerald bays, northern cloud passes, mossy imperial citadels, and Mekong river kitchens.',
    ctaLabel: 'Explore tours',
    alt: 'Misty limestone karst peaks and calm emerald waters of northern Vietnam at golden sunrise',
  },
  stats: {
    guests: {
      label: 'Travelers hosted',
      detail: 'Over 8 years of crafting unhurried journeys',
    },
    provinces: {
      label: 'Provinces explored',
      detail: 'From northernmost Lũng Cú to southern Mekong markets',
    },
    rating: {
      label: 'Average guest rating',
      detail: 'Verified post-trip satisfaction reviews',
    },
    guides: {
      label: 'Local storytellers',
      detail: 'Guides sharing their homeland through lived memory',
    },
  },
  destinations: {
    'ha-long': {
      name: 'Ha Long',
      region: 'Quang Ninh · Northeast Bay',
      tagline: 'Overnight wooden junk anchored in tranquil jade lagoons',
      bestSeason: 'Apr – Jun & Sep – Nov',
    },
    'ha-giang': {
      name: 'Ha Giang',
      region: 'Karst Plateau · Far North',
      tagline: 'Cloud-draped Ma Pi Leng Pass & Nho Que emerald gorge',
      bestSeason: 'Sep – Nov & Jan – Mar',
    },
    'cao-bang': {
      name: 'Cao Bang',
      region: 'Ban Gioc Falls · Northeast',
      tagline: 'Turquoise cascades & Quy Son river stone-house villages',
      bestSeason: 'Aug – Nov',
    },
    'ha-noi': {
      name: 'Hanoi',
      region: 'Capital · 36 Old Streets',
      tagline: 'Misty Hoan Kiem Lake, ochre alleys & balcony egg coffee',
      bestSeason: 'Sep – Nov & Mar – Apr',
    },
    'ninh-binh': {
      name: 'Ninh Binh',
      region: 'Tam Coc · Trang An',
      tagline: 'Hand-rowed sampans drifting past rice paddies and karsts',
      bestSeason: 'May – Jun & Sep – Nov',
    },
    sapa: {
      name: 'Sapa',
      region: 'Lao Cai · Hoang Lien Son',
      tagline: 'Muong Hoa valley rice terraces emerging through dawn mist',
      bestSeason: 'Mar – May & Sep – Oct',
    },
    'phong-nha': {
      name: 'Phong Nha',
      region: 'Quang Binh · Cave Kingdom',
      tagline: 'Emerald Son River flowing from ancient limestone caverns',
      bestSeason: 'Mar – Aug',
    },
    hue: {
      name: 'Hue',
      region: 'Thua Thien Hue · Imperial City',
      tagline: 'Misty Perfume River, mossy gates & garden-house feasts',
      bestSeason: 'Jan – May',
    },
    'hoi-an': {
      name: 'Hoi An',
      region: 'Quang Nam · Ancient Town',
      tagline: 'Amber silk lanterns & organic herb gardens in Tra Que',
      bestSeason: 'Feb – Aug',
    },
    'mang-den': {
      name: 'Mang Den',
      region: 'Kon Tum · Central Highlands',
      tagline: 'Mirror-still Dak Ke Lake wrapped in pine hills and dawn fog',
      bestSeason: 'Nov – Apr',
    },
    'quy-nhon': {
      name: 'Quy Nhon',
      region: 'Binh Dinh · South Central Coast',
      tagline: 'Windswept Eo Gio cliffs, Nhon Ly fishing cove & coral reefs',
      bestSeason: 'Mar – Sep',
    },
    'da-lat': {
      name: 'Da Lat',
      region: 'Lam Dong · Langbiang Plateau',
      tagline: 'Pine forests rising above a silent sea of morning clouds',
      bestSeason: 'Nov – Apr',
    },
    'sai-gon': {
      name: 'Saigon',
      region: 'Ho Chi Minh City · Southern Hub',
      tagline: 'Century-old Cho Lon, hidden street-food alleys & river sunsets',
      bestSeason: 'Dec – Apr',
    },
    'an-giang': {
      name: 'An Giang',
      region: 'Tra Su · Seven Mountains',
      tagline: 'Wooden sampans gliding across emerald melaleuca waterways',
      bestSeason: 'Sep – Dec',
    },
    'can-tho': {
      name: 'Can Tho',
      region: 'Mekong Delta · River Heart',
      tagline: 'Sunrise Cai Rang floating market & tropical orchards',
      bestSeason: 'Dec – May',
    },
    'phu-quoc': {
      name: 'Phu Quoc',
      region: 'Kien Giang · Southwest Sea',
      tagline: 'Crystal turquoise coves and untouched coral gardens',
      bestSeason: 'Nov – Apr',
    },
    'con-dao': {
      name: 'Con Dao',
      region: 'Ba Ria – Vung Tau · Quiet Island',
      tagline: 'Pristine Dam Trau bay, coastal jungle & sea turtle sanctuary',
      bestSeason: 'Mar – Sep',
    },
    'siem-reap': {
      name: 'Siem Reap',
      region: 'Cambodia · Ancient Angkor',
      tagline: 'Sunrise over Angkor Wat and moss-covered temples hidden in jungle',
      bestSeason: 'Nov – Feb',
    },
    'chiang-mai': {
      name: 'Chiang Mai',
      region: 'Thailand · The North',
      tagline: 'A golden temple above the clouds and the slow rhythm of the old town',
      bestSeason: 'Nov – Feb',
    },
    'singapore': {
      name: 'Singapore',
      region: 'Singapore · Southeast Asia',
      tagline: 'A futuristic garden city, heritage quarters and hawker food heaven',
      bestSeason: 'Feb – Apr & Jul – Sep',
    },
    'bali': {
      name: 'Bali',
      region: 'Indonesia · Island of the Gods',
      tagline: 'Tegalalang rice terraces, ancient temples and slow Ubud mornings',
      bestSeason: 'Apr – Oct',
    },
    'dai-loan': {
      name: 'Taiwan',
      region: 'Taiwan · East Asia',
      tagline: 'Lantern-lit Jiufen, high-mountain tea and night markets that never sleep',
      bestSeason: 'Mar – May & Oct – Nov',
    },
    'le-giang': {
      name: 'Lijiang',
      region: 'China · Yunnan',
      tagline: 'A thousand-year-old town beneath the Jade Dragon Snow Mountain',
      bestSeason: 'Apr – Jun & Sep – Oct',
    },
    'seoul': {
      name: 'Seoul',
      region: 'South Korea · Northeast Asia',
      tagline: 'Gyeongbokgung Palace, Bukchon hanok lanes and autumn foliage days',
      bestSeason: 'Apr – May & Oct – Nov',
    },
    'kyoto': {
      name: 'Kyoto',
      region: 'Japan · Kansai',
      tagline: 'Ten thousand vermilion torii gates, bamboo groves and quiet tea houses',
      bestSeason: 'Mar – Apr & Nov',
    },
    'pokhara': {
      name: 'Pokhara',
      region: 'Nepal · Himalaya',
      tagline: 'Still Phewa Lake beneath the white wall of the Annapurnas',
      bestSeason: 'Oct – Nov & Mar – Apr',
    },
    'ulaanbaatar': {
      name: 'Ulaanbaatar',
      region: 'Mongolia · Central Asian Steppe',
      tagline: 'Ger camps, horse rides and endless star-filled steppe skies',
      bestSeason: 'Jun – Aug',
    },
    'paro': {
      name: 'Paro',
      region: 'Bhutan · Himalaya',
      tagline: 'The cliff-clinging Tiger’s Nest and a nation that measures happiness',
      bestSeason: 'Mar – May & Oct – Nov',
    },
    'paris': {
      name: 'Paris',
      region: 'France · Europe',
      tagline: 'The Eiffel Tower, tree-lined boulevards and century-old cafés',
      bestSeason: 'May – Jun & Sep – Oct',
    },
  } as Record<string, { name: string; region: string; tagline: string; bestSeason: string }>,
  packages: {
    'local-standard': {
      label: 'Local Comfort',
      summary: 'Curated homestays or wooden cabins, small group of 6–10 guests',
    },
    'boutique-retreat': {
      label: 'Boutique Retreat',
      summary: 'Upgraded scenic boutique rooms + private regional tasting dinner',
    },
    'private-group': {
      label: 'Private Family / Group',
      summary: 'Dedicated private vehicle, personal guide & flexible pace',
    },
  } as Record<string, { label: string; summary: string }>,
  addons: {
    'addon-airport': 'Round-trip private airport / station transfer',
    'addon-photo': 'Half-day local documentary photographer',
    'addon-diet': 'Custom vegetarian or allergy-conscious menu',
  } as Record<string, string>,
  tours: {
    'tour-ha-long-cruise': {
      title: 'Overnight Wooden Junk Cruise on Ha Long & Lan Ha Bay',
      description:
        'Leave crowded piers behind to anchor in serene lagoons, kayak into hidden caves at dawn, and dine on freshly grilled seafood on teak decks.',
      departureInfo: 'Departs every Wednesday & Saturday',
      groupSize: 'Max 10 guests',
      highlights: [
        'Panoramic sea-view wooden cabin facing limestone karsts',
        '6:00 AM sunrise kayaking across mirror-still bay waters',
        '5-course dinner crafted from daily local catch',
      ],
    },
    'tour-ma-pi-leng': {
      title: 'Ma Pi Leng Pass Ride & Nho Que River Boat Journey',
      description:
        'Ride behind seasoned local drivers across Dong Van karst peaks and sip ancient wild Shan Tuyet tea overlooking the Nho Que canyon.',
      departureInfo: 'Departs every Thursday from Hanoi',
      groupSize: 'Max 8 guests',
      highlights: [
        'Experienced local drivers with full route insurance',
        'Cozy stays in rammed-earth Lo Lo Chai heritage homes',
        'Boat journey deep inside Southeast Asia’s deepest canyon, Tu San Gorge',
      ],
    },
    'tour-ninh-binh-tam-coc': {
      title: 'Dawn Sampan in Tam Coc & Ancient Village Cycling',
      description:
        'Board your hand-rowed boat at 6:30 AM before crowds arrive, glide through cool limestone grottos, and cycle peaceful dike roads.',
      departureInfo: 'Departs Wednesdays & Saturdays from Hanoi',
      groupSize: 'Max 10 guests',
      highlights: [
        'Early-morning quiet sampan cruise on Ngo Dong River',
        'Village cycling past lotus ponds and 17th-century communal temples',
        'Home-cooked claypot lunch with a farming family in Hai Nham valley',
      ],
    },
    'tour-sapa-trekking': {
      title: 'Cat Cat – Ta Van Forest Trail Trek with Hmong Hosts',
      description:
        'Follow quiet village footpaths through bamboo groves and Muong Hoa terraces, try beeswax indigo batik, and sleep in Ta Van village.',
      departureInfo: 'Daily departures from Hanoi or Lao Cai',
      groupSize: 'Max 8 guests',
      highlights: [
        'Gentle 11km scenic footpath far from paved tourist roads',
        'Warm family dinner hosted by a Giay household',
        'Traditional Red Dao herbal bath to unwind after trekking',
      ],
    },
    'tour-hue-imperial': {
      title: 'Imperial Hue Memories & Kim Long Garden House Dining',
      description:
        'Stroll the Citadel to morning temple bells, hear Nguyen dynasty stories from local scholars, and dine inside a century-old timber garden home.',
      departureInfo: 'Departs Thursdays & Sundays',
      groupSize: 'Max 8 guests',
      highlights: [
        '7-course royal home meal in a 100-year-old pomelo orchard',
        'Sunset paddleboarding on Tam Giang Lagoon with Chuon village dinner',
        'Paper flower crafting workshop with Thanh Tien village artisans',
      ],
    },
    'tour-hoi-an-cooking': {
      title: 'Ancient Town Dusk & Tra Que Organic Cooking Class',
      description:
        'Cycle past emerald paddies to Hoi An morning market, harvest fragrant herbs at Tra Que village, and cook crispy Quang-style dishes.',
      departureInfo: 'Daily departures',
      groupSize: 'Max 8 guests',
      highlights: [
        '7:00 AM market walk alongside a local Hoi An chef',
        'Harvest fresh organic herbs straight from Tra Que beds',
        'Evening river lanterns and pottery tales in Thanh Ha village',
      ],
    },
    'tour-quy-nhon-coast': {
      title: 'Nhon Ly Fishing Dawn & Coral Snorkeling at Ky Co',
      description:
        'Head out by fisherman skiff to clear coral coves at sunrise, walk coastal granite trails around Eo Gio, and feast by the surf.',
      departureInfo: 'Departs every Friday',
      groupSize: 'Max 8 guests',
      highlights: [
        'Shallow crystal-clear coral snorkeling at Hon Kho reef',
        'Uncrowded coastal cliff walk from Eo Gio to Bai Xep',
        'Oceanfront boutique stay with wave-sound balconies',
      ],
    },
    'tour-da-lat-cloud': {
      title: 'Pine Ridge Cloud Hunting & Cau Dat Highland Coffee',
      description:
        'Wake at 4:30 AM to watch seas of cloud drift past pine ridges, brew single-origin highland Arabica by a wood stove, and hike mossy forests.',
      departureInfo: 'Departs every Friday',
      groupSize: 'Max 10 guests',
      highlights: [
        'Private hilltop cloud-watching spot away from crowds',
        'Arabica coffee farm visit and pour-over tasting session',
        'Timber homestay nestled in a quiet valley 8km outside town',
      ],
    },
    'tour-can-tho-floating': {
      title: 'Sunrise Cai Rang Floating Market & Mekong Orchard Lunch',
      description:
        'Weave between fruit-laden wooden boats at 5:30 AM, slurp steaming river noodle soup aboard, and bake folk cakes on Con Son islet.',
      departureInfo: 'Departs Wednesdays & Saturdays from HCMC',
      groupSize: 'Max 10 guests',
      highlights: [
        'Traditional cloth-filtered coffee & noodle breakfast on the river',
        'Artisan rice-noodle workshop and seasonal tropical orchards',
        'Acoustic Don Ca Tai Tu folk music under Binh Thuy heritage eaves',
      ],
    },
    'tour-phu-quoc-coral': {
      title: 'Coral Snorkeling & Wild Island Camp in South Phu Quoc',
      description:
        'Private speedboat access to three quiet islets in the An Thoi archipelago, guided reef snorkeling, and candlelit seafood dinner on sand.',
      departureInfo: 'Departs Thursdays & Saturdays',
      groupSize: 'Max 8 guests',
      highlights: [
        'Dedicated snorkeling guides at a 1:2 safety ratio',
        'Full sanitized snorkel gear, fins, and certified life vests',
        'West-coast sunset seafood barbecue right on the beach',
      ],
    },
    'tour-cao-bang-ban-gioc': {
      title: 'Ban Gioc Waterfall, Thang Hen Lake & Stone Village Khuoi Ky',
      description:
        'Drift by bamboo raft to the misty foot of Ban Gioc Falls at dawn and spend the night inside a 400-year-old Tay stone stilt village.',
      departureInfo: 'Departs Fridays from Hanoi',
      groupSize: 'Max 8 guests',
      highlights: [
        '6:30 AM early-morning access to Ban Gioc Falls before day-trippers',
        'Authentic stay in heritage Khuoi Ky stone stilt homestays',
        'Taste 7-herb roasted duck and warm broth rice rolls for breakfast',
      ],
    },
    'tour-phong-nha-cave': {
      title: 'Son River Kayaking & Phong Nha Karst Cave Expedition',
      description:
        'Glide into towering cathedral-like river caves by wooden boat, swim emerald jungle springs at Nuoc Mooc, and cycle Bong Lai valley.',
      departureInfo: 'Departs Wednesdays & Saturdays from Dong Hoi',
      groupSize: 'Max 8 guests',
      highlights: [
        'Specialist Quang Binh karst cave guide throughout the trip',
        'Late-afternoon countryside ride along quiet Son River banks',
        'Organic valley farm dinner with grilled chicken and wild herb salt',
      ],
    },
    'tour-mang-den-pine': {
      title: 'Mang Den Pine Forests, Dak Ke Lake & Highland Coffee',
      description:
        'Retreat to an untouched pine plateau in Kon Tum, hike to Pa Sy waterfall, and gather around bamboo-tube rice fires with Mo Nam hosts.',
      departureInfo: 'Departs every Thursday',
      groupSize: 'Max 8 guests',
      highlights: [
        'Timber bungalows tucked beneath tall pines beside Dak Ke Lake',
        'Visit traditional Kon K’tu communal Rong house & handloom weaving',
        'Small-batch coffee tasting at 1,200m elevation',
      ],
    },
    'tour-an-giang-tra-su': {
      title: 'Tra Su Flooded Cajuput Forest & Tri Ton Palm Sunrise',
      description:
        'Paddle quietly across carpets of bright green duckweed beneath tall melaleuca trees and watch dawn break over twin sugar palms.',
      departureInfo: 'Departs Saturdays from HCMC',
      groupSize: 'Max 10 guests',
      highlights: [
        'Motor-free wooden sampan deep inside Tra Su bird sanctuary',
        'Sample handmade jaggery and warm palm-sugar steamed cakes',
        'Explore Chau Phong Cham village brocade weaving traditions',
      ],
    },
    'tour-con-dao-retreat': {
      title: 'Quiet Con Dao Sanctuary & Pristine Dam Trau Cove',
      description:
        'Hike coastal Ong Dung forest to pebble coves, boat to Hon Bay Canh sea-turtle sanctuary, and rest along untouched golden crescents.',
      departureInfo: 'Departs Thursdays & Sundays',
      groupSize: 'Max 8 guests',
      highlights: [
        'Gentle 2km jungle walk through Con Dao National Park',
        'Private boat visit to Hon Bay Canh turtle conservation station',
        'Serene beachfront villa stay with fresh island seafood dinners',
      ],
    },
    'tour-ha-noi-heritage': {
      title: 'Misty Hanoi Old Quarter, Egg Coffee & Bat Trang Pottery',
      description:
        'Walk quiet Hoan Kiem lakeside at 6:00 AM, savor whipped egg coffee on vintage wooden balconies, and throw clay on a Red River potter’s wheel.',
      departureInfo: 'Departs Fridays & Sundays',
      groupSize: 'Max 8 guests',
      highlights: [
        'Hidden Old Quarter alley walk with a Hanoi architectural historian',
        'Tasting heirloom pho, bun thang, and traditional turmeric fish',
        '2-hour hands-on ceramic workshop with Bat Trang master artisans',
      ],
    },
    'tour-sai-gon-alleys': {
      title: 'Old Cho Lon, Saigon Alley Food Crawl & Bach Dang Sunset Cruise',
      description:
        'Begin with 60-year-old sock-filtered coffee in Chinatown, taste six beloved late-night alley dishes, and cruise Saigon River at twilight.',
      departureInfo: 'Departs Thursdays & Saturdays',
      groupSize: 'Max 8 guests',
      highlights: [
        'Explore herbal medicine streets, heritage guildhalls & night flower market',
        'Sample hand-pulled noodles, alley skillet banh mi & charcoal broken rice',
        'Open-deck twilight river cruise with craft refreshments',
      ],
    },
    'tour-angkor-binh-minh': {
      title: 'Angkor Wat Sunrise & the Jungle Temples of Ta Prohm',
      description:
        'Four unhurried days among the Angkor temples: sunrise over the lotus pond at Angkor Wat, wandering root-strangled Ta Prohm, and hearing Khmer guides tell the story of their own ancient capital.',
      departureInfo: 'Departs every Tuesday & Friday from Ho Chi Minh City',
      groupSize: 'Max 10 guests',
      highlights: [
        'Enter at 5:00 AM and skip the midday crowds entirely',
        'Local guides deeply versed in Khmer epics and temple architecture',
        'A slow afternoon boat ride on Tonlé Sap to Kampong Phluk floating village',
      ],
    },
    'tour-chiang-mai-cham': {
      title: 'Slow Chiang Mai: Old Temples, Craft Villages & Doi Inthanon',
      description:
        'No checklist-chasing: this journey gives Chiang Mai the time it deserves — dawn alms at forest temples, a Khao Soi cooking class with a local family, and one full day on Thailand’s highest peak, Doi Inthanon.',
      departureInfo: 'Departs every Wednesday & Sunday',
      groupSize: 'Max 10 guests',
      highlights: [
        'Cooking class in the garden home of a Lanna family',
        'A quiet morning conversation with monks at forest temple Wat Pha Lat',
        'Wachirathan Waterfall and royal gardens on Doi Inthanon',
      ],
    },
    'tour-singapore-malaysia': {
      title: 'Singapore Garden City, Old Malacca & Genting Highlands',
      description:
        'Five days across two countries at an easy pace: vertical gardens and heritage quarters in Singapore, the mellow riverside of Malacca, then a cable car through clouds to the cool Genting Highlands.',
      departureInfo: 'Departs every Thursday from Ho Chi Minh City & Hanoi',
      groupSize: 'Max 12 guests',
      highlights: [
        'A free evening to graze through Maxwell hawker centre like a local',
        'River cruise past Malacca’s lantern-lit old town',
        'Genting Skyway cable car above the clouds at 1,800m',
      ],
    },
    'tour-bali-ubud': {
      title: 'Slow Bali: Ubud Terraces, Sacred Temples & a Day to Recharge',
      description:
        'Base yourself in Ubud and explore just one area per day: Tegalalang rice terraces, the holy springs of Tirta Empul, sunset over Uluwatu cliffs, and one full day reserved for yoga, massage and Balinese coffee.',
      departureInfo: 'Departs every Tuesday & Saturday',
      groupSize: 'Max 10 guests',
      highlights: [
        'Purification ritual under the sacred fountains of Tirta Empul',
        'Sunrise yoga overlooking the Ayung river valley',
        'Kecak fire dance on the Uluwatu cliff at sunset',
      ],
    },
    'tour-dai-loan-am-thuc': {
      title: 'Taiwan by Taste: Taipei – Jiufen – Sun Moon Lake',
      description:
        'A journey travelled by palate: steaming xiaolongbao in Taipei, high-mountain oolong, sky lanterns in Shifen, and sleepless night markets — eating the way Taiwan enjoys life.',
      departureInfo: 'Departs every Wednesday from Ho Chi Minh City & Hanoi',
      groupSize: 'Max 10 guests',
      highlights: [
        'Release a wish lantern in the old street of Shifen',
        'High-mountain oolong tasting with a local tea master',
        'Two night-market evenings: Shilin and Fengjia, eating like locals',
      ],
    },
    'tour-le-giang-shangrila': {
      title: 'Lijiang – Shangri-La: Snow Mountain Old Towns & Tiger Leaping Gorge',
      description:
        'Six days on the Yunnan plateau: get happily lost in Lijiang’s stone lanes, stand before Jade Dragon Snow Mountain, and reach Shangri-La — land of Songzanlin Monastery and gentle Tibetan hosts.',
      departureInfo: 'Departs every Thursday, direct flight to Kunming',
      groupSize: 'Max 10 guests',
      highlights: [
        'Open-air performance beneath Jade Dragon Snow Mountain',
        'Walk the finest stretch of Tiger Leaping Gorge with local porters',
        'A night in Shangri-La old town, sharing butter tea with a Tibetan family',
      ],
    },
    'tour-han-quoc-la-do': {
      title: 'Korea in Autumn Colours: Seoul – Nami Island – Jeju',
      description:
        'Korea at its most beautiful: wear hanbok through Gyeongbokgung, cycle under Nami’s ginkgo avenues, then slow down for two days on Jeju — island of wind, stone and seaside cafés.',
      departureInfo: 'Departs in foliage season Oct – Nov & cherry blossom season Apr',
      groupSize: 'Max 12 guests',
      highlights: [
        'Free palace entry in hanbok, like honoured guests of old',
        'A day on Jeju: Cheonjiyeon Falls and the Osulloc tea fields',
        'Kimchi-making class in Seoul — take your own jar home',
      ],
    },
    'tour-nhat-ban-kyoto': {
      title: 'Japan: Tokyo – Slow Kyoto – Osaka',
      description:
        'Three cities, three tempos: just enough of buzzing Tokyo, two full days in Kyoto for the Arashiyama bamboo grove, Fushimi Inari’s thousand gates and a private tea ceremony, closing with an Osaka food night.',
      departureInfo: 'Departs in cherry blossom & autumn seasons, limited seats',
      groupSize: 'Max 10 guests',
      highlights: [
        'Two full nights in Kyoto — few tours dare go this slow',
        'Tea ceremony with a tea master in a century-old Gion machiya',
        'Shinkansen ride with Mt. Fuji views between Tokyo and Kyoto',
      ],
    },
    'tour-nepal-annapurna': {
      title: 'Nepal: Kathmandu – Pokhara & a Gentle Annapurna Trek',
      description:
        'Nine days toward the Himalaya, the slow traveller’s way: old Kathmandu, the mirror-still Phewa Lake, and four gentle trekking days through Gurung villages, ending each afternoon with ginger tea and the Annapurnas turning gold.',
      departureInfo: 'Departs Oct – Nov & Mar – Apr, small groups only',
      groupSize: 'Max 8 guests',
      highlights: [
        'Beginner-friendly Ghandruk – Landruk trek, porters carry main luggage',
        'Sunrise from Poon Hill before the Annapurna & Dhaulagiri ranges',
        'Final-night dal bhat dinner with your teahouse host family in Ghandruk',
      ],
    },
    'tour-mong-co-thao-nguyen': {
      title: 'Mongolia: Ger Nights & Endless Steppe Days',
      description:
        'Almost a week beyond phone signal: stay in a ger with a nomad family, learn to milk a mare, ride across the Orkhon valley and watch the Milky Way in nights of absolute steppe silence.',
      departureInfo: 'Departs Jun – Aug, green steppe season',
      groupSize: 'Max 8 guests',
      highlights: [
        'Two nights in your own ger homestay with a nomad family',
        'Horseback ride to Orkhon Falls with local herders',
        'Ancient capital Karakorum and the 16th-century Erdene Zuu Monastery',
      ],
    },
    'tour-bhutan-hanh-phuc': {
      title: 'Bhutan: The Happiness Kingdom & Tiger’s Nest Monastery',
      description:
        'To the country that measures wealth in happiness: climb to the cliff-clinging Tiger’s Nest, spin prayer wheels in Thimphu, and live a few days at Bhutan’s pace — slow, still and kind.',
      departureInfo: 'Departs Mar – May & Oct – Nov, max 8 guests',
      groupSize: 'Max 8 guests',
      highlights: [
        'Summit Tiger’s Nest at 3,120m with a Bhutanese guide',
        'Meditation session and conversation with monks at Punakha Dzong',
        'Dress in gho/kira and try archery with local hosts',
      ],
    },
    'tour-chau-au-co-dien': {
      title: 'Classic Europe: France – Switzerland – Italy',
      description:
        'Ten days on the classic European route, without the rush: Paris of century-old cafés, the Alps and calm Lake Lucerne, then Venice, Florence and Rome to close the journey in art and Italian sun.',
      departureInfo: 'Departs May – Jun & Sep – Oct',
      groupSize: 'Max 12 guests',
      highlights: [
        'Two nights in Paris — slow enough for a Montmartre morning',
        'Scenic rail across the Alps from Lucerne to Milan',
        'A late-afternoon gondola ride when Venice empties of day crowds',
      ],
    },
  } as Record<
    string,
    {
      title: string;
      description: string;
      departureInfo: string;
      groupSize: string;
      highlights: string[];
    }
  >,
  experiences: {
    'exp-kayak': {
      title: 'Sunrise Kayaking',
      location: 'Lan Ha Bay · Hai Phong',
      duration: '2.5 hours',
      description:
        'Glide over mirror-calm emerald water at 5:30 AM as morning birdsong echoes across towering karst walls.',
    },
    'exp-cooking': {
      title: 'Garden Cooking Class',
      location: 'Tra Que Village · Hoi An',
      duration: '3.5 hours',
      description:
        'Shop early local markets, pick crisp organic herbs in the garden, and cook three Central specialties with local hosts.',
    },
    'exp-trekking': {
      title: 'Highland Village Trekking',
      location: 'Muong Hoa · Sapa',
      duration: 'Full day',
      description:
        'Walk narrow mountain trails past timber homes and listen to stories of rice harvests and indigo linen weaving.',
    },
    'exp-diving': {
      title: 'Coral Reef Snorkeling',
      location: 'Gam Ghi Islet · Phu Quoc',
      duration: '4 hours',
      description:
        'Float above sunlit white sandbars 4–6m deep and discover thriving natural coral gardens with a guide.',
    },
    'exp-lantern': {
      title: 'Lantern River Evening',
      location: 'Thu Bon River · Hoi An',
      duration: '2 hours',
      description:
        'Drift gently on a wooden sampan as silk lanterns glow at dusk, sipping lotus tea and folding paper wish lights.',
    },
    'exp-sunset-photo': {
      title: 'Golden Hour Photo Walk',
      location: 'Tam Coc · Ninh Binh & Ha Long',
      duration: '3 hours',
      description:
        'Join a local documentary photographer at secluded viewpoints to capture soft late-afternoon golden light.',
    },
    'exp-hanoi-coffee': {
      title: 'Egg Coffee & 36 Guild Streets',
      location: 'Old Quarter · Hanoi',
      duration: '3 hours',
      description:
        'Start morning on a leafy vintage balcony with velvety egg coffee before wandering Hanoi’s traditional craft streets.',
    },
    'exp-saigon-food': {
      title: 'Hidden Alleys & River Pier Food Walk',
      location: 'District 1 & Cho Lon · Saigon',
      duration: '3.5 hours',
      description:
        'Follow local foodies into glowing neighborhood alleys, from sock-brewed heritage coffee to sizzling night stalls.',
    },
    'exp-bat-trang': {
      title: 'Potter’s Wheel & Riverside Tea',
      location: 'Bat Trang Village · Hanoi',
      duration: '4 hours',
      description:
        'Shape kaolin clay on a traditional spinning wheel beside village artisans and enjoy lotus tea by the Red River.',
    },
  } as Record<
    string,
    { title: string; location: string; duration: string; description: string }
  >,
  process: [
    {
      step: '01',
      title: 'Pick a route or share your pace',
      description:
        'Filter tours by region, travel length, or stay tier — or simply send a few lines on whether you crave quiet nature, food, or light trekking.',
      note: 'No fixed dates required upfront',
    },
    {
      step: '02',
      title: 'Local route specialist calls within 2 hours',
      description:
        'Someone who has personally walked the route will call to share real seasonal weather conditions and tailor rooms to your style.',
      note: 'Callbacks during 08:00 – 20:00 daily',
    },
    {
      step: '03',
      title: 'Transparent itemized hold',
      description:
        'Receive a clear breakdown with zero hidden fees. Only a 30% deposit secures boutique rooms and your local guide.',
      note: 'Free date change up to 7 days prior',
    },
    {
      step: '04',
      title: 'Set off & live slowly',
      description:
        'Three days before departure, receive your bespoke pocket field guide and 24/7 direct coordinator contact.',
      note: 'Capped at 8–10 guests or private',
    },
  ],
  testimonials: {
    'testi-1': {
      city: 'Ho Chi Minh City',
      tourName: 'Ma Pi Leng Pass Ride & Nho Que River Boat Journey',
      travelDate: 'Oct 2025',
      quote:
        'What stayed with me wasn’t the overlook selfie, but sharing warm tea inside our Lo Lo hosts’ rammed-earth kitchen. With only six of us, nothing ever felt rushed.',
    },
    'testi-2': {
      city: 'Hanoi',
      tourName: 'Overnight Wooden Junk Cruise on Ha Long & Lan Ha Bay',
      travelDate: 'Aug 2025',
      quote:
        'Both my 65-year-old parents and 7-year-old son felt completely at ease. Kayaking into silent caves at 6 AM with only paddle ripples was worth every minute.',
    },
    'testi-3': {
      city: 'Da Nang',
      tourName: 'Imperial Hue Memories & Kim Long Garden House Dining',
      travelDate: 'Jan 2026',
      quote:
        'Even as a Central Vietnam native, I was captivated by our Kim Long garden lunch and the intimate stories our guide shared at each weathered citadel gate.',
    },
  } as Record<string, { city: string; tourName: string; travelDate: string; quote: string }>,
  faqs: {
    'faq-included': {
      question: 'What is included in Mây Lang Thang tour prices?',
      answer:
        'Listed rates cover seamless ground transport from the meeting point, handpicked stays matching your selected tier, all regional meals in the itinerary, entrance tickets, gear (kayaks, snorkel sets, vests), travel insurance up to 100M VND, and your local storyteller guide. Only flights to the starting hub and personal drinks are excluded.',
    },
    'faq-cancel': {
      question: 'What is your date-change or cancellation policy?',
      answer:
        'Plans shift, and we keep things humane. You receive one free date change with at least 7 days’ notice. For cancellations: 100% deposit refund 15+ days ahead, 70% refund 7–14 days ahead, or 100% credit preserved toward any route within 12 months.',
    },
    'faq-private': {
      question: 'Do you arrange private tours for families or teams?',
      answer:
        'Yes. Nearly 40% of our departures are bespoke private trips for families of 4+ or company retreats of 10–35 guests. You can also select the “Private Family / Group” tier directly inside any tour modal.',
    },
    'faq-age': {
      question: 'Are these journeys suitable for young children and older adults?',
      answer:
        'Absolutely for Ha Long, Ninh Binh, Hue, Hoi An, Quy Nhon, Da Lat, Can Tho, and Phu Quoc, which feature gentle pacing and generous rest. Children under 5 often travel free or at 50%. For Sapa treks or Ha Giang rides, we arrange private cars or shorter 3–4km walks.',
    },
  } as Record<string, { question: string; answer: string }>,
  journal: {
    'journal-lo-lo-chai': {
      category: 'Ký sự khách hàng' as const,
      destination: 'Ha Giang',
      title: 'Dawn by a Rammed-Earth Hearth in Lo Lo Chai',
      excerpt:
        'We reached the far north on an October afternoon wrapped in mist — and what lingered longest was hot Shan Tuyet tea on an earthen veranda.',
      authorName: 'Minh Chau & Friends (HCMC)',
      authorRole: 'Ma Pi Leng 3D2N Guests',
      publishedDate: 'Oct 14, 2025',
      readTime: '5 min read',
      pullQuote:
        'Slow travel isn’t about seeing fewer places — it’s lingering long enough to remember the real name of someone you just met.',
      paragraphs: [
        'As our vehicle cleared Tham Ma slope, late mist already blanketed Dong Van valley. Rather than racing toward Lung Cu flag tower before closing, our guide Vang turned onto a quiet stone lane leading into Lo Lo Chai hamlet.',
        'Inside a thick rammed-earth home, Mrs. My was tending a wood hearth simmering herbal mountain stew and twice-steamed corn cakes. In the crisp 11°C mountain air, six city travelers felt an immediate stillness settle over the room.',
        'At 5:30 the next morning, we walked mossy stone fences up the pine ridge behind the village to watch sunrise crest jagged limestone peaks — no megaphones, no rushing, only brass goat bells and warm waves from farmers heading to fields.',
      ],
    },
    'journal-muong-hoa-indigo': {
      category: 'Văn hóa bản địa' as const,
      destination: 'Sapa',
      title: 'Indigo Hands: Hemp & Beeswax Craft in Ta Van',
      excerpt:
        'Achieving a deep copper-sheen indigo cloth takes three weeks of mountain sun, fermented leaves, and steady hands.',
      authorName: 'Ha Vy, Contributing Editor',
      authorRole: 'Hoang Lien Son Field Notes',
      publishedDate: 'Nov 02, 2025',
      readTime: '6 min read',
      pullQuote:
        'Every hot beeswax line drawn onto raw hemp carries a family memory of terraced paddies, streams, and harvest seasons.',
      paragraphs: [
        'Leaving bustling Sapa town behind, a quiet footpath along Muong Hoa terraces led us down into Ta Van while morning fog clung to cypress roofs. Outside Mrs. Sung Thi Do’s porch stood two deep vats of fermented wild indigo.',
        'She explained how village women harvest indigo leaves every autumn, steep them three days in spring water, and whisk them with slaked lime. Achieving the durable metallic sheen on hand-loomed hemp requires dipping, wringing, and sun-drying dozens of times.',
        'Seated beside a glowing brazier, our group tried drawing geometric motifs with molten beeswax pens — finding unexpected calm in the rhythm of mountain water and cooling wax.',
      ],
    },
    'journal-hanoi-balcony': {
      category: 'Ẩm thực & Làng nghề' as const,
      destination: 'Hanoi',
      title: 'Morning on a Timber Balcony: Hanoi’s Egg Coffee Story',
      excerpt:
        'Tucked behind a bicycle-wide Old Quarter lane lies an upstairs room smelling of butter-roasted coffee and autumn spice.',
      authorName: 'Quoc Bao Tran',
      authorRole: 'Hanoi Old Quarter Guest',
      publishedDate: 'Nov 19, 2025',
      readTime: '4 min read',
      pullQuote:
        'Hanoi never rushes egg coffee — hand-whipped custard needs time to melt gently over a warm porcelain bath.',
      paragraphs: [
        'Even after thirty years living in Hanoi, waking at 6:30 AM for a Mây Lang Thang walk revealed a Hang Bac Street without horns — only bamboo brooms sweeping fallen dracontomelon leaves and fresh green rice scents near Hoan Kiem Lake.',
        'Our third stop climbed worn stairs to an ochre plaster balcony where the owner still whisks farm egg yolks with forest honey and dark phin espresso using a forty-year-old hand mixer.',
        'Resting the crackle-glaze Bat Trang cup inside a bowl of hot water, tales of Hanoi’s ancient guild streets unfolded naturally with every velvety sip.',
      ],
    },
    'journal-saigon-cholon': {
      category: 'Ký sự khách hàng' as const,
      destination: 'Saigon',
      title: 'Cho Lon Sock Coffee & Saigon’s Sleepless Food Alleys',
      excerpt:
        'From a 60-year-old coffee stove lit at 3 AM to hand-pulled noodles in District 5, Saigon reveals a surprisingly tender heart.',
      authorName: 'Hoang Minh Family',
      authorRole: 'Saigon 2D1N Guests',
      publishedDate: 'Dec 08, 2025',
      readTime: '5 min read',
      pullQuote:
        'Saigon wins you over not with riverfront skyscrapers, but with the effortless warmth of an alley vendor’s smile.',
      paragraphs: [
        'Most visitors picture Saigon through glass towers along Bach Dang Pier, yet our evening began inside a historic Sino-Vietnamese alleyway in old Cho Lon.',
        'Inside a three-generation cafe, earthenware kettles hissed over glowing charcoal while dark coffee filtered smoothly through cotton socks into classic ridged glasses.',
        'Later, drifting past lantern-lit piers aboard a small wooden river boat, we saw how gentle Saigon becomes once you step off the main boulevard.',
      ],
    },
    'journal-hue-kim-long': {
      category: 'Ẩm thực & Làng nghề' as const,
      destination: 'Hue',
      title: 'Pomelo Season & Timber Garden Dining in Kim Long',
      excerpt:
        'Along the Perfume River’s quiet northern bank, Hue cuisine speaks softly through balance rather than spectacle.',
      authorName: 'Hoang Anh Le',
      authorRole: 'Imperial Hue 3D2N Guest',
      publishedDate: 'Jan 12, 2026',
      readTime: '5 min read',
      pullQuote:
        'Hue’s finest meal isn’t on a white tablecloth, but beneath jackfruit-timber eaves where the host peels garden pomelo by hand.',
      paragraphs: [
        'Red-earth lanes into Kim Long wind beneath bamboo arches and century-old thanh tra pomelo trees. Mrs. Nga welcomed us into her ancestral wooden garden home with freshly brewed wild vối tea.',
        'Lunch featured five unhurried dishes: roasted-sesame fig salad, sour starfruit river fish broth, lemongrass shrimp paste, and charred lemongrass skewers wrapped in fresh garden herbs.',
        'At dusk, paddleboarding across mirror-pink Tam Giang Lagoon closed the day in complete coastal stillness.',
      ],
    },
    'journal-tra-su-water': {
      category: 'Văn hóa bản địa' as const,
      destination: 'An Giang',
      title: 'When Floodwaters Turn Tra Su Cajuput Forests Emerald',
      excerpt:
        'Every autumn, Mekong floodwaters transform An Giang’s ancient cajuput woods into a silent green sanctuary.',
      authorName: 'Quang Nhat, Contributing Editor',
      authorRole: 'Mekong Delta Field Notes',
      publishedDate: 'Jan 27, 2026',
      readTime: '4 min read',
      pullQuote:
        'Aboard a silent wooden skiff parting velvet duckweed, every trace of city noise vanishes beneath the canopy.',
      paragraphs: [
        'Unlike bustling dawn floating markets, Tra Su Cajuput Forest greets travelers with hushed stillness. Our motor-free sampan slipped cleanly across neon-green duckweed.',
        'Uncle Bay, born in Van Giao commune, pointed toward high treetops alive with nesting egrets and storks, explaining how seasonal floodwaters bring wild fish, yellow sesbania blossoms, and cajuput honey.',
        'Before sunset, we paused at a palm-sugar hut beneath Sam Mountain to sip chilled fresh palm juice as distant pagoda bells drifted across emerald paddies.',
      ],
    },
  } as Record<
    string,
    {
      category: Exclude<JournalCategory, 'Tất cả'>;
      destination: string;
      title: string;
      excerpt: string;
      authorName: string;
      authorRole: string;
      publishedDate: string;
      readTime: string;
      pullQuote: string;
      paragraphs: string[];
    }
  >,
};
