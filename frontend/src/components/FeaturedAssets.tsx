import React, { useEffect, useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { AssetCard } from './AssetCard';
import { Button } from './ui/Button';
import assetApi from '../api/assetApi';
import { Asset } from '../types';

export const FeaturedAssets = () => {
  const [featuredAssets, setFeaturedAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAssets = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await assetApi.getFeaturedAssets();
        setFeaturedAssets(data.slice(0, 4));
      } catch (err) {
        setError('Failed to load featured assets');
      } finally {
        setLoading(false);
      }
    };
    loadAssets();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-neutral-50 flex justify-center items-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-neutral-50 flex justify-center items-center">
        <div className="text-red-500">{error}</div>
      </section>
    );
  }

  if (featuredAssets.length === 0) {
    return (
      <section className="py-16 bg-neutral-50 flex justify-center items-center">
        <div className="text-neutral-500">No featured assets found.</div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-neutral-50">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-primary-800">Featured Assets</h2>
            <p className="mt-2 text-neutral-600">
              Discover unique real-world assets from trusted validators
            </p>
          </div>
          <Button
            variant="outline"
            className="mt-4 md:mt-0"
            icon={<ArrowRight size={16} />}
            iconPosition="right"
          >
            View All
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredAssets.map((asset, index) => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <AssetCard asset={asset} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};