'use client';

import { useState } from 'react';

type ModalType = 'trust' | 'support' | 'about' | 'privacy' | null;

export function InfoModals() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  return (
    <>
      <footer className="bg-white border-t border-slate-200 py-6 px-6 text-sm text-slate-500 flex flex-col sm:flex-row justify-between items-center max-w-7xl mx-auto w-full">
        <span className="font-bold text-slate-900 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-600"></span> E-merkato
        </span>

        <div className="flex flex-wrap gap-4 sm:gap-6 mt-4 sm:mt-0 text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveModal('trust')}
            className="hover:text-blue-600 transition cursor-pointer"
          >
            🛡️ Trust & Safety
          </button>
          <button
            onClick={() => setActiveModal('support')}
            className="hover:text-blue-600 transition cursor-pointer"
          >
            💬 Support & FAQ
          </button>
          <button
            onClick={() => setActiveModal('about')}
            className="hover:text-blue-600 transition cursor-pointer"
          >
            ℹ️ About Us
          </button>
          <button
            onClick={() => setActiveModal('privacy')}
            className="hover:text-blue-600 transition cursor-pointer"
          >
            🔒 Privacy Policy
          </button>
        </div>

        <span className="mt-4 sm:mt-0 text-xs text-slate-400">© 2026 E-merkato Inc. All rights reserved.</span>
      </footer>

      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white max-w-2xl w-full rounded-2xl p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                {activeModal === 'trust' && '🛡️ Trust & Safety Guidelines'}
                {activeModal === 'support' && '💬 Customer Support & FAQ'}
                {activeModal === 'about' && 'ℹ️ About E-merkato'}
                {activeModal === 'privacy' && '🔒 Privacy Policy & Data Security'}
              </h2>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1 leading-none"
              >
                ×
              </button>
            </div>

            {/* Modal Body Content */}
            <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
              {activeModal === 'trust' && (
                <>
                  <p className="font-semibold text-slate-800">
                    E-merkato is committed to creating Ethiopia’s most secure peer-to-peer marketplace.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 space-y-1 text-blue-900">
                    <h4 className="font-bold text-xs">🛡️ Fayda National ID Verification</h4>
                    <p className="text-[11px]">
                      Sellers verify their identity using Ethiopia’s Fayda FAN number and SMS OTP. Verified accounts receive a green Fayda shield badge for buyer peace of mind.
                    </p>
                  </div>
                  <div className="space-y-2 pt-1">
                    <h4 className="font-bold text-slate-900">Buyer Safety Tips:</h4>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Always meet sellers in safe, public places (e.g. popular cafes or plazas).</li>
                      <li>Inspect items thoroughly before releasing payment.</li>
                      <li>Never send wire transfers or advance deposits to unverified sellers.</li>
                    </ul>
                  </div>
                </>
              )}

              {activeModal === 'support' && (
                <>
                  <p className="font-semibold text-slate-800">
                    Need help with your account, listings, or verification?
                  </p>
                  <p>
                    Our Support team and AI Assistant are available 24/7. You can use the floating <strong>🤖 AI Assistant</strong> button at the bottom right of any page to get instant automated answers!
                  </p>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                    <h4 className="font-bold text-slate-900 text-xs">Direct Support Contact:</h4>
                    <p>📧 Email: <a href="mailto:support@emerkato.com" className="text-blue-600 underline font-medium">support@emerkato.com</a></p>
                    <p>📞 Phone: +251 91 100 0000</p>
                  </div>
                </>
              )}

              {activeModal === 'about' && (
                <>
                  <p className="font-semibold text-slate-800">
                    Welcome to E-merkato – Ethiopia’s Premier Trusted Marketplace.
                  </p>
                  <p>
                    E-merkato brings the vibrant spirit of Addis Ababa’s historic Merkato online with modern trust mechanisms. We bridge buyers and sellers across Ethiopia through verified identities, local subcity logistics, and direct Telegram & Phone communication.
                  </p>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                      <span className="text-base">🇪🇹</span>
                      <p className="font-bold text-slate-900 mt-1">100% Ethiopian</p>
                      <p className="text-[10px] text-slate-400">Tailored for local needs</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                      <span className="text-base">🛡️</span>
                      <p className="font-bold text-slate-900 mt-1">Fayda Verified</p>
                      <p className="text-[10px] text-slate-400">Identity protected</p>
                    </div>
                  </div>
                </>
              )}

              {activeModal === 'privacy' && (
                <>
                  <p className="font-semibold text-slate-800">
                    Your privacy and data security are our top priorities.
                  </p>
                  <p>
                    We collect minimal personal information necessary to facilitate safe marketplace transactions.
                  </p>
                  <div className="space-y-2 pt-1">
                    <h4 className="font-bold text-slate-900">Data Protection Commitments:</h4>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>National ID numbers and documents are stored securely with restricted administrative access.</li>
                      <li>We never sell or share your contact information with third-party advertisers.</li>
                      <li>You can edit or update your contact details at any time from your Account Settings.</li>
                    </ul>
                  </div>
                </>
              )}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setActiveModal(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
