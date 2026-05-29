import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FaqItem from '@/components/FaqItem';
import { useTranslations } from 'next-intl';

export default function Services() {
  const t = useTranslations('Services');

  return (
    <>
      <Header />
      <main className="w-full">
        {/* Hero Section */}
        <section className="py-24 md:py-32 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-center">
          <h1 className="font-display-mobile text-display-mobile md:font-display-lg md:text-display-lg text-primary mb-6 max-w-3xl mx-auto">
            {t('title')}
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            {t('desc')}
          </p>
        </section>

        {/* Packages Bento Grid */}
        <section className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
            {/* Package 1: The Classic */}
            <div className="border border-outline-variant p-8 flex flex-col justify-between bg-surface group hover:border-primary transition-colors duration-500">
              <div>
                <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest mb-4 block">Essential Coverage</span>
                <h2 className="font-headline-md text-headline-md text-primary mb-2">{t('tier1Title')}</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mb-8 h-16">
                  {t('tier1Desc')}
                </p>
                <div className="mb-8">
                  <span className="font-headline-sm text-headline-sm text-primary">{t('tier1Price')}</span>
                </div>
                <div className="space-y-4 mb-12">
                  <div className="flex items-start">
                    <span className="material-symbols-outlined text-secondary mr-3 text-[20px]" style={{ fontVariationSettings: "'FILL' 0" }}>schedule</span>
                    <span className="font-body-md text-body-md text-on-surface">{t('tier1Feature1')}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="material-symbols-outlined text-secondary mr-3 text-[20px]" style={{ fontVariationSettings: "'FILL' 0" }}>photo_prints</span>
                    <span className="font-body-md text-body-md text-on-surface">{t('tier1Feature2')}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="material-symbols-outlined text-secondary mr-3 text-[20px]" style={{ fontVariationSettings: "'FILL' 0" }}>gallery_thumbnail</span>
                    <span className="font-body-md text-body-md text-on-surface">{t('tier1Feature3')}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="material-symbols-outlined text-secondary mr-3 text-[20px]" style={{ fontVariationSettings: "'FILL' 0" }}>wallpaper</span>
                    <span className="font-body-md text-body-md text-on-surface">{t('tier1Feature4')}</span>
                  </div>
                </div>
              </div>
              <button className="w-full border border-primary text-primary font-label-lg text-label-lg py-4 hover:bg-primary hover:text-on-primary transition-colors duration-300">
                {t('inquireBtn')}
              </button>
            </div>

            {/* Package 2: The Editorial (Highlighted) */}
            <div className="border border-primary bg-surface-container-low p-8 flex flex-col justify-between relative transform lg:-translate-y-4 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)]">
              <div className="absolute top-0 right-8 -translate-y-1/2 bg-primary text-on-primary font-label-sm text-label-sm px-4 py-1 uppercase tracking-widest">
                Most Popular
              </div>
              <div>
                <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest mb-4 block">Complete Experience</span>
                <h2 className="font-headline-md text-headline-md text-primary mb-2">{t('tier2Title')}</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mb-8 h-16">
                  {t('tier2Desc')}
                </p>
                <div className="mb-8">
                  <span className="font-headline-sm text-headline-sm text-primary">{t('tier2Price')}</span>
                </div>
                <div className="space-y-4 mb-12">
                  <div className="flex items-start">
                    <span className="material-symbols-outlined text-primary mr-3 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
                    <span className="font-body-md text-body-md text-on-surface">{t('tier2Feature1')}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="material-symbols-outlined text-primary mr-3 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>photo_prints</span>
                    <span className="font-body-md text-body-md text-on-surface">{t('tier2Feature2')}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="material-symbols-outlined text-primary mr-3 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>photo_library</span>
                    <span className="font-body-md text-body-md text-on-surface">{t('tier2Feature3')}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="material-symbols-outlined text-primary mr-3 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>palette</span>
                    <span className="font-body-md text-body-md text-on-surface">{t('tier2Feature4')}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="material-symbols-outlined text-primary mr-3 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>masks</span>
                    <span className="font-body-md text-body-md text-on-surface">{t('tier2Feature5')}</span>
                  </div>
                </div>
              </div>
              <button className="w-full bg-primary text-on-primary font-label-lg text-label-lg py-4 hover:bg-on-surface-variant transition-colors duration-300">
                {t('inquireBtn')}
              </button>
            </div>

            {/* Package 3: The Heirloom */}
            <div className="border border-outline-variant p-8 flex flex-col justify-between bg-surface group hover:border-primary transition-colors duration-500">
              <div>
                <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest mb-4 block">Bespoke Design</span>
                <h2 className="font-headline-md text-headline-md text-primary mb-2">{t('tier3Title')}</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mb-8 h-16">
                  {t('tier3Desc')}
                </p>
                <div className="mb-8">
                  <span className="font-headline-sm text-headline-sm text-primary">{t('tier3Price')}</span>
                </div>
                <div className="space-y-4 mb-12">
                  <div className="flex items-start">
                    <span className="material-symbols-outlined text-secondary mr-3 text-[20px]" style={{ fontVariationSettings: "'FILL' 0" }}>all_inclusive</span>
                    <span className="font-body-md text-body-md text-on-surface">{t('tier3Feature1')}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="material-symbols-outlined text-secondary mr-3 text-[20px]" style={{ fontVariationSettings: "'FILL' 0" }}>auto_awesome</span>
                    <span className="font-body-md text-body-md text-on-surface">{t('tier3Feature2')}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="material-symbols-outlined text-secondary mr-3 text-[20px]" style={{ fontVariationSettings: "'FILL' 0" }}>book</span>
                    <span className="font-body-md text-body-md text-on-surface">{t('tier3Feature3')}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="material-symbols-outlined text-secondary mr-3 text-[20px]" style={{ fontVariationSettings: "'FILL' 0" }}>support_agent</span>
                    <span className="font-body-md text-body-md text-on-surface">{t('tier3Feature4')}</span>
                  </div>
                </div>
              </div>
              <button className="w-full border border-primary text-primary font-label-lg text-label-lg py-4 hover:bg-primary hover:text-on-primary transition-colors duration-300">
                {t('inquireBtn')}
              </button>
            </div>
          </div>
        </section>

        {/* Divider with Image */}
        <section className="w-full h-64 md:h-96 bg-surface-variant relative overflow-hidden mb-32">
          <div className="absolute inset-0 bg-cover bg-center opacity-80" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD3uC7mHwLq29_Z-v744CrWOTPnqhDRcAj7QutN7Y78EsYIjSZlV-jQ8NnHF40ljC3LTPOUMeJq1gMd-9dmMMB7muLgZlnZVESBasJodMVhR9pMCry0jNDu1nzNNrVzDhe0AvukSYHD7r2olISOneXIqKc0818rbcFfXqrFpPjipHb4OEF_dFbPTyMf8qpURNe8LAfY4IWYh9Xplrbdwa7DaqBwuiBEe6Ha1A5Q_fWvggEsiaUT4o-dwJfL-qIdJ1fp2Bysy4Nk4K4')" }}></div>
        </section>

        {/* Comparison Table */}
        <section className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto pb-32">
          <h3 className="font-headline-lg text-headline-lg text-primary mb-12 text-center">Compare Packages</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-primary">
                  <th className="py-6 pr-4 font-label-lg text-label-lg text-secondary w-1/4 uppercase tracking-widest">Feature</th>
                  <th className="py-6 px-4 font-headline-sm text-headline-sm text-primary w-1/4">{t('tier1Title')}</th>
                  <th className="py-6 px-4 font-headline-sm text-headline-sm text-primary w-1/4 bg-surface-container-low">{t('tier2Title')}</th>
                  <th className="py-6 pl-4 font-headline-sm text-headline-sm text-primary w-1/4">{t('tier3Title')}</th>
                </tr>
              </thead>
              <tbody className="font-body-md text-body-md">
                <tr className="border-b border-outline-variant hover:bg-surface-container-lowest transition-colors">
                  <td className="py-6 pr-4 text-on-surface-variant">Coverage Time</td>
                  <td className="py-6 px-4">3 Hours</td>
                  <td className="py-6 px-4 bg-surface-container-low font-medium">4 Hours</td>
                  <td className="py-6 pl-4">Unlimited</td>
                </tr>
                <tr className="border-b border-outline-variant hover:bg-surface-container-lowest transition-colors">
                  <td className="py-6 pr-4 text-on-surface-variant">Print Quality</td>
                  <td className="py-6 px-4">2x6 Strips</td>
                  <td className="py-6 px-4 bg-surface-container-low font-medium">4x6 Premium Matte</td>
                  <td className="py-6 pl-4">Custom Format</td>
                </tr>
                <tr className="border-b border-outline-variant hover:bg-surface-container-lowest transition-colors">
                  <td className="py-6 pr-4 text-on-surface-variant">Digital Gallery</td>
                  <td className="py-6 px-4">Standard Link</td>
                  <td className="py-6 px-4 bg-surface-container-low font-medium">Curated &amp; Retouched</td>
                  <td className="py-6 pl-4">Priority Delivery</td>
                </tr>
                <tr className="border-b border-outline-variant hover:bg-surface-container-lowest transition-colors">
                  <td className="py-6 pr-4 text-on-surface-variant">Backdrop Options</td>
                  <td className="py-6 px-4">3 House Options</td>
                  <td className="py-6 px-4 bg-surface-container-low font-medium">Textured Collections</td>
                  <td className="py-6 pl-4">Fully Custom Build</td>
                </tr>
                <tr className="border-b border-outline-variant hover:bg-surface-container-lowest transition-colors">
                  <td className="py-6 pr-4 text-on-surface-variant">Prop Curation</td>
                  <td className="py-6 px-4">Standard Fun</td>
                  <td className="py-6 px-4 bg-surface-container-low font-medium">Minimalist / Editorial</td>
                  <td className="py-6 pl-4">Sourced to Theme</td>
                </tr>
                <tr className="border-b border-outline-variant hover:bg-surface-container-lowest transition-colors">
                  <td className="py-6 pr-4 text-on-surface-variant">On-Site Attendant</td>
                  <td className="py-6 px-4">Standard Host</td>
                  <td className="py-6 px-4 bg-surface-container-low font-medium">Dedicated Stylist</td>
                  <td className="py-6 pl-4">Creative Director</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Common Questions (Accordion) */}
        <section className="px-margin-mobile md:px-margin-desktop max-w-3xl mx-auto pb-32">
          <h3 className="font-headline-lg text-headline-lg text-primary mb-12 text-center">{t('faqTitle')}</h3>
          <div className="border-t border-primary">
            <FaqItem 
              question={t('faq1Q')} 
              answer={t('faq1A')}
            />
            <FaqItem 
              question={t('faq2Q')} 
              answer={t('faq2A')}
            />
            <FaqItem 
              question={t('faq3Q')} 
              answer={t('faq3A')}
            />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
