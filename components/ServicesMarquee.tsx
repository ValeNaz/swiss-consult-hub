import React, { useEffect, useRef, useState } from 'react';
import { SERVICES_DATA } from '../constants';
import { useTranslation } from 'react-i18next';
import '../styles/ServicesMarquee.css';

const ServicesMarquee: React.FC = () => {
    const { t } = useTranslation('services');
    const trackRef = useRef<HTMLDivElement>(null);
    const animationFrameRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number | null>(null);
    const offsetRef = useRef<number>(0);
    const contentWidthRef = useRef<number>(0);
    const [isPaused, setIsPaused] = useState(false);

    // Duplicate services array for seamless infinite loop
    const duplicatedServices = [...SERVICES_DATA, ...SERVICES_DATA];

    // Constant speed in pixels per second (adjust for desired fluidity)
    const SPEED_PX_PER_SEC = 80;

    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;

        // Measure content width (half because duplicated)
        const measure = () => {
            contentWidthRef.current = track.scrollWidth / 2;
        };

        // Animation loop with requestAnimationFrame
        const animate = (timestamp: number) => {
            if (isPaused) {
                lastTimeRef.current = null;
                animationFrameRef.current = requestAnimationFrame(animate);
                return;
            }

            if (!lastTimeRef.current) {
                lastTimeRef.current = timestamp;
            }

            const delta = (timestamp - lastTimeRef.current) / 1000;
            lastTimeRef.current = timestamp;

            offsetRef.current -= SPEED_PX_PER_SEC * delta;

            // Seamless loop reset
            if (Math.abs(offsetRef.current) >= contentWidthRef.current) {
                offsetRef.current += contentWidthRef.current;
            }

            track.style.transform = `translateX(${offsetRef.current}px)`;
            animationFrameRef.current = requestAnimationFrame(animate);
        };

        // Initialize
        measure();
        animationFrameRef.current = requestAnimationFrame(animate);

        // Debounced resize handler
        let resizeTimeout: NodeJS.Timeout;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(measure, 150);
        };

        window.addEventListener('resize', handleResize);

        // Observe content changes for translations
        const observer = new MutationObserver(measure);
        observer.observe(track, { childList: true, subtree: true, characterData: true });

        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            window.removeEventListener('resize', handleResize);
            clearTimeout(resizeTimeout);
            observer.disconnect();
        };
    }, [isPaused]);

    return (
        <div className="services-marquee">
            <div
                className="services-marquee-track"
                ref={trackRef}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                {duplicatedServices.map((service, index) => (
                    <a
                        key={`${service.slug}-${index}`}
                        href={`#/servizi/${service.slug}`}
                        className={`service-marquee-item service-${service.theme}`}
                        data-service={service.theme}
                    >
                        <div className="service-marquee-icon">
                            <img src={service.icon} alt="" aria-hidden="true" />
                        </div>
                        <span className="service-marquee-title">
                            {t(`services.${service.theme}.title`, { defaultValue: service.title })}
                        </span>
                    </a>
                ))}
            </div>
        </div>
    );
};

export default ServicesMarquee;
