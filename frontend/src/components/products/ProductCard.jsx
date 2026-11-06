import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingBag, Heart, Check, Eye } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const isSaved = isInWishlist(product._id || product.id);
  const discountPercent = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  return (
    <div className="group relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 dark:hover:border-cyan-500/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-cyan-500/10 flex flex-col overflow-hidden">
      
      {/* Product Image Container */}
      <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
        <Link to={`/product/${product._id || product.id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
          {product.isNewArrival && (
            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase bg-cyan-500 text-white shadow-md">
              NEW
            </span>
          )}
          {discountPercent > 0 && (
            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase bg-rose-500 text-white shadow-md">
              SAVE {discountPercent}%
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={() => toggleWishlist(product)}
          className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all shadow-md ${
            isSaved
              ? 'bg-rose-500 text-white'
              : 'bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:text-rose-500 hover:scale-110'
          }`}
          title={isSaved ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View Button on Hover */}
        <Link
          to={`/product/${product._id || product.id}`}
          className="absolute bottom-3 left-3 right-3 py-2 rounded-xl bg-slate-950/80 hover:bg-slate-950 text-white text-xs font-semibold backdrop-blur-md flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          <Eye className="w-3.5 h-3.5" />
          View Details
        </Link>
      </div>

      {/* Product Info */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category */}
          <span className="text-[11px] font-medium text-cyan-600 dark:text-cyan-400 tracking-wide uppercase">
            {product.category}
          </span>

          {/* Title */}
          <Link to={`/product/${product._id || product.id}`}>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mt-1 line-clamp-2 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Ratings & Reviews */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{product.rating}</span>
            <span className="text-xs text-slate-400">({product.numReviews})</span>
            {product.stock <= 15 && product.stock > 0 && (
              <span className="ml-auto text-[10px] font-semibold text-amber-500 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                Only {product.stock} left
              </span>
            )}
          </div>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div>
            <div className="text-base font-extrabold text-slate-900 dark:text-white">
              ${product.price.toFixed(2)}
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="text-xs text-slate-400 line-through">
                ${product.originalPrice.toFixed(2)}
              </div>
            )}
          </div>

          <button
            onClick={() => addToCart(product, 1)}
            disabled={product.stock <= 0}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-cyan-600 dark:bg-slate-800 dark:hover:bg-cyan-500 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md flex items-center justify-center group/btn"
            title="Add to Cart"
          >
            <ShoppingBag className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
