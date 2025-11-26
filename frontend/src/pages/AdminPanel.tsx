import React from 'react';
import { AppNavigation } from '../components/AppNavigation';
import { AdminInventory } from '../components/AdminInventory';

const AdminPanel: React.FC = () => {
  return (
    <main className="min-h-screen w-full flex flex-col items-center p-4 sm:p-6 lg:p-8 bg-dots-pattern">
      <div className="w-full max-w-screen-2xl mx-auto flex flex-col flex-grow">
        <AppNavigation />
        <header className="text-center mb-10">
          <p className="text-sm uppercase tracking-[0.3em] text-green-400 mb-3">
            Admin
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500 pb-2">
            BookShop Control Center
          </h1>
          <p className="mt-3 text-base text-gray-400 max-w-3xl mx-auto">
            Manage inventory, oversee members, and monitor analytics with the same modern
            experience as your customers.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AdminInventory />
          <div className="bg-gray-800/70 border border-gray-700 rounded-2xl p-6">
            <p className="text-sm text-gray-400 mb-2">Next Steps</p>
            <h2 className="text-xl font-semibold text-gray-100 mb-2">Members & Rentals</h2>
            <p className="text-gray-400 text-sm">
              Placeholder for user management, rental approvals, and status controls.
            </p>
          </div>
          <div className="bg-gray-800/70 border border-gray-700 rounded-2xl p-6">
            <p className="text-sm text-gray-400 mb-2">Next Steps</p>
            <h2 className="text-xl font-semibold text-gray-100 mb-2">Analytics</h2>
            <p className="text-gray-400 text-sm">
              Future dashboard for pricing trends, stock heatmaps, and alerts.
            </p>
          </div>
        </section>
      </div>

      <footer className="text-center mt-10 text-sm text-gray-500">
        <p>BookShop Library Admin Experience</p>
      </footer>
    </main>
  );
};

export default AdminPanel;

