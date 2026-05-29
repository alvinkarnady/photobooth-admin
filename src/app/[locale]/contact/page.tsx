import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useTranslations } from 'next-intl';

export default function Contact() {
  const t = useTranslations('Contact');

  return (
    <>
      <Header />
      <main className="flex-grow pt-margin-desktop pb-margin-desktop px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full">
        {/* Let's Create Something Timeless Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-gutter mb-[128px]">
          <div className="flex flex-col justify-center pr-0 lg:pr-gutter">
            <h1 className="font-display-mobile md:font-display-lg text-display-mobile md:text-display-lg mb-8 tracking-tighter">{t('title')}</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg mb-12">
              {t('desc')}
            </p>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-outline" style={{ fontVariationSettings: "'FILL' 0" }}>mail</span>
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Email</p>
                  <a className="font-body-md text-body-md hover:underline decoration-outline underline-offset-4 transition-all" href={`mailto:${t('contactEmail')}`}>{t('contactEmail')}</a>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-outline" style={{ fontVariationSettings: "'FILL' 0" }}>call</span>
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Phone</p>
                  <p className="font-body-md text-body-md">{t('phone')}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-outline" style={{ fontVariationSettings: "'FILL' 0" }}>location_on</span>
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">{t('studioTitle')}</p>
                  <p className="font-body-md text-body-md">{t('studioDesc')}<br/>{t('address1')} {t('address2')}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="h-[600px] w-full bg-surface-container-low ghost-border p-4 relative overflow-hidden group mt-12 lg:mt-0">
            <div className="absolute inset-4 border border-outline-variant/30 pointer-events-none z-10"></div>
            <img alt="Editorial workspace" className="w-full h-full object-cover filter grayscale opacity-90 group-hover:scale-105 transition-transform duration-1000 ease-in-out" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPqUeDHyGH_ktDAy7gZld8zwOie7qrcRYiG53pM5Y9-HBK0Rn42UdBqiRQqUWzafZBAn5LTnSiSD74iufyv167uveJ_5_qdemDvxAw1BCwV63JBC8kOLDMc5vH12HoExI-q1gSInjuxkLO0lCyG1MyWRaXNmj6h_eclJHi3YIwF3rtJl6UuJnbBRcptlCqjoAnkwIXu-1y3PTPGGzozw0S6Nc8CJKImBp1H9AyzPMy3zGzZfuEzECb-G-OsvAU1pzcOnjKDVo1msg"/>
          </div>
        </section>

        {/* Form & Map Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Booking Form */}
          <div className="lg:col-span-7 ghost-border p-8 md:p-12 bg-surface">
            <h2 className="font-headline-sm md:font-headline-md text-headline-sm md:text-headline-md mb-8">Inquiry Form</h2>
            <form className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="relative group">
                  <input className="peer w-full bg-transparent border-0 input-border px-0 py-2 font-body-md text-body-md focus:ring-0 focus:border-primary placeholder-transparent" id="first_name" placeholder={t('firstName')} type="text"/>
                  <label className="absolute left-0 -top-4 font-label-sm text-label-sm text-on-surface-variant transition-all peer-placeholder-shown:text-body-md peer-placeholder-shown:top-2 peer-placeholder-shown:text-outline peer-focus:-top-4 peer-focus:text-label-sm peer-focus:text-primary" htmlFor="first_name">{t('firstName')}</label>
                </div>
                <div className="relative group">
                  <input className="peer w-full bg-transparent border-0 input-border px-0 py-2 font-body-md text-body-md focus:ring-0 focus:border-primary placeholder-transparent" id="last_name" placeholder={t('lastName')} type="text"/>
                  <label className="absolute left-0 -top-4 font-label-sm text-label-sm text-on-surface-variant transition-all peer-placeholder-shown:text-body-md peer-placeholder-shown:top-2 peer-placeholder-shown:text-outline peer-focus:-top-4 peer-focus:text-label-sm peer-focus:text-primary" htmlFor="last_name">{t('lastName')}</label>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="relative group">
                  <input className="peer w-full bg-transparent border-0 input-border px-0 py-2 font-body-md text-body-md focus:ring-0 focus:border-primary placeholder-transparent" id="email" placeholder={t('email')} type="email"/>
                  <label className="absolute left-0 -top-4 font-label-sm text-label-sm text-on-surface-variant transition-all peer-placeholder-shown:text-body-md peer-placeholder-shown:top-2 peer-placeholder-shown:text-outline peer-focus:-top-4 peer-focus:text-label-sm peer-focus:text-primary" htmlFor="email">{t('email')}</label>
                </div>
                <div className="relative group">
                  <input className="peer w-full bg-transparent border-0 input-border px-0 py-2 font-body-md text-body-md focus:ring-0 focus:border-primary placeholder-transparent" id="phone" placeholder="Phone Number" type="tel"/>
                  <label className="absolute left-0 -top-4 font-label-sm text-label-sm text-on-surface-variant transition-all peer-placeholder-shown:text-body-md peer-placeholder-shown:top-2 peer-placeholder-shown:text-outline peer-focus:-top-4 peer-focus:text-label-sm peer-focus:text-primary" htmlFor="phone">Phone</label>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="relative group">
                  <input className="peer w-full bg-transparent border-0 input-border px-0 py-2 font-body-md text-body-md focus:ring-0 focus:border-primary text-primary" id="event_date" placeholder={t('date')} type="date"/>
                  <label className="absolute left-0 -top-4 font-label-sm text-label-sm text-on-surface-variant transition-all" htmlFor="event_date">{t('date')}</label>
                </div>
                <div className="relative group">
                  <input className="peer w-full bg-transparent border-0 input-border px-0 py-2 font-body-md text-body-md focus:ring-0 focus:border-primary placeholder-transparent" id="venue" placeholder="Venue Location" type="text"/>
                  <label className="absolute left-0 -top-4 font-label-sm text-label-sm text-on-surface-variant transition-all peer-placeholder-shown:text-body-md peer-placeholder-shown:top-2 peer-placeholder-shown:text-outline peer-focus:-top-4 peer-focus:text-label-sm peer-focus:text-primary" htmlFor="venue">Venue Location</label>
                </div>
              </div>
              <div className="relative group mt-8">
                <select className="peer w-full bg-transparent border-0 input-border px-0 py-2 font-body-md text-body-md focus:ring-0 focus:border-primary text-primary" id="package" defaultValue="">
                  <option disabled value="">{t('eventType')}</option>
                  <option value="editorial">Editorial Portraiture</option>
                  <option value="wedding">Curated Wedding Narrative</option>
                  <option value="commercial">Artisanal Commercial</option>
                  <option value="custom">Bespoke Commission</option>
                </select>
                <label className="absolute left-0 -top-4 font-label-sm text-label-sm text-on-surface-variant" htmlFor="package">{t('eventType')}</label>
              </div>
              <div className="relative group mt-8">
                <textarea className="peer w-full bg-transparent border-0 input-border px-0 py-2 font-body-md text-body-md focus:ring-0 focus:border-primary placeholder-transparent resize-none" id="details" placeholder={t('details')} rows={4}></textarea>
                <label className="absolute left-0 -top-4 font-label-sm text-label-sm text-on-surface-variant transition-all peer-placeholder-shown:text-body-md peer-placeholder-shown:top-2 peer-placeholder-shown:text-outline peer-focus:-top-4 peer-focus:text-label-sm peer-focus:text-primary" htmlFor="details">{t('details')}</label>
              </div>
              <button className="w-full md:w-auto bg-primary text-on-primary px-8 py-4 font-label-lg text-label-lg hover:bg-on-surface-variant transition-colors mt-8" type="submit">{t('submitBtn')}</button>
            </form>
          </div>

          {/* Inked Map */}
          <div className="lg:col-span-5 h-[400px] lg:h-auto ghost-border p-2 bg-surface mt-12 lg:mt-0">
            <div className="w-full h-full bg-surface-variant relative overflow-hidden flex items-center justify-center grayscale contrast-125">
              <img alt="Map" className="w-full h-full object-cover opacity-80 mix-blend-multiply" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDV2lCWs-FC8QAYzKUeQLBxEc9uKddnyxrCVWCHrNHiZfEVHaGJzKPMwoJXpN45YQnLB9ErcjkFWTGGcaheEHUMkBW76QOA43ulecGGcDKCeeyQM0X-_qhIJVk-Cc0Nep5DlT2E19ODYQRo6dYhFGQy4hWNB0Vj6tr6jzXzfunk2CIArzgSu-NUDf530DTV761V2VuDYIy2rduxMi5nJ45ZBCYcp07_1t--s6JV6E4UqvPQRPX8YzIHGNVe53uV4i_Kcj4c26Ui3qI"/>
              <div className="absolute inset-0 bg-gradient-to-t from-surface/50 to-transparent pointer-events-none"></div>
              {/* Subtle Location Marker */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="w-4 h-4 bg-primary rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.5)] border-2 border-surface"></div>
                <div className="mt-2 px-3 py-1 bg-surface ghost-border text-primary font-label-sm text-label-sm whitespace-nowrap shadow-sm">Mémoire Studio</div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
