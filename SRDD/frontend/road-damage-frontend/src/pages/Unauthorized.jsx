import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

const Unauthorized = () => {
    return (
        <div className="min-h-screen flex items-center justify-center p-md bg-[#F8FAFC]">
            <div className="bg-white p-lg md:p-xl rounded-[20px] shadow-sm border border-slate-200/60 max-w-md w-full text-center space-y-md">
                <div className="w-16 h-16 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center mx-auto">
                    <span className="material-symbols-outlined text-3xl">gpp_maybe</span>
                </div>
                <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg font-bold text-on-surface">Access Denied</h2>
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                    You do not have the required authorization permissions to access this administrative portal area.
                </p>
                <div className="pt-md">
                    <Link 
                        to={ROUTES.HOME} 
                        className="bg-primary hover:bg-primary-container text-white px-xl py-3 rounded-xl font-label-md font-bold shadow-md block text-center transition-transform active:scale-95"
                    >
                        Return to Safety
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Unauthorized;
