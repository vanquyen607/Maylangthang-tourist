import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  CONTACT_INFO,
  DESTINATIONS,
  DestinationItem,
  EXPERIENCES,
  ExperienceItem,
  HERO_DATA,
  JOURNAL_ARTICLES,
  JournalArticle,
  TOURS,
  TourItem,
} from '../data/travelData';
import {
  CmsDestinationRecord,
  CmsExperienceRecord,
  CmsJournalRecord,
  CmsSiteSettingsRecord,
  CmsTourRecord,
  subscribeCmsDestinations,
  subscribeCmsExperiences,
  subscribeCmsJournalArticles,
  subscribeCmsSiteSettings,
  subscribeCmsTours,
} from '../lib/firebase';

export interface AdminManagedItem<T> {
  item: T;
  isHidden: boolean;
  isDefault: boolean;
  inFirestore: boolean;
}

interface SiteContentContextValue {
  heroData: typeof HERO_DATA;
  contactInfo: typeof CONTACT_INFO;
  siteSettings: CmsSiteSettingsRecord;
  siteSettingsInFirestore: boolean;
  tours: TourItem[];
  destinations: DestinationItem[];
  experiences: ExperienceItem[];
  journalArticles: JournalArticle[];
  adminTours: AdminManagedItem<TourItem>[];
  adminDestinations: AdminManagedItem<DestinationItem>[];
  adminExperiences: AdminManagedItem<ExperienceItem>[];
  adminJournalArticles: AdminManagedItem<JournalArticle>[];
  overriddenIds: Set<string>;
}

const DEFAULT_SITE_SETTINGS: CmsSiteSettingsRecord = {
  heroEyebrow: HERO_DATA.eyebrow,
  heroHeadline: HERO_DATA.headline,
  heroSubtitle: HERO_DATA.subtitle,
  heroCtaLabel: HERO_DATA.ctaLabel,
  heroImage: HERO_DATA.image,
  heroVideoUrl: HERO_DATA.videoUrl,
  brand: CONTACT_INFO.brand,
  slogan: CONTACT_INFO.slogan,
  hotline: CONTACT_INFO.hotline,
  phone: CONTACT_INFO.phone,
  email: CONTACT_INFO.email,
  address: CONTACT_INFO.address,
  hanoiOffice: CONTACT_INFO.hanoiOffice,
  workingHours: CONTACT_INFO.workingHours,
  license: CONTACT_INFO.license,
};

const SiteContentContext = createContext<SiteContentContextValue | null>(null);

function mergeCollections<T extends { id: string }>(
  defaults: T[],
  firestoreRecords: (T & { isHidden: boolean })[]
): {
  visible: T[];
  managed: AdminManagedItem<T>[];
} {
  const defaultIds = new Set(defaults.map((item) => item.id));
  const fsMap = new Map<string, T & { isHidden: boolean }>();
  firestoreRecords.forEach((rec) => fsMap.set(rec.id, rec));

  const managed: AdminManagedItem<T>[] = [];

  defaults.forEach((def) => {
    const override = fsMap.get(def.id);
    if (override) {
      const { isHidden, ...rest } = override;
      managed.push({
        item: rest as unknown as T,
        isHidden,
        isDefault: true,
        inFirestore: true,
      });
    } else {
      managed.push({
        item: def,
        isHidden: false,
        isDefault: true,
        inFirestore: false,
      });
    }
  });

  firestoreRecords.forEach((rec) => {
    if (!defaultIds.has(rec.id)) {
      const { isHidden, ...rest } = rec;
      managed.push({
        item: rest as unknown as T,
        isHidden,
        isDefault: false,
        inFirestore: true,
      });
    }
  });

  const visible = managed.filter((entry) => !entry.isHidden).map((entry) => entry.item);
  return { visible, managed };
}

export function SiteContentProvider({ children }: { children: React.ReactNode }) {
  const [fsTours, setFsTours] = useState<CmsTourRecord[]>([]);
  const [fsDestinations, setFsDestinations] = useState<CmsDestinationRecord[]>([]);
  const [fsExperiences, setFsExperiences] = useState<CmsExperienceRecord[]>([]);
  const [fsJournal, setFsJournal] = useState<CmsJournalRecord[]>([]);
  const [fsSettings, setFsSettings] = useState<CmsSiteSettingsRecord | null>(null);

  useEffect(() => {
    const unsubTours = subscribeCmsTours(setFsTours);
    const unsubDests = subscribeCmsDestinations(setFsDestinations);
    const unsubExps = subscribeCmsExperiences(setFsExperiences);
    const unsubJournal = subscribeCmsJournalArticles(setFsJournal);
    const unsubSettings = subscribeCmsSiteSettings(setFsSettings);

    return () => {
      unsubTours();
      unsubDests();
      unsubExps();
      unsubJournal();
      unsubSettings();
    };
  }, []);

  const value = useMemo<SiteContentContextValue>(() => {
    const mergedTours = mergeCollections(TOURS, fsTours);
    const mergedDests = mergeCollections(DESTINATIONS, fsDestinations);
    const mergedExps = mergeCollections(EXPERIENCES, fsExperiences);
    const mergedJournal = mergeCollections(JOURNAL_ARTICLES, fsJournal);

    const overriddenIds = new Set<string>();
    fsTours.forEach((item) => overriddenIds.add(item.id));
    fsDestinations.forEach((item) => overriddenIds.add(item.id));
    fsExperiences.forEach((item) => overriddenIds.add(item.id));
    fsJournal.forEach((item) => overriddenIds.add(item.id));

    const activeSettings: CmsSiteSettingsRecord = fsSettings
      ? {
          ...DEFAULT_SITE_SETTINGS,
          ...fsSettings,
        }
      : DEFAULT_SITE_SETTINGS;

    const heroData = {
      ...HERO_DATA,
      eyebrow: activeSettings.heroEyebrow,
      headline: activeSettings.heroHeadline,
      subtitle: activeSettings.heroSubtitle,
      ctaLabel: activeSettings.heroCtaLabel,
      image: activeSettings.heroImage,
      videoUrl: activeSettings.heroVideoUrl || '',
    };

    const contactInfo = {
      ...CONTACT_INFO,
      brand: activeSettings.brand,
      slogan: activeSettings.slogan,
      hotline: activeSettings.hotline,
      phone: activeSettings.phone,
      email: activeSettings.email,
      address: activeSettings.address,
      hanoiOffice: activeSettings.hanoiOffice,
      workingHours: activeSettings.workingHours,
      license: activeSettings.license,
    };

    return {
      heroData,
      contactInfo,
      siteSettings: activeSettings,
      siteSettingsInFirestore: Boolean(fsSettings),
      tours: mergedTours.visible,
      destinations: mergedDests.visible,
      experiences: mergedExps.visible,
      journalArticles: mergedJournal.visible,
      adminTours: mergedTours.managed,
      adminDestinations: mergedDests.managed,
      adminExperiences: mergedExps.managed,
      adminJournalArticles: mergedJournal.managed,
      overriddenIds,
    };
  }, [fsTours, fsDestinations, fsExperiences, fsJournal, fsSettings]);

  return (
    <SiteContentContext.Provider value={value}>
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContent() {
  const ctx = useContext(SiteContentContext);
  if (!ctx) {
    throw new Error('useSiteContent must be used inside SiteContentProvider');
  }
  return ctx;
}
