import React, { useEffect, useMemo, useState } from 'react';
import { geoGraticule10, geoMercator, geoPath } from 'd3-geo';
import type { FeatureCollection, Geometry } from 'geojson';
import { ArrowRight, CalendarDays, Compass, MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSiteContent } from '../context/SiteContentContext';
import { EN_CONTENT } from '../data/i18n';
import { DestinationItem, RegionZone } from '../data/travelData';
import { EditorialImage, MagneticButton, RevealBlock } from './MotionPrimitives';

interface VietnamMapProps {
  selectedZone: RegionZone;
  onZoneChange: (zone: RegionZone) => void;
  onSelectDestination: (destinationName: string) => void;
}

const SVG_WIDTH = 560;
const SVG_HEIGHT = 680;

const VIETNAM_GEOJSON: FeatureCollection<Geometry> = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Việt Nam' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [107.97, 21.52],
            [107.15, 20.95],
            [106.75, 20.68],
            [106.58, 20.15],
            [105.92, 19.75],
            [105.75, 18.67],
            [106.45, 18.02],
            [106.62, 17.47],
            [107.65, 16.56],
            [108.28, 16.12],
            [108.38, 15.86],
            [108.91, 15.13],
            [109.25, 13.77],
            [109.45, 12.89],
            [109.2, 12.24],
            [109.1, 11.56],
            [108.28, 10.93],
            [107.08, 10.35],
            [106.75, 10.22],
            [105.9, 9.25],
            [104.8, 8.6],
            [105.08, 10.01],
            [104.48, 10.38],
            [105.12, 10.7],
            [106.1, 11.45],
            [106.8, 11.95],
            [107.55, 13.2],
            [107.55, 14.68],
            [107.25, 15.85],
            [106.6, 16.62],
            [105.15, 18.38],
            [104.05, 19.45],
            [104.6, 20.3],
            [102.85, 21.4],
            [102.15, 22.4],
            [103.1, 22.65],
            [103.95, 22.6],
            [105.32, 23.38],
            [106.72, 22.85],
            [106.76, 21.85],
            [107.97, 21.52],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Đảo Phú Quốc' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [103.85, 10.45],
            [104.05, 10.42],
            [104.03, 10.05],
            [103.93, 10.02],
            [103.85, 10.28],
            [103.85, 10.45],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Côn Đảo' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [106.56, 8.74],
            [106.66, 8.74],
            [106.64, 8.66],
            [106.56, 8.68],
            [106.56, 8.74],
          ],
        ],
      },
    },
  ],
};

// Căn chỉnh nhãn cho 17 địa điểm để chữ luôn rõ ràng, không chạm nhau
const LABEL_OFFSETS: Record<string, { dx: number; dy: number; anchor: 'start' | 'end' | 'middle' }> = {
  sapa: { dx: -12, dy: 4, anchor: 'end' },
  'ha-giang': { dx: 0, dy: -15, anchor: 'middle' },
  'cao-bang': { dx: 12, dy: -6, anchor: 'start' },
  'ha-noi': { dx: -12, dy: -4, anchor: 'end' },
  'ha-long': { dx: 13, dy: 3, anchor: 'start' },
  'ninh-binh': { dx: -13, dy: 9, anchor: 'end' },
  'phong-nha': { dx: -13, dy: 4, anchor: 'end' },
  hue: { dx: -13, dy: 4, anchor: 'end' },
  'hoi-an': { dx: 13, dy: 4, anchor: 'start' },
  'mang-den': { dx: -13, dy: 4, anchor: 'end' },
  'quy-nhon': { dx: 13, dy: 4, anchor: 'start' },
  'da-lat': { dx: -13, dy: 4, anchor: 'end' },
  'sai-gon': { dx: 13, dy: -2, anchor: 'start' },
  'an-giang': { dx: -12, dy: -7, anchor: 'end' },
  'can-tho': { dx: 13, dy: 11, anchor: 'start' },
  'phu-quoc': { dx: -13, dy: 8, anchor: 'end' },
  'con-dao': { dx: 13, dy: 4, anchor: 'start' },
};

// Thứ tự kết nối tuyến hành trình Bắc -> Trung -> Nam
const ROUTE_ORDER = [
  'sapa',
  'ha-giang',
  'cao-bang',
  'ha-noi',
  'ha-long',
  'ninh-binh',
  'phong-nha',
  'hue',
  'hoi-an',
  'mang-den',
  'quy-nhon',
  'da-lat',
  'sai-gon',
  'an-giang',
  'can-tho',
  'phu-quoc',
  'con-dao',
];

export function VietnamMap({
  selectedZone,
  onZoneChange,
  onSelectDestination,
}: VietnamMapProps) {
  const { lang, t } = useLanguage();
  const { destinations, tours, overriddenIds } = useSiteContent();

  const visibleDestinations = useMemo(() => {
    if (selectedZone === 'Tất cả') return destinations;
    return destinations.filter((d) => d.zone === selectedZone);
  }, [selectedZone, destinations]);

  const [activeId, setActiveId] = useState<string>(destinations[0]?.id || 'ha-long');

  // Tự động chọn điểm đầu tiên của vùng miền nếu điểm đang active nằm ngoài vùng lọc
  useEffect(() => {
    if (!visibleDestinations.some((d) => d.id === activeId) && visibleDestinations.length > 0) {
      setActiveId(visibleDestinations[0].id);
    }
  }, [visibleDestinations, activeId]);

  const { landPath, graticulePath, projectedMarkers, routePaths, islands } = useMemo(() => {
    const projection = geoMercator().fitExtent(
      [
        [46, 36],
        [SVG_WIDTH - 96, SVG_HEIGHT - 34],
      ],
      VIETNAM_GEOJSON
    );

    const pathGenerator = geoPath(projection);
    const graticule = pathGenerator(geoGraticule10()) || '';
    const land = pathGenerator(VIETNAM_GEOJSON) || '';

    const markers = destinations.map((dest) => {
      const coords = projection(dest.coordinates) || [0, 0];
      return {
        dest,
        x: coords[0],
        y: coords[1],
      };
    });

    const markerMap = new Map(markers.map((m) => [m.dest.id, m]));
    const arcs: { d: string; matchesZone: boolean }[] = [];
    for (let i = 0; i < ROUTE_ORDER.length - 1; i++) {
      const from = markerMap.get(ROUTE_ORDER[i]);
      const to = markerMap.get(ROUTE_ORDER[i + 1]);
      if (from && to) {
        const mx = (from.x + to.x) / 2;
        const my = (from.y + to.y) / 2;
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const cx = mx - dy * 0.14;
        const cy = my + dx * 0.14;
        const matchesZone =
          selectedZone === 'Tất cả' ||
          (from.dest.zone === selectedZone && to.dest.zone === selectedZone);
        arcs.push({
          d: `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`,
          matchesZone,
        });
      }
    }

    const hoangSa = projection([111.9, 16.5]) || [460, 290];
    const truongSa = projection([113.8, 10.3]) || [490, 520];

    return {
      landPath: land,
      graticulePath: graticule,
      projectedMarkers: markers,
      routePaths: arcs,
      islands: [
        { key: 'hoang-sa', name: t.destinations.hoangSa, x: Math.min(hoangSa[0], SVG_WIDTH - 95), y: hoangSa[1] },
        { key: 'truong-sa', name: t.destinations.truongSa, x: Math.min(truongSa[0], SVG_WIDTH - 95), y: truongSa[1] },
      ],
    };
  }, [selectedZone, destinations, t.destinations.hoangSa, t.destinations.truongSa]);

  const activeDest: DestinationItem | undefined =
    destinations.find((d) => d.id === activeId) || destinations[0];

  const matchingTour = activeDest
    ? tours.find((item) => item.destination === activeDest.name) || tours[0]
    : tours[0];

  if (!activeDest || !matchingTour) {
    return null;
  }

  const enActiveDest =
    lang === 'en' && !overriddenIds.has(activeDest.id)
      ? EN_CONTENT.destinations[activeDest.id]
      : undefined;
  const activeDestName = enActiveDest ? enActiveDest.name : activeDest.name;
  const activeDestRegion = enActiveDest ? enActiveDest.region : activeDest.region;
  const activeDestTagline = enActiveDest ? enActiveDest.tagline : activeDest.tagline;
  const activeDestSeason = enActiveDest ? enActiveDest.bestSeason : activeDest.bestSeason;

  const enTour =
    lang === 'en' && !overriddenIds.has(matchingTour.id)
      ? EN_CONTENT.tours[matchingTour.id]
      : undefined;
  const tourTitle = enTour ? enTour.title : matchingTour.title;
  const tourDuration = t.durations[matchingTour.duration];
  const formattedPrice =
    matchingTour.price.toLocaleString(lang === 'en' ? 'en-US' : 'vi-VN') + '₫';

  return (
    <div className="mt-16 md:mt-20 pt-14 border-t border-[#0B2A33]/10 dark:border-white/10">
      <RevealBlock>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs tracking-[0.16em] uppercase font-semibold text-[#1F8A70] dark:text-[#F2B84B] mb-2">
              {t.destinations.mapEyebrow}
            </p>
            <h3 className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#0B2A33] dark:text-white">
              {t.destinations.mapHeading}
            </h3>
          </div>
          <p className="text-sm text-[#0B2A33]/70 dark:text-[#EDF4F3]/70 max-w-md">
            {t.destinations.mapSubtitle(destinations.length)}
          </p>
        </div>
      </RevealBlock>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
        {/* Cột trái: Bản đồ SVG / D3 Việt Nam */}
        <RevealBlock className="lg:col-span-7">
          <div className="relative h-full rounded-2xl bg-white dark:bg-[#0D313B] border border-[#0B2A33]/10 dark:border-white/10 p-4 sm:p-6 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2 text-xs text-[#0B2A33]/65 dark:text-[#EDF4F3]/65">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <Compass className="w-3.5 h-3.5 text-[#1F8A70] dark:text-[#F2B84B]" />
                {t.destinations.mapProjection}
              </span>
              <span className="tabular-nums">
                {t.destinations.mapShowing(visibleDestinations.length, destinations.length)}
              </span>
            </div>

            <div className="w-full flex items-center justify-center">
              <svg
                viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
                role="img"
                aria-label={t.destinations.mapHeading}
                className="w-full max-w-[500px] h-auto select-none"
              >
                {/* Lưới kinh vĩ tuyến D3 */}
                <path
                  d={graticulePath}
                  fill="none"
                  className="stroke-[#0B2A33]/[0.06] dark:stroke-white/[0.07]"
                  strokeWidth={0.8}
                />

                {/* Đất liền & đảo lớn Việt Nam */}
                <path
                  d={landPath}
                  className="fill-[#E1EFEA] dark:fill-[#13424E] stroke-[#1F8A70]/65 dark:stroke-[#F2B84B]/55 transition-colors duration-300"
                  strokeWidth={1.5}
                  strokeLinejoin="round"
                />

                {/* Quần đảo Hoàng Sa & Trường Sa */}
                {islands.map((island) => (
                  <g key={island.key} transform={`translate(${island.x}, ${island.y})`}>
                    <circle cx={-6} cy={-2} r={1.6} className="fill-[#1F8A70]/70 dark:fill-[#F2B84B]/70" />
                    <circle cx={2} cy={3} r={1.4} className="fill-[#1F8A70]/70 dark:fill-[#F2B84B]/70" />
                    <circle cx={7} cy={-3} r={1.3} className="fill-[#1F8A70]/70 dark:fill-[#F2B84B]/70" />
                    <text
                      x={0}
                      y={16}
                      textAnchor="middle"
                      className="fill-[#0B2A33]/55 dark:fill-[#EDF4F3]/55 text-[10px] italic"
                    >
                      {island.name}
                    </text>
                  </g>
                ))}

                {/* Đường cung nét đứt kết nối tuyến hành trình */}
                {routePaths.map((arc, idx) => (
                  <path
                    key={idx}
                    d={arc.d}
                    fill="none"
                    className={`transition-opacity duration-300 ${
                      arc.matchesZone
                        ? 'stroke-[#1F8A70]/45 dark:stroke-[#F2B84B]/40 opacity-100'
                        : 'stroke-[#0B2A33]/15 dark:stroke-white/10 opacity-40'
                    }`}
                    strokeWidth={1.35}
                    strokeDasharray="4 5"
                  />
                ))}

                {/* Các điểm đánh dấu từ mảng DESTINATIONS */}
                {projectedMarkers.map(({ dest, x, y }) => {
                  const isActive = dest.id === activeId;
                  const inSelectedZone =
                    selectedZone === 'Tất cả' || dest.zone === selectedZone;
                  const offset = LABEL_OFFSETS[dest.id] || {
                    dx: 13,
                    dy: 4,
                    anchor: 'start' as const,
                  };
                  const enDest =
                    lang === 'en' && !overriddenIds.has(dest.id)
                      ? EN_CONTENT.destinations[dest.id]
                      : undefined;
                  const pinName = enDest ? enDest.name : dest.name;
                  const pinRegion = enDest ? enDest.region : dest.region;

                  return (
                    <g
                      key={dest.id}
                      transform={`translate(${x}, ${y})`}
                      role="button"
                      tabIndex={0}
                      aria-label={`${t.destinations.viewToursAt(pinName)} (${pinRegion})`}
                      onMouseEnter={() => {
                        setActiveId(dest.id);
                        if (!inSelectedZone) onZoneChange('Tất cả');
                      }}
                      onFocus={() => setActiveId(dest.id)}
                      onClick={() => {
                        setActiveId(dest.id);
                        onSelectDestination(dest.name);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setActiveId(dest.id);
                          onSelectDestination(dest.name);
                        }
                      }}
                      className={`cursor-pointer group focus:outline-none transition-opacity duration-300 ${
                        inSelectedZone ? 'opacity-100' : 'opacity-30 hover:opacity-85'
                      }`}
                    >
                      <circle r={16} fill="transparent" />

                      <circle
                        r={isActive ? 12 : 8.5}
                        className={`transition-all duration-300 ${
                          isActive
                            ? 'fill-[#F2B84B]/24 stroke-[#E8708A] dark:stroke-[#F2B84B]'
                            : 'fill-transparent stroke-transparent group-hover:fill-[#1F8A70]/15 group-focus-visible:stroke-[#F2B84B]'
                        }`}
                        strokeWidth={1.5}
                      />

                      <circle
                        r={isActive ? 6 : 4.6}
                        className={`transition-all duration-300 stroke-white dark:stroke-[#06181E] ${
                          isActive
                            ? 'fill-[#E8708A] dark:fill-[#F2B84B]'
                            : 'fill-[#0B2A33] dark:fill-[#EDF4F3] group-hover:fill-[#1F8A70] dark:group-hover:fill-[#F2B84B]'
                        }`}
                        strokeWidth={1.8}
                      />

                      <text
                        x={offset.dx}
                        y={offset.dy}
                        textAnchor={offset.anchor}
                        className={`text-[12px] transition-all duration-200 ${
                          isActive
                            ? 'font-semibold fill-[#0B2A33] dark:fill-[#F2B84B]'
                            : 'font-medium fill-[#0B2A33]/80 dark:fill-[#EDF4F3]/85 group-hover:fill-[#0B2A33] dark:group-hover:fill-white'
                        }`}
                      >
                        {pinName}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </RevealBlock>

        {/* Cột phải: Thẻ xem trước điểm đến đang chọn trên bản đồ */}
        <RevealBlock delay={0.1} className="lg:col-span-5 flex flex-col">
          <div className="flex-1 flex flex-col rounded-2xl bg-white dark:bg-[#0D313B] border border-[#0B2A33]/10 dark:border-white/10 overflow-hidden">
            <div className="relative aspect-[16/10] w-full overflow-hidden">
              <EditorialImage
                src={activeDest.image}
                alt={activeDest.alt}
                fallbackTitle={activeDestName}
                className="w-full h-full"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[#06181E]/85 via-[#06181E]/25 to-transparent"
              />
              <div className="absolute bottom-4 left-5 right-5 text-white">
                <p className="text-xs font-medium text-[#F2B84B] mb-1">
                  {t.zones[activeDest.zone]} · {activeDestRegion}
                </p>
                <h4 className="font-serif-display text-2xl sm:text-3xl font-semibold leading-tight">
                  {activeDestName}
                </h4>
              </div>
            </div>

            <div className="flex-1 p-6 sm:p-7 flex flex-col justify-between gap-5">
              <div className="space-y-4">
                <p className="text-sm sm:text-base leading-relaxed text-[#0B2A33]/82 dark:text-[#EDF4F3]/82">
                  {activeDestTagline}
                </p>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#0B2A33]/10 dark:border-white/10 text-xs sm:text-sm">
                  <div>
                    <span className="flex items-center gap-1.5 text-[#0B2A33]/60 dark:text-[#EDF4F3]/60 mb-1">
                      <CalendarDays className="w-3.5 h-3.5 text-[#1F8A70] dark:text-[#F2B84B]" />
                      {t.destinations.bestSeason}
                    </span>
                    <span className="font-semibold text-[#0B2A33] dark:text-white">
                      {activeDestSeason}
                    </span>
                  </div>
                  <div>
                    <span className="flex items-center gap-1.5 text-[#0B2A33]/60 dark:text-[#EDF4F3]/60 mb-1">
                      <MapPin className="w-3.5 h-3.5 text-[#1F8A70] dark:text-[#F2B84B]" />
                      {t.destinations.coordinates}
                    </span>
                    <span className="font-semibold text-[#0B2A33] dark:text-white tabular-nums">
                      {activeDest.coordinates[1].toFixed(2)}°N, {activeDest.coordinates[0].toFixed(2)}°E
                    </span>
                  </div>
                </div>

                {/* Gợi ý tour tiêu biểu tại điểm đến này */}
                <div className="pt-4 border-t border-[#0B2A33]/10 dark:border-white/10">
                  <p className="text-xs font-medium text-[#1F8A70] dark:text-[#F2B84B] mb-1">
                    {t.destinations.featuredTourAt(activeDestName)}
                  </p>
                  <p className="font-serif-display text-lg font-semibold text-[#0B2A33] dark:text-white leading-snug">
                    {tourTitle}
                  </p>
                  <p className="text-xs text-[#0B2A33]/70 dark:text-[#EDF4F3]/70 mt-1 tabular-nums">
                    {tourDuration} · {t.destinations.fromPrice} {formattedPrice}{' '}
                    {t.destinations.perGuest} · {t.destinations.packagesCount(matchingTour.packages.length)}
                  </p>
                </div>
              </div>

              {/* Chọn nhanh trong danh sách địa điểm đang lọc */}
              <div className="space-y-4">
                <div
                  className="flex flex-wrap gap-1.5"
                  role="group"
                  aria-label={t.destinations.mapHeading}
                >
                  {visibleDestinations.map((dest) => {
                    const active = dest.id === activeId;
                    const chipName =
                      lang === 'en' && EN_CONTENT.destinations[dest.id]
                        ? EN_CONTENT.destinations[dest.id].name
                        : dest.name;
                    return (
                      <button
                        key={dest.id}
                        type="button"
                        onClick={() => setActiveId(dest.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F2B84B] ${
                          active
                            ? 'bg-[#0B2A33] text-white dark:bg-[#F2B84B] dark:text-[#06181E]'
                            : 'bg-[#F1F7F6] dark:bg-[#06181E] text-[#0B2A33]/75 dark:text-[#EDF4F3]/75 hover:text-[#0B2A33] dark:hover:text-white'
                        }`}
                      >
                        {chipName}
                      </button>
                    );
                  })}
                </div>

                <MagneticButton
                  onClick={() => onSelectDestination(activeDest.name)}
                  className="w-full py-3.5 px-6 rounded-full bg-[#1F8A70] hover:bg-[#0B2A33] dark:bg-[#F2B84B] dark:text-[#06181E] dark:hover:bg-white text-white font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F2B84B]"
                >
                  <span>{t.destinations.viewToursAt(activeDestName)}</span>
                  <ArrowRight className="w-4 h-4" />
                </MagneticButton>
              </div>
            </div>
          </div>
        </RevealBlock>
      </div>
    </div>
  );
}
