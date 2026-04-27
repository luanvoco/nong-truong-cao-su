import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MapPin, User, Users, Droplet, Package, Layers, GitCommit, Save, History, Check, AlertCircle, ChevronDown, Search, ShieldCheck, Smartphone } from 'lucide-react';

// Danh mục 35 nông trường
const FARMS = Array.from({ length: 35 }, (_, i) => `NT${i + 1}`);

// Component Dropdown tích hợp tìm kiếm
const SearchableSelect = ({ options, value, onChange, placeholder, icon: Icon, disabled }) => {
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
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-emerald-600" />
        </div>
        <span className={`flex-1 truncate text-base font-medium ${!value ? 'text-gray-400' : 'text-slate-900'}`}>
          {value || placeholder}
        </span>
        <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-[100] w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="p-3 border-b border-gray-50 bg-slate-50 relative">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              placeholder="Gõ để tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>
          <ul className="max-h-72 overflow-y-auto py-2">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(opt => (
                <li
                  key={opt}
                  className={`px-6 py-3.5 hover:bg-emerald-50 cursor-pointer text-sm transition-colors flex items-center justify-between ${value === opt ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-700 font-medium'}`}
                  onClick={() => {
                     onChange(opt);
                     setIsOpen(false);
                     setSearchTerm('');
                  }}
                >
                  {opt}
                  {value === opt && <Check className="w-4 h-4 text-emerald-600" />}
                </li>
              ))
            ) : (
              <li className="px-6 py-8 text-sm text-gray-400 text-center italic">Không thấy dữ liệu</li>
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
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInstallTip, setShowInstallTip] = useState(true);

  // Khởi tạo Tailwind CSS
  useEffect(() => {
    if (!document.getElementById('tailwind-script')) {
      const script = document.createElement('script');
      script.id = 'tailwind-script';
      script.src = 'https://cdn.tailwindcss.com';
      document.head.appendChild(script);
    }
  }, []);

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
    e.preventDefault();
    if (!selectedFarm || !selectedWorker || isSubmitting) return;
    if (isSubstitute && !substituteWorker) return;

    setIsSubmitting(true);
    const timeStr = new Date().toLocaleString('vi-VN');

    try {
      const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyLiyGtZI0eUE_9rLGnTlXefIQyt0to6tu3yasGW7wc0-UC4cFhr-Xu3-ECYgzcCoKW/exec';
      const payload = new URLSearchParams();
      payload.append('farm', selectedFarm);
      payload.append('worker', selectedWorker);
      payload.append('water', latexWater || 0);
      payload.append('tap', latexTap || 0);
      payload.append('dong', latexDong || 0);
      payload.append('scrap', latexScrap || 0);
      payload.append('substitute_worker', isSubstitute ? substituteWorker : 'Không');
      payload.append('time', timeStr);

      await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: payload,
        mode: 'no-cors'
      });

      setSelectedWorker('');
      setLatexWater('');
      setLatexTap('');
      setLatexDong('');
      setLatexScrap('');
      setIsSubstitute(false);
      setSubstituteWorker('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
    } catch (error) {
      alert("Lỗi đồng bộ dữ liệu. Anh vui lòng kiểm tra lại kết nối!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex justify-center selection:bg-emerald-100">
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl relative overflow-hidden flex flex-col border-x border-slate-100">
        
        {/* Header - Thiết kế chuyên nghiệp cho Giải pháp đề xuất */}
        <header className="bg-gradient-to-br from-emerald-800 to-emerald-600 text-white p-8 pt-12 shadow-lg relative overflow-hidden">
          <div className="absolute -top-12 -right-12 opacity-10 rotate-12">
             <Droplet size={200} />
          </div>
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-2 bg-emerald-400/20 rounded-xl backdrop-blur-sm border border-emerald-400/30">
              <ShieldCheck className="text-emerald-200 w-4 h-4" />
            </div>
            <span className="text-[11px] uppercase tracking-[0.3em] font-bold text-emerald-100">Giải pháp đề xuất</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight leading-tight uppercase text-white">BÁO CÁO SẢN LƯỢNG <br/> TỪ NÔNG TRƯỜNG</h1>
          <p className="text-emerald-50 text-xs font-medium opacity-80 mt-3 flex items-center italic">
             Tư vấn bởi Business Consultant: Luân - Base.vn
          </p>
        </header>

        {/* PWA Tip */}
        {showInstallTip && (
          <div className="bg-slate-900 p-4 flex items-center space-x-4 text-white shadow-inner animate-in slide-in-from-top duration-700">
            <div className="bg-emerald-500 p-2.5 rounded-2xl animate-pulse shadow-lg shadow-emerald-500/20">
               <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-bold leading-tight">Cài đặt App vào điện thoại!</p>
              <p className="text-[10px] opacity-70 mt-1">
                Bấm <span className="text-emerald-400 font-bold underline px-1">Chia sẻ</span> {"\u2192"} chọn <span className="text-emerald-400 font-bold underline px-1">Thêm vào MH chính</span>.
              </p>
            </div>
            <button onClick={() => setShowInstallTip(false)} className="text-white/40 p-2">✕</button>
          </div>
        )}

        {/* Success Toast */}
        <div className={`fixed top-12 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-md border-2 border-emerald-500 text-emerald-800 px-8 py-4 rounded-3xl flex items-center shadow-2xl transition-all duration-500 z-[9999] ${showSuccess ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-10 scale-90 pointer-events-none'}`}>
          <div className="bg-emerald-500 text-white p-1 rounded-full mr-3">
             <Check className="w-4 h-4" />
          </div>
          <span className="font-black text-sm uppercase tracking-widest">Đã lưu thành công!</span>
        </div>

        <main className="flex-1 overflow-y-auto p-6 pb-32">
          <form onSubmit={handleSubmit} className="space-y-10">
            
            <section className="space-y-6">
              <div className="group">
                <label className="block text-[11px] font-black text-slate-400 mb-3 ml-1 uppercase tracking-[0.2em]">Khu vực nông trường</label>
                <SearchableSelect
                  options={FARMS}
                  value={selectedFarm}
                  onChange={handleFarmChange}
                  placeholder="Chọn đơn vị..."
                  icon={MapPin}
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-400 mb-3 ml-1 uppercase tracking-[0.2em]">Họ tên nhân sự</label>
                <SearchableSelect
                  options={workersInFarm}
                  value={selectedWorker}
                  onChange={setSelectedWorker}
                  placeholder={!selectedFarm ? 'Đang đợi chọn nông trường...' : 'Gõ tên hoặc số thẻ...'}
                  icon={User}
                  disabled={!selectedFarm}
                />
              </div>
            </section>

            <section className="bg-slate-50 rounded-[2.5rem] p-7 border-2 border-slate-100 shadow-sm relative">
              <h2 className="text-[11px] font-black text-slate-400 mb-6 flex items-center uppercase tracking-[0.2em]">
                <AlertCircle className="w-3.5 h-3.5 mr-2 text-emerald-600" /> Số lượng thực tế (Kg)
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'water', label: 'Mủ Nước', icon: Droplet, color: 'text-blue-600', state: latexWater, setState: setLatexWater, bg: 'bg-blue-50' },
                  { id: 'tap', label: 'Mủ Tạp', icon: Layers, color: 'text-orange-600', state: latexTap, setState: setLatexTap, bg: 'bg-orange-50' },
                  { id: 'dong', label: 'Mủ Đông', icon: Package, color: 'text-indigo-600', state: latexDong, setState: setLatexDong, bg: 'bg-indigo-50' },
                  { id: 'scrap', label: 'Mủ Dây', icon: GitCommit, color: 'text-slate-600', state: latexScrap, setState: setLatexScrap, bg: 'bg-slate-50' },
                ].map(item => (
                  <div key={item.id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center group active:scale-95 transition-all hover:border-emerald-500">
                    <div className={`p-3 rounded-2xl ${item.bg} mb-3 group-hover:scale-110 transition-transform`}>
                       <item.icon className={`w-6 h-6 ${item.color}`} />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 mb-3 uppercase tracking-tighter">{item.label}</span>
                    <input
                      type="number" step="0.01" min="0" value={item.state} onChange={(e) => item.setState(e.target.value)}
                      className="w-full text-2xl font-black text-center text-slate-900 focus:outline-none border-b-2 border-transparent focus:border-emerald-500 transition-all placeholder-slate-200 bg-transparent"
                      placeholder="0.0"
                    />
                  </div>
                ))}
              </div>
            </section>

            <section className={`rounded-[2.5rem] border-2 transition-all duration-300 shadow-sm ${isSubstitute ? 'bg-emerald-50 border-emerald-400 shadow-lg' : 'bg-white border-slate-100'}`}>
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center space-x-4">
                   <div className={`p-4 rounded-2xl transition-all shadow-sm ${isSubstitute ? 'bg-emerald-600 text-white shadow-emerald-300/30' : 'bg-slate-100 text-slate-400'}`}>
                      <Users size={24} />
                   </div>
                   <div>
                      <label className="text-sm font-black text-slate-800">Báo cáo cạo thay</label>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight italic opacity-70">Nhân sự hỗ trợ thu hoạch</p>
                   </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSubstitute(!isSubstitute)}
                  disabled={!selectedFarm}
                  className={`relative inline-flex h-9 w-18 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 ${!selectedFarm ? 'opacity-20' : ''} ${isSubstitute ? 'bg-emerald-600' : 'bg-slate-300'}`}
                >
                  <span className={`pointer-events-none inline-block h-8 w-8 transform rounded-full bg-white shadow-xl transition-transform duration-300 ${isSubstitute ? 'translate-x-9' : 'translate-x-0'}`} />
                </button>
              </div>

              {isSubstitute && (
                <div className="p-6 pt-0 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="h-px bg-emerald-200/50 w-full mb-5"></div>
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
              disabled={isSubmitting || !selectedFarm || !selectedWorker}
              className={`w-full text-white font-black py-6 px-6 rounded-[2rem] shadow-2xl flex items-center justify-center transition-all active:scale-95 uppercase tracking-[0.3em] text-sm group relative overflow-hidden ${isSubmitting || !selectedFarm || !selectedWorker ? 'bg-slate-300 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'}`}
            >
              {isSubmitting ? (
                 <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>ĐANG ĐỒNG BỘ...</span>
                 </div>
              ) : (
                 <div className="flex items-center text-white">
                    <Save className="w-5 h-5 mr-3 group-hover:scale-125 transition-transform" /> GỬI KẾT QUẢ {"\u0026"} LƯU
                 </div>
              )}
            </button>
          </form>

          <footer className="mt-20 text-center pb-12 border-t border-slate-100 pt-10">
             <div className="flex justify-center items-center space-x-4 text-slate-200 mb-4">
                <div className="h-px w-10 bg-slate-200"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.5em]">Giải pháp đề xuất</span>
                <div className="h-px w-10 bg-slate-200"></div>
             </div>
             <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest">Tư vấn giải pháp: Luân - Base.vn</p>
             <p className="text-[9px] text-slate-300 mt-2 font-medium italic">PoC (Proof of Concept) - Lưu hành demo khách hàng</p>
          </footer>
        </main>
      </div>
    </div>
  );
}
