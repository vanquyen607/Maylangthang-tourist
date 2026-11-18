import React, { useState } from 'react';
import { Loader2, Save, X } from 'lucide-react';
import {
  DEFAULT_TOUR_PACKAGES,
  DestinationItem,
  DurationFilter,
  ExperienceItem,
  JournalArticle,
  JournalCategory,
  RegionZone,
  TourCategory,
  TourItem,
} from '../data/travelData';
import { CmsDestinationRecord, CmsExperienceRecord, CmsJournalRecord, CmsTourRecord, sanitizeSlugId } from '../lib/firebase';

const ZONES: Exclude<RegionZone, 'Tất cả'>[] = ['Miền Bắc', 'Miền Trung', 'Miền Nam'];
const TOUR_CATS: Exclude<TourCategory, 'Tất cả'>[] = ['Biển đảo', 'Núi rừng', 'Văn hóa', 'Ẩm thực'];
const DURATIONS: Exclude<DurationFilter, 'Tất cả'>[] = ['2 ngày 1 đêm', '3 ngày 2 đêm'];
const JOURNAL_CATS: Exclude<JournalCategory, 'Tất cả'>[] = [
  'Ký sự khách hàng',
  'Văn hóa bản địa',
  'Ẩm thực & Làng nghề',
];

const DEFAULT_IMG = '/src/assets/images/hero_vietnam_mist_1794970963443.jpg';

const INPUT_CLASS =
  'w-full h-10 px-3.5 rounded-xl bg-[#F1F7F6] dark:bg-[#06181E] border border-[#0B2A33]/15 dark:border-white/15 text-xs sm:text-sm text-[#0B2A33] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1F8A70] dark:focus:ring-[#F2B84B]';

const TEXTAREA_CLASS =
  'w-full p-3.5 rounded-xl bg-[#F1F7F6] dark:bg-[#06181E] border border-[#0B2A33]/15 dark:border-white/15 text-xs sm:text-sm text-[#0B2A33] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1F8A70] dark:focus:ring-[#F2B84B] resize-y';

interface ModalShellProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

function ModalShell({ title, onClose, children }: ModalShellProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#06181E]/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#0D313B] text-[#0B2A33] dark:text-[#EDF4F3] border border-[#0B2A33]/15 dark:border-white/15 shadow-2xl p-6 sm:p-8"
      >
        <div className="flex items-center justify-between gap-4 pb-4 mb-5 border-b border-[#0B2A33]/10 dark:border-white/10">
          <h3 className="font-serif-display text-xl sm:text-2xl font-semibold">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-full hover:bg-[#0B2A33]/8 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// TOUR EDITOR MODAL
// ============================================================================

interface TourEditorModalProps {
  initial?: CmsTourRecord;
  destinations: DestinationItem[];
  saveLabel: string;
  savingLabel: string;
  onSave: (record: CmsTourRecord) => Promise<void>;
  onClose: () => void;
}

export function TourEditorModal({
  initial,
  destinations,
  saveLabel,
  savingLabel,
  onSave,
  onClose,
}: TourEditorModalProps) {
  const isNew = !initial;
  const [title, setTitle] = useState(initial?.title || '');
  const [destination, setDestination] = useState(
    initial?.destination || destinations[0]?.name || 'Hạ Long'
  );
  const [zone, setZone] = useState<TourItem['zone']>(initial?.zone || 'Miền Bắc');
  const [category, setCategory] = useState<TourItem['category']>(initial?.category || 'Văn hóa');
  const [duration, setDuration] = useState<TourItem['duration']>(
    initial?.duration || '2 ngày 1 đêm'
  );
  const [price, setPrice] = useState(String(initial?.price ?? 4200000));
  const [groupSize, setGroupSize] = useState(initial?.groupSize || 'Tối đa 8 khách');
  const [departureInfo, setDepartureInfo] = useState(
    initial?.departureInfo || 'Khởi hành thứ Sáu hàng tuần'
  );
  const [image, setImage] = useState(initial?.image || DEFAULT_IMG);
  const [alt, setAlt] = useState(initial?.alt || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [highlightsText, setHighlightsText] = useState(
    (initial?.highlights || []).join('\n')
  );
  const [packages, setPackages] = useState(
    initial?.packages?.length ? initial.packages : DEFAULT_TOUR_PACKAGES
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 2 || description.trim().length < 5) {
      setError('Vui lòng nhập tên tour (tối thiểu 2 ký tự) và mô tả hành trình.');
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const id = initial?.id || sanitizeSlugId(title, 'tour');
      await onSave({
        id,
        title: title.trim(),
        destination: destination.trim() || 'Việt Nam',
        zone,
        category,
        duration,
        price: Math.max(0, Number(price) || 0),
        rating: initial?.rating ?? 4.9,
        reviewCount: initial?.reviewCount ?? 12,
        groupSize: groupSize.trim(),
        departureInfo: departureInfo.trim(),
        description: description.trim(),
        highlights: highlightsText
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 12),
        packages,
        image: image.trim() || DEFAULT_IMG,
        alt: alt.trim() || title.trim(),
        isHidden: initial?.isHidden ?? false,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalShell title={isNew ? 'Thêm Tour Mới' : `Chỉnh sửa: ${initial.title}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold mb-1">Tên hành trình *</label>
            <input
              type="text"
              required
              maxLength={200}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Điểm đến *</label>
            <input
              type="text"
              list="cms-destination-names"
              required
              maxLength={100}
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className={INPUT_CLASS}
            />
            <datalist id="cms-destination-names">
              {destinations.map((d) => (
                <option key={d.id} value={d.name} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Vùng miền</label>
            <select
              value={zone}
              onChange={(e) => setZone(e.target.value as TourItem['zone'])}
              className={INPUT_CLASS}
            >
              {ZONES.map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Loại hình</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TourItem['category'])}
              className={INPUT_CLASS}
            >
              {TOUR_CATS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Thời lượng</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value as TourItem['duration'])}
              className={INPUT_CLASS}
            >
              {DURATIONS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Giá tiêu chuẩn (VNĐ)</label>
            <input
              type="number"
              min={0}
              step={50000}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Quy mô đoàn</label>
            <input
              type="text"
              maxLength={80}
              value={groupSize}
              onChange={(e) => setGroupSize(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold mb-1">Lịch khởi hành</label>
            <input
              type="text"
              maxLength={160}
              value={departureInfo}
              onChange={(e) => setDepartureInfo(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold mb-1">URL hình ảnh *</label>
            <input
              type="text"
              required
              maxLength={600}
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold mb-1">Mô tả chi tiết *</label>
            <textarea
              rows={3}
              required
              maxLength={1500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={TEXTAREA_CLASS}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold mb-1">
              Điểm nhấn hành trình (mỗi dòng 1 ý, tối đa 12 dòng)
            </label>
            <textarea
              rows={3}
              value={highlightsText}
              onChange={(e) => setHighlightsText(e.target.value)}
              className={TEXTAREA_CLASS}
            />
          </div>
        </div>

        {/* Gói lưu trú */}
        <div className="pt-3 border-t border-[#0B2A33]/10 dark:border-white/10 space-y-2.5">
          <p className="text-xs font-semibold">Các gói lưu trú (chênh lệch VNĐ)</p>
          {packages.map((pkg, idx) => (
            <div key={pkg.id} className="grid grid-cols-12 gap-2 items-center">
              <input
                type="text"
                value={pkg.label}
                maxLength={100}
                onChange={(e) => {
                  const next = [...packages];
                  next[idx] = { ...pkg, label: e.target.value };
                  setPackages(next);
                }}
                className={`${INPUT_CLASS} col-span-4`}
                placeholder="Tên gói"
              />
              <input
                type="text"
                value={pkg.summary}
                maxLength={200}
                onChange={(e) => {
                  const next = [...packages];
                  next[idx] = { ...pkg, summary: e.target.value };
                  setPackages(next);
                }}
                className={`${INPUT_CLASS} col-span-5`}
                placeholder="Mô tả gói"
              />
              <input
                type="number"
                step={50000}
                value={pkg.priceDelta}
                onChange={(e) => {
                  const next = [...packages];
                  next[idx] = { ...pkg, priceDelta: Number(e.target.value) || 0 };
                  setPackages(next);
                }}
                className={`${INPUT_CLASS} col-span-3`}
                placeholder="+VNĐ"
              />
            </div>
          ))}
        </div>

        {error && <p className="text-xs font-medium text-[#C83E5B]">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-full border border-[#0B2A33]/15 dark:border-white/15 text-xs font-semibold"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1F8A70] dark:bg-[#F2B84B] text-white dark:text-[#06181E] text-xs font-semibold disabled:opacity-60"
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{busy ? savingLabel : saveLabel}</span>
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

// ============================================================================
// DESTINATION EDITOR MODAL
// ============================================================================

interface DestinationEditorModalProps {
  initial?: CmsDestinationRecord;
  saveLabel: string;
  savingLabel: string;
  onSave: (record: CmsDestinationRecord) => Promise<void>;
  onClose: () => void;
}

export function DestinationEditorModal({
  initial,
  saveLabel,
  savingLabel,
  onSave,
  onClose,
}: DestinationEditorModalProps) {
  const isNew = !initial;
  const [name, setName] = useState(initial?.name || '');
  const [region, setRegion] = useState(initial?.region || '');
  const [zone, setZone] = useState<DestinationItem['zone']>(initial?.zone || 'Miền Bắc');
  const [tagline, setTagline] = useState(initial?.tagline || '');
  const [bestSeason, setBestSeason] = useState(initial?.bestSeason || 'Tháng 9 – Tháng 4');
  const [lng, setLng] = useState(String(initial?.coordinates?.[0] ?? 105.8542));
  const [lat, setLat] = useState(String(initial?.coordinates?.[1] ?? 21.0285));
  const [tourCount, setTourCount] = useState(String(initial?.tourCount ?? 1));
  const [image, setImage] = useState(initial?.image || DEFAULT_IMG);
  const [alt, setAlt] = useState(initial?.alt || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2 || region.trim().length < 2) {
      setError('Vui lòng nhập tên điểm đến và vùng địa lý.');
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const id = initial?.id || sanitizeSlugId(name, 'dest');
      await onSave({
        id,
        name: name.trim(),
        region: region.trim(),
        zone,
        tagline: tagline.trim() || region.trim(),
        bestSeason: bestSeason.trim(),
        coordinates: [Number(lng) || 105.8542, Number(lat) || 21.0285],
        image: image.trim() || DEFAULT_IMG,
        alt: alt.trim() || name.trim(),
        tourCount: Math.max(0, Math.round(Number(tourCount) || 1)),
        isHidden: initial?.isHidden ?? false,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalShell
      title={isNew ? 'Thêm Điểm Đến Mới' : `Chỉnh sửa điểm đến: ${initial.name}`}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Tên điểm đến *</label>
            <input
              type="text"
              required
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Tỉnh / Khu vực *</label>
            <input
              type="text"
              required
              maxLength={120}
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Vùng miền</label>
            <select
              value={zone}
              onChange={(e) => setZone(e.target.value as DestinationItem['zone'])}
              className={INPUT_CLASS}
            >
              {ZONES.map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Mùa đẹp nhất</label>
            <input
              type="text"
              maxLength={120}
              value={bestSeason}
              onChange={(e) => setBestSeason(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Kinh độ (Longitude)</label>
            <input
              type="number"
              step="0.0001"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Vĩ độ (Latitude)</label>
            <input
              type="number"
              step="0.0001"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold mb-1">Khẩu hiệu ngắn (Tagline)</label>
            <input
              type="text"
              maxLength={300}
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Số tour hiển thị</label>
            <input
              type="number"
              min={0}
              value={tourCount}
              onChange={(e) => setTourCount(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">URL hình ảnh *</label>
            <input
              type="text"
              required
              maxLength={600}
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>
        </div>

        {error && <p className="text-xs font-medium text-[#C83E5B]">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-full border border-[#0B2A33]/15 dark:border-white/15 text-xs font-semibold"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1F8A70] dark:bg-[#F2B84B] text-white dark:text-[#06181E] text-xs font-semibold disabled:opacity-60"
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{busy ? savingLabel : saveLabel}</span>
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

// ============================================================================
// EXPERIENCE EDITOR MODAL
// ============================================================================

interface ExperienceEditorModalProps {
  initial?: CmsExperienceRecord;
  nextIndex: string;
  saveLabel: string;
  savingLabel: string;
  onSave: (record: CmsExperienceRecord) => Promise<void>;
  onClose: () => void;
}

export function ExperienceEditorModal({
  initial,
  nextIndex,
  saveLabel,
  savingLabel,
  onSave,
  onClose,
}: ExperienceEditorModalProps) {
  const isNew = !initial;
  const [index, setIndex] = useState(initial?.index || nextIndex);
  const [title, setTitle] = useState(initial?.title || '');
  const [location, setLocation] = useState(initial?.location || '');
  const [duration, setDuration] = useState(initial?.duration || 'Nửa ngày');
  const [image, setImage] = useState(initial?.image || DEFAULT_IMG);
  const [alt, setAlt] = useState(initial?.alt || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 2 || description.trim().length < 5) {
      setError('Vui lòng nhập tiêu đề và mô tả trải nghiệm.');
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const id = initial?.id || sanitizeSlugId(title, 'exp');
      await onSave({
        id,
        index: index.trim() || nextIndex,
        title: title.trim(),
        location: location.trim() || 'Việt Nam',
        duration: duration.trim() || 'Nửa ngày',
        description: description.trim(),
        image: image.trim() || DEFAULT_IMG,
        alt: alt.trim() || title.trim(),
        isHidden: initial?.isHidden ?? false,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalShell
      title={isNew ? 'Thêm Trải Nghiệm Mới' : `Chỉnh sửa: ${initial.title}`}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Số thứ tự (01, 02...)</label>
            <input
              type="text"
              maxLength={16}
              value={index}
              onChange={(e) => setIndex(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Thời lượng</label>
            <input
              type="text"
              maxLength={80}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold mb-1">Tên trải nghiệm *</label>
            <input
              type="text"
              required
              maxLength={180}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Địa điểm *</label>
            <input
              type="text"
              required
              maxLength={120}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">URL hình ảnh *</label>
            <input
              type="text"
              required
              maxLength={600}
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold mb-1">Mô tả chi tiết *</label>
            <textarea
              rows={3}
              required
              maxLength={1200}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={TEXTAREA_CLASS}
            />
          </div>
        </div>

        {error && <p className="text-xs font-medium text-[#C83E5B]">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-full border border-[#0B2A33]/15 dark:border-white/15 text-xs font-semibold"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1F8A70] dark:bg-[#F2B84B] text-white dark:text-[#06181E] text-xs font-semibold disabled:opacity-60"
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{busy ? savingLabel : saveLabel}</span>
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

// ============================================================================
// JOURNAL ARTICLE EDITOR MODAL
// ============================================================================

interface JournalEditorModalProps {
  initial?: CmsJournalRecord;
  saveLabel: string;
  savingLabel: string;
  onSave: (record: CmsJournalRecord) => Promise<void>;
  onClose: () => void;
}

export function JournalEditorModal({
  initial,
  saveLabel,
  savingLabel,
  onSave,
  onClose,
}: JournalEditorModalProps) {
  const isNew = !initial;
  const [category, setCategory] = useState<JournalArticle['category']>(
    initial?.category || 'Ký sự khách hàng'
  );
  const [destination, setDestination] = useState(initial?.destination || 'Đà Lạt');
  const [title, setTitle] = useState(initial?.title || '');
  const [excerpt, setExcerpt] = useState(initial?.excerpt || '');
  const [authorName, setAuthorName] = useState(initial?.authorName || 'Mây Lang Thang');
  const [authorRole, setAuthorRole] = useState(initial?.authorRole || 'Biên tập viên');
  const [publishedDate, setPublishedDate] = useState(initial?.publishedDate || 'Tháng 11, 2026');
  const [readTime, setReadTime] = useState(initial?.readTime || '5 phút đọc');
  const [pullQuote, setPullQuote] = useState(initial?.pullQuote || '');
  const [paragraphsText, setParagraphsText] = useState(
    (initial?.paragraphs || []).join('\n\n')
  );
  const [image, setImage] = useState(initial?.image || DEFAULT_IMG);
  const [alt, setAlt] = useState(initial?.alt || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 3 || excerpt.trim().length < 5) {
      setError('Vui lòng nhập tiêu đề và trích đoạn bài viết.');
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const id = initial?.id || sanitizeSlugId(title, 'journal');
      const paragraphs = paragraphsText
        .split(/\n{2,}|\n/)
        .map((p) => p.trim())
        .filter(Boolean)
        .slice(0, 15);

      await onSave({
        id,
        category,
        destination: destination.trim(),
        title: title.trim(),
        excerpt: excerpt.trim(),
        authorName: authorName.trim(),
        authorRole: authorRole.trim(),
        publishedDate: publishedDate.trim(),
        readTime: readTime.trim(),
        pullQuote: pullQuote.trim() || excerpt.trim(),
        paragraphs: paragraphs.length ? paragraphs : [excerpt.trim()],
        image: image.trim() || DEFAULT_IMG,
        alt: alt.trim() || title.trim(),
        isHidden: initial?.isHidden ?? false,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalShell
      title={isNew ? 'Viết Bài Nhật Ký Mây Mới' : `Chỉnh sửa bài viết`}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold mb-1">Tiêu đề bài viết *</label>
            <input
              type="text"
              required
              maxLength={220}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Chuyên mục</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as JournalArticle['category'])}
              className={INPUT_CLASS}
            >
              {JOURNAL_CATS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Điểm đến liên quan *</label>
            <input
              type="text"
              required
              maxLength={100}
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Tác giả</label>
            <input
              type="text"
              maxLength={120}
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Vai trò / Khách hàng</label>
            <input
              type="text"
              maxLength={140}
              value={authorRole}
              onChange={(e) => setAuthorRole(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Ngày đăng</label>
            <input
              type="text"
              maxLength={60}
              value={publishedDate}
              onChange={(e) => setPublishedDate(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Thời gian đọc</label>
            <input
              type="text"
              maxLength={40}
              value={readTime}
              onChange={(e) => setReadTime(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold mb-1">URL hình ảnh *</label>
            <input
              type="text"
              required
              maxLength={600}
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold mb-1">Trích đoạn mở đầu *</label>
            <textarea
              rows={2}
              required
              maxLength={600}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className={TEXTAREA_CLASS}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold mb-1">Câu trích dẫn nổi bật (Pull quote)</label>
            <input
              type="text"
              maxLength={500}
              value={pullQuote}
              onChange={(e) => setPullQuote(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold mb-1">
              Nội dung bài viết (mỗi đoạn cách 1 dòng trống)
            </label>
            <textarea
              rows={5}
              value={paragraphsText}
              onChange={(e) => setParagraphsText(e.target.value)}
              className={TEXTAREA_CLASS}
            />
          </div>
        </div>

        {error && <p className="text-xs font-medium text-[#C83E5B]">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-full border border-[#0B2A33]/15 dark:border-white/15 text-xs font-semibold"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1F8A70] dark:bg-[#F2B84B] text-white dark:text-[#06181E] text-xs font-semibold disabled:opacity-60"
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{busy ? savingLabel : saveLabel}</span>
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
