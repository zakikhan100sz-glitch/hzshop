import Container from './Container';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  return (
    <footer className="mt-16 bg-neutral-900 text-neutral-200">
      <Container className="py-14">
        <div className={`grid gap-10 md:grid-cols-4 ${isRTL ? 'text-right' : 'text-left'}`}>
          <div>
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-neutral-900">hz</div>
              <div className="text-lg font-bold">hzShop</div>
            </div>

            <p className="mt-4 text-sm text-neutral-300">{t('footer.brandTagline')}</p>

            <div className={`mt-5 flex gap-3 ${isRTL ? 'justify-end' : ''}`}>
              <div className="h-10 w-10 rounded-full bg-neutral-800" />
              <div className="h-10 w-10 rounded-full bg-neutral-800" />
              <div className="h-10 w-10 rounded-full bg-neutral-800" />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white">{t('footer.quickLinksTitle')}</h4>
            <ul className="mt-3 space-y-2 text-sm text-neutral-300">
              <li>{t('footer.shopAll')}</li>
              <li>{t('footer.newArrivals')}</li>
              <li>{t('footer.bestSellers')}</li>
              <li>{t('footer.sale')}</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white">{t('footer.customerServiceTitle')}</h4>
            <ul className="mt-3 space-y-2 text-sm text-neutral-300">
              <li>{t('footer.contactUs')}</li>
              <li>{t('footer.shippingReturns')}</li>
              <li>{t('footer.faq')}</li>
              <li>{t('footer.sizeGuide')}</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white">{t('footer.contactTitle')}</h4>
            <ul className="mt-3 space-y-2 text-sm text-neutral-300">
              <li>{t('footer.email')}</li>
              <li>{t('footer.phone')}</li>
              <li>
                {t('footer.addressLine1')}
                <br />
                {t('footer.addressLine2')}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-neutral-800 pt-6 text-center text-xs text-neutral-400">
          {t('footer.copyright', { year: new Date().getFullYear() })}
        </div>
      </Container>
    </footer>
  );
}