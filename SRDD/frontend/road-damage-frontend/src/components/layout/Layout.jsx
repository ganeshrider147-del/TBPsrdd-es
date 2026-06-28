import React from 'react';
import TopAppBar from './TopAppBar';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

const Layout = ({ children }) => {
    return (
        <div className="bg-background font-body-md text-on-background min-h-screen">
            <TopAppBar />
            <Sidebar />
            <main className="pt-20 pb-24 lg:pb-8 lg:ml-64 px-md lg:px-lg max-w-7xl mx-auto">
                {children}
            </main>
            <MobileNav />
        </div>
    );
};

export default Layout;
