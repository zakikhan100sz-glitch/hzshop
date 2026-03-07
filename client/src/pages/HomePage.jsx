import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import Container from '../components/Container';
import Badge from '../components/Badge';
import Button from '../components/Button';
import ProductCard from '../components/ProductCard';
import { api } from '../app/api';

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    api('/api/products?limit=4&sort=newest')
      .then((d) => setFeatured(d.items || []))
      .catch(() => setFeatured([]));
  }, []);

  const categories = [
    {
      key: 'bags',
      title: t('home.categories.items.bags.name'),
      img: 'https://res.cloudinary.com/dcu824c5e/image/upload/v1772564578/pexels-valentin-ivantsov-2154772556-36385203_shat7l.jpg',
      count: t('home.categories.items.bags.count'),
      href: '/shop?category=Bags'
    },
    {
      key: 'clothing',
      title: t('home.categories.items.clothing.name'),
      img: 'https://res.cloudinary.com/dcu824c5e/image/upload/v1772564587/rjer-dress-eRJ-vvdhbY4-unsplash_paeazf.jpg',
      count: t('home.categories.items.clothing.count'),
      href: '/shop?category=Clothing'
    },
    {
      key: 'toteBags',
      title: t('home.categories.items.toteBags.name'),
      img: 'https://res.cloudinary.com/dcu824c5e/image/upload/v1772564569/pexels-jose-martin-segura-benites-1422456152-27174571_dugjcz.jpg',
      count: t('home.categories.items.toteBags.count'),
      href: '/shop?category=Tote%20Bags'
    },
    {
      key: 'shoulderBags',
      title: t('home.categories.items.shoulderBags.name'),
      img: 'https://res.cloudinary.com/dcu824c5e/image/upload/v1772564581/qingyu-rVdLmULqVTQ-unsplash_nqrzyc.jpg',
      count: t('home.categories.items.shoulderBags.count'),
      href: '/shop?category=Shoulder%20Bags'
    }
  ];

  return (
    <motion.main
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -25 }}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
    >
      <Container className="py-14">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <Badge>{t('home.badge')}</Badge>

            <h1 className="mt-6 text-5xl font-extrabold leading-tight tracking-tight text-neutral-900">
              {t('home.headline')}
            </h1>

            <p className="mt-4 max-w-xl text-base leading-relaxed text-neutral-600">
              {t('home.sub')}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button type="button" onClick={() => navigate('/shop')}>
                {t('home.cta1')} <ArrowRight className="ml-2" size={16} />
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/shop')}
              >
                {t('home.cta2')}
              </Button>
            </div>

            <div className="mt-10 flex gap-10">
              <div>
                <div className="text-3xl font-extrabold">500+</div>
                <div className="text-sm text-neutral-600">{t('home.stats1')}</div>
              </div>

              <div>
                <div className="text-3xl font-extrabold">10K+</div>
                <div className="text-sm text-neutral-600">{t('home.stats2')}</div>
              </div>

              <div>
                <div className="text-3xl font-extrabold">4.9★</div>
                <div className="text-sm text-neutral-600">{t('home.stats3')}</div>
              </div>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-lg overflow-hidden rounded-[28px] shadow-soft">
              <img
                className="h-full w-full object-cover"
                src="https://res.cloudinary.com/dcu824c5e/image/upload/v1772564528/download_18_hlkjgl.jpg"
                alt={t('home.heroAlt')}
              />
            </div>
          </div>
        </div>
      </Container>

      <Container className="pb-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold">{t('home.featuredTitle')}</h2>
            <p className="mt-2 text-neutral-600">{t('home.featuredSub')}</p>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/shop')}
          >
            {t('home.viewAll')} <ArrowRight className="ml-2" size={16} />
          </Button>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p._id} p={p} />
          ))}
        </div>
      </Container>
    </motion.main>
  );
}