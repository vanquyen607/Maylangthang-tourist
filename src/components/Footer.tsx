import React from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSiteContent } from '../context/SiteContentContext';

interface FooterProps {
  onOpenAdmin: () => void;
}

export function Footer({ onOpenAdmin }: FooterProps) {
  const { lang, t } = useLanguage();
  const { contactInfo, siteSettingsInFirestore } = useSiteContent();

  const useEnDefault = lang === 'en' && !siteSettingsInFirestore;
  const slogan = useEnDefault ? 'Travel slow, live deeply.' : contactInfo.slogan;
  const hcmcAddress = useEnDefault
    ? '42 Tran Quoc Thao, Xuan Hoa Ward, District 3, Ho Chi Minh City'
    : contactInfo.address;
  const hanoiAddress = useEnDefault
    ? '18 Hoi Vu Alley, Hoan Kiem District, Hanoi'
    : contactInfo.hanoiOffice;
  const license = useEnDefault
    ? 'International Tour Operator License No. 79-1428/2025/TCDL-GP LHQT'
    : contactInfo.license;

  return (
    <footer className="bg-[#06181E] text-[#EDF4F3] pt-16 pb-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          {/* Cột thương hiệu */}
          <div className="md:col-span-5 space-y-4">
            <a
              href="#hero"
              className="font-serif-display text-2xl sm:text-3xl font-semibold text-white inline-block"
            >
              {contactInfo.brand}
            </a>
            <p className="text-sm font-medium text-[#F2B84B]">{slogan}</p>
            <p className="text-sm leading-relaxed text-[#EDF4F3]/72 max-w-sm">
              {t.footer.description}
            </p>
          </div>

          {/* Cột liên hệ */}
          <div className="md:col-span-4 space-y-3 text-sm text-[#EDF4F3]/80">
            <p className="text-xs uppercase tracking-[0.14em] font-semibold text-white/60 mb-3">
              {t.footer.officeTitle}
            </p>
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#F2B84B] shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p>{hcmcAddress}</p>
                <p className="text-xs text-[#EDF4F3]/60 mt-1">
                  {t.footer.hanoiPrefix} {hanoiAddress}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-[#F2B84B] shrink-0" aria-hidden="true" />
              <a
                href={`tel:${contactInfo.hotline.replace(/\s+/g, '')}`}
                className="hover:text-[#F2B84B] transition-colors tabular-nums"
              >
                {t.footer.hotlinePrefix} {contactInfo.hotline} · {contactInfo.phone}
              </a>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-[#F2B84B] shrink-0" aria-hidden="true" />
              <a
                href={`mailto:${contactInfo.email}`}
                className="hover:text-[#F2B84B] transition-colors"
              >
                {contactInfo.email}
              </a>
            </div>
          </div>

          {/* Cột mạng xã hội & điều hướng nhanh */}
          <div className="md:col-span-3 space-y-3 text-sm">
            <p className="text-xs uppercase tracking-[0.14em] font-semibold text-white/60 mb-3">
              {t.footer.connectTitle}
            </p>
            <ul className="space-y-2 text-[#EDF4F3]/80">
              <li>
                <a
                  href="#journal"
                  className="hover:text-[#F2B84B] transition-colors inline-block py-0.5"
                >
                  {t.footer.journalLink}
                </a>
              </li>
              {contactInfo.socials.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[#F2B84B] transition-colors inline-block py-0.5"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#/admin"
                  onClick={(e) => {
                    e.preventDefault();
                    onOpenAdmin();
                  }}
                  className="hover:text-[#F2B84B] transition-colors inline-block py-0.5 text-[#F2B84B]/90"
                >
                  {t.footer.adminLink}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-[#EDF4F3]/60">
          <p>{license}</p>
          <p>
            © {new Date().getFullYear()} {contactInfo.brand}. {t.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
