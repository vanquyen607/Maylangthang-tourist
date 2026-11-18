import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocFromServer,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Timestamp,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import type {
  DestinationItem,
  DurationFilter,
  ExperienceItem,
  JournalArticle,
  JournalCategory,
  RegionZone,
  TourCategory,
  TourItem,
  TourPackageOption,
} from '../data/travelData';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export const ADMIN_EMAIL = 'vanquyen607@gmail.com';
export const BOOKINGS_COLLECTION = 'booking_inquiries';
export const TOURS_COLLECTION = 'tours';
export const DESTINATIONS_COLLECTION = 'destinations';
export const EXPERIENCES_COLLECTION = 'experiences';
export const JOURNAL_COLLECTION = 'journal_articles';
export const SITE_SETTINGS_COLLECTION = 'site_settings';
export const SITE_SETTINGS_DOC_ID = 'main';

export type BookingStatus = 'pending' | 'contacted' | 'confirmed' | 'archived';

export interface BookingInquiryInput {
  fullName: string;
  phone: string;
  tourId: string;
  tourTitle: string;
  packageId: string;
  packageLabel: string;
  note?: string;
  lang: 'vi' | 'en';
}

export interface BookingInquiryRecord {
  id: string;
  fullName: string;
  phone: string;
  tourId: string;
  tourTitle: string;
  packageId: string;
  packageLabel: string;
  note?: string;
  lang: 'vi' | 'en';
  status: BookingStatus;
  userId?: string;
  createdAtMs: number;
  updatedAtMs?: number;
}

export interface CmsTourRecord extends TourItem {
  isHidden: boolean;
}

export interface CmsDestinationRecord extends DestinationItem {
  isHidden: boolean;
}

export interface CmsExperienceRecord extends ExperienceItem {
  isHidden: boolean;
}

export interface CmsJournalRecord extends JournalArticle {
  isHidden: boolean;
}

export interface CmsSiteSettingsRecord {
  heroEyebrow: string;
  heroHeadline: string;
  heroSubtitle: string;
  heroCtaLabel: string;
  heroImage: string;
  heroVideoUrl?: string;
  notifyEmails?: string;
  brand: string;
  slogan: string;
  hotline: string;
  phone: string;
  email: string;
  address: string;
  hanoiOffice: string;
  workingHours: string;
  license: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection(): Promise<void> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

void testConnection();

export function isPrimaryAdminUser(user: User | null): boolean {
  return Boolean(
    user && user.emailVerified && user.email?.toLowerCase() === ADMIN_EMAIL
  );
}

export async function signInWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

export function subscribeAuth(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

const VALID_ID_REGEX = /^[a-zA-Z0-9_-]+$/;
const VALID_PHONE_REGEX = /^(0|\+84)[0-9]{8,10}$/;

function clampText(value: string, maxLength: number): string {
  const trimmed = value.trim();
  return trimmed.length > maxLength ? trimmed.slice(0, maxLength) : trimmed;
}

function clampRequiredText(value: string, minLength: number, maxLength: number, fallback: string): string {
  const text = clampText(value, maxLength);
  return text.length >= minLength ? text : fallback;
}

export function sanitizeSlugId(value: string, fallbackPrefix = 'item'): string {
  const normalized = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  if (VALID_ID_REGEX.test(normalized) && normalized.length >= 2) {
    return normalized;
  }
  return `${fallbackPrefix}-${Date.now().toString(36)}`;
}

function sanitizeId(value: string, fallback: string, maxLength = 80): string {
  const cleaned = value.trim().replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, maxLength);
  return VALID_ID_REGEX.test(cleaned) && cleaned.length >= 1 ? cleaned : fallback;
}

function toTimestampMs(value: unknown): number {
  if (value && typeof value === 'object' && 'toMillis' in value) {
    return (value as Timestamp).toMillis();
  }
  return Date.now();
}

// =========================================================================
// BOOKING INQUIRIES
// =========================================================================

export async function submitBookingInquiry(
  input: BookingInquiryInput
): Promise<string> {
  const fullName = clampText(input.fullName, 120);
  const phone = input.phone.replace(/[\s.-]/g, '').slice(0, 20);
  const tourId = sanitizeId(input.tourId, 'custom-private', 80);
  const tourTitle = clampText(input.tourTitle, 200) || 'Custom Journey';
  const packageId = sanitizeId(input.packageId, 'standard', 80);
  const packageLabel = clampText(input.packageLabel, 120) || 'Standard';
  const note = clampText(input.note || '', 1000);
  const lang: 'vi' | 'en' = input.lang === 'en' ? 'en' : 'vi';

  if (fullName.length < 2) {
    throw new Error('Invalid full name length');
  }
  if (!VALID_PHONE_REGEX.test(phone)) {
    throw new Error('Invalid phone format');
  }

  const randomSuffix = Math.random().toString(36).slice(2, 8);
  const inquiryId = `inq_${Date.now()}_${randomSuffix}`;
  const docPath = `${BOOKINGS_COLLECTION}/${inquiryId}`;

  const payload: Record<string, unknown> = {
    fullName,
    phone,
    tourId,
    tourTitle,
    packageId,
    packageLabel,
    lang,
    status: 'pending',
    createdAt: serverTimestamp(),
  };

  if (note.length > 0) {
    payload.note = note;
  }

  const currentUser = auth.currentUser;
  if (
    currentUser &&
    currentUser.emailVerified &&
    VALID_ID_REGEX.test(currentUser.uid)
  ) {
    payload.userId = currentUser.uid;
  }

  try {
    await setDoc(doc(db, BOOKINGS_COLLECTION, inquiryId), payload);
    // Notify staff by email (fire-and-forget; never blocks or fails the booking)
    void notifyStaffNewBooking({
      inquiryId,
      fullName,
      phone,
      tourTitle,
      packageLabel,
      note,
    }).catch(() => undefined);
    return inquiryId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
  }
}

// --- Staff email notifications for new bookings (via EmailJS, free tier) ---
// These IDs are public by design (EmailJS browser integration).
const EMAILJS_SERVICE_ID = 'service_ujekkjc';
const EMAILJS_TEMPLATE_ID = 'template_2x0hdja';
const EMAILJS_PUBLIC_KEY = 'koqgX0BloYAD-ldrJ';

async function notifyStaffNewBooking(details: {
  inquiryId: string;
  fullName: string;
  phone: string;
  tourTitle: string;
  packageLabel: string;
  note: string;
}): Promise<void> {
  const snap = await getDoc(doc(db, SITE_SETTINGS_COLLECTION, SITE_SETTINGS_DOC_ID));
  if (!snap.exists()) return;
  const data = snap.data();
  const notifyEmails =
    typeof data.notifyEmails === 'string' ? data.notifyEmails.trim() : '';
  const contactEmail = typeof data.email === 'string' ? data.email.trim() : '';
  const toEmail = notifyEmails.length > 0 ? notifyEmails : contactEmail;
  if (!toEmail) return;

  await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      user_id: EMAILJS_PUBLIC_KEY,
      template_params: {
        to_email: toEmail,
        inquiry_id: details.inquiryId,
        customer_name: details.fullName,
        customer_phone: details.phone,
        tour_title: details.tourTitle,
        package_label: details.packageLabel,
        note: details.note || '(không có)',
        created_at: new Date().toLocaleString('vi-VN', {
          timeZone: 'Asia/Ho_Chi_Minh',
        }),
      },
    }),
  });
}

export function subscribeBookingInquiries(
  user: User,
  onData: (records: BookingInquiryRecord[]) => void,
  onError?: (err: Error) => void
): () => void {
  if (!user.emailVerified) {
    onData([]);
    return () => {};
  }

  const isAdmin = isPrimaryAdminUser(user);
  const q = isAdmin
    ? query(
        collection(db, BOOKINGS_COLLECTION),
        orderBy('createdAt', 'desc'),
        limit(100)
      )
    : query(
        collection(db, BOOKINGS_COLLECTION),
        where('userId', '==', user.uid),
        limit(25)
      );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: BookingInquiryRecord[] = snapshot.docs.map((snap) => {
        const data = snap.data();
        return {
          id: snap.id,
          fullName: String(data.fullName ?? ''),
          phone: String(data.phone ?? ''),
          tourId: String(data.tourId ?? ''),
          tourTitle: String(data.tourTitle ?? ''),
          packageId: String(data.packageId ?? ''),
          packageLabel: String(data.packageLabel ?? ''),
          note: typeof data.note === 'string' ? data.note : undefined,
          lang: data.lang === 'en' ? 'en' : 'vi',
          status: (data.status as BookingStatus) || 'pending',
          userId: typeof data.userId === 'string' ? data.userId : undefined,
          createdAtMs: toTimestampMs(data.createdAt),
          updatedAtMs: data.updatedAt ? toTimestampMs(data.updatedAt) : undefined,
        };
      });

      items.sort((a, b) => b.createdAtMs - a.createdAtMs);
      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, BOOKINGS_COLLECTION);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) {
          onError(wrapped);
        } else {
          throw wrapped;
        }
      }
    }
  );
}

export async function updateBookingInquiryStatus(
  inquiryId: string,
  status: BookingStatus
): Promise<void> {
  const path = `${BOOKINGS_COLLECTION}/${inquiryId}`;
  try {
    await updateDoc(doc(db, BOOKINGS_COLLECTION, inquiryId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteBookingInquiry(inquiryId: string): Promise<void> {
  const path = `${BOOKINGS_COLLECTION}/${inquiryId}`;
  try {
    await deleteDoc(doc(db, BOOKINGS_COLLECTION, inquiryId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// =========================================================================
// PUBLIC CMS SUBSCRIPTIONS & ADMIN CRUD
// =========================================================================

async function upsertCmsDoc(
  collectionName: string,
  id: string,
  payload: Record<string, unknown>
): Promise<void> {
  const safeId = sanitizeId(id, `${collectionName}-${Date.now()}`, 128);
  const path = `${collectionName}/${safeId}`;
  const ref = doc(db, collectionName, safeId);
  try {
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const existingCreatedAt = snap.data().createdAt ?? serverTimestamp();
      await updateDoc(ref, {
        ...payload,
        createdAt: existingCreatedAt,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(ref, {
        ...payload,
        createdAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteCmsDoc(collectionName: string, id: string): Promise<void> {
  const safeId = sanitizeId(id, id, 128);
  const path = `${collectionName}/${safeId}`;
  try {
    await deleteDoc(doc(db, collectionName, safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// 1. Tours CMS
const VALID_ZONES: Exclude<RegionZone, 'Tất cả'>[] = ['Miền Bắc', 'Miền Trung', 'Miền Nam'];
const VALID_CATEGORIES: Exclude<TourCategory, 'Tất cả'>[] = ['Biển đảo', 'Núi rừng', 'Văn hóa', 'Ẩm thực'];
const VALID_DURATIONS: Exclude<DurationFilter, 'Tất cả'>[] = ['2 ngày 1 đêm', '3 ngày 2 đêm'];
const VALID_JOURNAL_CATS: Exclude<JournalCategory, 'Tất cả'>[] = [
  'Ký sự khách hàng',
  'Văn hóa bản địa',
  'Ẩm thực & Làng nghề',
];

export async function saveCmsTour(tour: CmsTourRecord): Promise<void> {
  const highlights = (tour.highlights || [])
    .map((h) => clampText(String(h), 240))
    .filter(Boolean)
    .slice(0, 12);

  const packages: TourPackageOption[] = (tour.packages || [])
    .slice(0, 5)
    .map((pkg, idx) => ({
      id: sanitizeId(pkg.id || `tier-${idx}`, `tier-${idx}`, 40),
      label: clampRequiredText(pkg.label || '', 1, 100, 'Tiêu chuẩn'),
      summary: clampRequiredText(pkg.summary || '', 1, 200, 'Lưu trú chọn lọc'),
      priceDelta: Number.isFinite(Number(pkg.priceDelta)) ? Number(pkg.priceDelta) : 0,
    }));

  if (packages.length === 0) {
    packages.push({
      id: 'standard',
      label: 'Tiêu chuẩn',
      summary: 'Homestay bản địa, xe đưa đón & hướng dẫn viên',
      priceDelta: 0,
    });
  }

  const payload = {
    title: clampRequiredText(tour.title, 2, 200, 'Hành trình mới'),
    destination: clampRequiredText(tour.destination, 2, 100, 'Việt Nam'),
    zone: VALID_ZONES.includes(tour.zone) ? tour.zone : 'Miền Bắc',
    category: VALID_CATEGORIES.includes(tour.category) ? tour.category : 'Văn hóa',
    duration: VALID_DURATIONS.includes(tour.duration) ? tour.duration : '2 ngày 1 đêm',
    price: Math.max(0, Math.min(500_000_000, Math.round(Number(tour.price) || 0))),
    rating: Math.max(1, Math.min(5, Number(tour.rating) || 4.9)),
    reviewCount: Math.max(0, Math.min(1_000_000, Math.round(Number(tour.reviewCount) || 0))),
    groupSize: clampRequiredText(tour.groupSize, 1, 80, 'Tối đa 8 khách'),
    departureInfo: clampRequiredText(tour.departureInfo, 1, 160, 'Thứ Sáu hàng tuần'),
    description: clampRequiredText(tour.description, 5, 1500, 'Hành trình du lịch chậm cùng bản địa.'),
    highlights,
    packages,
    image: clampRequiredText(tour.image, 1, 600, '/src/assets/images/hero_vietnam_mist_1794970963443.jpg'),
    alt: clampRequiredText(tour.alt || tour.title, 1, 300, tour.title),
    isHidden: Boolean(tour.isHidden),
  };

  await upsertCmsDoc(TOURS_COLLECTION, tour.id, payload);
}

export function subscribeCmsTours(
  onData: (items: CmsTourRecord[]) => void,
  onError?: (err: Error) => void
): () => void {
  return onSnapshot(
    collection(db, TOURS_COLLECTION),
    (snapshot) => {
      const items: CmsTourRecord[] = snapshot.docs.map((snap) => {
        const d = snap.data();
        return {
          id: snap.id,
          title: String(d.title ?? ''),
          destination: String(d.destination ?? ''),
          zone: (d.zone as CmsTourRecord['zone']) || 'Miền Bắc',
          category: (d.category as CmsTourRecord['category']) || 'Văn hóa',
          duration: (d.duration as CmsTourRecord['duration']) || '2 ngày 1 đêm',
          price: Number(d.price ?? 0),
          rating: Number(d.rating ?? 4.9),
          reviewCount: Number(d.reviewCount ?? 0),
          groupSize: String(d.groupSize ?? ''),
          departureInfo: String(d.departureInfo ?? ''),
          description: String(d.description ?? ''),
          highlights: Array.isArray(d.highlights) ? d.highlights.map(String) : [],
          packages: Array.isArray(d.packages) ? (d.packages as TourPackageOption[]) : [],
          image: String(d.image ?? ''),
          alt: String(d.alt ?? ''),
          isHidden: Boolean(d.isHidden),
        };
      });
      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, TOURS_COLLECTION);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) onError(wrapped);
      }
    }
  );
}

// 2. Destinations CMS
export async function saveCmsDestination(dest: CmsDestinationRecord): Promise<void> {
  const lng = Number(dest.coordinates?.[0]);
  const lat = Number(dest.coordinates?.[1]);
  const payload = {
    name: clampRequiredText(dest.name, 2, 100, 'Điểm đến mới'),
    region: clampRequiredText(dest.region, 2, 120, 'Việt Nam'),
    zone: VALID_ZONES.includes(dest.zone) ? dest.zone : 'Miền Bắc',
    tagline: clampRequiredText(dest.tagline, 2, 300, 'Miền đất dịu dàng'),
    bestSeason: clampRequiredText(dest.bestSeason, 2, 120, 'Quanh năm'),
    coordinates: [
      Number.isFinite(lng) ? lng : 105.8542,
      Number.isFinite(lat) ? lat : 21.0285,
    ],
    image: clampRequiredText(dest.image, 1, 600, '/src/assets/images/hero_vietnam_mist_1794970963443.jpg'),
    alt: clampRequiredText(dest.alt || dest.name, 1, 300, dest.name),
    tourCount: Math.max(0, Math.min(1000, Math.round(Number(dest.tourCount) || 1))),
    isHidden: Boolean(dest.isHidden),
  };

  await upsertCmsDoc(DESTINATIONS_COLLECTION, dest.id, payload);
}

export function subscribeCmsDestinations(
  onData: (items: CmsDestinationRecord[]) => void,
  onError?: (err: Error) => void
): () => void {
  return onSnapshot(
    collection(db, DESTINATIONS_COLLECTION),
    (snapshot) => {
      const items: CmsDestinationRecord[] = snapshot.docs.map((snap) => {
        const d = snap.data();
        const coords = Array.isArray(d.coordinates) ? d.coordinates : [105.8542, 21.0285];
        return {
          id: snap.id,
          name: String(d.name ?? ''),
          region: String(d.region ?? ''),
          zone: (d.zone as CmsDestinationRecord['zone']) || 'Miền Bắc',
          tagline: String(d.tagline ?? ''),
          bestSeason: String(d.bestSeason ?? ''),
          coordinates: [Number(coords[0] ?? 105.8542), Number(coords[1] ?? 21.0285)],
          image: String(d.image ?? ''),
          alt: String(d.alt ?? ''),
          tourCount: Number(d.tourCount ?? 1),
          isHidden: Boolean(d.isHidden),
        };
      });
      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, DESTINATIONS_COLLECTION);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) onError(wrapped);
      }
    }
  );
}

// 3. Experiences CMS
export async function saveCmsExperience(exp: CmsExperienceRecord): Promise<void> {
  const payload = {
    index: clampRequiredText(exp.index, 1, 16, '01'),
    title: clampRequiredText(exp.title, 2, 180, 'Trải nghiệm bản địa'),
    location: clampRequiredText(exp.location, 2, 120, 'Việt Nam'),
    duration: clampRequiredText(exp.duration, 1, 80, 'Nửa ngày'),
    description: clampRequiredText(exp.description, 5, 1200, 'Trải nghiệm văn hóa địa phương.'),
    image: clampRequiredText(exp.image, 1, 600, '/src/assets/images/hero_vietnam_mist_1794970963443.jpg'),
    alt: clampRequiredText(exp.alt || exp.title, 1, 300, exp.title),
    isHidden: Boolean(exp.isHidden),
  };

  await upsertCmsDoc(EXPERIENCES_COLLECTION, exp.id, payload);
}

export function subscribeCmsExperiences(
  onData: (items: CmsExperienceRecord[]) => void,
  onError?: (err: Error) => void
): () => void {
  return onSnapshot(
    collection(db, EXPERIENCES_COLLECTION),
    (snapshot) => {
      const items: CmsExperienceRecord[] = snapshot.docs.map((snap) => {
        const d = snap.data();
        return {
          id: snap.id,
          index: String(d.index ?? '01'),
          title: String(d.title ?? ''),
          location: String(d.location ?? ''),
          duration: String(d.duration ?? ''),
          description: String(d.description ?? ''),
          image: String(d.image ?? ''),
          alt: String(d.alt ?? ''),
          isHidden: Boolean(d.isHidden),
        };
      });
      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, EXPERIENCES_COLLECTION);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) onError(wrapped);
      }
    }
  );
}

// 4. Journal Articles CMS
export async function saveCmsJournalArticle(article: CmsJournalRecord): Promise<void> {
  const paragraphs = (article.paragraphs || [])
    .map((p) => clampText(String(p), 2000))
    .filter(Boolean)
    .slice(0, 15);
  if (paragraphs.length === 0) {
    paragraphs.push(clampRequiredText(article.excerpt || '', 5, 2000, 'Ghi chép hành trình Mây Lang Thang.'));
  }

  const payload = {
    category: VALID_JOURNAL_CATS.includes(article.category) ? article.category : 'Ký sự khách hàng',
    destination: clampRequiredText(article.destination, 2, 100, 'Việt Nam'),
    title: clampRequiredText(article.title, 3, 220, 'Bài viết mới'),
    excerpt: clampRequiredText(article.excerpt, 5, 600, 'Ghi chép từ những chuyến đi chậm.'),
    authorName: clampRequiredText(article.authorName, 2, 120, 'Mây Lang Thang'),
    authorRole: clampRequiredText(article.authorRole, 2, 140, 'Biên tập viên'),
    publishedDate: clampRequiredText(article.publishedDate, 2, 60, 'Hôm nay'),
    readTime: clampRequiredText(article.readTime, 1, 40, '5 phút đọc'),
    pullQuote: clampRequiredText(article.pullQuote, 2, 500, 'Đi chậm để sống nhiều hơn.'),
    paragraphs,
    image: clampRequiredText(article.image, 1, 600, '/src/assets/images/hero_vietnam_mist_1794970963443.jpg'),
    alt: clampRequiredText(article.alt || article.title, 1, 300, article.title),
    isHidden: Boolean(article.isHidden),
  };

  await upsertCmsDoc(JOURNAL_COLLECTION, article.id, payload);
}

export function subscribeCmsJournalArticles(
  onData: (items: CmsJournalRecord[]) => void,
  onError?: (err: Error) => void
): () => void {
  return onSnapshot(
    collection(db, JOURNAL_COLLECTION),
    (snapshot) => {
      const items: CmsJournalRecord[] = snapshot.docs.map((snap) => {
        const d = snap.data();
        return {
          id: snap.id,
          category: (d.category as CmsJournalRecord['category']) || 'Ký sự khách hàng',
          destination: String(d.destination ?? ''),
          title: String(d.title ?? ''),
          excerpt: String(d.excerpt ?? ''),
          authorName: String(d.authorName ?? ''),
          authorRole: String(d.authorRole ?? ''),
          publishedDate: String(d.publishedDate ?? ''),
          readTime: String(d.readTime ?? ''),
          pullQuote: String(d.pullQuote ?? ''),
          paragraphs: Array.isArray(d.paragraphs) ? d.paragraphs.map(String) : [],
          image: String(d.image ?? ''),
          alt: String(d.alt ?? ''),
          isHidden: Boolean(d.isHidden),
        };
      });
      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, JOURNAL_COLLECTION);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) onError(wrapped);
      }
    }
  );
}

// 5. Site Settings CMS (Hero & Contact Info)
export async function saveCmsSiteSettings(settings: CmsSiteSettingsRecord): Promise<void> {
  const payload: Record<string, unknown> = {
    heroEyebrow: clampRequiredText(settings.heroEyebrow, 2, 200, 'Du lịch chậm khắp Việt Nam'),
    heroHeadline: clampRequiredText(settings.heroHeadline, 2, 160, 'Đi chậm, sống nhiều.'),
    heroSubtitle: clampRequiredText(settings.heroSubtitle, 5, 600, 'Hành trình tinh tế cùng bản địa.'),
    heroCtaLabel: clampRequiredText(settings.heroCtaLabel, 1, 80, 'Khám phá tour'),
    heroImage: clampRequiredText(settings.heroImage, 1, 600, '/src/assets/images/hero_vietnam_mist_1794970963443.jpg'),
    brand: clampRequiredText(settings.brand, 2, 120, 'Mây Lang Thang'),
    slogan: clampRequiredText(settings.slogan, 2, 160, 'Đi chậm, sống nhiều.'),
    hotline: clampRequiredText(settings.hotline, 4, 40, '1900 6868 24'),
    phone: clampRequiredText(settings.phone, 4, 40, '0912 345 678'),
    email: clampRequiredText(settings.email, 5, 160, 'xin-chao@maylangthang.vn'),
    address: clampRequiredText(settings.address, 4, 300, 'TP. Hồ Chí Minh'),
    hanoiOffice: clampRequiredText(settings.hanoiOffice, 4, 300, 'Hà Nội'),
    workingHours: clampRequiredText(settings.workingHours, 2, 120, '08:00 – 20:00'),
    license: clampRequiredText(settings.license, 2, 200, 'TCDL-GP LHQT'),
    notifyEmails: clampText(settings.notifyEmails || '', 300),
  };

  const trimmedVideo = clampText(settings.heroVideoUrl || '', 600);
  if (trimmedVideo.length > 0) {
    payload.heroVideoUrl = trimmedVideo;
  }

  await upsertCmsDoc(SITE_SETTINGS_COLLECTION, SITE_SETTINGS_DOC_ID, payload);
}

export function subscribeCmsSiteSettings(
  onData: (settings: CmsSiteSettingsRecord | null) => void,
  onError?: (err: Error) => void
): () => void {
  return onSnapshot(
    doc(db, SITE_SETTINGS_COLLECTION, SITE_SETTINGS_DOC_ID),
    (snap) => {
      if (!snap.exists()) {
        onData(null);
        return;
      }
      const d = snap.data();
      onData({
        heroEyebrow: String(d.heroEyebrow ?? ''),
        heroHeadline: String(d.heroHeadline ?? ''),
        heroSubtitle: String(d.heroSubtitle ?? ''),
        heroCtaLabel: String(d.heroCtaLabel ?? ''),
        heroImage: String(d.heroImage ?? ''),
        heroVideoUrl: typeof d.heroVideoUrl === 'string' ? d.heroVideoUrl : '',
        brand: String(d.brand ?? ''),
        slogan: String(d.slogan ?? ''),
        hotline: String(d.hotline ?? ''),
        phone: String(d.phone ?? ''),
        email: String(d.email ?? ''),
        address: String(d.address ?? ''),
        hanoiOffice: String(d.hanoiOffice ?? ''),
        workingHours: String(d.workingHours ?? ''),
        license: String(d.license ?? ''),
        notifyEmails: typeof d.notifyEmails === 'string' ? d.notifyEmails : '',
      });
    },
    (error) => {
      try {
        handleFirestoreError(
          error,
          OperationType.GET,
          `${SITE_SETTINGS_COLLECTION}/${SITE_SETTINGS_DOC_ID}`
        );
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) onError(wrapped);
      }
    }
  );
}
