
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { initScrollAnimations } from '../utils/scrollAnimations';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const location = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
        initScrollAnimations();
    }, [location]);

    return (
        <div className="page">
            <Header />
            <main id="main-content">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
