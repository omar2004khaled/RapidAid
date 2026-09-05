import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Siren, MapPin, Phone, User, AlertCircle, CheckCircle2, Shield, Flame, HeartPulse, Send, LogIn, X } from "lucide-react";
import LocationPickerMap from '../Components/LocationPickerMap';
import { useToast } from '../contexts/ToastContext';
import incidentAPI from '../services/incidentAPI';

function ReporterPage() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    emergencyType: 'MEDICAL',
    location: '',
    latitude: 30.0444,
    longitude: 31.2357,
    description: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const incidentData = {
        incidentType: formData.emergencyType.toUpperCase(),
        address: {
          street: formData.location || "Street Location",
          city: "Cairo",
          neighborhood: "Downtown",
          buildingNo: "N/A",
          apartmentNo: "N/A",
          latitude: formData.latitude,
          longitude: formData.longitude
        },
        description: formData.description,
        reporterName: formData.name,
        reporterPhone: formData.phone,
        severityLevel: 3,
        lifeCycleStatus: "REPORTED"
      };

      await incidentAPI.reportPublicIncident(incidentData);

      setSuccess(true);
      showSuccess('Emergency reported successfully! Dispatch command has been alerted.');

      setFormData({
        name: '',
        phone: '',
        emergencyType: 'MEDICAL',
        location: '',
        latitude: 30.0444,
        longitude: 31.2357,
        description: ''
      });

      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      const msg = err.message || 'Failed to submit report. Please try again or call local emergency services immediately.';
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8EDE3] text-[#283227] flex flex-col">
      {/* Public Header */}
      <header className="border-b border-[#BDD2B6] bg-white/90 backdrop-blur-md px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#798777] flex items-center justify-center text-white shadow-md shadow-[#798777]/25">
              <Siren className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-tight text-[#283227]">Rapid<span className="text-[#798777]">Aid</span></h1>
              <p className="text-[10px] text-[#5B6859] font-semibold uppercase tracking-wider">Public Emergency Portal</p>
            </div>
          </div>

          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F8EDE3] hover:bg-[#ebdcd0] text-xs font-semibold text-[#283227] border border-[#BDD2B6] transition-all"
          >
            <LogIn className="w-3.5 h-3.5 text-[#798777]" />
            Dispatcher Login
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12">
        <div className="text-center space-y-3 mb-8">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#283227]">
            Report an Emergency Incident
          </h2>
          <p className="text-sm text-[#5B6859] max-w-xl mx-auto">
            If you are witnessing or experiencing a life-threatening situation, report it immediately below. Response units will be dispatched automatically.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-2xl bg-[#BDD2B6]/40 border border-[#A2B29F] text-[#283227] text-sm flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#798777] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Incident Dispatched Successfully</p>
              <p className="text-xs text-[#5B6859] mt-0.5">Emergency units have been alerted and coordinates relayed to responders.</p>
            </div>
          </div>
        )}

        <div className="bg-white border border-[#BDD2B6] rounded-3xl p-6 sm:p-10 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Emergency Type Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5B6859] mb-3">
                Emergency Classification
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, emergencyType: 'MEDICAL' }))}
                  className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${
                    formData.emergencyType === 'MEDICAL'
                      ? 'bg-[#BDD2B6]/40 border-[#798777] text-[#283227] ring-2 ring-[#798777]/20 shadow-md'
                      : 'bg-[#F8EDE3]/30 border-[#BDD2B6] text-[#5B6859] hover:border-[#A2B29F]'
                  }`}
                >
                  <HeartPulse className="w-6 h-6 text-[#798777]" />
                  <div className="text-left">
                    <p className="font-bold text-sm text-[#283227]">Medical</p>
                    <p className="text-[11px] opacity-75 text-[#5B6859]">Ambulance & Paramedics</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, emergencyType: 'FIRE' }))}
                  className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${
                    formData.emergencyType === 'FIRE'
                      ? 'bg-red-50 border-red-500 text-red-700 ring-2 ring-red-500/20 shadow-md'
                      : 'bg-[#F8EDE3]/30 border-[#BDD2B6] text-[#5B6859] hover:border-[#A2B29F]'
                  }`}
                >
                  <Flame className="w-6 h-6 text-red-500" />
                  <div className="text-left">
                    <p className="font-bold text-sm text-[#283227]">Fire & Rescue</p>
                    <p className="text-[11px] opacity-75 text-[#5B6859]">Fire Engines & Hazmat</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, emergencyType: 'POLICE' }))}
                  className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${
                    formData.emergencyType === 'POLICE'
                      ? 'bg-[#BDD2B6]/40 border-[#798777] text-[#283227] ring-2 ring-[#798777]/20 shadow-md'
                      : 'bg-[#F8EDE3]/30 border-[#BDD2B6] text-[#5B6859] hover:border-[#A2B29F]'
                  }`}
                >
                  <Shield className="w-6 h-6 text-[#798777]" />
                  <div className="text-left">
                    <p className="font-bold text-sm text-[#283227]">Police</p>
                    <p className="text-[11px] opacity-75 text-[#5B6859]">Security & Patrol Units</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Reporter Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#5B6859] uppercase tracking-wider mb-2">
                  Your Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#798777] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                    className="w-full h-12 pl-10 pr-4 rounded-xl bg-[#F8EDE3]/50 border border-[#BDD2B6] text-[#283227] placeholder-[#A2B29F] focus:outline-none focus:border-[#798777] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5B6859] uppercase tracking-wider mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#798777] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="Contact telephone"
                    className="w-full h-12 pl-10 pr-4 rounded-xl bg-[#F8EDE3]/50 border border-[#BDD2B6] text-[#283227] placeholder-[#A2B29F] focus:outline-none focus:border-[#798777] text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Address & GPS */}
            <div>
              <label className="block text-xs font-semibold text-[#5B6859] uppercase tracking-wider mb-2">
                Street Address / Landmark
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="e.g. 15 Tahrir Square, Downtown, near Metro station"
                className="w-full h-12 px-4 rounded-xl bg-[#F8EDE3]/50 border border-[#BDD2B6] text-[#283227] placeholder-[#A2B29F] focus:outline-none focus:border-[#798777] text-sm mb-3"
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#F8EDE3] border border-[#BDD2B6]">
                <div className="flex items-center gap-2.5 text-xs text-[#5B6859]">
                  <MapPin className="w-4 h-4 text-[#798777]" />
                  <span>
                    Pinned Coordinates: <strong className="font-mono text-[#283227]">{formData.latitude.toFixed(5)}, {formData.longitude.toFixed(5)}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLocationPicker(true)}
                  className="px-4 py-2 rounded-xl bg-[#798777] hover:bg-[#687566] text-white text-xs font-semibold transition-all shadow-md shadow-[#798777]/25"
                >
                  Pick Location on Map
                </button>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-[#5B6859] uppercase tracking-wider mb-2">
                Situation Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="4"
                placeholder="Describe what is occurring, any hazards, trapped individuals, or casualties..."
                className="w-full p-4 rounded-xl bg-[#F8EDE3]/50 border border-[#BDD2B6] text-[#283227] placeholder-[#A2B29F] focus:outline-none focus:border-[#798777] text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-[#798777] hover:bg-[#687566] text-white font-extrabold text-base shadow-xl shadow-[#798777]/25 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Transmit Emergency Dispatch</span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Location Picker Modal */}
      {showLocationPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A2119]/50 backdrop-blur-sm">
          <div className="bg-white border border-[#BDD2B6] rounded-3xl w-full max-w-3xl h-[550px] flex flex-col overflow-hidden shadow-2xl animate-scaleIn">
            <div className="p-4 border-b border-[#BDD2B6] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#798777]" />
                <h3 className="font-bold text-[#283227] text-sm">Click Map to Pin Precise Scene Location</h3>
              </div>
              <button
                onClick={() => setShowLocationPicker(false)}
                className="p-1 rounded-lg text-[#5B6859] hover:text-[#283227] hover:bg-[#F8EDE3]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 relative">
              <LocationPickerMap
                initialPosition={[formData.latitude, formData.longitude]}
                onLocationSelect={(lat, lng) => {
                  setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
                }}
              />
            </div>
            <div className="p-4 border-t border-[#BDD2B6] flex items-center justify-between bg-[#F8EDE3]">
              <span className="text-xs text-[#5B6859] font-mono">
                Selected: {formData.latitude.toFixed(5)}, {formData.longitude.toFixed(5)}
              </span>
              <button
                onClick={() => setShowLocationPicker(false)}
                className="px-5 py-2 rounded-xl bg-[#798777] hover:bg-[#687566] text-white text-xs font-bold shadow-md shadow-[#798777]/25"
              >
                Confirm Coordinates
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReporterPage;