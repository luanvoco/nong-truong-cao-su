import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MapPin, User, Users, Droplet, Package, Layers, GitCommit, Save, Check, AlertCircle, ChevronDown, Search, ShieldCheck, Smartphone, Wifi, WifiOff, RefreshCw, Database, Send, X } from 'lucide-react';

/**
 * NHẬP SẢN LƯỢNG CAO SU - PHIÊN BẢN VRG OFFICIAL BRANDING (v2.7)
 * Consultant: Luân - Base.vn
 */

const FARMS = Array.from({ length: 35 }, (_, i) => `NT${i + 1}`);

// Component Dropdown tích hợp tìm kiếm và điều hướng focus
const SearchableSelect = ({ options, value, onChange, placeholder, icon: Icon, disabled, nextRef }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt =>
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative" ref={wrapperRef}>
      <div
        className={`flex items-center w-full pl-10 pr-3 py-4 border-2 rounded-2xl transition-all shadow-sm ${disabled ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border-gray-300 text-gray-800 cursor-pointer hover:border-emerald-500 active:ring-4 active:ring-emerald-100'}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-600">
          <Icon size={20} />
        </div>
        <span className={`flex-1 truncate text-base font-medium ${!value ? 'text-gray-400' : 'text-slate-900'}`}>
          {value || placeholder}
        </span>
        <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-[2000] w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 text-left text-slate-800">
          <div className="p-3 border-b border-slate-100 bg-slate-50 sticky top-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
                placeholder="Tìm nhanh..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && filteredOptions.length > 0) {
                        onChange(filteredOptions[0]);
                        setIsOpen(false);
                        setSearchTerm('');
                        if (nextRef) nextRef.current.focus();
                    }
                }}
                autoFocus
              />
            </div>
          </div>
          <ul className="max-h-60 overflow-y-auto py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(opt => (
                <li
                  key={opt}
                  className={`px-6 py-3.5 hover:bg-emerald-50 cursor-pointer text-sm transition-colors flex items-center justify-between ${value === opt ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-700 font-medium'}`}
                  onClick={() => {
                     onChange(opt);
                     setIsOpen(false);
                     setSearchTerm('');
                     if (nextRef) nextRef.current.focus();
                  }}
                >
                  {opt}
                  {value === opt && <Check className="w-4 h-4 text-emerald-600" />}
                </li>
              ))
            ) : (
              <li className="px-6 py-8 text-sm text-gray-400 text-center italic font-medium">Không thấy kết quả</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [selectedFarm, setSelectedFarm] = useState('');
  const [selectedWorker, setSelectedWorker] = useState('');
  const [latexWater, setLatexWater] = useState('');
  const [latexTap, setLatexTap] = useState('');
  const [latexDong, setLatexDong] = useState('');
  const [latexScrap, setLatexScrap] = useState('');
  const [isSubstitute, setIsSubstitute] = useState(false);
  const [substituteWorker, setSubstituteWorker] = useState('');
  
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPwaTip, setShowPwaTip] = useState(false);

  // Refs điều hướng thông minh (Enter Flow)
  const inputRefs = {
    water: useRef(),
    tap: useRef(),
    dong: useRef(),
    scrap: useRef()
  };

  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyLiyGtZI0eUE_9rLGnTlXefIQyt0to6tu3yasGW7wc0-UC4cFhr-Xu3-ECYgzcCoKW/exec';

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const savedQueue = JSON.parse(localStorage.getItem('rubber_yield_cache_v3') || '[]');
    setOfflineQueue(savedQueue);

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (!isStandalone && window.innerWidth < 768) {
        setTimeout(() => setShowPwaTip(true), 3000);
    }

    // TÍCH HỢP LOGO VRG CHÍNH THỨC (SVG Base64)
    if (!document.getElementById('vrg-official-branding')) {
      // SVG tái tạo logo VRG: Vòng tròn xanh + 3 đường lượn trắng
      const svgIcon = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj4KICA8Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0OCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDA5MjQ1IiBzdHJva2Utd2lkdGg9IjIiLz4KICA8cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgcng9IjI0IiBmaWxsPSIjMDA5MjQ1Ii8+CiAgPHBhdGggZD0iTTM1IDQwIEM0MCAzMCA1MCAyNSA2MCA0MCBDNjUgNTAgNjAgNjUgNTAgODAgQzQwIDY1IDM1IDUwIDM1IDQwIFoiIGZpbGw9IndoaXRlIi8+CiAgPHBhdGggZD0iTTQ1IDM1IEM1MCAyNSA2MCAyMCA3MCAzNSBDNzUgNDUgNzAgNjAgNjAgNzUgQzUwIDYwIDQ1IDQ1IDQ1IDM1IFoiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjkiLz4KICA8cGF0aCBkPSJNMjUgNDUgQzMwIDM1IDQwIDMwIDUwIDQ1IEM1NSA1NSA1MCA3MCA0MCA4NSBDMzAgNzAgMjUgNTUgMjUgNDUgWiIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuOCIvPgo8L3N2Zz4=";
      
      const appleIcon = document.createElement('link');
      appleIcon.id = 'vrg-official-branding';
      appleIcon.rel = 'apple-touch-icon';
      appleIcon.href = svgIcon;
      document.head.appendChild(appleIcon);

      const shortcutIcon = document.createElement('link');
      shortcutIcon.rel = 'icon';
      shortcutIcon.type = "image/svg+xml";
      shortcutIcon.href = svgIcon;
      document.head.appendChild(shortcutIcon);

      const metaCapable = document.createElement('meta');
      metaCapable.name = "apple-mobile-web-app-capable";
      metaCapable.content = "yes";
      document.head.appendChild(metaCapable);

      const metaTitle = document.createElement('meta');
      metaTitle.name = "apple-mobile-web-app-title";
      metaTitle.content = "VRG Sản Lượng";
      document.head.appendChild(metaTitle);
    }

    if (!document.getElementById('tailwind-cdn')) {
      const script = document.createElement('script');
      script.id = 'tailwind-cdn';
      script.src = 'https://cdn.tailwindcss.com';
      document.head.appendChild(script);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('rubber_yield_cache_v3', JSON.stringify(offlineQueue));
  }, [offlineQueue]);

  const workersInFarm = useMemo(() => {
    if (!selectedFarm) return [];
    return Array.from({ length: 60 }, (_, i) => `${selectedFarm}-${String(i + 1).padStart(2, '0')}`);
  }, [selectedFarm]);

  const handleFarmChange = (val) => {
    setSelectedFarm(val);
    setSelectedWorker('');
    setIsSubstitute(false);
    setSubstituteWorker('');
  };

  const handleSyncAll = async () => {
    if (offlineQueue.length === 0 || !isOnline || isSyncing) return;
    setIsSyncing(true);
    const records = [...offlineQueue];
    const failed = [];
    for (const record of records) {
      try {
        const payload = new URLSearchParams();
        Object.keys(record).forEach(key => { if (key !== 'tempId') payload.append(key, record[key]); });
        await fetch(SCRIPT_URL, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: payload, mode: 'no-cors' });
      } catch (err) { failed.push(record); }
    }
    setOfflineQueue(failed);
    setIsSyncing(false);
    if (failed.length === 0) { setShowSuccess(true); setTimeout(() => setShowSuccess(false), 4000); }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!selectedFarm || !selectedWorker) return;

    const newRecord = {
      tempId: Date.now(), farm: selectedFarm, worker: selectedWorker,
      water: parseInt(latexWater) || 0, 
      tap: parseInt(latexTap) || 0, 
      dong: parseInt(latexDong) || 0, 
      scrap: parseInt(latexScrap) || 0,
      substitute_worker: isSubstitute ? substituteWorker : 'Không', 
      time: new Date().toLocaleString('vi-VN')
    };

    setOfflineQueue(prev => [newRecord, ...prev]);

    setSelectedWorker(''); setLatexWater(''); setLatexTap(''); setLatexDong(''); setLatexScrap(''); setIsSubstitute(false); setSubstituteWorker('');
    if (isOnline) { setTimeout(() => handleSyncAll(), 500); }
    
    // Focus lại ô đầu tiên cho lượt nhập tiếp theo
    if (inputRefs.water.current) inputRefs.water.current.focus();
  };

  // Chỉ nhận số nguyên
  const handleIntInput = (val, setter) => {
    const cleanVal = val.replace(/[^0-9]/g, '');
    setter(cleanVal);
  };

  const handleKeyDown = (e, nextFieldRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextFieldRef && nextFieldRef.current) {
        nextFieldRef.current.focus();
      } else {
        handleSubmit();
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 flex justify-center selection:bg-emerald-100">
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl relative flex flex-col border-x border-slate-200">
        
        {/* PWA Gợi ý cài đặt */}
        {showPwaTip && (
           <div className="fixed bottom-6 left-6 right-6 z-[3000] bg-slate-900 text-white p-5 rounded-[2rem] shadow-2xl border border-white/10 animate-in slide-in-from-bottom duration-700">
              <div className="flex items-start space-x-4 text-left">
                 <div className="bg-emerald-600 p-3 rounded-2xl flex-shrink-0 shadow-lg text-white">
                    <Smartphone size={24} />
                 </div>
                 <div className="flex-1">
                    <p className="text-xs font-black uppercase text-emerald-400 italic tracking-widest">Cài đặt App VRG</p>
                    <p className="text-[11px] mt-1 text-slate-300 italic leading-relaxed font-medium">
                       Bấm nút <span className="text-white font-bold underline">Chia sẻ</span>, sau đó chọn <span className="text-white font-bold underline">"Thêm vào MH chính"</span> để hiện logo VRG.
                    </p>
                 </div>
                 <button onClick={() => setShowPwaTip(false)} className="text-slate-500 p-1"><X size={16}/></button>
              </div>
           </div>
        )}

        {/* Header - Mang bản sắc VRG Official */}
        <header className="bg-gradient-to-br from-emerald-900 to-emerald-700 text-white p-8 pt-12 shadow-lg relative overflow-hidden flex-shrink-0 text-left">
          <div className="absolute -top-12 -right-12 opacity-10 rotate-12"><Droplet size={200} /></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
             <div className="flex items-center space-x-2">
                <div className="p-2 bg-emerald-400/20 rounded-xl backdrop-blur-sm border border-emerald-400/30 text-emerald-200"><ShieldCheck size={16} /></div>
                <span className="text-[11px] uppercase tracking-[0.3em] font-bold text-emerald-100 italic">VRG - Dầu Tiếng Việt Lào</span>
             </div>
             <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${isOnline ? 'bg-emerald-500/20 text-emerald-100 border border-emerald-500/30' : 'bg-red-500/30 text-red-100 border border-red-500/40 animate-pulse'}`}>
                {isOnline ? <><Wifi size={12} className="mr-1"/> Trực tuyến</> : <><WifiOff size={12} className="mr-1"/> Ngoại tuyến</>}
             </div>
          </div>
          
          <div className="flex items-start space-x-4 relative z-10 mb-4">
             <div className="bg-white p-2 rounded-2xl shadow-lg flex-shrink-0">
                <svg width="40" height="40" viewBox="0 0 100 100">
                   <rect width="100" height="100" rx="20" fill="#009245"/>
                   <path d="M35 40 C40 30 50 25 60 40 C65 50 60 65 50 80 C40 65 35 50 35 40 Z" fill="white"/>
                   <path d="M45 35 C50 25 60 20 70 35 C75 45 70 60 60 75 C50 60 45 45 45 35 Z" fill="white" opacity="0.9"/>
                   <path d="M25 45 C30 35 40 30 50 45 C55 55 50 70 40 85 C30 70 25 55 25 45 Z" fill="white" opacity="0.8"/>
                </svg>
             </div>
             <div>
                <h1 className="text-2xl font-black tracking-tight leading-tight uppercase italic">BÁO CÁO SẢN LƯỢNG <br/> TỪ NÔNG TRƯỜNG</h1>
                <p className="text-emerald-50 text-[10px] font-bold opacity-80 mt-1 uppercase tracking-widest italic">Tư vấn giải pháp: Luân - Base.vn</p>
             </div>
          </div>
        </header>

        {offlineQueue.length > 0 && (
          <div className="p-4 flex items-center justify-between bg-amber-500 text-white shadow-lg z-[60] animate-in slide-in-from-top duration-300">
             <div className="flex items-center space-x-3 text-left leading-tight">
                <div className={`p-2.5 rounded-2xl ${isSyncing ? 'animate-spin bg-amber-400' : 'bg-amber-600 shadow-md'}`}><RefreshCw size={18} /></div>
                <div><p className="text-[11px] font-black uppercase tracking-tighter">Đợi đồng bộ</p><p className="text-[10px] font-bold opacity-80">{offlineQueue.length} bản ghi đang nợ</p></div>
             </div>
             {isOnline && !isSyncing && <button onClick={handleSyncAll} className="bg-white text-amber-600 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase shadow-xl active:scale-95 transition-all flex items-center"><Send size={12} className="mr-2" /> Gửi ngay</button>}
          </div>
        )}

        <div className={`fixed top-12 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-md border-2 border-emerald-500 text-emerald-800 px-10 py-5 rounded-[2.5rem] flex items-center shadow-2xl transition-all duration-700 z-[9999] ${showSuccess ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-20 scale-90 pointer-events-none'}`}>
          <div className="bg-emerald-500 text-white p-1.5 rounded-full mr-4"><Check size={16} /></div>
          <span className="font-black text-sm uppercase tracking-[0.1em] italic">Đồng bộ hoàn tất!</span>
        </div>

        <main className="flex-1 overflow-y-auto p-6 pb-32">
          <form onSubmit={handleSubmit} className="space-y-10">
            <section className="space-y-6">
              <div className="text-left group">
                <label className="block text-[11px] font-black text-slate-400 mb-3 ml-1 uppercase tracking-[0.2em]">Khu vực nông trường</label>
                <SearchableSelect options={FARMS} value={selectedFarm} onChange={handleFarmChange} placeholder="Chọn đơn vị..." icon={MapPin} />
              </div>

              <div className="text-left group">
                <label className="block text-[11px] font-black text-slate-400 mb-3 ml-1 uppercase tracking-[0.2em]">Họ tên nhân sự</label>
                <SearchableSelect 
                    options={workersInFarm} 
                    value={selectedWorker} 
                    onChange={setSelectedWorker} 
                    placeholder={!selectedFarm ? 'Đợi chọn nông trường...' : 'Gõ tên hoặc số thẻ...'} 
                    icon={User} 
                    disabled={!selectedFarm}
                    nextRef={inputRefs.water}
                />
              </div>
            </section>

            <section className="bg-slate-50 rounded-[2rem] p-7 border-2 border-slate-100 shadow-sm relative text-left">
              <h2 className="text-[11px] font-black text-slate-400 mb-6 flex items-center uppercase tracking-[0.2em] relative z-10 text-left"><AlertCircle size={14} className="mr-2 text-emerald-600" /> Nhập sản lượng (KG)</h2>
              <div className="grid grid-cols-2 gap-4 relative z-10">
                {[
                  { id: 'water', label: 'Mủ Nước', icon: Droplet, color: 'text-blue-600', state: latexWater, setState: setLatexWater, bg: 'bg-blue-50', ref: inputRefs.water, next: inputRefs.tap },
                  { id: 'tap', label: 'Mủ Tạp', icon: Layers, color: 'text-orange-600', state: latexTap, setState: setLatexTap, bg: 'bg-orange-50', ref: inputRefs.tap, next: inputRefs.dong },
                  { id: 'dong', label: 'Mủ Đông', icon: Package, color: 'text-indigo-600', state: latexDong, setState: setLatexDong, bg: 'bg-indigo-50', ref: inputRefs.dong, next: inputRefs.scrap },
                  { id: 'scrap', label: 'Mủ Dây', icon: GitCommit, color: 'text-slate-600', state: latexScrap, setState: setLatexScrap, bg: 'bg-slate-50', ref: inputRefs.scrap, next: null },
                ].map(item => (
                  <div key={item.id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center group active:scale-95 transition-all hover:border-emerald-500">
                    <div className={`p-3 rounded-2xl ${item.bg} mb-3 group-hover:scale-110 transition-transform`}><item.icon className={`w-6 h-6 ${item.color}`} /></div>
                    <span className="text-[10px] font-black text-slate-400 mb-3 uppercase tracking-tighter text-center">{item.label}</span>
                    <input
                      ref={item.ref}
                      type="tel" 
                      pattern="[0-9]*"
                      value={item.state} 
                      onChange={(e) => handleIntInput(e.target.value, item.setState)}
                      onKeyDown={(e) => handleKeyDown(e, item.next)}
                      className="w-full text-2xl font-black text-center text-slate-900 focus:outline-none border-b-2 border-transparent focus:border-emerald-500 transition-all placeholder-slate-200 bg-transparent"
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
            </section>

            <section className={`rounded-[2rem] border-2 transition-all duration-300 shadow-sm relative ${isSubstitute ? 'bg-emerald-50 border-emerald-400 shadow-lg shadow-emerald-100' : 'bg-white border-slate-100'}`}>
              <div className="flex items-center justify-between p-6 gap-4">
                <div className="flex items-center space-x-3 flex-1 min-w-0 text-left">
                   <div className={`p-3.5 rounded-2xl transition-all shadow-sm flex-shrink-0 ${isSubstitute ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      <Users size={20} />
                   </div>
                   <div className="flex-1 min-w-0 text-left leading-tight">
                      <label className="text-sm font-black text-slate-800 block truncate uppercase tracking-tighter text-left">Báo cáo cạo thay</label>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight italic opacity-70 truncate text-left font-medium">Hỗ trợ khai thác</p>
                   </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSubstitute(!isSubstitute)}
                  disabled={!selectedFarm}
                  className={`relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 ${!selectedFarm ? 'opacity-20 cursor-not-allowed' : 'hover:scale-105'} ${isSubstitute ? 'bg-emerald-600' : 'bg-slate-300'}`}
                >
                  <span className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-300 ${isSubstitute ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              {isSubstitute && (
                <div className="px-6 pb-8 animate-in fade-in slide-in-from-top-4 duration-500 text-left">
                  <div className="h-px bg-emerald-200/50 w-full mb-6"></div>
                  <SearchableSelect
                    options={workersInFarm.filter(w => w !== selectedWorker)}
                    value={substituteWorker}
                    onChange={setSubstituteWorker}
                    placeholder="Chọn người được cạo thay..."
                    icon={Users}
                  />
                </div>
              )}
            </section>

            <button
              type="submit"
              disabled={!selectedFarm || !selectedWorker}
              className={`w-full text-white font-black py-6 px-6 rounded-[2rem] shadow-2xl flex items-center justify-center transition-all active:scale-95 uppercase tracking-[0.3em] text-sm group relative overflow-hidden ${!selectedFarm || !selectedWorker ? 'bg-slate-300 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'}`}
            >
               <div className="flex items-center text-white italic font-black">
                  <Save className="w-5 h-5 mr-3 group-hover:scale-125 transition-transform" /> {isOnline ? 'XÁC NHẬN & GỬI ĐI' : 'LƯU TẠM (NGOẠI TUYẾN)'}
               </div>
            </button>
          </form>

          {offlineQueue.length > 0 && (
             <section className="mt-12 border-t border-slate-100 pt-8 animate-in fade-in duration-500 text-left">
                <div className="flex justify-between items-center mb-6 text-left">
                   <div className="flex items-center space-x-2 px-1 text-left">
                      <Database size={14} className="text-slate-400" />
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-left">Dữ liệu đợi (Local)</h3>
                   </div>
                   <button onClick={() => setOfflineQueue([])} className="text-red-400 text-[9px] font-black uppercase hover:text-red-600 transition-colors p-1 font-bold">Xóa sạch</button>
                </div>
                <div className="space-y-4">
                   {offlineQueue.slice(0, 3).map((rec) => (
                      <div key={rec.tempId} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center group transition-all hover:bg-white hover:border-emerald-200 text-left">
                         <div className="text-left leading-tight">
                            <p className="text-xs font-black text-slate-800 text-left">{rec.worker}</p>
                            <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase italic text-left">{rec.time}</p>
                         </div>
                         <div className="text-right">
                            <div className="flex items-center justify-end space-x-1">
                               <Droplet size={10} className="text-blue-500" />
                               <p className="text-[11px] font-black text-blue-600 text-left font-bold">{rec.water} Kg</p>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
             </section>
          )}

          <footer className="mt-20 text-center pb-12 border-t border-slate-100 pt-10 text-left">
             <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest italic text-center leading-relaxed font-bold">Tư vấn giải pháp: Luân - Base.vn <br/> Hybrid Offline Solution (v2.7)</p>
          </footer>
        </main>
      </div>
    </div>
  );
}
