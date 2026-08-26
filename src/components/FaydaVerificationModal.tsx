'use client';

import { useState } from 'react';
import { requestFaydaOtp, verifyFaydaOtp, submitFaydaVerificationRequest } from '@/actions/fayda';
import { useRouter } from 'next/navigation';
import type { VerificationState } from '@/src/types';

type FaydaVerificationModalProps = {
  verificationState?: VerificationState;
  isVerified: boolean;
};

export function FaydaVerificationModal({
  verificationState = 'UNVERIFIED',
  isVerified,
}: FaydaVerificationModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [fanNumber, setFanNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [idPhotoUrl, setIdPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file (PNG, JPG, JPEG).');
        return;
      }
      setError(null);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setIdPhotoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await requestFaydaOtp(fanNumber);
      if (res.success) {

        setMessage(`OTP sent to ${res.maskedPhone}`);
        setStep(2);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await verifyFaydaOtp(otpCode);
      if (res.success) {
        setMessage('OTP Verified! Next: Upload your National ID card photograph.');
        setStep(3);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid OTP code.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitPhoto(e: React.FormEvent) {
    e.preventDefault();
    if (!idPhotoUrl) {
      setError('Please upload a photograph of your National ID card before submitting.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await submitFaydaVerificationRequest(idPhotoUrl);
      if (res.success) {
        setMessage('🎉 Verification Submitted! Status: Pending Admin Approval ⏳');
        router.refresh();
        setTimeout(() => {
          setIsOpen(false);
          setStep(1);
        }, 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit verification request.');
    } finally {
      setLoading(false);
    }
  }

  // Button label according to state
  let buttonLabel = '🪪 Verify National ID →';
  let buttonStyle = 'bg-white text-blue-900 hover:bg-blue-50';

  if (verificationState === 'VERIFIED' || isVerified) {
    buttonLabel = '🛡️ Verified with National ID';
    buttonStyle = 'bg-emerald-50 text-emerald-800 border border-emerald-300';
  } else if (verificationState === 'IN_PROGRESS') {
    buttonLabel = '⏳ Verification Pending Admin Approval';
    buttonStyle = 'bg-amber-50 text-amber-900 border border-amber-300';
  } else if (verificationState === 'DECLINED') {
    buttonLabel = '⚠️ Verification Declined - Try Again →';
    buttonStyle = 'bg-red-50 text-red-900 border border-red-300';
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`font-bold px-5 py-2.5 rounded-xl text-xs transition shadow-sm whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${buttonStyle}`}
      >
        {buttonLabel}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-5">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-900 text-amber-400 font-black text-xl flex items-center justify-center border border-amber-500/40 shadow-xs">
                  🇪🇹
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    National ID (Fayda) Verification
                  </h3>
                  <p className="text-[11px] text-slate-500">Step {step} of 3 Verification Flow</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg p-1"
              >
                ✕
              </button>
            </div>

            {/* Progress Stepper */}
            <div className="flex items-center justify-between text-xs font-semibold px-2 py-1 bg-slate-50 rounded-lg border border-slate-200">
              <span className={step === 1 ? 'text-blue-600 font-bold' : 'text-slate-400'}>
                1. FAN Number
              </span>
              <span className="text-slate-300">→</span>
              <span className={step === 2 ? 'text-blue-600 font-bold' : 'text-slate-400'}>
                2. SMS OTP
              </span>
              <span className="text-slate-300">→</span>
              <span className={step === 3 ? 'text-blue-600 font-bold' : 'text-slate-400'}>
                3. ID Photo Upload
              </span>
            </div>

            {step === 1 && (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Fayda Identification Number (FAN)
                  </label>
                  <input
                    type="text"
                    value={fanNumber}
                    onChange={(e) => setFanNumber(e.target.value)}
                    placeholder="e.g. 9842 1049 2049 1049"
                    required
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 font-mono tracking-wider focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Enter the 16-digit FAN printed on your National ID card.
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-xs py-2 px-3 rounded-lg font-medium">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold py-2.5 rounded-xl text-xs transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-900 hover:bg-blue-800 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? 'Sending OTP...' : 'Send SMS OTP →'}
                  </button>
                </div>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 text-blue-900 text-xs p-3 rounded-xl font-medium shadow-xs">
                  <span className="flex items-center gap-1.5">
                    <span>📲</span>
                    <span>Check your server console for the OTP code sent to your registered phone number.</span>
                  </span>
                </div>


                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Enter 6-Digit OTP Code
                  </label>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="849201"
                    maxLength={6}
                    required
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-center text-lg font-mono font-bold tracking-widest text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                {message && (
                  <div className="bg-blue-50 border border-blue-200 text-blue-800 text-xs py-2 px-3 rounded-xl font-medium">
                    {message}
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-xs py-2 px-3 rounded-xl font-medium">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold py-2.5 rounded-xl text-xs transition"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? 'Verifying...' : 'Verify OTP →'}
                  </button>
                </div>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleSubmitPhoto} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Upload Photograph of National ID Card
                  </label>
                  
                  <input
                    type="file"
                    id="id-photo-file-input"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {idPhotoUrl ? (
                    <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-3">
                      <img
                        src={idPhotoUrl}
                        alt="National ID Preview"
                        className="h-40 w-full object-cover rounded-lg border border-slate-300 shadow-xs"
                      />
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          ✓ Image Attached
                        </span>
                        <label
                          htmlFor="id-photo-file-input"
                          className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-3 py-1 rounded-lg cursor-pointer transition"
                        >
                          📷 Change File
                        </label>
                      </div>
                    </div>
                  ) : (
                    <label
                      htmlFor="id-photo-file-input"
                      className="border-2 border-dashed border-blue-300 hover:border-blue-500 rounded-xl p-6 text-center bg-blue-50/50 hover:bg-blue-50 transition cursor-pointer block space-y-2"
                    >
                      <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-black text-xl flex items-center justify-center mx-auto">
                        📤
                      </div>
                      <div>
                        <p className="text-xs font-bold text-blue-900">Click to Choose Image File</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Supports PNG, JPG, JPEG</p>
                      </div>
                    </label>
                  )}

                  <p className="text-[11px] text-slate-400 mt-2">
                    Upload a clear front photograph of your physical / digital Fayda National ID card.
                  </p>
                </div>

                {message && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs py-2.5 px-3 rounded-xl font-bold text-center">
                    {message}
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-xs py-2 px-3 rounded-xl font-medium">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold py-2.5 rounded-xl text-xs transition"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !idPhotoUrl}
                    className="flex-1 bg-blue-900 hover:bg-blue-800 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? 'Submitting...' : 'Submit to Admin ✓'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
