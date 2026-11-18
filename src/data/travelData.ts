/**
 * TỆP DỮ LIỆU TRUNG TÂM — MÂY LANG THANG
 * -------------------------------------------------------------------------
 * Hướng dẫn chỉnh sửa nhanh:
 * 1. Đổi ảnh: Thay giá trị `image` bằng đường dẫn ảnh mới (URL Unsplash hoặc file nội bộ).
 * 2. Đổi điểm đến & tọa độ bản đồ: Chỉnh mảng `DESTINATIONS` (cập nhật `coordinates` [kinh độ, vĩ độ]).
 * 3. Đổi danh sách tour, giá & các gói lựa chọn: Chỉnh mảng `TOURS` và `TOUR_ADDONS`.
 */

export type TourCategory = 'Tất cả' | 'Biển đảo' | 'Núi rừng' | 'Văn hóa' | 'Ẩm thực';
export type RegionZone = 'Tất cả' | 'Miền Bắc' | 'Miền Trung' | 'Miền Nam';
export type DurationFilter = 'Tất cả' | '2 ngày 1 đêm' | '3 ngày 2 đêm';

export interface TourPackageOption {
  id: string;
  label: string;
  summary: string;
  priceDelta: number;
}

export interface TourAddonOption {
  id: string;
  label: string;
  price: number;
}

export interface DestinationItem {
  id: string;
  name: string;
  region: string;
  zone: Exclude<RegionZone, 'Tất cả'>;
  tagline: string;
  bestSeason: string;
  /** Tọa độ [kinh độ, vĩ độ] dùng cho bản đồ D3/SVG */
  coordinates: [number, number];
  image: string;
  alt: string;
  tourCount: number;
}

export interface TourItem {
  id: string;
  title: string;
  destination: string;
  zone: Exclude<RegionZone, 'Tất cả'>;
  category: Exclude<TourCategory, 'Tất cả'>;
  duration: Exclude<DurationFilter, 'Tất cả'>;
  price: number;
  rating: number;
  reviewCount: number;
  groupSize: string;
  departureInfo: string;
  description: string;
  highlights: string[];
  packages: TourPackageOption[];
  image: string;
  alt: string;
}

export interface ExperienceItem {
  id: string;
  index: string;
  title: string;
  location: string;
  duration: string;
  description: string;
  image: string;
  alt: string;
}

export interface StatItem {
  id: string;
  value: number;
  decimals?: number;
  suffix: string;
  label: string;
  detail: string;
}

export interface ProcessStep {
  step: string;
  title: string;
  description: string;
  note: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  city: string;
  tourName: string;
  quote: string;
  travelDate: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export type JournalCategory =
  | 'Tất cả'
  | 'Ký sự khách hàng'
  | 'Văn hóa bản địa'
  | 'Ẩm thực & Làng nghề';

export interface JournalArticle {
  id: string;
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
  image: string;
  alt: string;
}

/* =========================================================================
 * 1. ẢNH & VIDEO NỀN HERO
 * Ghi chú: Điền đường dẫn file .mp4/.webm vào `videoUrl` nếu muốn phát video MP4 riêng.
 * Khi để trống, Hero tự chạy thước phim nền chuyển động mượt từ bộ ảnh `videoSlides`.
 * ========================================================================= */
export const HERO_DATA = {
  eyebrow: 'Tạp chí hành trình Việt Nam · 17 vùng đất & nhóm nhỏ tối đa 10 khách',
  headline: 'Đi chậm, sống nhiều.',
  subtitle:
    'Chúng tôi không chạy theo danh sách điểm check-in. Mỗi chuyến đi của Mây Lang Thang là một lát cắt dịu dàng qua vịnh biển sớm sương, đèo mây phía Bắc, cố đô rêu phong và miệt vườn sông nước.',
  ctaLabel: 'Khám phá tour',
  image: '/src/assets/images/hero_vietnam_mist_1794970963443.jpg',
  alt: 'Vịnh Hạ Long và núi đá vôi Việt Nam trong làn sương sớm bình minh vàng óng',
  videoUrl: '',
  videoSlides: [
    {
      src: '/src/assets/images/hero_vietnam_mist_1794970963443.jpg',
      alt: 'Vịnh Hạ Long bình minh sương sớm',
      captionVi: 'Vịnh Hạ Long · Bình minh',
      captionEn: 'Ha Long Bay · Dawn Mist',
    },
    {
      src: '/src/assets/images/exp_kayak_dawn_1794970966817.jpg',
      alt: 'Chèo kayak đón bình minh trên vịnh Lan Hạ',
      captionVi: 'Lan Hạ · Mặt nước sớm mai',
      captionEn: 'Lan Ha · Morning Calm',
    },
    {
      src: '/src/assets/images/dest_da_lat_1794970965037.jpg',
      alt: 'Biển mây đồi thông Đà Lạt lúc mặt trời lên',
      captionVi: 'Đà Lạt · Biển mây đồi thông',
      captionEn: 'Da Lat · Pine Ridge Clouds',
    },
  ],
};

/* =========================================================================
 * 2. SỐ LIỆU GIỚI THIỆU
 * ========================================================================= */
export const STATS: StatItem[] = [
  {
    id: 'guests',
    value: 48000,
    suffix: '+',
    label: 'Lượt khách đồng hành',
    detail: 'Trong hơn 8 năm thiết kế hành trình chậm',
  },
  {
    id: 'provinces',
    value: 63,
    suffix: '',
    label: 'Tỉnh thành đặt chân',
    detail: 'Từ cực Bắc Lũng Cú đến chợ nổi miền Tây',
  },
  {
    id: 'rating',
    value: 4.9,
    decimals: 1,
    suffix: '/5',
    label: 'Điểm hài lòng trung bình',
    detail: 'Đánh giá xác thực sau khi kết thúc chuyến đi',
  },
  {
    id: 'guides',
    value: 120,
    suffix: '+',
    label: 'Hướng dẫn viên bản địa',
    detail: 'Người địa phương kể chuyện quê hương bằng ký ức thật',
  },
];

/* =========================================================================
 * 3. ĐIỂM ĐẾN NỔI BẬT (10 địa điểm đa dạng Bắc - Trung - Nam)
 * ========================================================================= */
export const REGION_ZONES: RegionZone[] = ['Tất cả', 'Miền Bắc', 'Miền Trung', 'Miền Nam'];

export const DESTINATIONS: DestinationItem[] = [
  {
    id: 'ha-long',
    name: 'Hạ Long',
    region: 'Quảng Ninh · Đông Bắc',
    zone: 'Miền Bắc',
    tagline: 'Ngủ đêm giữa vịnh xanh ngọc tĩnh lặng',
    bestSeason: 'Tháng 4 – 6 & 9 – 11',
    coordinates: [107.0833, 20.95],
    image: '/src/assets/images/dest_ha_long_1794970963621.jpg',
    alt: 'Thuyền buồm gỗ truyền thống lướt nhẹ trên làn nước xanh ngọc vịnh Hạ Long lúc hoàng hôn',
    tourCount: 4,
  },
  {
    id: 'ha-giang',
    name: 'Hà Giang',
    region: 'Cao nguyên đá · Cực Bắc',
    zone: 'Miền Bắc',
    tagline: 'Đèo mây Mã Pí Lèng và hẻm vực sông Nho Quế',
    bestSeason: 'Tháng 9 – 11 & 1 – 3',
    coordinates: [105.25, 23.12],
    image: '/src/assets/images/dest_ha_giang_1794970964276.jpg',
    alt: 'Cung đường đèo Mã Pí Lèng uốn lượn bên sườn núi đá vôi nhìn xuống dòng sông Nho Quế xanh biếc ở Hà Giang',
    tourCount: 5,
  },
  {
    id: 'cao-bang',
    name: 'Cao Bằng',
    region: 'Thác Bản Giốc · Đông Bắc',
    zone: 'Miền Bắc',
    tagline: 'Thác nước xanh ngọc bên biên giới và thung lũng sông Quây Sơn',
    bestSeason: 'Tháng 8 – 11',
    coordinates: [106.723, 22.855],
    image: '/src/assets/images/dest_cao_bang_1794972067545.jpg',
    alt: 'Thác Bản Giốc nhiều tầng nước trắng xóa đổ xuống dòng sông Quây Sơn xanh ngọc ở Cao Bằng',
    tourCount: 3,
  },
  {
    id: 'ha-noi',
    name: 'Hà Nội',
    region: 'Thủ đô · 36 phố phường',
    zone: 'Miền Bắc',
    tagline: 'Hồ Gươm sớm sương, phố cổ rêu phong và cà phê trứng góc ban công',
    bestSeason: 'Tháng 9 – 11 & 3 – 4',
    coordinates: [105.8342, 21.0278],
    image: '/src/assets/images/dest_ha_noi_1794972303202.jpg',
    alt: 'Hồ Hoàn Kiếm mờ sương buổi sớm bên dãy nhà cổ vàng rêu phong của phố cổ Hà Nội',
    tourCount: 4,
  },
  {
    id: 'ninh-binh',
    name: 'Ninh Bình',
    region: 'Tam Cốc · Tràng An',
    zone: 'Miền Bắc',
    tagline: 'Đò chèo sông Ngô Đồng giữa cánh đồng lúa và núi đá vôi',
    bestSeason: 'Tháng 5 – 6 & 9 – 11',
    coordinates: [105.915, 20.215],
    image: '/src/assets/images/dest_ninh_binh_1794971770699.jpg',
    alt: 'Thuyền nan xuôi dòng sông Ngô Đồng xanh ngọc giữa cánh đồng lúa Tam Cốc Ninh Bình',
    tourCount: 3,
  },
  {
    id: 'sapa',
    name: 'Sapa',
    region: 'Lào Cai · Dãy Hoàng Liên Sơn',
    zone: 'Miền Bắc',
    tagline: 'Ruộng bậc thang Mường Hoa ẩn hiện trong sương',
    bestSeason: 'Tháng 3 – 5 & 9 – 10',
    coordinates: [103.8438, 22.3364],
    image: '/src/assets/images/dest_sapa_1794970965669.jpg',
    alt: 'Ruộng bậc thang xanh mướt uốn lượn tại thung lũng Mường Hoa Sapa trong làn sương sớm',
    tourCount: 5,
  },
  {
    id: 'phong-nha',
    name: 'Phong Nha',
    region: 'Quảng Bình · Vương quốc hang động',
    zone: 'Miền Trung',
    tagline: 'Sông Son xanh thẳm chảy ra từ lòng hang đá vôi nguyên sinh',
    bestSeason: 'Tháng 3 – 8',
    coordinates: [106.283, 17.591],
    image: '/src/assets/images/dest_phong_nha_1794972068750.jpg',
    alt: 'Thuyền gỗ tiến vào cửa động Phong Nha giữa rừng núi đá vôi xanh rì Quảng Bình',
    tourCount: 4,
  },
  {
    id: 'hue',
    name: 'Huế',
    region: 'Thừa Thiên Huế · Cố đô',
    zone: 'Miền Trung',
    tagline: 'Sông Hương mờ sương, cổng thành rêu phong và cơm nhà vườn',
    bestSeason: 'Tháng 1 – 5',
    coordinates: [107.5909, 16.4637],
    image: '/src/assets/images/dest_hue_1794971771385.jpg',
    alt: 'Cổng thành cổ kính rêu phong bên dòng sông Hương yên ả trong buổi bình minh xứ Huế',
    tourCount: 4,
  },
  {
    id: 'hoi-an',
    name: 'Hội An',
    region: 'Quảng Nam · Di sản miền Trung',
    zone: 'Miền Trung',
    tagline: 'Phố đèn lồng vàng ươm và vườn rau Trà Quế',
    bestSeason: 'Tháng 2 – 8',
    coordinates: [108.338, 15.8801],
    image: '/src/assets/images/dest_hoi_an_1794970965738.jpg',
    alt: 'Phố cổ Hội An lung linh ánh đèn lồng soi bóng xuống dòng sông Thu Bồn vào lúc chạng vạng',
    tourCount: 6,
  },
  {
    id: 'mang-den',
    name: 'Măng Đen',
    region: 'Kon Tum · Đại ngàn Tây Nguyên',
    zone: 'Miền Trung',
    tagline: 'Hồ Đắk Ke phẳng lặng giữa rừng thông già và sương mờ ban mai',
    bestSeason: 'Tháng 11 – 4',
    coordinates: [108.288, 14.595],
    image: '/src/assets/images/dest_mang_den_1794972068497.jpg',
    alt: 'Hồ nước phẳng lặng soi bóng rừng thông và hoa anh đào nở sớm tại cao nguyên Măng Đen',
    tourCount: 3,
  },
  {
    id: 'quy-nhon',
    name: 'Quy Nhơn',
    region: 'Bình Định · Duyên hải Nam Trung Bộ',
    zone: 'Miền Trung',
    tagline: 'Eo Gió lộng gió, làng chài Nhơn Lý và vịnh nước trong xanh',
    bestSeason: 'Tháng 3 – 9',
    coordinates: [109.2197, 13.783],
    image: '/src/assets/images/dest_quy_nhon_1794971771597.jpg',
    alt: 'Vách đá Eo Gió ôm trọn làn nước biển xanh ngọc và thuyền thúng làng chài Nhơn Lý Quy Nhơn',
    tourCount: 3,
  },
  {
    id: 'da-lat',
    name: 'Đà Lạt',
    region: 'Lâm Đồng · Cao nguyên Langbiang',
    zone: 'Miền Trung',
    tagline: 'Biển mây sớm mai xuyên qua rặng thông già',
    bestSeason: 'Tháng 11 – 4',
    coordinates: [108.4583, 11.9404],
    image: '/src/assets/images/dest_da_lat_1794970965037.jpg',
    alt: 'Rừng thông Đà Lạt đón tia nắng bình minh xuyên qua biển mây trắng bồng bềnh trên thung lũng',
    tourCount: 4,
  },
  {
    id: 'sai-gon',
    name: 'Sài Gòn',
    region: 'TP. Hồ Chí Minh · Đô thị phương Nam',
    zone: 'Miền Nam',
    tagline: 'Chợ Lớn trăm tuổi, hẻm nhỏ ẩm thực và hoàng hôn trên sông Sài Gòn',
    bestSeason: 'Tháng 12 – 4',
    coordinates: [106.7009, 10.7769],
    image: '/src/assets/images/dest_sai_gon_1794972303889.jpg',
    alt: 'Hoàng hôn vàng rực trên sông Sài Gòn bên những tòa nhà di sản và hàng cọ nhiệt đới',
    tourCount: 4,
  },
  {
    id: 'an-giang',
    name: 'An Giang',
    region: 'Trà Sư · Vùng Thất Sơn',
    zone: 'Miền Nam',
    tagline: 'Xuồng ba lá lướt trên thảm bèo xanh rừng tràm Trà Sư',
    bestSeason: 'Tháng 9 – 12',
    coordinates: [105.118, 10.703],
    image: '/src/assets/images/dest_an_giang_1794972069923.jpg',
    alt: 'Xuồng gỗ chèo tay lướt qua thảm bèo xanh mướt dưới tán rừng tràm Trà Sư An Giang',
    tourCount: 3,
  },
  {
    id: 'can-tho',
    name: 'Cần Thơ',
    region: 'Đồng bằng sông Cửu Long · Miền Tây',
    zone: 'Miền Nam',
    tagline: 'Chợ nổi Cái Răng bình minh và vườn cây trái Cồn Sơn',
    bestSeason: 'Tháng 12 – 5',
    coordinates: [105.7689, 10.0452],
    image: '/src/assets/images/dest_can_tho_1794971772434.jpg',
    alt: 'Ghe thuyền chở đầy trái cây rực rỡ sắc màu họp chợ nổi Cái Răng Cần Thơ lúc bình minh',
    tourCount: 3,
  },
  {
    id: 'phu-quoc',
    name: 'Phú Quốc',
    region: 'Kiên Giang · Biển Tây Nam',
    zone: 'Miền Nam',
    tagline: 'Vịnh nước trong vắt và rạn san hô nguyên sơ',
    bestSeason: 'Tháng 11 – 4',
    coordinates: [103.984, 10.227],
    image: '/src/assets/images/dest_phu_quoc_1794970965284.jpg',
    alt: 'Thuyền gỗ neo đậu trên làn nước biển trong vắt nhìn thấu rạn san hô tại đảo Phú Quốc',
    tourCount: 3,
  },
  {
    id: 'con-dao',
    name: 'Côn Đảo',
    region: 'Bà Rịa – Vũng Tàu · Hòn đảo tĩnh lặng',
    zone: 'Miền Nam',
    tagline: 'Bãi Đầm Trầu hoang sơ, rừng nguyên sinh và mùa rùa biển đẻ trứng',
    bestSeason: 'Tháng 3 – 9',
    coordinates: [106.609, 8.686],
    image: '/src/assets/images/dest_con_dao_1794972070502.jpg',
    alt: 'Bãi cát vàng hình vòng cung yên bình ôm lấy vịnh biển xanh ngọc ở Côn Đảo',
    tourCount: 3,
  },
];

/* =========================================================================
 * 4. GÓI LỰA CHỌN & DỊCH VỤ CHỌN THÊM CHO TỪNG TOUR
 * ========================================================================= */
export const DEFAULT_TOUR_PACKAGES: TourPackageOption[] = [
  {
    id: 'local-standard',
    label: 'Gói Bản Địa',
    summary: 'Homestay / cabin gỗ chọn lọc, ghép nhóm nhỏ 6–10 khách',
    priceDelta: 0,
  },
  {
    id: 'boutique-retreat',
    label: 'Nghỉ Dưỡng Tinh Tế',
    summary: 'Nâng hạng phòng boutique view đẹp + bữa tối đặc sản riêng',
    priceDelta: 1250000,
  },
  {
    id: 'private-group',
    label: 'Đi Riêng Gia Đình / Nhóm',
    summary: 'Xe riêng, hướng dẫn viên riêng và giờ giấc linh hoạt',
    priceDelta: 2100000,
  },
];

export const TOUR_ADDONS: TourAddonOption[] = [
  {
    id: 'addon-airport',
    label: 'Đưa đón sân bay / nhà ga riêng 2 chiều',
    price: 450000,
  },
  {
    id: 'addon-photo',
    label: 'Nhiếp ảnh gia địa phương ghi hình 1 buổi',
    price: 900000,
  },
  {
    id: 'addon-diet',
    label: 'Thiết kế thực đơn chay / kiêng dị ứng riêng',
    price: 250000,
  },
];

/* =========================================================================
 * 5. DANH SÁCH 10 TOUR ĐA DẠNG KÈM LỰA CHỌN GÓI
 * ========================================================================= */
export const TOUR_CATEGORIES: TourCategory[] = [
  'Tất cả',
  'Biển đảo',
  'Núi rừng',
  'Văn hóa',
  'Ẩm thực',
];

export const DURATION_FILTERS: DurationFilter[] = [
  'Tất cả',
  '2 ngày 1 đêm',
  '3 ngày 2 đêm',
];

export const TOURS: TourItem[] = [
  {
    id: 'tour-ha-long-cruise',
    title: 'Du thuyền gỗ ngủ đêm vịnh Hạ Long & Lan Hạ',
    destination: 'Hạ Long',
    zone: 'Miền Bắc',
    category: 'Biển đảo',
    duration: '2 ngày 1 đêm',
    price: 4850000,
    rating: 4.9,
    reviewCount: 312,
    groupSize: 'Tối đa 10 khách',
    departureInfo: 'Khởi hành Thứ 4 & Thứ 7 hằng tuần',
    description:
      'Rời bến cảng đông đúc để neo tàu ở vùng vịnh lặng sóng, chèo kayak qua hang sáng tối và thưởng thức hải sản tươi nướng ngay trên boong gỗ.',
    highlights: [
      'Phòng cabin cửa sổ toàn cảnh nhìn thẳng ra đảo đá vôi',
      'Chèo kayak lúc 6 giờ sáng khi sương còn vương mặt nước',
      'Bữa tối 5 món chế biến từ hải sản đánh bắt trong ngày',
    ],
    packages: DEFAULT_TOUR_PACKAGES,
    image: '/src/assets/images/dest_ha_long_1794970963621.jpg',
    alt: 'Du thuyền gỗ truyền thống neo giữa vịnh Hạ Long yên bình lúc hoàng hôn',
  },
  {
    id: 'tour-ma-pi-leng',
    title: 'Chạy xe đèo Mã Pí Lèng & xuôi thuyền Nho Quế',
    destination: 'Hà Giang',
    zone: 'Miền Bắc',
    category: 'Núi rừng',
    duration: '3 ngày 2 đêm',
    price: 5200000,
    rating: 4.9,
    reviewCount: 284,
    groupSize: 'Tối đa 8 khách',
    departureInfo: 'Khởi hành Thứ 5 hằng tuần từ Hà Nội',
    description:
      'Ngồi sau tay lái của người dẫn đường bản địa qua bốn mùa hoa đá Đồng Văn, dừng chân uống trà shan tuyết cổ thụ trên đỉnh đèo.',
    highlights: [
      'Tài xế bản địa tay lái vững, bảo hiểm hành trình đầy đủ',
      'Ngủ nhà trình tường người Lô Lô Chải ấm áp tiện nghi',
      'Xuôi thuyền hẻm Tu Sản dưới vách đá dựng đứng sâu nhất Đông Nam Á',
    ],
    packages: DEFAULT_TOUR_PACKAGES,
    image: '/src/assets/images/dest_ha_giang_1794970964276.jpg',
    alt: 'Cung đường đèo Mã Pí Lèng hùng vĩ nhìn xuống sông Nho Quế ở Hà Giang',
  },
  {
    id: 'tour-ninh-binh-tam-coc',
    title: 'Ngồi đò sớm Tam Cốc & đạp xe làng cổ Ninh Bình',
    destination: 'Ninh Bình',
    zone: 'Miền Bắc',
    category: 'Văn hóa',
    duration: '2 ngày 1 đêm',
    price: 3350000,
    rating: 4.9,
    reviewCount: 164,
    groupSize: 'Tối đa 10 khách',
    departureInfo: 'Khởi hành Thứ 3 & Thứ 7 từ Hà Nội',
    description:
      'Xuống đò lúc 6 giờ 30 sáng trước khi khách đoàn đổ về, lướt qua ba hang đá mát lạnh rồi đạp xe xuyên đường làng cổ Bích Động.',
    highlights: [
      'Đi đò khung giờ sáng sớm yên tĩnh trên sông Ngô Đồng',
      'Đạp xe đường đê qua đầm sen và sân đình cổ thế kỷ 17',
      'Ăn trưa cơm niêu cùng gia đình nông dân tại thung lũng Hải Nham',
    ],
    packages: DEFAULT_TOUR_PACKAGES,
    image: '/src/assets/images/dest_ninh_binh_1794971770699.jpg',
    alt: 'Đò chèo tay trên sông Ngô Đồng xanh biếc giữa núi đá vôi Tam Cốc Ninh Bình',
  },
  {
    id: 'tour-sapa-trekking',
    title: 'Trekking đường mòn Cát Cát – Tả Van cùng người Mông',
    destination: 'Sapa',
    zone: 'Miền Bắc',
    category: 'Văn hóa',
    duration: '2 ngày 1 đêm',
    price: 3750000,
    rating: 4.8,
    reviewCount: 229,
    groupSize: 'Tối đa 8 khách',
    departureInfo: 'Khởi hành hằng ngày từ Hà Nội hoặc Lào Cai',
    description:
      'Đi theo lối mòn của người bản địa băng qua rừng trúc và ruộng bậc thang Mường Hoa, học nhuộm chàm vẽ sáp ong và ngủ đêm tại bản Tả Van.',
    highlights: [
      'Cung đường trekking 11km nhẹ nhàng, tách biệt đường nhựa đông đúc',
      'Bữa cơm gia đình ấm cúng cùng chủ nhà người Giáy',
      'Trải nghiệm tắm lá thuốc Dao Đỏ phục hồi cơ bắp sau chặng đi bộ',
    ],
    packages: DEFAULT_TOUR_PACKAGES,
    image: '/src/assets/images/dest_sapa_1794970965669.jpg',
    alt: 'Những thửa ruộng bậc thang xanh ngắt tại thung lũng Mường Hoa Sapa',
  },
  {
    id: 'tour-hue-imperial',
    title: 'Ký ức Cố đô Huế & ẩm thực nhà vườn Kim Long',
    destination: 'Huế',
    zone: 'Miền Trung',
    category: 'Ẩm thực',
    duration: '3 ngày 2 đêm',
    price: 4450000,
    rating: 4.9,
    reviewCount: 152,
    groupSize: 'Tối đa 8 khách',
    departureInfo: 'Khởi hành Thứ 5 & Chủ nhật hằng tuần',
    description:
      'Dạo bước Đại Nội trong tiếng chuông chùa Thiên Mụ sớm, nghe chuyện triều Nguyễn từ nhà nghiên cứu địa phương và dùng bữa cơm cung đình tại nhà rường cổ.',
    highlights: [
      'Thưởng thức bữa cơm 7 món trong khu vườn thanh trà hơn 100 năm tuổi',
      'Chèo SUP đón hoàng hôn trên phá Tam Giang và ăn tối tại đầm Chuồn',
      'Học làm hoa giấy Thanh Tiên cùng nghệ nhân làng nghề',
    ],
    packages: DEFAULT_TOUR_PACKAGES,
    image: '/src/assets/images/dest_hue_1794971771385.jpg',
    alt: 'Cổng thành cổ kính và dòng sông Hương mờ sương buổi sớm tại Huế',
  },
  {
    id: 'tour-hoi-an-cooking',
    title: 'Chiều phố cổ & lớp nấu ăn vườn rau Trà Quế',
    destination: 'Hội An',
    zone: 'Miền Trung',
    category: 'Ẩm thực',
    duration: '2 ngày 1 đêm',
    price: 3450000,
    rating: 4.8,
    reviewCount: 196,
    groupSize: 'Tối đa 8 khách',
    departureInfo: 'Khởi hành hằng ngày',
    description:
      'Đạp xe qua những ruộng lúa xanh rì ra chợ sớm Hội An chọn nguyên liệu, rồi tự tay tráng mì Quảng và bánh xèo giòn rụm dưới mái lá.',
    highlights: [
      'Đi chợ Hội An cùng đầu bếp địa phương từ 7 giờ sáng',
      'Thu hoạch rau thơm hữu cơ ngay tại vườn Trà Quế',
      'Tối thả đèn hoa đăng và nghe chuyện nghề gốm Thanh Hà',
    ],
    packages: DEFAULT_TOUR_PACKAGES,
    image: '/src/assets/images/exp_cooking_local_1794970967578.jpg',
    alt: 'Lớp học nấu ăn ngoài trời với rau thơm tươi và gia vị truyền thống tại Hội An',
  },
  {
    id: 'tour-quy-nhon-coast',
    title: 'Bình minh làng chài Nhơn Lý & lặn biển Kỳ Co – Quy Nhơn',
    destination: 'Quy Nhơn',
    zone: 'Miền Trung',
    category: 'Biển đảo',
    duration: '3 ngày 2 đêm',
    price: 4650000,
    rating: 4.9,
    reviewCount: 138,
    groupSize: 'Tối đa 8 khách',
    departureInfo: 'Khởi hành Thứ 6 hằng tuần',
    description:
      'Theo ghe ngư dân ra bãi rạn san hô Bãi Dứa khi nắng vừa lên, dạo con đường đá xanh ôm sát vách Eo Gió và ăn tối hải sản tươi bên bờ cát.',
    highlights: [
      'Lặn ngắm san hô gần bờ với nước trong thấy đáy ở Hòn Khô',
      'Đi bộ cung đường ven biển Eo Gió – Bãi Xép ít du khách',
      'Nghỉ tại boutique sát vịnh có ban công nghe tiếng sóng vỗ',
    ],
    packages: DEFAULT_TOUR_PACKAGES,
    image: '/src/assets/images/dest_quy_nhon_1794971771597.jpg',
    alt: 'Vịnh biển xanh trong và những chiếc thuyền thúng ở làng chài Nhơn Lý Quy Nhơn',
  },
  {
    id: 'tour-da-lat-cloud',
    title: 'Săn mây đồi thông & cà phê rẫy Cầu Đất',
    destination: 'Đà Lạt',
    zone: 'Miền Trung',
    category: 'Núi rừng',
    duration: '3 ngày 2 đêm',
    price: 3900000,
    rating: 4.9,
    reviewCount: 245,
    groupSize: 'Tối đa 10 khách',
    departureInfo: 'Khởi hành Thứ 6 hằng tuần',
    description:
      'Thức dậy lúc 4 giờ 30 phút đón biển mây bồng bềnh từ triền đồi riêng, uống cà phê rang mộc bên bếp củi và đi bộ xuyên rừng thông nguyên sinh.',
    highlights: [
      'Điểm săn mây riêng tư không chen chúc du khách',
      'Tham quan nông trại cà phê Arabica và học pha pour-over',
      'Nghỉ tại homestay gỗ giữa thung lũng yên tĩnh cách trung tâm 8km',
    ],
    packages: DEFAULT_TOUR_PACKAGES,
    image: '/src/assets/images/dest_da_lat_1794970965037.jpg',
    alt: 'Thung lũng rừng thông Đà Lạt phủ đầy biển mây trắng vào buổi sớm mai',
  },
  {
    id: 'tour-can-tho-floating',
    title: 'Chợ nổi Cái Răng sớm mai & bữa cơm miệt vườn Cần Thơ',
    destination: 'Cần Thơ',
    zone: 'Miền Nam',
    category: 'Ẩm thực',
    duration: '2 ngày 1 đêm',
    price: 3150000,
    rating: 4.8,
    reviewCount: 147,
    groupSize: 'Tối đa 10 khách',
    departureInfo: 'Khởi hành Thứ 4 & Thứ 7 từ TP.HCM',
    description:
      'Ngồi xuồng máy nhỏ len lỏi giữa hàng trăm ghe trái cây từ 5 giờ 30 sáng, ăn tô hủ tiếu nóng hổi ngay trên sông rồi ghé vườn Cồn Sơn làm bánh dân gian.',
    highlights: [
      'Thưởng thức cà phê vợt và bún riêu trên ghe buôn bán thật của người miền Tây',
      'Tham quan lò hủ tiếu truyền thống và vườn chôm chôm, măng cụt theo mùa',
      'Đêm nghe đờn ca tài tử mộc mạc dưới mái hiên nhà cổ Bình Thủy',
    ],
    packages: DEFAULT_TOUR_PACKAGES,
    image: '/src/assets/images/dest_can_tho_1794971772434.jpg',
    alt: 'Chợ nổi Cái Răng nhộn nhịp ghe trái cây lúc bình minh trên sông Hậu Cần Thơ',
  },
  {
    id: 'tour-phu-quoc-coral',
    title: 'Lặn san hô & cắm trại đảo hoang Nam Phú Quốc',
    destination: 'Phú Quốc',
    zone: 'Miền Nam',
    category: 'Biển đảo',
    duration: '3 ngày 2 đêm',
    price: 5650000,
    rating: 4.9,
    reviewCount: 178,
    groupSize: 'Tối đa 8 khách',
    departureInfo: 'Khởi hành Thứ 5 & Thứ 7 hằng tuần',
    description:
      'Cano riêng đưa bạn tới ba hòn đảo nhỏ ít người đặt chân ở quần đảo An Thới, lặn ngắm rạn san hô nhiều màu và ăn tối dưới ánh nến bãi cát.',
    highlights: [
      'Huấn luyện viên lặn biển đi kèm theo tỷ lệ 1 kèm 2',
      'Đầy đủ kính lặn chuyên dụng, chân vịt và áo phao chuẩn an toàn',
      'Ngắm hoàng hôn trên biển Tây Nam với tiệc BBQ hải sản tươi',
    ],
    packages: DEFAULT_TOUR_PACKAGES,
    image: '/src/assets/images/dest_phu_quoc_1794970965284.jpg',
    alt: 'Làn nước biển ngọc lam trong vắt soi rõ rạn san hô tại đảo Phú Quốc',
  },
  {
    id: 'tour-cao-bang-ban-gioc',
    title: 'Thác Bản Giốc, hồ Thang Hen & bản đá Khuổi Ky Cao Bằng',
    destination: 'Cao Bằng',
    zone: 'Miền Bắc',
    category: 'Núi rừng',
    duration: '3 ngày 2 đêm',
    price: 4950000,
    rating: 4.9,
    reviewCount: 142,
    groupSize: 'Tối đa 8 khách',
    departureInfo: 'Khởi hành Thứ 6 hằng tuần từ Hà Nội',
    description:
      'Đi bè tre sát chân thác Bản Giốc lúc sương sớm còn vờn mặt nước, chèo thuyền hồ Thang Hen xanh biếc và ngủ đêm trong làng nhà sàn đá cổ 400 năm tuổi.',
    highlights: [
      'Ngắm thác Bản Giốc khung giờ 6h30 sáng vắng bóng đoàn khách lớn',
      'Nghỉ tại homestay nhà sàn đá Khuổi Ky của người Tày',
      'Thưởng thức vịt quay 7 vị, bánh cuốn canh xương nóng hổi buổi sáng',
    ],
    packages: DEFAULT_TOUR_PACKAGES,
    image: '/src/assets/images/dest_cao_bang_1794972067545.jpg',
    alt: 'Thác Bản Giốc hùng vĩ đổ xuống dòng sông Quây Sơn xanh ngọc tại Cao Bằng',
  },
  {
    id: 'tour-phong-nha-cave',
    title: 'Chèo kayak sông Son & thám hiểm hang động Phong Nha',
    destination: 'Phong Nha',
    zone: 'Miền Trung',
    category: 'Núi rừng',
    duration: '2 ngày 1 đêm',
    price: 4150000,
    rating: 4.9,
    reviewCount: 158,
    groupSize: 'Tối đa 8 khách',
    departureInfo: 'Khởi hành Thứ 4 & Thứ 7 từ Đồng Hới',
    description:
      'Đi thuyền gỗ vào lòng động nước kỳ vĩ, tắm suối Nước Moọc xanh ngọc giữa rừng nguyên sinh và đạp xe dọc thung lũng Bồng Lai uống trà chiều.',
    highlights: [
      'Hướng dẫn viên chuyên tuyến hang động Quảng Bình đi kèm suốt chặng',
      'Đạp xe đường làng ngắm cánh đồng ngô bên sông Son lúc chiều tà',
      'Bữa tối gà đồi nướng muối cheo tại nông trại hữu cơ thung lũng Bồng Lai',
    ],
    packages: DEFAULT_TOUR_PACKAGES,
    image: '/src/assets/images/dest_phong_nha_1794972068750.jpg',
    alt: 'Cửa động Phong Nha uy nghiêm soi bóng xuống dòng sông Son xanh thẳm',
  },
  {
    id: 'tour-mang-den-pine',
    title: 'Rừng thông Măng Đen, hồ Đắk Ke & cà phê xứ lạnh Kon Tum',
    destination: 'Măng Đen',
    zone: 'Miền Trung',
    category: 'Núi rừng',
    duration: '3 ngày 2 đêm',
    price: 4250000,
    rating: 4.9,
    reviewCount: 119,
    groupSize: 'Tối đa 8 khách',
    departureInfo: 'Khởi hành Thứ 5 hằng tuần',
    description:
      'Tìm về cao nguyên còn giữ trọn nét nguyên sơ giữa bốn bề rừng thông, đi bộ xuyên thác Pa Sỹ và quây quần bên bếp lửa cơm lam gà nướng người Mơ Nâm.',
    highlights: [
      'Lưu trú tại bungalow gỗ ẩn dưới tán thông gần hồ Đắk Ke',
      'Ghé thăm nhà rông truyền thống Kon K’tu và dệt thổ cẩm cùng nghệ nhân',
      'Thưởng thức cà phê rang xay tại nông trại độ cao 1.200m',
    ],
    packages: DEFAULT_TOUR_PACKAGES,
    image: '/src/assets/images/dest_mang_den_1794972068497.jpg',
    alt: 'Mặt hồ Măng Đen yên ả phản chiếu rừng thông và sương sớm Tây Nguyên',
  },
  {
    id: 'tour-an-giang-tra-su',
    title: 'Rừng tràm Trà Sư mùa nước nổi & thốt nốt Tri Tôn An Giang',
    destination: 'An Giang',
    zone: 'Miền Nam',
    category: 'Văn hóa',
    duration: '2 ngày 1 đêm',
    price: 3250000,
    rating: 4.8,
    reviewCount: 131,
    groupSize: 'Tối đa 10 khách',
    departureInfo: 'Khởi hành Thứ 7 hằng tuần từ TP.HCM',
    description:
      'Ngồi xuồng ba lá nhẹ tênh trên thảm bèo xanh mướt giữa rừng tràm cổ thụ, ngắm bình minh qua hàng thốt nốt đôi và ăn cá linh nấu bông điên điển.',
    highlights: [
      'Đi xuồng chèo tay vào vùng lõi rừng tràm Trà Sư nghe tiếng chim làm tổ',
      'Thưởng thức đường thốt nốt nấu thủ công và bánh bò thốt nốt nóng',
      'Tham quan làng Chăm Châu Phong cùng nghề dệt thổ cẩm truyền thống',
    ],
    packages: DEFAULT_TOUR_PACKAGES,
    image: '/src/assets/images/dest_an_giang_1794972069923.jpg',
    alt: 'Xuồng gỗ lướt nhẹ trên thảm bèo xanh mướt tại rừng tràm Trà Sư An Giang',
  },
  {
    id: 'tour-con-dao-retreat',
    title: 'Hành trình tĩnh lặng Côn Đảo & vịnh Đầm Trầu hoang sơ',
    destination: 'Côn Đảo',
    zone: 'Miền Nam',
    category: 'Biển đảo',
    duration: '3 ngày 2 đêm',
    price: 6450000,
    rating: 4.9,
    reviewCount: 126,
    groupSize: 'Tối đa 8 khách',
    departureInfo: 'Khởi hành Thứ 5 & Chủ nhật hằng tuần',
    description:
      'Chạm vào nhịp sống chậm hiếm có trên hòn đảo xanh ngắt: đi bộ xuyên rừng Ông Đụng ra bãi đá cuội, lặn ngắm san hô Hòn Bảy Cạnh và nghe chuyện lịch sử đảo.',
    highlights: [
      'Trekking nhẹ 2km xuyên rừng nguyên sinh Vườn quốc gia Côn Đảo',
      'Cano riêng ra Hòn Bảy Cạnh tìm hiểu công tác bảo tồn rùa biển',
      'Nghỉ tại villa ven biển yên tĩnh với bữa tối hải sản tươi mộc mạc',
    ],
    packages: DEFAULT_TOUR_PACKAGES,
    image: '/src/assets/images/dest_con_dao_1794972070502.jpg',
    alt: 'Bãi biển Côn Đảo hoang sơ với cát vàng mịn và làn nước xanh ngọc',
  },
  {
    id: 'tour-ha-noi-heritage',
    title: 'Phố cổ Hà Nội sớm sương, cà phê trứng & làng gốm Bát Tràng',
    destination: 'Hà Nội',
    zone: 'Miền Bắc',
    category: 'Văn hóa',
    duration: '2 ngày 1 đêm',
    price: 3100000,
    rating: 4.9,
    reviewCount: 218,
    groupSize: 'Tối đa 8 khách',
    departureInfo: 'Khởi hành Thứ 6 & Chủ nhật hằng tuần',
    description:
      'Dạo bộ quanh Hồ Gươm lúc 6 giờ sáng nghe kể chuyện kiến trúc Đông Dương, nhâm nhi cà phê trứng cổ truyền trên gác gỗ và tự tay xoay gốm bên bờ sông Hồng.',
    highlights: [
      'Đi bộ qua những con ngõ nhỏ ít biết ở khu phố cổ cùng nhà nghiên cứu Hà Nội',
      'Thưởng thức phở bò gia truyền, bún thang và chả cá Lã Vọng đúng vị xưa',
      'Trải nghiệm 2 giờ làm gốm thủ công tại xưởng nghệ nhân làng Bát Tràng',
    ],
    packages: DEFAULT_TOUR_PACKAGES,
    image: '/src/assets/images/dest_ha_noi_1794972303202.jpg',
    alt: 'Phố cổ Hà Nội và hồ Hoàn Kiếm yên bình dưới tán cây đa cổ thụ buổi sớm',
  },
  {
    id: 'tour-sai-gon-alleys',
    title: 'Chợ Lớn trăm tuổi, hẻm ẩm thực Sài Gòn & du thuyền Bạch Đằng',
    destination: 'Sài Gòn',
    zone: 'Miền Nam',
    category: 'Ẩm thực',
    duration: '2 ngày 1 đêm',
    price: 3200000,
    rating: 4.9,
    reviewCount: 204,
    groupSize: 'Tối đa 8 khách',
    departureInfo: 'Khởi hành Thứ 5 & Thứ 7 hằng tuần',
    description:
      'Khám phá nhịp sống Sài Gòn từ ly cà phê vợt hơn 60 năm tuổi ở Chợ Lớn, len lỏi hẻm nhỏ nếm 6 món đặc sản đêm và ngắm hoàng hôn từ du thuyền trên sông Sài Gòn.',
    highlights: [
      'Ghé tiệm thuốc bắc, hội quán người Hoa và chợ hoa Hồ Thị Kỷ về đêm',
      'Nếm thử hủ tiếu mì kéo sợi, bánh mì chảo hẻm cũ và cơm tấm sườn nướng than',
      'Du ngoạn sông Sài Gòn lúc chạng vạng với đồ uống thủ công trên boong mở',
    ],
    packages: DEFAULT_TOUR_PACKAGES,
    image: '/src/assets/images/dest_sai_gon_1794972303889.jpg',
    alt: 'Sông Sài Gòn rực rỡ ánh hoàng hôn bên đại lộ di sản trung tâm thành phố',
  },
];

/* =========================================================================
 * 6. TRẢI NGHIỆM THÊM (6 hoạt động chọn lọc trên nền xanh đậm)
 * ========================================================================= */
export const EXPERIENCES: ExperienceItem[] = [
  {
    id: 'exp-kayak',
    index: '01',
    title: 'Kayak đón bình minh',
    location: 'Vịnh Lan Hạ · Hải Phòng',
    duration: '2,5 giờ',
    description:
      'Lướt mái chèo qua mặt nước phẳng như gương lúc 5h30 sáng, nghe tiếng chim rừng vang giữa vách đá vôi.',
    image: '/src/assets/images/exp_kayak_dawn_1794970966817.jpg',
    alt: 'Hai du khách chèo thuyền kayak giữa làn sương sớm trên vịnh đá vôi Việt Nam',
  },
  {
    id: 'exp-cooking',
    index: '02',
    title: 'Lớp nấu ăn bản địa',
    location: 'Làng Trà Quế · Hội An',
    duration: '3,5 giờ',
    description:
      'Đi chợ quê buổi sớm, hái rau thơm trong vườn và tự tay nấu ba món đặc sản xứ Quảng cùng bà con địa phương.',
    image: '/src/assets/images/exp_cooking_local_1794970967578.jpg',
    alt: 'Du khách cùng đầu bếp địa phương chế biến món ăn truyền thống trong khu bếp vườn Hội An',
  },
  {
    id: 'exp-trekking',
    index: '03',
    title: 'Trekking cùng người dân tộc',
    location: 'Mường Hoa · Sapa',
    duration: '1 ngày',
    description:
      'Đi theo lối nhỏ qua những nếp nhà gỗ trên triền núi, nghe kể chuyện mùa nước đổ và nghệ thuật dệt lanh nhuộm chàm.',
    image: '/src/assets/images/dest_sapa_1794970965669.jpg',
    alt: 'Đường mòn đi bộ giữa những thửa ruộng bậc thang Sapa mờ sương',
  },
  {
    id: 'exp-diving',
    index: '04',
    title: 'Lặn biển ngắm san hô',
    location: 'Hòn Gầm Ghì · Phú Quốc',
    duration: '4 giờ',
    description:
      'Thả mình trong làn nước ấm nhìn thấu đáy cát trắng ở độ sâu 4–6m, khám phá vườn san hô tự nhiên đầy sức sống.',
    image: '/src/assets/images/dest_phu_quoc_1794970965284.jpg',
    alt: 'Mặt biển trong xanh nhìn rõ hệ sinh thái san hô bên dưới ở Phú Quốc',
  },
  {
    id: 'exp-lantern',
    index: '05',
    title: 'Đêm đèn lồng phố cổ',
    location: 'Sông Thu Bồn · Hội An',
    duration: '2 giờ',
    description:
      'Ngồi thuyền gỗ xuôi dòng sông Hoài khi phố lên đèn, thưởng trà sen và tự tay gấp chiếc đèn hoa đăng nguyện ước.',
    image: '/src/assets/images/dest_hoi_an_1794970965738.jpg',
    alt: 'Thuyền gỗ và dãy đèn lồng tỏa sáng ấm áp dọc bờ sông phố cổ Hội An',
  },
  {
    id: 'exp-sunset-photo',
    index: '06',
    title: 'Tour chụp ảnh hoàng hôn',
    location: 'Tam Cốc · Ninh Bình & Hạ Long',
    duration: '3 giờ',
    description:
      'Đồng hành cùng nhiếp ảnh gia bản địa đến những tọa độ ít người biết để bắt trọn khoảnh khắc ánh vàng rực cuối ngày.',
    image: '/src/assets/images/dest_ninh_binh_1794971770699.jpg',
    alt: 'Khung cảnh hoàng hôn vàng dịu trên dòng sông Ngô Đồng tại Tam Cốc Ninh Bình',
  },
  {
    id: 'exp-hanoi-coffee',
    index: '07',
    title: 'Cà phê trứng & dạo bộ 36 phố phường',
    location: 'Phố cổ · Hà Nội',
    duration: '3 giờ',
    description:
      'Bắt đầu buổi sáng bên ly cà phê trứng béo mịn trên ban công cổ, nghe chuyện nghề thủ công truyền thống qua từng con phố Hàng Bạc, Hàng Mã.',
    image: '/src/assets/images/exp_hanoi_coffee_1794972303828.jpg',
    alt: 'Ly cà phê trứng Hà Nội đặt trên bàn gỗ nhỏ ở ban công rợp bóng cây phố cổ',
  },
  {
    id: 'exp-saigon-food',
    index: '08',
    title: 'Food tour hẻm nhỏ & bến Bạch Đằng',
    location: 'Quận 1 & Chợ Lớn · Sài Gòn',
    duration: '3,5 giờ',
    description:
      'Theo chân người bản địa len vào những con hẻm chỉ người sành ăn mới biết, từ cà phê vợt Chợ Lớn đến những hàng quán đêm rực ánh đèn.',
    image: '/src/assets/images/exp_saigon_streetfood_1794972304093.jpg',
    alt: 'Con hẻm ẩm thực Sài Gòn ấm áp ánh đèn lồng với tô hủ tiếu nghi ngút khói',
  },
  {
    id: 'exp-bat-trang',
    index: '09',
    title: 'Làm gốm bàn xoay & trà chiều ven sông',
    location: 'Làng cổ Bát Tràng · Hà Nội',
    duration: '4 giờ',
    description:
      'Tự tay nhào đất sét cao lanh, ngồi bàn xoay tạo hình chiếc tách riêng dưới sự hướng dẫn của nghệ nhân và thưởng trà sen bên bờ sông Hồng.',
    image: '/src/assets/images/dest_ha_noi_1794972303202.jpg',
    alt: 'Không gian cổ kính thanh bình của phố cổ Hà Nội và bờ hồ sớm mai',
  },
];

/* =========================================================================
 * 7. QUY TRÌNH ĐẶT TOUR 4 BƯỚC
 * ========================================================================= */
export const PROCESS_STEPS: ProcessStep[] = [
  {
    step: '01',
    title: 'Chọn hành trình hoặc gửi mong muốn',
    description:
      'Lọc nhanh các tour theo vùng miền, thời lượng, loại hình hoặc tùy chọn gói lưu trú phù hợp nhịp đi của riêng bạn.',
    note: 'Không cần chốt ngày ngay từ đầu',
  },
  {
    step: '02',
    title: 'Chuyên viên bản địa gọi lại trong 2 giờ',
    description:
      'Người trực tiếp phụ trách tuyến điểm sẽ liên hệ tư vấn lịch trình cụ thể, tình hình thời tiết thực tế và tinh chỉnh chỗ ở theo gu của bạn.',
    note: 'Cam kết gọi lại trong giờ làm việc (8:00 – 20:00)',
  },
  {
    step: '03',
    title: 'Giữ chỗ linh hoạt, minh bạch từng khoản',
    description:
      'Bạn nhận bảng kê chi tiết những gì đã bao gồm, không phí ẩn. Chỉ cần cọc trước 30% để khóa phòng đẹp và hướng dẫn viên riêng.',
    note: 'Hỗ trợ đổi ngày miễn phí trước 7 ngày',
  },
  {
    step: '04',
    title: 'Lên đường & tận hưởng nhịp sống chậm',
    description:
      'Trước ngày đi 3 ngày, bạn nhận cẩm nang hành trình riêng kèm số liên hệ trực tiếp 24/7 của điều phối viên suốt chuyến đi.',
    note: 'Nhóm tối đa 8–10 khách hoặc đi riêng',
  },
];

/* =========================================================================
 * 8. LỜI KHÁCH HÀNG
 * ========================================================================= */
export const TESTIMONIALS: TestimonialItem[] = [
  {
    id: 'testi-1',
    name: 'Nguyễn Minh Châu',
    city: 'TP. Hồ Chí Minh',
    tourName: 'Chạy xe đèo Mã Pí Lèng & xuôi thuyền Nho Quế',
    travelDate: 'Tháng 10/2025',
    quote:
      'Điều mình nhớ nhất không phải là tấm hình trên đỉnh đèo mà là buổi sáng ngồi uống trà ấm trong nhà trình tường của cô chú người Lô Lô. Nhóm chỉ có 6 người nên đi rất thong thả, không hề có cảm giác bị lùa theo giờ.',
  },
  {
    id: 'testi-2',
    name: 'Trần Quốc Bảo',
    city: 'Hà Nội',
    tourName: 'Du thuyền gỗ ngủ đêm vịnh Hạ Long & Lan Hạ',
    travelDate: 'Tháng 08/2025',
    quote:
      'Gia đình mình có cả bố mẹ 65 tuổi và bé 7 tuổi nhưng ai cũng thấy vừa vặn. Tàu gỗ nhỏ yên tĩnh, 6 giờ sáng chèo kayak vào hang vắng chỉ nghe tiếng mái chèo khua nước, đáng tiền từng phút.',
  },
  {
    id: 'testi-3',
    name: 'Lê Hoàng Anh',
    city: 'Đà Nẵng',
    tourName: 'Ký ức Cố đô Huế & ẩm thực nhà vườn Kim Long',
    travelDate: 'Tháng 01/2026',
    quote:
      'Mình ở miền Trung nhưng đi tour Huế vẫn bất ngờ vì bữa cơm nhà vườn Kim Long quá tinh tế và những câu chuyện nhỏ của bác hướng dẫn viên về lịch sử từng cổng thành.',
  },
];

/* =========================================================================
 * 9. HỎI ĐÁP THƯỜNG GẶP
 * ========================================================================= */
export const FAQS: FaqItem[] = [
  {
    id: 'faq-included',
    question: 'Giá tour của Mây Lang Thang đã bao gồm những gì?',
    answer:
      'Mức giá niêm yết đã trọn gói: xe đưa đón suốt tuyến từ điểm hẹn, chỗ ở boutique/homestay chọn lọc theo đúng hạng gói đã chọn, các bữa ăn đặc sản địa phương theo lịch trình, vé tham quan, dụng cụ trải nghiệm (kayak, kính lặn, áo phao), bảo hiểm du lịch mức tối đa 100 triệu đồng/người và hướng dẫn viên bản địa đồng hành. Chỉ chưa bao gồm vé máy bay đến điểm tập trung và chi phí đồ uống cá nhân ngoài thực đơn.',
  },
  {
    id: 'faq-cancel',
    question: 'Chính sách đổi ngày hoặc hủy tour khi có việc đột xuất ra sao?',
    answer:
      'Chúng tôi hiểu kế hoạch cá nhân đôi khi thay đổi. Bạn được đổi ngày khởi hành miễn phí 01 lần nếu báo trước ít nhất 07 ngày. Trường hợp buộc phải hủy tour: báo trước từ 15 ngày hoàn 100% tiền cọc; trước 7–14 ngày hoàn 70% tiền cọc; hoặc bạn có thể bảo lưu toàn bộ số tiền cọc sang bất kỳ hành trình nào khác trong vòng 12 tháng.',
  },
  {
    id: 'faq-private',
    question: 'Mây Lang Thang có thiết kế tour riêng cho gia đình hoặc công ty không?',
    answer:
      'Có. Khoảng 40% chuyến đi của chúng tôi là hành trình thiết kế riêng cho nhóm gia đình từ 4 người hoặc nhóm công ty quy mô 10–35 người. Ngay trong từng tour, bạn cũng có thể chọn gói "Đi Riêng Gia Đình / Nhóm" để có xe riêng, hướng dẫn viên riêng và giờ giấc linh hoạt theo nhịp của đoàn.',
  },
  {
    id: 'faq-age',
    question: 'Trẻ em và người lớn tuổi có tham gia các tour này được không?',
    answer:
      'Hoàn toàn phù hợp với các tuyến Hạ Long, Ninh Bình, Huế, Hội An, Quy Nhơn, Đà Lạt, Cần Thơ và Phú Quốc vì nhịp di chuyển nhẹ nhàng, thời gian nghỉ ngơi nhiều. Với trẻ dưới 5 tuổi thường được miễn phí hoặc tính 50% chi phí tùy tuyến. Riêng các cung trekking Sapa hoặc chạy xe máy Hà Giang, chúng tôi sẽ tư vấn phương án ô tô riêng hoặc chặng đi bộ ngắn 3–4km để người lớn tuổi và các bé vẫn trải nghiệm thoải mái.',
  },
];

/* =========================================================================
 * 10. NHẬT KÝ MÂY (Các bài viết tạp chí kể chuyện hành trình & văn hóa bản địa)
 * ========================================================================= */
export const JOURNAL_CATEGORIES: JournalCategory[] = [
  'Tất cả',
  'Ký sự khách hàng',
  'Văn hóa bản địa',
  'Ẩm thực & Làng nghề',
];

export const JOURNAL_ARTICLES: JournalArticle[] = [
  {
    id: 'journal-lo-lo-chai',
    category: 'Ký sự khách hàng',
    destination: 'Hà Giang',
    title: 'Buổi sáng bên bếp lửa nhà trình tường Lô Lô Chải',
    excerpt:
      'Chúng tôi đến cực Bắc vào một chiều tháng Mười sương giăng kín lối, và điều giữ chân cả nhóm lâu nhất lại là ấm trà shan tuyết trước hiên đất nện.',
    authorName: 'Minh Châu & nhóm bạn TP.HCM',
    authorRole: 'Khách hành trình Mã Pí Lèng 3N2Đ',
    publishedDate: '14/10/2025',
    readTime: '5 phút đọc',
    pullQuote:
      'Đi chậm không phải là đi ít điểm hơn, mà là cho phép mình ngồi lại đủ lâu để nghe tên thật của một người vừa gặp.',
    paragraphs: [
      'Khi xe vừa qua dốc Thẩm Mã, sương chiều đã phủ trắng thung lũng Đồng Văn. Thay vì vội vàng chạy thẳng lên cột cờ Lũng Cú cho kịp giờ đóng cửa, anh Vàng — người dẫn đường của nhóm — rẽ vào con ngõ lát đá dẫn về bản Lô Lô Chải.',
      'Trong căn nhà trình tường đất dày hơn bốn tấc, cô Mỷ đang nhóm bếp củi chuẩn bị nồi thắng cố gà đen và mèn mén hấp hai lửa. Mùi khói ngô quyện với hơi lạnh 11 độ ngoài hiên khiến sáu người từ Sài Gòn vốn quen nắng ấm bỗng thấy lòng dịu hẳn lại.',
      'Sáng hôm sau, cả nhóm dậy từ 5 giờ rưỡi, đi bộ dọc bờ rào đá xanh rêu lên đồi thông sau bản nhìn mặt trời nhô lên sau rặng đá tai mèo. Không có tiếng loa hướng dẫn, không ai giục giã lên xe, chỉ có tiếng chuông đồng từ đàn dê sớm và những cái vẫy tay hiền lành của bà con đi nương.',
    ],
    image: '/src/assets/images/dest_ha_giang_1794970964276.jpg',
    alt: 'Cung đường đèo Mã Pí Lèng mờ sương buổi sáng sớm tại cao nguyên đá Hà Giang',
  },
  {
    id: 'journal-muong-hoa-indigo',
    category: 'Văn hóa bản địa',
    destination: 'Sapa',
    title: 'Màu chàm trên đôi tay người phụ nữ Mông Đen ở Tả Van',
    excerpt:
      'Để có một tấm vải lanh nhuộm chàm ánh tím đồng, người thợ bản địa phải nhúng và phơi suốt hơn ba tuần nắng núi cùng nước tro bếp.',
    authorName: 'Biên tập viên Hạ Vy',
    authorRole: 'Ghi chép thực địa Hoàng Liên Sơn',
    publishedDate: '02/11/2025',
    readTime: '6 phút đọc',
    pullQuote:
      'Mỗi đường sáp ong nóng vẽ trên nền vải mộc là một ký ức về ruộng bậc thang, tiếng suối và mùa màng của cả một dòng họ.',
    paragraphs: [
      'Rời khu chợ trung tâm Sapa ồn ã, con đường mòn men theo triền ruộng bậc thang Mường Hoa đưa chúng tôi xuống bản Tả Van khi sương vẫn còn vắt ngang mái nhà gỗ pơ-mu. Trước hiên nhà chị Sùng Thị Dở, hai chum chàm lớn tỏa mùi hăng nhẹ của lá chàm lên men tự nhiên.',
      'Chị Dở kể rằng từ tháng Tám âm lịch, phụ nữ trong bản bắt đầu cắt lá chàm về ngâm nước suối ba ngày, đánh sục với vôi tôi để lắng xuống thứ bột màu xanh thẫm. Muốn nhuộm một xấp vải lanh dệt tay lên đúng sắc đen ánh đồng bền màu qua hàng chục năm, vải phải được nhúng vào chum chàm, vắt kiệt rồi phơi gió hàng chục lần liên tiếp.',
      'Du khách trong nhóm được ngồi cạnh bếp than nhỏ, cầm chiếc bút đồng chấm sáp ong nóng chảy vẽ những đường kỷ hà lên mảnh vải vuông. Bàn tay lóng ngóng ban đầu bỗng trở nên tĩnh tại lạ thường khi xung quanh chỉ còn tiếng suối chảy và tiếng lách tách của sáp nguội dần.',
    ],
    image: '/src/assets/images/dest_sapa_1794970965669.jpg',
    alt: 'Thung lũng ruộng bậc thang Mường Hoa xanh mướt và nhà gỗ bản địa ở Sapa',
  },
  {
    id: 'journal-hanoi-balcony',
    category: 'Ẩm thực & Làng nghề',
    destination: 'Hà Nội',
    title: 'Nửa buổi sáng trên ban công gác gỗ và câu chuyện cà phê trứng',
    excerpt:
      'Ẩn sau con ngõ nhỏ chỉ vừa một chiếc xe đạp ở phố Nguyễn Hữu Huân là tầng gác có mùi cà phê rang bơ thoảng hương quế hồi của Hà Nội mùa thu.',
    authorName: 'Trần Quốc Bảo',
    authorRole: 'Khách hành trình Phố cổ Hà Nội',
    publishedDate: '19/11/2025',
    readTime: '4 phút đọc',
    pullQuote:
      'Người Hà Nội uống cà phê trứng không vội — vì lớp kem trứng đánh tay cần thời gian tan chậm cùng hơi ấm của chén nước nóng bên dưới.',
    paragraphs: [
      'Dù sống ở Hà Nội hơn ba mươi năm, phải đến sáng đi bộ cùng nhóm Mây Lang Thang lúc 6 giờ 30 phút, tôi mới lần đầu thấy một Hàng Bạc không còi xe, chỉ có tiếng chổi tre quét lá sấu và mùi cốm mới thoảng qua từ gánh hàng rong bên Hồ Gươm.',
      'Điểm dừng chân thứ ba trong buổi sáng là căn gác gỗ sơn vôi vàng đã tróc nhẹ mảng tường gạch cũ. Bác chủ quán vẫn giữ công thức đánh lòng đỏ trứng gà ta với chút mật ong rừng và cà phê phin đậm đặc bằng máy đánh cầm tay cũ kỹ suốt hơn bốn thập kỷ.',
      'Khi đặt chiếc tách gốm Bát Tràng men rạn vào bát nước nóng để giữ nhiệt, câu chuyện về những phố nghề xưa — Hàng Thiếc, Hàng Bông, Hàng Đào — tự nhiên nối dài theo từng ngụm cà phê sánh mịn.',
    ],
    image: '/src/assets/images/exp_hanoi_coffee_1794972303828.jpg',
    alt: 'Tách cà phê trứng đặt trên bàn gỗ cũ ở ban công xanh mát phố cổ Hà Nội',
  },
  {
    id: 'journal-saigon-cholon',
    category: 'Ký sự khách hàng',
    destination: 'Sài Gòn',
    title: 'Cà phê vợt Chợ Lớn và đêm hẻm nhỏ Sài Gòn không ngủ',
    excerpt:
      'Từ tiệm cà phê hơn sáu mươi năm đỏ lửa từ 3 giờ sáng đến tô hủ tiếu mì kéo sợi thơm lừng góc hẻm Quận 5, Sài Gòn hiện ra thân thương đến lạ.',
    authorName: 'Gia đình anh Hoàng Minh',
    authorRole: 'Khách hành trình Sài Gòn 2N1Đ',
    publishedDate: '08/12/2025',
    readTime: '5 phút đọc',
    pullQuote:
      'Sài Gòn giữ chân người ta không chỉ bằng ánh đèn bên sông, mà bằng sự hào sảng trong từng câu hỏi thăm của cô bán hàng hẻm cũ.',
    paragraphs: [
      'Người ta hay nhớ Sài Gòn với những tòa tháp kính soi bóng sông Bạch Đằng, nhưng hành trình buổi tối của chúng tôi lại bắt đầu từ một con hẻm nhỏ mang đậm dấu ấn Hoa – Việt ở khu Chợ Lớn.',
      'Trong tiệm cà phê vợt tồn tại qua ba thế hệ, chiếc siêu đất vẫn reo đều trên bếp than hồng. Nước cốt cà phê lọc qua túi vải mịn sánh, rót vào ly thủy tinh khía quen thuộc, uống kèm chiếc bánh quẩy nóng giòn.',
      'Rời khu phố đèn lồng rực rỡ, cả nhóm tản bộ ra bến Bạch Đằng khi thành phố lên đèn. Ngồi trên boong thuyền gỗ lộng gió nhìn lại dãy phố cổ bên bờ sông, ai cũng nhận ra Sài Gòn vẫn có những khoảng lặng thật dịu nếu biết rẽ vào đúng nhịp.',
    ],
    image: '/src/assets/images/exp_saigon_streetfood_1794972304093.jpg',
    alt: 'Không khí ấm áp của con hẻm ẩm thực đêm Sài Gòn với đèn lồng và tô mì nghi ngút khói',
  },
  {
    id: 'journal-hue-kim-long',
    category: 'Ẩm thực & Làng nghề',
    destination: 'Huế',
    title: 'Mùa thanh trà Kim Long và bữa cơm nhà rường trăm tuổi xứ Huế',
    excerpt:
      'Giữa khu vườn rợp bóng cây ăn trái bên bờ Bắc sông Hương, ẩm thực Huế không cầu kỳ phô trương mà tinh tế ở sự cân bằng từng vị chua, cay, bùi, chát.',
    authorName: 'Lê Hoàng Anh',
    authorRole: 'Khách hành trình Cố đô Huế 3N2Đ',
    publishedDate: '12/01/2026',
    readTime: '5 phút đọc',
    pullQuote:
      'Bữa cơm Huế ngon nhất không nằm trong thực đơn sang trọng, mà ở gian nhà rường mát rượi nơi mệ chủ nhà tự tay gọt từng múi thanh trà.',
    paragraphs: [
      'Con đường đất đỏ dẫn vào làng vườn Kim Long rợp bóng tre và những gốc thanh trà cổ thụ. Mệ Nga — chủ nhân ngôi nhà rường gỗ mít ba gian hai chái — đón đoàn bằng ấm trà vối hái ngay sau vườn.',
      'Bữa trưa hôm ấy chỉ có năm món mộc mạc: gỏi vả trộn mè rang, canh chua cá dìa nấu khế, thịt luộc chấm mắm ruốc sả ớt và đĩa nem lụi cuốn lá lốt thơm lừng. Điều khiến cả nhóm ngạc nhiên là cách mệ kể tên từng loại rau thơm trong vườn nhà và lý do món Huế luôn ăn từng phần nhỏ để giữ trọn vị giác.',
      'Chiều xuống, chúng tôi chèo SUP nhẹ nhàng trên phá Tam Giang khi mặt đầm nhuộm màu hồng tím. Tiếng mái chèo khua nước đều đặn giữa mênh mông sóng nước như khép lại một ngày sống trọn vẹn từng giờ.',
    ],
    image: '/src/assets/images/dest_hue_1794971771385.jpg',
    alt: 'Cổng thành cổ kính rêu phong bên dòng sông Hương yên ả trong buổi sáng xứ Huế',
  },
  {
    id: 'journal-tra-su-water',
    category: 'Văn hóa bản địa',
    destination: 'An Giang',
    title: 'Khi mùa nước nổi phủ xanh những tán tràm Trà Sư',
    excerpt:
      'Mỗi độ tháng Chín đến tháng Mười Một, con nước từ thượng nguồn đổ về biến cánh rừng tràm An Giang thành tấm gương xanh ngắt tiếng chim.',
    authorName: 'Biên tập viên Quang Nhật',
    authorRole: 'Ghi chép miền Tây sông nước',
    publishedDate: '27/01/2026',
    readTime: '4 phút đọc',
    pullQuote:
      'Trên chiếc xuồng ba lá rẽ thảm bèo tấm xanh mướt, mọi tiếng ồn đô thị như tan biến sau tán tràm cổ thụ.',
    paragraphs: [
      'Khác với vẻ nhộn nhịp của chợ nổi buổi sớm, rừng tràm Trà Sư đón chúng tôi bằng một sự tĩnh lặng gần như tuyệt đối. Chiếc xuồng gỗ nhỏ không động cơ lướt êm qua mặt nước phủ kín bèo tấm xanh rì như thảm nhung.',
      'Chú Bảy — người chèo đò sinh ra ở xã Văn Giáo — chỉ tay lên những tán tràm cao vút nơi hàng trăm cánh cò trắng và điên điển đang làm tổ. Chú bảo mùa nước nổi không phải là mùa lũ đáng ngại, mà là mùa con cá, bông điên điển và mật ong hoa tràm nuôi sống cả vùng đất Thất Sơn.',
      'Rời rừng tràm lúc nắng xế, nhóm ghé lò nấu đường thốt nốt thủ công dưới chân núi Sam, uống ly nước thốt nốt tươi mát lạnh và nghe tiếng chuông chùa vang vọng giữa cánh đồng lúa xanh.',
    ],
    image: '/src/assets/images/dest_an_giang_1794972069923.jpg',
    alt: 'Xuồng gỗ chèo tay lướt nhẹ qua thảm bèo xanh mướt tại rừng tràm Trà Sư An Giang',
  },
];

/* =========================================================================
 * 11. THÔNG TIN LIÊN HỆ CHÂN TRANG
 * ========================================================================= */
export const CONTACT_INFO = {
  brand: 'Mây Lang Thang',
  slogan: 'Đi chậm, sống nhiều.',
  address: '42 Trần Quốc Thảo, Phường Xuân Hòa, Quận 3, TP. Hồ Chí Minh',
  hanoiOffice: '18 Ngõ Hội Vũ, Quận Hoàn Kiếm, Hà Nội',
  hotline: '1900 6868 24',
  phone: '028 3824 9191',
  email: 'xin-chao@maylangthang.vn',
  license: 'Giấy phép kinh doanh lữ hành quốc tế số 79-1428/2025/TCDL-GP LHQT',
  workingHours: 'Thứ 2 – Chủ nhật: 08:00 – 20:00',
  socials: [
    { label: 'Facebook', href: 'https://facebook.com' },
    { label: 'Instagram', href: 'https://instagram.com' },
    { label: 'YouTube', href: 'https://youtube.com' },
  ],
};
