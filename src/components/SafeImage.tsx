import { useLayoutEffect, useRef, useState, ImgHTMLAttributes } from 'react';
import { ImageOff } from 'lucide-react';
import { resolveImageUrl } from '../utils/image';

interface SafeImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
    src?: string | null;
    /** Classes for the wrapper that shows the skeleton / placeholder. */
    wrapperClassName?: string;
    /** Load immediately (above-the-fold images). Defaults to lazy loading. */
    eager?: boolean;
}

type Status = 'loading' | 'loaded' | 'error';

/**
 * Image with a loading skeleton, lazy loading and a branded placeholder when the image is
 * missing or fails, so pages never show the browser's broken-image icon.
 */
const SafeImage = ({ src, alt = '', className = '', wrapperClassName = '', eager = false, ...rest }: SafeImageProps) => {
    const url = resolveImageUrl(src);
    const imgRef = useRef<HTMLImageElement>(null);
    // Status is tracked per URL so a fast (cached) load is never overwritten by a reset.
    const [state, setState] = useState<{ url: string; status: Status }>({ url, status: url ? 'loading' : 'error' });
    const status: Status = state.url === url ? state.status : (url ? 'loading' : 'error');

    useLayoutEffect(() => {
        const img = imgRef.current;
        if (img && img.complete) {
            setState({ url, status: img.naturalWidth > 0 ? 'loaded' : 'error' });
        }
    }, [url]);

    return (
        <div className={`relative overflow-hidden bg-brand-surface ${wrapperClassName}`}>
            {status === 'loading' && (
                <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-white/[0.04] via-white/[0.08] to-white/[0.04]" aria-hidden />
            )}
            {status === 'error' ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-brand-muted/60" role="img" aria-label={alt || 'Image unavailable'}>
                    <ImageOff className="w-6 h-6" />
                    <span className="text-[9px] uppercase tracking-[0.25em]">CStyle</span>
                </div>
            ) : (
                <img
                    {...rest}
                    ref={imgRef}
                    src={url}
                    alt={alt}
                    loading={eager ? 'eager' : 'lazy'}
                    decoding="async"
                    onLoad={() => setState({ url, status: 'loaded' })}
                    onError={() => setState({ url, status: 'error' })}
                    className={`${className} transition-opacity duration-500 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
                />
            )}
        </div>
    );
};

export default SafeImage;
