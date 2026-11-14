import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component
 * Automatically scrolls to top of page when route changes
 */
const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // Jump to the top on route change (the new page fades in, so no smooth scroll).
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    }, [pathname]);

    return null;
};

export default ScrollToTop;
