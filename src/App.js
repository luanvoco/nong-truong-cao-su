import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MapPin, User, Users, Droplet, Package, Layers, GitCommit, Save, Check, AlertCircle, ChevronDown, Search, ShieldCheck, Smartphone, Wifi, WifiOff, RefreshCw, Database, Send, X, TrendingUp } from 'lucide-react';

/**
 * NHẬP SẢN LƯỢNG CAO SU - PHIÊN BẢN TẬP ĐOÀN (v5.1)
 * Consultant: Luân - Base.vn
 * Fix: Lỗi overflow khiến danh sách cạo thay bị ẩn
 */

const FARMS = Array.from({ length: 35 }, (_, i) => `NT${i + 1}`);

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

  const handleSelect = (opt) => {
    onChange(opt);
    setIsOpen(false);
    setSearchTerm('');
    if (nextRef && nextRef.current) nextRef.current.focus();
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div
        className={`flex items-center w-full pl-10 pr-3 py-4 border-2 rounded-2xl transition-all shadow-sm ${disabled ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border-gray-300 text-gray-800 cursor-pointer hover:border-emerald-500 active:ring-4 active:ring-emerald-100'}`}
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) setIsOpen(!isOpen);
        }}
      >
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-600">
          <Icon size={20} />
        </div>
        <span className={`flex-1 truncate text-base font-medium text-left ${!value ? 'text-gray-400' : 'text-slate-900'}`}>
          {value || placeholder}
        </span>
        <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-[2000] w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 text-left text-slate-800">
          <div className="p-3 border-b border-slate-100 bg-slate-50 sticky top-0">
            <div className="relative text-left">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 text-left" />
              <input
                type="text"
                className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white text-left"
                placeholder="Tìm nhanh..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && filteredOptions.length > 0) {
                        handleSelect(filteredOptions[0]);
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
                  className={`px-6 py-3.5 hover:bg-emerald-50 cursor-pointer text-sm transition-colors flex items-center justify-between text-left ${value === opt ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-700 font-medium'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(opt);
                  }}
                >
                  {opt}
                  {value === opt && <Check className="w-4 h-4 text-emerald-600 text-left" />}
                </li>
              ))
            ) : (
              <li className="px-6 py-8 text-sm text-gray-400 text-center italic font-medium">Không tìm thấy</li>
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

  const inputRefs = {
    water: useRef(),
    tap: useRef(),
    dong: useRef(),
    scrap: useRef()
  };

  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyLiyGtZI0eUE_9rLGnTlXefIQyt0to6tu3yasGW7wc0-UC4cFhr-Xu3-ECYgzcCoKW/exec';

  const dryRubberWeight = useMemo(() => {
    const water = parseInt(latexWater) || 0;
    return (water * 0.7).toFixed(1);
  }, [latexWater]);

  const handleSyncAll = async (queueToSync = offlineQueue) => {
    if (queueToSync.length === 0 || !navigator.onLine || isSyncing) return;
    
    setIsSyncing(true);
    const records = [...queueToSync];
    const failed = [];

    for (const record of records) {
      try {
        const payload = new URLSearchParams();
        Object.keys(record).forEach(key => {
          if (key !== 'tempId') payload.append(key, record[key]);
        });

        await fetch(SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: payload,
          mode: 'no-cors'
        });
      } catch (err) {
        failed.push(record);
      }
    }

    setOfflineQueue(failed);
    setIsSyncing(false);
    
    if (failed.length === 0 && queueToSync.length > 0) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  useEffect(() => {
    const protocol = window.location.protocol;
    if ('serviceWorker' in navigator && (protocol === 'http:' || protocol === 'https:')) {
      navigator.serviceWorker.register('/service-worker.js', { scope: '/' })
        .then(() => console.log('SW Active'))
        .catch(err => console.error('SW Fail:', err));
    }

    const handleOnline = () => { setIsOnline(true); handleSyncAll(); };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const savedQueue = JSON.parse(localStorage.getItem('vrg_v4_cache') || '[]');
    setOfflineQueue(savedQueue);

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (!isStandalone && /iPhone|Android/i.test(navigator.userAgent)) {
        setTimeout(() => setShowPwaTip(true), 2000);
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('vrg_v4_cache', JSON.stringify(offlineQueue));
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

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!selectedFarm || !selectedWorker) return;

    const newRecord = {
      tempId: Date.now(), 
      farm: selectedFarm, 
      worker: selectedWorker,
      water: parseInt(latexWater) || 0, 
      tap: parseInt(latexTap) || 0, 
      dong: parseInt(latexDong) || 0, 
      scrap: parseInt(latexScrap) || 0,
      dry_rubber_est: dryRubberWeight, 
      substitute_worker: isSubstitute ? substituteWorker : 'Không', 
      time: new Date().toLocaleString('vi-VN')
    };

    const updatedQueue = [newRecord, ...offlineQueue];
    setOfflineQueue(updatedQueue);

    setSelectedWorker(''); setLatexWater(''); setLatexTap(''); setLatexDong(''); setLatexScrap(''); setIsSubstitute(false); setSubstituteWorker('');
    
    if (navigator.onLine) {
      handleSyncAll(updatedQueue);
    }

    if (inputRefs.water.current) inputRefs.water.current.focus();
  };

  const handleIntInput = (val, setter) => setter(val.replace(/[^0-9]/g, ''));

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 flex justify-center selection:bg-emerald-100 text-left">
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl relative flex flex-col border-x border-slate-200 text-left">
        
        {showPwaTip && (
           <div className="fixed bottom-6 left-6 right-6 z-[3000] bg-slate-900 text-white p-6 rounded-[2.5rem] shadow-2xl border border-white/10 animate-in slide-in-from-bottom duration-700 text-left">
              <div className="flex items-start space-x-4 text-left">
                 <div className="bg-emerald-600 p-3.5 rounded-2xl flex-shrink-0 shadow-lg text-white text-left"><Smartphone size={24} /></div>
                 <div className="flex-1 text-left">
                    <p className="text-xs font-black uppercase text-emerald-400 italic tracking-widest text-left">LƯU APP VÀO MÁY</p>
                    <p className="text-[11px] mt-1 text-slate-300 italic leading-relaxed font-medium text-left">
                       Nhấn {"\u2192"} <span className="text-white font-bold underline">Chia sẻ</span> {"\u2192"} <span className="text-white font-bold underline">Thêm vào MH chính</span> để trải nghiệm Offline tốt nhất.
                    </p>
                 </div>
                 <button onClick={() => setShowPwaTip(false)} className="text-slate-500 p-1 text-left"><X size={16}/></button>
              </div>
           </div>
        )}

        <header className="bg-gradient-to-br from-emerald-900 to-emerald-700 text-white p-8 pt-12 shadow-lg relative overflow-hidden flex-shrink-0 text-left">
          <div className="absolute -top-12 -right-12 opacity-10 rotate-12 text-left"><Droplet size={200} /></div>
          <div className="flex items-center justify-between mb-4 relative z-10 text-left">
             <div className="flex items-center space-x-2 text-left">
                <div className="p-2 bg-emerald-400/20 rounded-xl backdrop-blur-sm border border-emerald-400/30 text-emerald-200 text-left"><ShieldCheck size={16} /></div>
                <span className="text-[11px] uppercase tracking-[0.3em] font-bold text-emerald-100 italic text-left">VRG - TẬP ĐOÀN CAO SU</span>
             </div>
             <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-left ${isOnline ? 'bg-emerald-500/20 text-emerald-100 border border-emerald-500/30' : 'bg-red-500/30 text-red-100 border border-red-500/40 animate-pulse'}`}>
                {isOnline ? <><Wifi size={12} className="mr-1 text-left"/> Online</> : <><WifiOff size={12} className="mr-1 text-left"/> Offline</>}
             </div>
          </div>
          <div className="flex items-start space-x-4 relative z-10 mb-4 text-left">
             <div className="bg-white p-2 rounded-2xl shadow-lg flex-shrink-0 text-left">
                <svg width="42" height="42" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="#009245"/><path d="M50 20 C40 40 38 65 50 85 C62 65 60 40 50 20 Z" fill="white"/><path d="M64 30 C73 45 68 65 55 78 C60 65 65 50 64 30 Z" fill="white" opacity="0.9"/><path d="M36 30 C27 45 32 65 45 78 C40 65 35 50 36 30 Z" fill="white" opacity="0.9"/></svg>
             </div>
             <div className="text-left">
                <h1 className="text-2xl font-black tracking-tight leading-tight uppercase italic text-left">NHẬP SẢN LƯỢNG <br/> TỪ NÔNG TRƯỜNG</h1>
                <p className="text-emerald-50 text-[10px] font-bold opacity-80 mt-1 uppercase tracking-widest italic text-left">Official Production v5.1</p>
             </div>
          </div>
        </header>

        {offlineQueue.length > 0 && (
          <div className={`p-4 flex items-center justify-between shadow-lg z-[60] animate-in slide-in-from-top duration-300 ${isSyncing ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'}`}>
             <div className="flex items-center space-x-3 text-left leading-tight text-left">
                <div className={`p-2.5 rounded-2xl text-left ${isSyncing ? 'animate-spin bg-emerald-500' : 'bg-amber-600 shadow-md text-left'}`}><RefreshCw size={18} /></div>
                <div className="text-left"><p className="text-[11px] font-black uppercase tracking-tighter text-left">{isSyncing ? 'Đang nộp số...' : `Chưa nộp ${offlineQueue.length} bản ghi`}</p><p className="text-[10px] font-bold opacity-80 text-left">{isOnline ? 'Nhấn để nộp ngay' : 'Sẽ tự nộp khi có mạng'}</p></div>
             </div>
             {isOnline && !isSyncing && (
               <button onClick={() => handleSyncAll()} className="bg-white text-amber-600 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase shadow-xl active:scale-95 transition-all flex items-center text-left">
                 <Send size={12} className="mr-2 text-left" /> Nộp ngay
               </button>
             )}
          </div>
        )}

        <div className={`fixed top-12 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-md border-2 border-emerald-500 text-emerald-800 px-10 py-5 rounded-[2.5rem] flex items-center shadow-2xl transition-all duration-700 z-[9999] text-left ${showSuccess ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-20 scale-90 pointer-events-none'}`}>
          <div className="bg-emerald-500 text-white p-1.5 rounded-full mr-4 text-left"><Check size={16} /></div>
          <span className="font-black text-sm uppercase tracking-[0.1em] italic text-left">Đã đồng bộ thành công!</span>
        </div>

        <main className="flex-1 overflow-y-auto p-6 pb-32 text-left">
          <form onSubmit={handleSubmit} className="space-y-10 text-left">
            <section className="space-y-6 text-left">
              <div className="text-left group text-left">
                <label className="block text-[11px] font-black text-slate-400 mb-3 ml-1 uppercase tracking-[0.2em] text-left font-bold">Đơn vị nông trường</label>
                <SearchableSelect options={FARMS} value={selectedFarm} onChange={handleFarmChange} placeholder="Chọn nông trường..." icon={MapPin} />
              </div>
              <div className="text-left group text-left text-left">
                <label className="block text-[11px] font-black text-slate-400 mb-3 ml-1 uppercase tracking-[0.2em] text-left font-bold">Nhân sự thực địa</label>
                <SearchableSelect options={workersInFarm} value={selectedWorker} onChange={setSelectedWorker} placeholder={!selectedFarm ? 'Đợi chọn đơn vị...' : 'Tên hoặc số thẻ...'} icon={User} disabled={!selectedFarm} nextRef={inputRefs.water}/>
              </div>
            </section>

            <section className="bg-slate-50 rounded-[2rem] p-7 border-2 border-slate-100 shadow-sm relative text-left">
              <h2 className="text-[11px] font-black text-slate-400 mb-6 flex items-center uppercase tracking-[0.2em] relative z-10 text-left font-bold"><AlertCircle size={14} className="mr-2 text-emerald-600 text-left" /> Sản lượng khai thác (KG)</h2>
              <div className="grid grid-cols-2 gap-4 relative z-10 text-left">
                {[
                  { id: 'water', label: 'Mủ Nước', icon: Droplet, color: 'text-blue-600', state: latexWater, setState: setLatexWater, bg: 'bg-blue-50', ref: inputRefs.water, next: inputRefs.tap },
                  { id: 'tap', label: 'Mủ Tạp', icon: Layers, color: 'text-orange-600', state: latexTap, setState: setLatexTap, bg: 'bg-orange-50', ref: inputRefs.tap, next: inputRefs.dong },
                  { id: 'dong', label: 'Mủ Đông', icon: Package, color: 'text-indigo-600', state: latexDong, setState: setLatexDong, bg: 'bg-indigo-50', ref: inputRefs.dong, next: inputRefs.scrap },
                  { id: 'scrap', label: 'Mủ Dây', icon: GitCommit, color: 'text-slate-600', state: latexScrap, setState: setLatexScrap, bg: 'bg-slate-50', ref: inputRefs.scrap, next: null },
                ].map(item => (
                  <div key={item.id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center group active:scale-95 transition-all hover:border-emerald-500 text-left">
                    <div className={`p-3 rounded-2xl ${item.bg} mb-3 group-hover:scale-110 transition-transform text-left`}><item.icon className={`w-6 h-6 ${item.color} text-left`} /></div>
                    <span className="text-[10px] font-black text-slate-400 mb-3 uppercase tracking-tighter text-center text-left font-bold">{item.label}</span>
                    <input ref={item.ref} type="tel" pattern="[0-9]*" value={item.state} onChange={(e) => handleIntInput(e.target.value, item.setState)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (item.next && item.next.current) item.next.current.focus(); else handleSubmit(); }}}
                      className="w-full text-2xl font-black text-center text-slate-900 focus:outline-none border-b-2 border-transparent focus:border-emerald-500 transition-all placeholder-slate-200 bg-transparent text-left" placeholder="0"/>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-emerald-50 rounded-[2rem] p-6 border-2 border-emerald-100 shadow-inner flex items-center justify-between transition-all duration-500 text-left">
              <div className="flex items-center space-x-4 text-left">
                 <div className="bg-emerald-600 text-white p-3 rounded-2xl shadow-lg animate-pulse text-left"><TrendingUp size={20} /></div>
                 <div className="text-left text-left text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700 italic text-left font-bold">Mủ Quy khô (70%)</p>
                    <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-tighter text-left italic text-left font-bold text-left">Chỉ số quy đổi chuẩn VRG</p>
                 </div>
              </div>
              <div className="text-right text-left text-left"><span className="text-3xl font-black text-emerald-900 italic tracking-tighter text-left text-left font-bold">{dryRubberWeight}</span><span className="ml-1 text-[10px] font-black text-emerald-700 uppercase text-left text-left text-left font-bold">KG</span></div>
            </section>

            {/* PHẦN BÁO CÁO CẠO THAY - LOẠI BỎ OVERFLOW-HIDDEN ĐỂ HIỂN THỊ DROPDOWN */}
            <section 
              className={`rounded-[2rem] border-2 transition-all duration-300 shadow-sm relative text-left ${!selectedFarm ? 'opacity-40 bg-slate-50 border-slate-100' : 'bg-white border-slate-100'} ${isSubstitute ? 'bg-emerald-50 border-emerald-400 shadow-lg shadow-emerald-100' : ''}`}
            >
              <div 
                onClick={() => selectedFarm && setIsSubstitute(!isSubstitute)}
                className={`flex items-center justify-between p-6 gap-4 text-left ${selectedFarm ? 'cursor-pointer hover:bg-slate-50 transition-colors' : 'cursor-not-allowed'}`}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0 text-left">
                   <div className={`p-3.5 rounded-2xl transition-all shadow-sm flex-shrink-0 text-left ${isSubstitute ? 'bg-emerald-600 text-white shadow-emerald-300/30' : 'bg-slate-100 text-slate-400'}`}><Users size={20} /></div>
                   <div className="flex-1 min-w-0 text-left leading-tight text-left">
                      <label className="text-sm font-black text-slate-800 block truncate uppercase tracking-tighter text-left font-bold">Báo cáo cạo thay</label>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight italic opacity-70 truncate text-left font-medium">
                        {!selectedFarm ? 'Vui lòng chọn nông trường trước' : 'Dành cho nhân sự hỗ trợ thực địa'}
                      </p>
                   </div>
                </div>
                <div className={`relative inline-flex h-7 w-12 flex-shrink-0 rounded-full border-2 border-transparent transition-all duration-300 ${isSubstitute ? 'bg-emerald-600' : 'bg-slate-300'}`}>
                  <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${isSubstitute ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
              </div>

              {isSubstitute && (
                <div className="px-6 pb-8 animate-in fade-in slide-in-from-top-4 duration-500 text-left">
                  <div className="h-px bg-emerald-200/50 w-full mb-6 text-left"></div>
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

            <button type="submit" disabled={!selectedFarm || !selectedWorker} className={`w-full text-white font-black py-6 px-6 rounded-[2rem] shadow-2xl flex items-center justify-center transition-all active:scale-95 uppercase tracking-[0.3em] text-sm group relative overflow-hidden text-left ${!selectedFarm || !selectedWorker ? 'bg-slate-300 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'}`}>
               <div className="flex items-center text-white italic font-black text-left">
                  <Save className="w-5 h-5 mr-3 group-hover:scale-125 transition-transform" /> {isOnline ? 'XÁC NHẬN & NỘP SỐ' : 'GHI TẠM (NGOẠI TUYẾN)'}
               </div>
            </button>
          </form>

          <footer className="mt-20 text-center pb-12 border-t border-slate-100 pt-10 text-left">
             <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest italic text-center leading-relaxed font-bold">Solution by Consultant: Luân - Base.vn <br/> VRG Official Production v5.1</p>
          </footer>
        </main>
      </div>
    </div>
  );
}
