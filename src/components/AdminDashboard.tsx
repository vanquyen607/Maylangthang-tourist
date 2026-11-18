import React, { useEffect, useMemo, useState } from 'react';
import type { User } from 'firebase/auth';
import {
  ArrowLeft,
  BookOpen,
  CalendarClock,
  Check,
  CheckCircle2,
  Compass,
  Copy,
  Download,
  Edit3,
  Eye,
  EyeOff,
  Loader2,
  LogIn,
  LogOut,
  MapPin,
  Moon,
  Phone,
  Plus,
  RotateCcw,
  Save,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { AdminManagedItem, useSiteContent } from '../context/SiteContentContext';
import {
  ADMIN_EMAIL,
  BookingInquiryRecord,
  BookingStatus,
  CmsDestinationRecord,
  CmsExperienceRecord,
  CmsJournalRecord,
  CmsSiteSettingsRecord,
  CmsTourRecord,
  DESTINATIONS_COLLECTION,
  EXPERIENCES_COLLECTION,
  JOURNAL_COLLECTION,
  SITE_SETTINGS_COLLECTION,
  SITE_SETTINGS_DOC_ID,
  TOURS_COLLECTION,
  deleteBookingInquiry,
  deleteCmsDoc,
  isPrimaryAdminUser,
  saveCmsDestination,
  saveCmsExperience,
  saveCmsJournalArticle,
  saveCmsSiteSettings,
  saveCmsTour,
  signInWithGoogle,
  signOutUser,
  subscribeAuth,
  subscribeBookingInquiries,
  updateBookingInquiryStatus,
} from '../lib/firebase';
import {
  DestinationEditorModal,
  ExperienceEditorModal,
  JournalEditorModal,
  TourEditorModal,
} from './AdminCmsModals';

interface AdminDashboardProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onBackHome: () => void;
}

type AdminTab =
  | 'inquiries'
  | 'tours'
  | 'destinations'
  | 'experiences'
  | 'journal'
  | 'settings';
type StatusFilter = 'all' | BookingStatus;

export function AdminDashboard({
  isDark,
  onToggleTheme,
  onBackHome,
}: AdminDashboardProps) {
  const { lang, setLang, t } = useLanguage();
  const {
    destinations,
    siteSettings,
    siteSettingsInFirestore,
    adminTours,
    adminDestinations,
    adminExperiences,
    adminJournalArticles,
  } = useSiteContent();

  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);

  const [inquiries, setInquiries] = useState<BookingInquiryRecord[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cmsNotice, setCmsNotice] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<AdminTab>('inquiries');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cmsSearch, setCmsSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmCmsDeleteKey, setConfirmCmsDeleteKey] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal states
  const [tourModal, setTourModal] = useState<{ open: boolean; initial?: CmsTourRecord }>({
    open: false,
  });
  const [destModal, setDestModal] = useState<{
    open: boolean;
    initial?: CmsDestinationRecord;
  }>({ open: false });
  const [expModal, setExpModal] = useState<{
    open: boolean;
    initial?: CmsExperienceRecord;
  }>({ open: false });
  const [journalModal, setJournalModal] = useState<{
    open: boolean;
    initial?: CmsJournalRecord;
  }>({ open: false });

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<CmsSiteSettingsRecord>(siteSettings);
  const [settingsDirty, setSettingsDirty] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    if (!settingsDirty) {
      setSettingsForm(siteSettings);
    }
  }, [siteSettings, settingsDirty]);

  useEffect(() => {
    const unsub = subscribeAuth((currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
      if (!currentUser) {
        setInquiries([]);
        setLoadingInquiries(false);
      }
    });
    return unsub;
  }, []);

  const isAdmin = isPrimaryAdminUser(user);

  useEffect(() => {
    if (!user || !isAdmin) {
      setInquiries([]);
      return;
    }

    setLoadingInquiries(true);
    setErrorMsg(null);

    const unsub = subscribeBookingInquiries(
      user,
      (records) => {
        setInquiries(records);
        setLoadingInquiries(false);
      },
      (err) => {
        setErrorMsg(err.message);
        setLoadingInquiries(false);
      }
    );

    return unsub;
  }, [user, isAdmin]);

  const showCmsSavedNotice = () => {
    setCmsNotice(t.admin.cmsSaved);
    window.setTimeout(() => {
      setCmsNotice((prev) => (prev === t.admin.cmsSaved ? null : prev));
    }, 3200);
  };

  const counts = useMemo(() => {
    return inquiries.reduce(
      (acc, item) => {
        acc.all += 1;
        acc[item.status] += 1;
        return acc;
      },
      { all: 0, pending: 0, contacted: 0, confirmed: 0, archived: 0 }
    );
  }, [inquiries]);

  const filteredInquiries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return inquiries.filter((item) => {
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      if (!matchStatus) return false;
      if (!q) return true;
      return (
        item.fullName.toLowerCase().includes(q) ||
        item.phone.toLowerCase().includes(q) ||
        item.tourTitle.toLowerCase().includes(q) ||
        item.packageLabel.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        (item.note && item.note.toLowerCase().includes(q))
      );
    });
  }, [inquiries, statusFilter, searchQuery]);

  const filteredTours = useMemo(() => {
    const q = cmsSearch.trim().toLowerCase();
    if (!q) return adminTours;
    return adminTours.filter(
      ({ item }) =>
        item.title.toLowerCase().includes(q) ||
        item.destination.toLowerCase().includes(q) ||
        item.zone.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [adminTours, cmsSearch]);

  const filteredDestinations = useMemo(() => {
    const q = cmsSearch.trim().toLowerCase();
    if (!q) return adminDestinations;
    return adminDestinations.filter(
      ({ item }) =>
        item.name.toLowerCase().includes(q) ||
        item.region.toLowerCase().includes(q) ||
        item.zone.toLowerCase().includes(q)
    );
  }, [adminDestinations, cmsSearch]);

  const filteredExperiences = useMemo(() => {
    const q = cmsSearch.trim().toLowerCase();
    if (!q) return adminExperiences;
    return adminExperiences.filter(
      ({ item }) =>
        item.title.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q)
    );
  }, [adminExperiences, cmsSearch]);

  const filteredJournal = useMemo(() => {
    const q = cmsSearch.trim().toLowerCase();
    if (!q) return adminJournalArticles;
    return adminJournalArticles.filter(
      ({ item }) =>
        item.title.toLowerCase().includes(q) ||
        item.destination.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.authorName.toLowerCase().includes(q)
    );
  }, [adminJournalArticles, cmsSearch]);

  const handleSignIn = async () => {
    setAuthBusy(true);
    setErrorMsg(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t.booking.submitError);
    } finally {
      setAuthBusy(false);
    }
  };

  const handleStatusChange = async (id: string, nextStatus: BookingStatus) => {
    setUpdatingId(id);
    setErrorMsg(null);
    try {
      await updateBookingInquiryStatus(id, nextStatus);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t.booking.submitError);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConfirmDelete = async (id: string) => {
    setUpdatingId(id);
    setErrorMsg(null);
    try {
      await deleteBookingInquiry(id);
      setConfirmDeleteId(null);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t.booking.submitError);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCopyPhone = async (id: string, phoneValue: string) => {
    try {
      await navigator.clipboard.writeText(phoneValue);
      setCopiedId(id);
      window.setTimeout(() => {
        setCopiedId((prev) => (prev === id ? null : prev));
      }, 1800);
    } catch {
      // Clipboard API unavailable
    }
  };

  const handleExportCsv = () => {
    const escapeCsv = (val: string) => `"${val.replace(/"/g, '""')}"`;
    const headers = [
      'ID',
      'Created At',
      'Full Name',
      'Phone',
      'Tour',
      'Package',
      'Status',
      'Language',
      'Note',
    ];
    const rows = filteredInquiries.map((item) => [
      item.id,
      new Date(item.createdAtMs).toISOString(),
      item.fullName,
      item.phone,
      item.tourTitle,
      item.packageLabel,
      item.status,
      item.lang,
      item.note || '',
    ]);

    const csvContent =
      '\uFEFF' +
      [headers, ...rows].map((row) => row.map((cell) => escapeCsv(cell)).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `may-lang-thang-bookings-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDeleteOrResetCms = async (collectionName: string, id: string) => {
    setUpdatingId(id);
    setErrorMsg(null);
    try {
      await deleteCmsDoc(collectionName, id);
      setConfirmCmsDeleteKey(null);
      showCmsSavedNotice();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t.booking.submitError);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setErrorMsg(null);
    try {
      await saveCmsSiteSettings(settingsForm);
      setSettingsDirty(false);
      showCmsSavedNotice();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t.booking.submitError);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleResetSettings = async () => {
    setSavingSettings(true);
    setErrorMsg(null);
    try {
      await deleteCmsDoc(SITE_SETTINGS_COLLECTION, SITE_SETTINGS_DOC_ID);
      setSettingsDirty(false);
      showCmsSavedNotice();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t.booking.submitError);
    } finally {
      setSavingSettings(false);
    }
  };

  const formatDate = (ms: number) =>
    new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'vi-VN', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(ms));

  const statusBadgeClass: Record<BookingStatus, string> = {
    pending:
      'bg-[#F2B84B]/18 text-[#8A5A00] dark:bg-[#F2B84B]/20 dark:text-[#F2B84B] border-[#F2B84B]/35',
    contacted:
      'bg-[#0B2A33]/10 text-[#0B2A33] dark:bg-white/12 dark:text-[#EDF4F3] border-[#0B2A33]/20 dark:border-white/20',
    confirmed:
      'bg-[#1F8A70]/15 text-[#12624E] dark:bg-[#1F8A70]/25 dark:text-[#6EE7B7] border-[#1F8A70]/30',
    archived:
      'bg-[#0B2A33]/6 text-[#0B2A33]/60 dark:bg-white/6 dark:text-white/55 border-[#0B2A33]/12 dark:border-white/12',
  };

  const renderOriginBadge = <T,>(entry: AdminManagedItem<T>) => {
    if (entry.isHidden) {
      return (
        <span className="px-2 py-0.5 rounded-md border text-[10px] font-semibold bg-[#C83E5B]/12 text-[#C83E5B] dark:text-[#E8708A] border-[#C83E5B]/30">
          {t.admin.cmsBadgeHidden}
        </span>
      );
    }
    if (!entry.isDefault) {
      return (
        <span className="px-2 py-0.5 rounded-md border text-[10px] font-semibold bg-[#1F8A70]/14 text-[#12624E] dark:text-[#6EE7B7] border-[#1F8A70]/30">
          {t.admin.cmsBadgeCustom}
        </span>
      );
    }
    if (entry.inFirestore) {
      return (
        <span className="px-2 py-0.5 rounded-md border text-[10px] font-semibold bg-[#F2B84B]/18 text-[#8A5A00] dark:text-[#F2B84B] border-[#F2B84B]/35">
          {t.admin.cmsBadgeEdited}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-md border text-[10px] font-semibold bg-[#0B2A33]/6 dark:bg-white/8 text-[#0B2A33]/70 dark:text-white/70 border-[#0B2A33]/12 dark:border-white/12">
        {t.admin.cmsBadgeDefault}
      </span>
    );
  };

  const renderCmsRowActions = <T extends { id: string }>(
    collectionName: string,
    entry: AdminManagedItem<T>,
    onEdit: () => void,
    onToggleVisibility: () => Promise<void>
  ) => {
    const deleteKey = `${collectionName}:${entry.item.id}`;
    const isBusy = updatingId === entry.item.id;

    return (
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-[#0B2A33]/15 dark:border-white/15 bg-[#F1F7F6] dark:bg-[#06181E] text-xs font-semibold hover:border-[#1F8A70] dark:hover:border-[#F2B84B] transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>{t.admin.cmsEdit}</span>
        </button>

        <button
          type="button"
          disabled={isBusy}
          onClick={() => void onToggleVisibility()}
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-[#0B2A33]/15 dark:border-white/15 bg-[#F1F7F6] dark:bg-[#06181E] text-xs font-semibold hover:border-[#1F8A70] dark:hover:border-[#F2B84B] transition-colors disabled:opacity-50"
        >
          {entry.isHidden ? (
            <>
              <Eye className="w-3.5 h-3.5 text-[#1F8A70] dark:text-[#6EE7B7]" />
              <span>{t.admin.cmsShow}</span>
            </>
          ) : (
            <>
              <EyeOff className="w-3.5 h-3.5" />
              <span>{t.admin.cmsHide}</span>
            </>
          )}
        </button>

        {entry.isDefault && entry.inFirestore && (
          <button
            type="button"
            disabled={isBusy}
            onClick={() => void handleDeleteOrResetCms(collectionName, entry.item.id)}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-[#F2B84B]/45 bg-[#F2B84B]/12 text-[#8A5A00] dark:text-[#F2B84B] text-xs font-semibold hover:bg-[#F2B84B]/22 transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.admin.cmsResetDefault}</span>
          </button>
        )}

        {!entry.isDefault && (
          confirmCmsDeleteKey === deleteKey ? (
            <div className="inline-flex items-center gap-1.5">
              <button
                type="button"
                disabled={isBusy}
                onClick={() => void handleDeleteOrResetCms(collectionName, entry.item.id)}
                className="h-9 px-3 rounded-xl bg-[#C83E5B] text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50"
              >
                {t.admin.confirmDelete}
              </button>
              <button
                type="button"
                onClick={() => setConfirmCmsDeleteKey(null)}
                className="h-9 px-3 rounded-xl border border-[#0B2A33]/15 dark:border-white/15 text-xs font-semibold"
              >
                {t.admin.cancelDelete}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmCmsDeleteKey(deleteKey)}
              aria-label={t.booking.deskDelete}
              className="h-9 w-9 rounded-xl border border-[#0B2A33]/12 dark:border-white/12 flex items-center justify-center text-[#0B2A33]/60 dark:text-[#EDF4F3]/60 hover:text-[#C83E5B] dark:hover:text-[#E8708A] hover:border-[#C83E5B]/40 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )
        )}
      </div>
    );
  };

  const tabButtonClass = (active: boolean) =>
    `inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
      active
        ? 'bg-[#0B2A33] text-white dark:bg-[#F2B84B] dark:text-[#06181E]'
        : 'text-[#0B2A33]/70 dark:text-[#EDF4F3]/75 hover:text-[#0B2A33] dark:hover:text-white'
    }`;

  return (
    <div className="min-h-screen bg-[#F1F7F6] dark:bg-[#06181E] text-[#0B2A33] dark:text-[#EDF4F3] transition-colors duration-300">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-30 bg-[#F1F7F6]/92 dark:bg-[#06181E]/92 backdrop-blur-xl border-b border-[#0B2A33]/10 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <button
              type="button"
              onClick={onBackHome}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-[#0B2A33]/15 dark:border-white/15 bg-white dark:bg-[#0D313B] text-xs font-semibold hover:border-[#1F8A70] dark:hover:border-[#F2B84B] transition-colors shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.admin.backToSite}</span>
            </button>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.14em] font-semibold text-[#1F8A70] dark:text-[#F2B84B] truncate">
                Mây Lang Thang
              </p>
              <h1 className="font-serif-display text-lg sm:text-xl font-semibold truncate">
                {t.admin.pageTitle}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div
              role="group"
              aria-label={lang === 'vi' ? 'Chuyển đổi ngôn ngữ' : 'Language switcher'}
              className="inline-flex items-center p-0.5 rounded-lg border bg-white/80 dark:bg-[#0D313B] border-[#0B2A33]/15 dark:border-white/15 text-xs font-semibold"
            >
              <button
                type="button"
                onClick={() => setLang('vi')}
                aria-pressed={lang === 'vi'}
                className={`px-2 py-1 rounded-md transition-colors ${
                  lang === 'vi'
                    ? 'bg-[#0B2A33] text-white dark:bg-[#F2B84B] dark:text-[#06181E]'
                    : 'text-[#0B2A33]/70 dark:text-white/70'
                }`}
              >
                VI
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                aria-pressed={lang === 'en'}
                className={`px-2 py-1 rounded-md transition-colors ${
                  lang === 'en'
                    ? 'bg-[#0B2A33] text-white dark:bg-[#F2B84B] dark:text-[#06181E]'
                    : 'text-[#0B2A33]/70 dark:text-white/70'
                }`}
              >
                EN
              </button>
            </div>

            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={isDark ? t.nav.toLight : t.nav.toDark}
              className="w-9 h-9 rounded-full flex items-center justify-center border border-[#0B2A33]/15 dark:border-white/15 bg-white dark:bg-[#0D313B] hover:border-[#1F8A70] dark:hover:border-[#F2B84B] transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {user && (
              <button
                type="button"
                onClick={() => void signOutUser()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#0B2A33] text-white dark:bg-white/10 dark:hover:bg-white/18 text-xs font-semibold hover:bg-[#1F8A70] transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.booking.deskSignOut}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {!authReady ? (
          <div className="py-24 text-center text-sm text-[#0B2A33]/65 dark:text-[#EDF4F3]/65">
            {t.admin.loadingAuth}
          </div>
        ) : !user ? (
          /* Login Card */
          <div className="max-w-lg mx-auto my-12 rounded-3xl bg-white dark:bg-[#0D313B] border border-[#0B2A33]/12 dark:border-white/12 p-8 sm:p-10 shadow-xl text-center space-y-5">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#1F8A70]/12 dark:bg-[#F2B84B]/15 text-[#1F8A70] dark:text-[#F2B84B] flex items-center justify-center">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h2 className="font-serif-display text-2xl sm:text-3xl font-semibold">
                {t.admin.loginTitle}
              </h2>
              <p className="text-sm text-[#0B2A33]/75 dark:text-[#EDF4F3]/75 mt-2.5 leading-relaxed">
                {t.admin.loginSubtitle}
              </p>
            </div>
            <p className="text-xs text-[#0B2A33]/60 dark:text-[#EDF4F3]/60">
              {t.admin.authorizedEmailHint}{' '}
              <span className="font-mono font-semibold text-[#0B2A33] dark:text-white">
                {ADMIN_EMAIL}
              </span>
            </p>
            {errorMsg && (
              <p className="text-xs font-medium text-[#C83E5B] dark:text-[#E8708A]">
                {errorMsg}
              </p>
            )}
            <button
              type="button"
              disabled={authBusy}
              onClick={handleSignIn}
              className="w-full py-3.5 px-6 rounded-full bg-[#1F8A70] hover:bg-[#0B2A33] dark:bg-[#F2B84B] dark:text-[#06181E] dark:hover:bg-white text-white font-semibold text-sm inline-flex items-center justify-center gap-2.5 transition-colors disabled:opacity-60"
            >
              <LogIn className="w-4 h-4" />
              <span>{t.admin.loginButton}</span>
            </button>
          </div>
        ) : !isAdmin ? (
          /* Unauthorized Account Notice */
          <div className="max-w-lg mx-auto my-12 rounded-3xl bg-white dark:bg-[#0D313B] border border-[#C83E5B]/30 p-8 sm:p-10 shadow-xl text-center space-y-5">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#C83E5B]/12 text-[#C83E5B] dark:text-[#E8708A] flex items-center justify-center">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <h2 className="font-serif-display text-2xl font-semibold">
                {t.admin.unauthorizedTitle}
              </h2>
              <p className="text-sm text-[#0B2A33]/75 dark:text-[#EDF4F3]/75 mt-2.5 leading-relaxed">
                {t.admin.unauthorizedBody(user.email || '', ADMIN_EMAIL)}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => void signOutUser()}
                className="flex-1 py-3 px-5 rounded-full bg-[#0B2A33] text-white dark:bg-[#F2B84B] dark:text-[#06181E] text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                {t.admin.switchAccount}
              </button>
              <button
                type="button"
                onClick={onBackHome}
                className="flex-1 py-3 px-5 rounded-full border border-[#0B2A33]/20 dark:border-white/20 text-sm font-semibold hover:bg-[#0B2A33]/5 dark:hover:bg-white/5 transition-colors"
              >
                {t.admin.backToSite}
              </button>
            </div>
          </div>
        ) : (
          /* Authorized Admin Dashboard */
          <div className="space-y-6">
            {/* Admin Greeting & Tab Switcher */}
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1F8A70] dark:text-[#F2B84B]">
                  {t.admin.signedInAs} {user.email}
                </p>
                <h2 className="font-serif-display text-2xl sm:text-3xl font-semibold mt-1">
                  {t.admin.dashboardHeading}
                </h2>
              </div>

              <div
                role="tablist"
                aria-label={t.admin.workspaceTabsAria}
                className="flex items-center gap-1 p-1.5 rounded-2xl bg-white dark:bg-[#0D313B] border border-[#0B2A33]/12 dark:border-white/12 overflow-x-auto no-scrollbar"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'inquiries'}
                  onClick={() => setActiveTab('inquiries')}
                  className={tabButtonClass(activeTab === 'inquiries')}
                >
                  <CalendarClock className="w-3.5 h-3.5" />
                  <span>
                    {t.admin.tabInquiries} ({counts.all})
                  </span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'tours'}
                  onClick={() => {
                    setActiveTab('tours');
                    setCmsSearch('');
                  }}
                  className={tabButtonClass(activeTab === 'tours')}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>
                    {t.admin.tabTours} ({adminTours.length})
                  </span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'destinations'}
                  onClick={() => {
                    setActiveTab('destinations');
                    setCmsSearch('');
                  }}
                  className={tabButtonClass(activeTab === 'destinations')}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>
                    {t.admin.tabDestinations} ({adminDestinations.length})
                  </span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'experiences'}
                  onClick={() => {
                    setActiveTab('experiences');
                    setCmsSearch('');
                  }}
                  className={tabButtonClass(activeTab === 'experiences')}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {t.admin.tabExperiences} ({adminExperiences.length})
                  </span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'journal'}
                  onClick={() => {
                    setActiveTab('journal');
                    setCmsSearch('');
                  }}
                  className={tabButtonClass(activeTab === 'journal')}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>
                    {t.admin.tabJournal} ({adminJournalArticles.length})
                  </span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'settings'}
                  onClick={() => setActiveTab('settings')}
                  className={tabButtonClass(activeTab === 'settings')}
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>{t.admin.tabSettings}</span>
                </button>
              </div>
            </div>

            {cmsNotice && (
              <div className="px-5 py-3 rounded-2xl bg-[#1F8A70]/15 dark:bg-[#1F8A70]/25 border border-[#1F8A70]/35 text-[#12624E] dark:text-[#6EE7B7] text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{cmsNotice}</span>
              </div>
            )}

            {errorMsg && (
              <div className="px-5 py-3 rounded-2xl bg-[#C83E5B]/10 border border-[#C83E5B]/25 text-[#C83E5B] dark:text-[#E8708A] text-xs font-medium">
                {errorMsg}
              </div>
            )}

            {/* TAB 1: BOOKING INQUIRIES */}
            {activeTab === 'inquiries' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="rounded-2xl bg-white dark:bg-[#0D313B] border border-[#0B2A33]/10 dark:border-white/10 p-5">
                    <p className="text-xs font-medium text-[#0B2A33]/65 dark:text-[#EDF4F3]/65">
                      {t.admin.kpiTotal}
                    </p>
                    <p className="font-serif-display text-3xl font-semibold mt-1.5 tabular-nums">
                      {counts.all}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white dark:bg-[#0D313B] border border-[#F2B84B]/40 p-5">
                    <p className="text-xs font-medium text-[#8A5A00] dark:text-[#F2B84B]">
                      {t.booking.statuses.pending}
                    </p>
                    <p className="font-serif-display text-3xl font-semibold mt-1.5 tabular-nums text-[#8A5A00] dark:text-[#F2B84B]">
                      {counts.pending}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white dark:bg-[#0D313B] border border-[#0B2A33]/10 dark:border-white/10 p-5">
                    <p className="text-xs font-medium text-[#0B2A33]/65 dark:text-[#EDF4F3]/65">
                      {t.booking.statuses.contacted}
                    </p>
                    <p className="font-serif-display text-3xl font-semibold mt-1.5 tabular-nums">
                      {counts.contacted}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white dark:bg-[#0D313B] border border-[#1F8A70]/35 p-5">
                    <p className="text-xs font-medium text-[#1F8A70] dark:text-[#6EE7B7]">
                      {t.booking.statuses.confirmed}
                    </p>
                    <p className="font-serif-display text-3xl font-semibold mt-1.5 tabular-nums text-[#1F8A70] dark:text-[#6EE7B7]">
                      {counts.confirmed}
                    </p>
                  </div>
                </div>

                <div className="rounded-3xl bg-white dark:bg-[#0D313B] border border-[#0B2A33]/10 dark:border-white/10 overflow-hidden shadow-sm">
                  <div className="p-4 sm:p-6 border-b border-[#0B2A33]/10 dark:border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
                      {(
                        ['all', 'pending', 'contacted', 'confirmed', 'archived'] as StatusFilter[]
                      ).map((key) => {
                        const label =
                          key === 'all' ? t.admin.filterAll : t.booking.statuses[key];
                        const count = counts[key];
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setStatusFilter(key)}
                            className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                              statusFilter === key
                                ? 'bg-[#0B2A33] text-white dark:bg-[#F2B84B] dark:text-[#06181E]'
                                : 'bg-[#F1F7F6] dark:bg-[#06181E] text-[#0B2A33]/75 dark:text-[#EDF4F3]/75 hover:text-[#0B2A33] dark:hover:text-white'
                            }`}
                          >
                            {label} ({count})
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <div className="relative">
                        <Search className="w-4 h-4 text-[#0B2A33]/45 dark:text-white/45 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="search"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder={t.admin.searchPlaceholder}
                          className="w-full sm:w-64 h-10 pl-10 pr-4 rounded-xl bg-[#F1F7F6] dark:bg-[#06181E] border border-[#0B2A33]/12 dark:border-white/12 text-xs text-[#0B2A33] dark:text-white placeholder:text-[#0B2A33]/45 dark:placeholder:text-white/45 focus:outline-none focus:ring-2 focus:ring-[#1F8A70] dark:focus:ring-[#F2B84B]"
                        />
                      </div>

                      <button
                        type="button"
                        disabled={filteredInquiries.length === 0}
                        onClick={handleExportCsv}
                        className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl border border-[#0B2A33]/15 dark:border-white/15 bg-[#F1F7F6] dark:bg-[#06181E] text-xs font-semibold hover:border-[#1F8A70] dark:hover:border-[#F2B84B] disabled:opacity-50 transition-colors whitespace-nowrap"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{t.admin.exportCsv}</span>
                      </button>
                    </div>
                  </div>

                  {loadingInquiries ? (
                    <div className="p-12 text-center text-sm text-[#0B2A33]/65 dark:text-[#EDF4F3]/65">
                      {t.admin.loadingList}
                    </div>
                  ) : filteredInquiries.length === 0 ? (
                    <div className="p-12 text-center space-y-2">
                      <CheckCircle2 className="w-8 h-8 mx-auto text-[#1F8A70]/50 dark:text-[#F2B84B]/50" />
                      <p className="text-sm font-medium">{t.admin.emptyTitle}</p>
                      <p className="text-xs text-[#0B2A33]/65 dark:text-[#EDF4F3]/65">
                        {t.admin.emptySub}
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#0B2A33]/10 dark:divide-white/10">
                      {filteredInquiries.map((item) => (
                        <article
                          key={item.id}
                          className="p-5 sm:p-6 hover:bg-[#F1F7F6]/60 dark:hover:bg-[#06181E]/40 transition-colors"
                        >
                          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                            <div className="space-y-2 min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2.5">
                                <h3 className="font-semibold text-base text-[#0B2A33] dark:text-white">
                                  {item.fullName}
                                </h3>
                                <span
                                  className={`px-2.5 py-0.5 rounded-md border text-[11px] font-semibold ${
                                    statusBadgeClass[item.status]
                                  }`}
                                >
                                  {t.booking.statuses[item.status]}
                                </span>
                                <span className="text-[11px] font-mono text-[#0B2A33]/55 dark:text-[#EDF4F3]/55">
                                  #{item.id}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#0B2A33]/80 dark:text-[#EDF4F3]/80">
                                <a
                                  href={`tel:${item.phone}`}
                                  className="inline-flex items-center gap-1.5 font-semibold text-[#1F8A70] dark:text-[#F2B84B] hover:underline tabular-nums"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                  <span>{item.phone}</span>
                                </a>
                                <button
                                  type="button"
                                  onClick={() => void handleCopyPhone(item.id, item.phone)}
                                  className="inline-flex items-center gap-1 text-[11px] text-[#0B2A33]/65 dark:text-[#EDF4F3]/65 hover:text-[#0B2A33] dark:hover:text-white"
                                >
                                  {copiedId === item.id ? (
                                    <>
                                      <Check className="w-3 h-3 text-[#1F8A70]" />
                                      <span>{t.admin.copied}</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span>{t.admin.copyPhone}</span>
                                    </>
                                  )}
                                </button>
                                <span className="tabular-nums text-[#0B2A33]/60 dark:text-[#EDF4F3]/60">
                                  {formatDate(item.createdAtMs)}
                                </span>
                                <span className="uppercase text-[10px] font-semibold tracking-wider px-1.5 py-0.5 rounded bg-[#0B2A33]/8 dark:bg-white/10">
                                  {item.lang}
                                </span>
                              </div>

                              <p className="text-sm font-medium text-[#0B2A33] dark:text-[#EDF4F3]">
                                {item.tourTitle}{' '}
                                <span className="text-[#0B2A33]/65 dark:text-[#EDF4F3]/65 font-normal">
                                  · {item.packageLabel}
                                </span>
                              </p>

                              {item.note && (
                                <p className="text-xs leading-relaxed text-[#0B2A33]/75 dark:text-[#EDF4F3]/75 bg-[#F1F7F6] dark:bg-[#06181E] border border-[#0B2A33]/8 dark:border-white/8 rounded-xl p-3">
                                  {item.note}
                                </p>
                              )}
                            </div>

                            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
                              <select
                                aria-label={t.admin.statusSelectAria}
                                disabled={updatingId === item.id}
                                value={item.status}
                                onChange={(e) =>
                                  void handleStatusChange(
                                    item.id,
                                    e.target.value as BookingStatus
                                  )
                                }
                                className="h-9 px-3 rounded-xl bg-[#F1F7F6] dark:bg-[#06181E] border border-[#0B2A33]/15 dark:border-white/15 text-xs font-semibold text-[#0B2A33] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1F8A70] dark:focus:ring-[#F2B84B] disabled:opacity-50"
                              >
                                <option value="pending">{t.booking.statuses.pending}</option>
                                <option value="contacted">{t.booking.statuses.contacted}</option>
                                <option value="confirmed">{t.booking.statuses.confirmed}</option>
                                <option value="archived">{t.booking.statuses.archived}</option>
                              </select>

                              {confirmDeleteId === item.id ? (
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    disabled={updatingId === item.id}
                                    onClick={() => void handleConfirmDelete(item.id)}
                                    className="h-9 px-3 rounded-xl bg-[#C83E5B] text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50"
                                  >
                                    {t.admin.confirmDelete}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="h-9 px-3 rounded-xl border border-[#0B2A33]/15 dark:border-white/15 text-xs font-semibold"
                                  >
                                    {t.admin.cancelDelete}
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(item.id)}
                                  aria-label={t.booking.deskDelete}
                                  className="h-9 w-9 rounded-xl border border-[#0B2A33]/12 dark:border-white/12 flex items-center justify-center text-[#0B2A33]/60 dark:text-[#EDF4F3]/60 hover:text-[#C83E5B] dark:hover:text-[#E8708A] hover:border-[#C83E5B]/40 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: TOURS CRUD */}
            {activeTab === 'tours' && (
              <div className="rounded-3xl bg-white dark:bg-[#0D313B] border border-[#0B2A33]/10 dark:border-white/10 overflow-hidden shadow-sm">
                <div className="p-4 sm:p-6 border-b border-[#0B2A33]/10 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="w-4 h-4 text-[#0B2A33]/45 dark:text-white/45 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="search"
                      value={cmsSearch}
                      onChange={(e) => setCmsSearch(e.target.value)}
                      placeholder={t.admin.cmsSearchContent}
                      className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#F1F7F6] dark:bg-[#06181E] border border-[#0B2A33]/12 dark:border-white/12 text-xs text-[#0B2A33] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1F8A70] dark:focus:ring-[#F2B84B]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setTourModal({ open: true })}
                    className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-full bg-[#1F8A70] hover:bg-[#0B2A33] dark:bg-[#F2B84B] dark:text-[#06181E] text-white text-xs font-semibold transition-colors shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t.admin.cmsAddTour}</span>
                  </button>
                </div>

                <div className="divide-y divide-[#0B2A33]/10 dark:divide-white/10">
                  {filteredTours.map((entry) => {
                    const tour = entry.item;
                    return (
                      <div
                        key={tour.id}
                        className={`p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                          entry.isHidden ? 'opacity-65' : ''
                        }`}
                      >
                        <div className="flex items-start gap-4 min-w-0 flex-1">
                          <img
                            src={tour.image}
                            alt={tour.alt}
                            className="w-20 h-16 rounded-xl object-cover shrink-0 bg-[#0B2A33]/10"
                          />
                          <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold text-sm sm:text-base text-[#0B2A33] dark:text-white truncate">
                                {tour.title}
                              </h3>
                              {renderOriginBadge(entry)}
                            </div>
                            <p className="text-xs text-[#0B2A33]/70 dark:text-[#EDF4F3]/70">
                              {tour.destination} · {tour.zone} · {tour.category} · {tour.duration}
                            </p>
                            <p className="text-xs font-semibold text-[#1F8A70] dark:text-[#F2B84B] tabular-nums">
                              {tour.price.toLocaleString(lang === 'en' ? 'en-US' : 'vi-VN')}₫ ·{' '}
                              {tour.packages.length} {lang === 'en' ? 'tiers' : 'gói'}
                            </p>
                          </div>
                        </div>

                        {renderCmsRowActions(
                          TOURS_COLLECTION,
                          entry,
                          () =>
                            setTourModal({
                              open: true,
                              initial: { ...tour, isHidden: entry.isHidden },
                            }),
                          async () => {
                            setUpdatingId(tour.id);
                            setErrorMsg(null);
                            try {
                              await saveCmsTour({ ...tour, isHidden: !entry.isHidden });
                              showCmsSavedNotice();
                            } catch (err) {
                              setErrorMsg(err instanceof Error ? err.message : t.booking.submitError);
                            } finally {
                              setUpdatingId(null);
                            }
                          }
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: DESTINATIONS CRUD */}
            {activeTab === 'destinations' && (
              <div className="rounded-3xl bg-white dark:bg-[#0D313B] border border-[#0B2A33]/10 dark:border-white/10 overflow-hidden shadow-sm">
                <div className="p-4 sm:p-6 border-b border-[#0B2A33]/10 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="w-4 h-4 text-[#0B2A33]/45 dark:text-white/45 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="search"
                      value={cmsSearch}
                      onChange={(e) => setCmsSearch(e.target.value)}
                      placeholder={t.admin.cmsSearchContent}
                      className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#F1F7F6] dark:bg-[#06181E] border border-[#0B2A33]/12 dark:border-white/12 text-xs text-[#0B2A33] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1F8A70] dark:focus:ring-[#F2B84B]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setDestModal({ open: true })}
                    className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-full bg-[#1F8A70] hover:bg-[#0B2A33] dark:bg-[#F2B84B] dark:text-[#06181E] text-white text-xs font-semibold transition-colors shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t.admin.cmsAddDestination}</span>
                  </button>
                </div>

                <div className="divide-y divide-[#0B2A33]/10 dark:divide-white/10">
                  {filteredDestinations.map((entry) => {
                    const dest = entry.item;
                    return (
                      <div
                        key={dest.id}
                        className={`p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                          entry.isHidden ? 'opacity-65' : ''
                        }`}
                      >
                        <div className="flex items-start gap-4 min-w-0 flex-1">
                          <img
                            src={dest.image}
                            alt={dest.alt}
                            className="w-20 h-16 rounded-xl object-cover shrink-0 bg-[#0B2A33]/10"
                          />
                          <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold text-sm sm:text-base text-[#0B2A33] dark:text-white">
                                {dest.name}
                              </h3>
                              {renderOriginBadge(entry)}
                            </div>
                            <p className="text-xs text-[#0B2A33]/70 dark:text-[#EDF4F3]/70">
                              {dest.region} · {dest.zone} · {dest.bestSeason}
                            </p>
                            <p className="text-[11px] font-mono text-[#0B2A33]/55 dark:text-[#EDF4F3]/55">
                              [{dest.coordinates[0].toFixed(3)}, {dest.coordinates[1].toFixed(3)}] ·{' '}
                              {dest.tagline}
                            </p>
                          </div>
                        </div>

                        {renderCmsRowActions(
                          DESTINATIONS_COLLECTION,
                          entry,
                          () =>
                            setDestModal({
                              open: true,
                              initial: { ...dest, isHidden: entry.isHidden },
                            }),
                          async () => {
                            setUpdatingId(dest.id);
                            setErrorMsg(null);
                            try {
                              await saveCmsDestination({ ...dest, isHidden: !entry.isHidden });
                              showCmsSavedNotice();
                            } catch (err) {
                              setErrorMsg(err instanceof Error ? err.message : t.booking.submitError);
                            } finally {
                              setUpdatingId(null);
                            }
                          }
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 4: EXPERIENCES CRUD */}
            {activeTab === 'experiences' && (
              <div className="rounded-3xl bg-white dark:bg-[#0D313B] border border-[#0B2A33]/10 dark:border-white/10 overflow-hidden shadow-sm">
                <div className="p-4 sm:p-6 border-b border-[#0B2A33]/10 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="w-4 h-4 text-[#0B2A33]/45 dark:text-white/45 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="search"
                      value={cmsSearch}
                      onChange={(e) => setCmsSearch(e.target.value)}
                      placeholder={t.admin.cmsSearchContent}
                      className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#F1F7F6] dark:bg-[#06181E] border border-[#0B2A33]/12 dark:border-white/12 text-xs text-[#0B2A33] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1F8A70] dark:focus:ring-[#F2B84B]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setExpModal({ open: true })}
                    className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-full bg-[#1F8A70] hover:bg-[#0B2A33] dark:bg-[#F2B84B] dark:text-[#06181E] text-white text-xs font-semibold transition-colors shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t.admin.cmsAddExperience}</span>
                  </button>
                </div>

                <div className="divide-y divide-[#0B2A33]/10 dark:divide-white/10">
                  {filteredExperiences.map((entry) => {
                    const exp = entry.item;
                    return (
                      <div
                        key={exp.id}
                        className={`p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                          entry.isHidden ? 'opacity-65' : ''
                        }`}
                      >
                        <div className="flex items-start gap-4 min-w-0 flex-1">
                          <img
                            src={exp.image}
                            alt={exp.alt}
                            className="w-20 h-16 rounded-xl object-cover shrink-0 bg-[#0B2A33]/10"
                          />
                          <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-mono font-semibold text-[#1F8A70] dark:text-[#F2B84B]">
                                {exp.index}
                              </span>
                              <h3 className="font-semibold text-sm sm:text-base text-[#0B2A33] dark:text-white">
                                {exp.title}
                              </h3>
                              {renderOriginBadge(entry)}
                            </div>
                            <p className="text-xs text-[#0B2A33]/70 dark:text-[#EDF4F3]/70">
                              {exp.location} · {exp.duration}
                            </p>
                            <p className="text-xs text-[#0B2A33]/65 dark:text-[#EDF4F3]/65 line-clamp-1">
                              {exp.description}
                            </p>
                          </div>
                        </div>

                        {renderCmsRowActions(
                          EXPERIENCES_COLLECTION,
                          entry,
                          () =>
                            setExpModal({
                              open: true,
                              initial: { ...exp, isHidden: entry.isHidden },
                            }),
                          async () => {
                            setUpdatingId(exp.id);
                            setErrorMsg(null);
                            try {
                              await saveCmsExperience({ ...exp, isHidden: !entry.isHidden });
                              showCmsSavedNotice();
                            } catch (err) {
                              setErrorMsg(err instanceof Error ? err.message : t.booking.submitError);
                            } finally {
                              setUpdatingId(null);
                            }
                          }
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 5: JOURNAL ARTICLES CRUD */}
            {activeTab === 'journal' && (
              <div className="rounded-3xl bg-white dark:bg-[#0D313B] border border-[#0B2A33]/10 dark:border-white/10 overflow-hidden shadow-sm">
                <div className="p-4 sm:p-6 border-b border-[#0B2A33]/10 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="w-4 h-4 text-[#0B2A33]/45 dark:text-white/45 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="search"
                      value={cmsSearch}
                      onChange={(e) => setCmsSearch(e.target.value)}
                      placeholder={t.admin.cmsSearchContent}
                      className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#F1F7F6] dark:bg-[#06181E] border border-[#0B2A33]/12 dark:border-white/12 text-xs text-[#0B2A33] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1F8A70] dark:focus:ring-[#F2B84B]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setJournalModal({ open: true })}
                    className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-full bg-[#1F8A70] hover:bg-[#0B2A33] dark:bg-[#F2B84B] dark:text-[#06181E] text-white text-xs font-semibold transition-colors shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t.admin.cmsAddJournal}</span>
                  </button>
                </div>

                <div className="divide-y divide-[#0B2A33]/10 dark:divide-white/10">
                  {filteredJournal.map((entry) => {
                    const article = entry.item;
                    return (
                      <div
                        key={article.id}
                        className={`p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                          entry.isHidden ? 'opacity-65' : ''
                        }`}
                      >
                        <div className="flex items-start gap-4 min-w-0 flex-1">
                          <img
                            src={article.image}
                            alt={article.alt}
                            className="w-20 h-16 rounded-xl object-cover shrink-0 bg-[#0B2A33]/10"
                          />
                          <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold text-sm sm:text-base text-[#0B2A33] dark:text-white">
                                {article.title}
                              </h3>
                              {renderOriginBadge(entry)}
                            </div>
                            <p className="text-xs text-[#0B2A33]/70 dark:text-[#EDF4F3]/70">
                              {article.category} · {article.destination} · {article.authorName} ·{' '}
                              {article.publishedDate}
                            </p>
                            <p className="text-xs text-[#0B2A33]/65 dark:text-[#EDF4F3]/65 line-clamp-1">
                              {article.excerpt}
                            </p>
                          </div>
                        </div>

                        {renderCmsRowActions(
                          JOURNAL_COLLECTION,
                          entry,
                          () =>
                            setJournalModal({
                              open: true,
                              initial: { ...article, isHidden: entry.isHidden },
                            }),
                          async () => {
                            setUpdatingId(article.id);
                            setErrorMsg(null);
                            try {
                              await saveCmsJournalArticle({
                                ...article,
                                isHidden: !entry.isHidden,
                              });
                              showCmsSavedNotice();
                            } catch (err) {
                              setErrorMsg(err instanceof Error ? err.message : t.booking.submitError);
                            } finally {
                              setUpdatingId(null);
                            }
                          }
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 6: HERO & CONTACT SETTINGS */}
            {activeTab === 'settings' && (
              <form
                onSubmit={handleSaveSettings}
                className="rounded-3xl bg-white dark:bg-[#0D313B] border border-[#0B2A33]/10 dark:border-white/10 p-6 sm:p-8 shadow-sm space-y-8"
              >
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#0B2A33]/10 dark:border-white/10">
                    <h3 className="font-serif-display text-xl font-semibold">
                      {t.admin.cmsSettingsHeroTitle}
                    </h3>
                    {siteSettingsInFirestore && (
                      <span className="px-2.5 py-0.5 rounded-md border text-[11px] font-semibold bg-[#F2B84B]/18 text-[#8A5A00] dark:text-[#F2B84B] border-[#F2B84B]/35">
                        {t.admin.cmsBadgeEdited}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1">
                        Hero Eyebrow (Dòng phụ đầu trang)
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={200}
                        value={settingsForm.heroEyebrow}
                        onChange={(e) => {
                          setSettingsDirty(true);
                          setSettingsForm((prev) => ({ ...prev, heroEyebrow: e.target.value }));
                        }}
                        className="w-full h-10 px-3.5 rounded-xl bg-[#F1F7F6] dark:bg-[#06181E] border border-[#0B2A33]/15 dark:border-white/15 text-xs sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1">
                        Hero Headline (Tiêu đề chính)
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={160}
                        value={settingsForm.heroHeadline}
                        onChange={(e) => {
                          setSettingsDirty(true);
                          setSettingsForm((prev) => ({ ...prev, heroHeadline: e.target.value }));
                        }}
                        className="w-full h-10 px-3.5 rounded-xl bg-[#F1F7F6] dark:bg-[#06181E] border border-[#0B2A33]/15 dark:border-white/15 text-xs sm:text-sm"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold mb-1">
                        Hero Subtitle (Mô tả giới thiệu)
                      </label>
                      <textarea
                        rows={3}
                        required
                        maxLength={600}
                        value={settingsForm.heroSubtitle}
                        onChange={(e) => {
                          setSettingsDirty(true);
                          setSettingsForm((prev) => ({ ...prev, heroSubtitle: e.target.value }));
                        }}
                        className="w-full p-3.5 rounded-xl bg-[#F1F7F6] dark:bg-[#06181E] border border-[#0B2A33]/15 dark:border-white/15 text-xs sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1">
                        Nút CTA (Hero Button)
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={80}
                        value={settingsForm.heroCtaLabel}
                        onChange={(e) => {
                          setSettingsDirty(true);
                          setSettingsForm((prev) => ({ ...prev, heroCtaLabel: e.target.value }));
                        }}
                        className="w-full h-10 px-3.5 rounded-xl bg-[#F1F7F6] dark:bg-[#06181E] border border-[#0B2A33]/15 dark:border-white/15 text-xs sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1">
                        URL Ảnh nền Hero
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={600}
                        value={settingsForm.heroImage}
                        onChange={(e) => {
                          setSettingsDirty(true);
                          setSettingsForm((prev) => ({ ...prev, heroImage: e.target.value }));
                        }}
                        className="w-full h-10 px-3.5 rounded-xl bg-[#F1F7F6] dark:bg-[#06181E] border border-[#0B2A33]/15 dark:border-white/15 text-xs sm:text-sm"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold mb-1">
                        URL Video nền Hero (không bắt buộc)
                      </label>
                      <input
                        type="text"
                        maxLength={600}
                        value={settingsForm.heroVideoUrl || ''}
                        onChange={(e) => {
                          setSettingsDirty(true);
                          setSettingsForm((prev) => ({ ...prev, heroVideoUrl: e.target.value }));
                        }}
                        className="w-full h-10 px-3.5 rounded-xl bg-[#F1F7F6] dark:bg-[#06181E] border border-[#0B2A33]/15 dark:border-white/15 text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="pb-3 border-b border-[#0B2A33]/10 dark:border-white/10">
                    <h3 className="font-serif-display text-xl font-semibold">
                      {t.admin.cmsSettingsContactTitle}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Thương hiệu</label>
                      <input
                        type="text"
                        required
                        maxLength={120}
                        value={settingsForm.brand}
                        onChange={(e) => {
                          setSettingsDirty(true);
                          setSettingsForm((prev) => ({ ...prev, brand: e.target.value }));
                        }}
                        className="w-full h-10 px-3.5 rounded-xl bg-[#F1F7F6] dark:bg-[#06181E] border border-[#0B2A33]/15 dark:border-white/15 text-xs sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1">Slogan</label>
                      <input
                        type="text"
                        required
                        maxLength={160}
                        value={settingsForm.slogan}
                        onChange={(e) => {
                          setSettingsDirty(true);
                          setSettingsForm((prev) => ({ ...prev, slogan: e.target.value }));
                        }}
                        className="w-full h-10 px-3.5 rounded-xl bg-[#F1F7F6] dark:bg-[#06181E] border border-[#0B2A33]/15 dark:border-white/15 text-xs sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1">Hotline</label>
                      <input
                        type="text"
                        required
                        maxLength={40}
                        value={settingsForm.hotline}
                        onChange={(e) => {
                          setSettingsDirty(true);
                          setSettingsForm((prev) => ({ ...prev, hotline: e.target.value }));
                        }}
                        className="w-full h-10 px-3.5 rounded-xl bg-[#F1F7F6] dark:bg-[#06181E] border border-[#0B2A33]/15 dark:border-white/15 text-xs sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1">Số điện thoại / Zalo</label>
                      <input
                        type="text"
                        required
                        maxLength={40}
                        value={settingsForm.phone}
                        onChange={(e) => {
                          setSettingsDirty(true);
                          setSettingsForm((prev) => ({ ...prev, phone: e.target.value }));
                        }}
                        className="w-full h-10 px-3.5 rounded-xl bg-[#F1F7F6] dark:bg-[#06181E] border border-[#0B2A33]/15 dark:border-white/15 text-xs sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1">Email liên hệ</label>
                      <input
                        type="email"
                        required
                        maxLength={160}
                        value={settingsForm.email}
                        onChange={(e) => {
                          setSettingsDirty(true);
                          setSettingsForm((prev) => ({ ...prev, email: e.target.value }));
                        }}
                        className="w-full h-10 px-3.5 rounded-xl bg-[#F1F7F6] dark:bg-[#06181E] border border-[#0B2A33]/15 dark:border-white/15 text-xs sm:text-sm"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold mb-1">Email nhận thông báo đơn đặt tour mới</label>
                      <input
                        type="text"
                        maxLength={300}
                        placeholder="vd: nhanvien1@gmail.com, nhanvien2@gmail.com"
                        value={settingsForm.notifyEmails ?? ''}
                        onChange={(e) => {
                          setSettingsDirty(true);
                          setSettingsForm((prev) => ({ ...prev, notifyEmails: e.target.value }));
                        }}
                        className="w-full h-10 px-3.5 rounded-xl bg-[#F1F7F6] dark:bg-[#06181E] border border-[#0B2A33]/15 dark:border-white/15 text-xs sm:text-sm"
                      />
                      <p className="mt-1 text-[11px] opacity-70">Mỗi đơn đặt tour mới (qua form hoặc chatbot) sẽ được gửi email tới các địa chỉ này — nhiều email cách nhau bằng dấu phẩy. Để trống thì gửi tới Email liên hệ ở trên.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1">Giờ làm việc</label>
                      <input
                        type="text"
                        required
                        maxLength={120}
                        value={settingsForm.workingHours}
                        onChange={(e) => {
                          setSettingsDirty(true);
                          setSettingsForm((prev) => ({ ...prev, workingHours: e.target.value }));
                        }}
                        className="w-full h-10 px-3.5 rounded-xl bg-[#F1F7F6] dark:bg-[#06181E] border border-[#0B2A33]/15 dark:border-white/15 text-xs sm:text-sm"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold mb-1">Văn phòng chính (TP.HCM)</label>
                      <input
                        type="text"
                        required
                        maxLength={300}
                        value={settingsForm.address}
                        onChange={(e) => {
                          setSettingsDirty(true);
                          setSettingsForm((prev) => ({ ...prev, address: e.target.value }));
                        }}
                        className="w-full h-10 px-3.5 rounded-xl bg-[#F1F7F6] dark:bg-[#06181E] border border-[#0B2A33]/15 dark:border-white/15 text-xs sm:text-sm"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold mb-1">Văn phòng Hà Nội</label>
                      <input
                        type="text"
                        required
                        maxLength={300}
                        value={settingsForm.hanoiOffice}
                        onChange={(e) => {
                          setSettingsDirty(true);
                          setSettingsForm((prev) => ({ ...prev, hanoiOffice: e.target.value }));
                        }}
                        className="w-full h-10 px-3.5 rounded-xl bg-[#F1F7F6] dark:bg-[#06181E] border border-[#0B2A33]/15 dark:border-white/15 text-xs sm:text-sm"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold mb-1">Giấy phép lữ hành</label>
                      <input
                        type="text"
                        required
                        maxLength={200}
                        value={settingsForm.license}
                        onChange={(e) => {
                          setSettingsDirty(true);
                          setSettingsForm((prev) => ({ ...prev, license: e.target.value }));
                        }}
                        className="w-full h-10 px-3.5 rounded-xl bg-[#F1F7F6] dark:bg-[#06181E] border border-[#0B2A33]/15 dark:border-white/15 text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#0B2A33]/10 dark:border-white/10">
                  {siteSettingsInFirestore ? (
                    <button
                      type="button"
                      disabled={savingSettings}
                      onClick={() => void handleResetSettings()}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#F2B84B]/45 bg-[#F2B84B]/12 text-[#8A5A00] dark:text-[#F2B84B] text-xs font-semibold hover:bg-[#F2B84B]/20 disabled:opacity-50"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{t.admin.cmsResetSettings}</span>
                    </button>
                  ) : (
                    <div />
                  )}

                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1F8A70] hover:bg-[#0B2A33] dark:bg-[#F2B84B] dark:text-[#06181E] text-white text-xs font-semibold transition-colors disabled:opacity-60"
                  >
                    {savingSettings ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>{savingSettings ? t.admin.cmsSaving : t.admin.cmsSave}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </main>

      {/* CMS EDITOR MODALS */}
      {tourModal.open && (
        <TourEditorModal
          initial={tourModal.initial}
          destinations={destinations}
          saveLabel={t.admin.cmsSave}
          savingLabel={t.admin.cmsSaving}
          onSave={async (record) => {
            await saveCmsTour(record);
            showCmsSavedNotice();
          }}
          onClose={() => setTourModal({ open: false })}
        />
      )}

      {destModal.open && (
        <DestinationEditorModal
          initial={destModal.initial}
          saveLabel={t.admin.cmsSave}
          savingLabel={t.admin.cmsSaving}
          onSave={async (record) => {
            await saveCmsDestination(record);
            showCmsSavedNotice();
          }}
          onClose={() => setDestModal({ open: false })}
        />
      )}

      {expModal.open && (
        <ExperienceEditorModal
          initial={expModal.initial}
          nextIndex={String(adminExperiences.length + 1).padStart(2, '0')}
          saveLabel={t.admin.cmsSave}
          savingLabel={t.admin.cmsSaving}
          onSave={async (record) => {
            await saveCmsExperience(record);
            showCmsSavedNotice();
          }}
          onClose={() => setExpModal({ open: false })}
        />
      )}

      {journalModal.open && (
        <JournalEditorModal
          initial={journalModal.initial}
          saveLabel={t.admin.cmsSave}
          savingLabel={t.admin.cmsSaving}
          onSave={async (record) => {
            await saveCmsJournalArticle(record);
            showCmsSavedNotice();
          }}
          onClose={() => setJournalModal({ open: false })}
        />
      )}
    </div>
  );
}
