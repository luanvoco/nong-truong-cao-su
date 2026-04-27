import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  MapPin,
  User,
  Users,
  Droplet,
  Package,
  Layers,
  GitCommit,
  Save,
  History,
  Check,
  AlertCircle,
  ChevronDown,
  Search,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

// Dữ liệu danh mục tự động tạo
const FARMS = Array.from({ length: 35 }, (_, i) => `NT${i + 1}`);

// Component Dropdown có tích hợp Search
const SearchableSelect = ({
  options,
  value,
  onChange,
  placeholder,
  icon: Icon,
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative" ref={wrapperRef}>
      <div
        className={`flex items-center w-full pl-10 pr-3 py-3 border rounded-xl transition-all shadow-sm ${
          disabled
            ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-white border-gray-300 text-gray-800 cursor-pointer hover:border-emerald-500 active:ring-2 active:ring-emerald-200"
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-emerald-600" />
        </div>
        <span
          className={`flex-1 truncate text-base ${
            !value ? "text-gray-400" : "font-semibold"
          }`}
        >
          {value || placeholder}
        </span>
        <ChevronDown
          className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-[100] w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden">
          <div className="p-2 border-b border-gray-100 bg-gray-50 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>
          <ul className="max-h-60 overflow-y-auto py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <li
                  key={opt}
                  className={`px-4 py-3 hover:bg-emerald-50 cursor-pointer text-sm transition-colors border-b border-gray-50 last:border-0 ${
                    value === opt
                      ? "bg-emerald-50 text-emerald-700 font-bold"
                      : "text-gray-700 font-medium"
                  }`}
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                >
                  {opt}
                </li>
              ))
            ) : (
              <li className="px-4 py-4 text-sm text-gray-500 text-center italic">
                Không tìm thấy
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [selectedFarm, setSelectedFarm] = useState("");
  const [selectedWorker, setSelectedWorker] = useState("");
  const [latexWater, setLatexWater] = useState("");
  const [latexTap, setLatexTap] = useState("");
  const [latexDong, setLatexDong] = useState("");
  const [latexScrap, setLatexScrap] = useState("");
  const [isSubstitute, setIsSubstitute] = useState(false);
  const [substituteWorker, setSubstituteWorker] = useState("");
  const [records, setRecords] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInstallTip, setShowInstallTip] = useState(true);

  // Đảm bảo giao diện luôn đẹp bất kể môi trường deploy
  useEffect(() => {
    if (!document.getElementById("tailwind-script")) {
      const script = document.createElement("script");
      script.id = "tailwind-script";
      script.src = "https://cdn.tailwindcss.com";
      document.head.appendChild(script);
    }
  }, []);

  const workersInFarm = useMemo(() => {
    if (!selectedFarm) return [];
    return Array.from({ length: 60 }, (_, i) => `${selectedFarm}-${i + 1}`);
  }, [selectedFarm]);

  const handleFarmChange = (farmValue) => {
    setSelectedFarm(farmValue);
    setSelectedWorker("");
    setSubstituteWorker("");
    setIsSubstitute(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFarm || !selectedWorker) return;
    if (isSubstitute && !substituteWorker) return;

    setIsSubmitting(true);
    const newRecord = {
      id: Date.now(),
      farm: selectedFarm,
      worker: selectedWorker,
      water: latexWater || 0,
      tap: latexTap || 0,
      dong: latexDong || 0,
      scrap: latexScrap || 0,
      substituteWorker: isSubstitute ? substituteWorker : "Không",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    try {
      const SCRIPT_URL =
        "https://script.google.com/macros/s/AKfycbyLiyGtZI0eUE_9rLGnTlXefIQyt0to6tu3yasGW7wc0-UC4cFhr-Xu3-ECYgzcCoKW/exec";
      const payload = new URLSearchParams();
      payload.append("farm", newRecord.farm);
      payload.append("worker", newRecord.worker);
      payload.append("water", newRecord.water);
      payload.append("tap", newRecord.tap);
      payload.append("dong", newRecord.dong);
      payload.append("scrap", newRecord.scrap);
      payload.append("substitute_worker", newRecord.substituteWorker);
      payload.append("time", newRecord.time);

      await fetch(SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: payload,
        mode: "no-cors",
      });

      setRecords([newRecord, ...records]);
      setSelectedWorker("");
      setLatexWater("");
      setLatexTap("");
      setLatexDong("");
      setLatexScrap("");
      setIsSubstitute(false);
      setSubstituteWorker("");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      alert("Lỗi kết nối máy chủ!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex justify-center">
      <div className="w-full max-w-md bg-white min-h-screen shadow-xl relative overflow-hidden flex flex-col border-x border-gray-100">
        {/* Header - Branding Tin cậy */}
        <header className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-6 shadow-lg z-10 relative">
          <div className="absolute top-0 right-0 p-2 opacity-10">
            <Droplet size={80} />
          </div>
          <div className="flex items-center space-x-2 mb-1">
            <ShieldCheck className="text-emerald-300 w-4 h-4" />
            <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-200 italic">
              Hệ thống ghi nhận sản lượng - Lưu hành nội bộ
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight uppercase">
            Nông Trường Cao Su
          </h1>
          <p className="text-emerald-50 text-xs font-medium opacity-90 mt-1 flex items-center">
            Tư vấn bởi Business Consultant | Base.vn
          </p>
        </header>

        {/* PWA Tip - Giúp app "Đơn giản" như anh muốn */}
        {showInstallTip && (
          <div className="bg-blue-50 p-3 flex items-start space-x-3 border-b border-blue-100 animate-in slide-in-from-top duration-500">
            <Smartphone className="w-8 h-8 text-blue-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-blue-900 font-bold">
                Cài đặt biểu tượng ra màn hình!
              </p>
              <p className="text-[10px] text-blue-700">
                Nhấn nút <span className="font-bold underline">Chia sẻ</span>{" "}
                (hình vuông mũi tên lên) rồi chọn{" "}
                <span className="font-bold underline">"Thêm vào MH chính"</span>
                .
              </p>
            </div>
            <button
              onClick={() => setShowInstallTip(false)}
              className="text-blue-300"
            >
              ✕
            </button>
          </div>
        )}

        {/* Success Toast */}
        <div
          className={`absolute top-32 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-md border border-emerald-500 text-emerald-700 px-6 py-3 rounded-full flex items-center shadow-2xl transition-all duration-500 z-50 ${
            showSuccess
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-10 pointer-events-none"
          }`}
        >
          <Check className="w-5 h-5 mr-2" />
          <span className="font-bold text-sm">Gửi dữ liệu thành công!</span>
        </div>

        <main className="flex-1 overflow-y-auto p-5 pb-24">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Chọn lựa danh mục */}
            <div className="space-y-4">
              <div className="group">
                <label className="block text-[10px] font-black text-slate-400 mb-2 ml-1 uppercase tracking-widest">
                  Khu vực khai thác
                </label>
                <SearchableSelect
                  options={FARMS}
                  value={selectedFarm}
                  onChange={handleFarmChange}
                  placeholder="Chọn Nông trường"
                  icon={MapPin}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-2 ml-1 uppercase tracking-widest">
                  Nhân sự cạo mủ
                </label>
                <SearchableSelect
                  options={workersInFarm}
                  value={selectedWorker}
                  onChange={setSelectedWorker}
                  placeholder={
                    !selectedFarm
                      ? "Vui lòng chọn Nông trường..."
                      : "Tìm tên nhân sự"
                  }
                  icon={User}
                  disabled={!selectedFarm}
                />
              </div>
            </div>

            {/* 2. Nhập số liệu */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 shadow-inner">
              <h2 className="text-[10px] font-black text-slate-400 mb-4 flex items-center uppercase tracking-widest">
                <AlertCircle className="w-3 h-3 mr-1" /> Sản lượng thu hoạch
                thực tế (kg)
              </h2>

              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    id: "water",
                    label: "Mủ Nước",
                    icon: Droplet,
                    color: "text-blue-600",
                    state: latexWater,
                    setState: setLatexWater,
                  },
                  {
                    id: "tap",
                    label: "Mủ Tạp",
                    icon: Layers,
                    color: "text-amber-600",
                    state: latexTap,
                    setState: setLatexTap,
                  },
                  {
                    id: "dong",
                    label: "Mủ Đông",
                    icon: Package,
                    color: "text-indigo-600",
                    state: latexDong,
                    setState: setLatexDong,
                  },
                  {
                    id: "scrap",
                    label: "Mủ Dây",
                    icon: GitCommit,
                    color: "text-slate-500",
                    state: latexScrap,
                    setState: setLatexScrap,
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center group active:scale-95 transition-transform"
                  >
                    <item.icon className={`w-5 h-5 ${item.color} mb-1`} />
                    <span className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-tighter">
                      {item.label}
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.state}
                      onChange={(e) => item.setState(e.target.value)}
                      className="w-full text-xl font-black text-center text-slate-800 focus:outline-none border-b-2 border-transparent focus:border-emerald-500 transition-all placeholder-slate-200"
                      placeholder="0.0"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Logic Cạo thay */}
            <div
              className={`rounded-2xl border transition-all duration-300 ${
                isSubstitute
                  ? "bg-emerald-50 border-emerald-300 shadow-md"
                  : "bg-white border-slate-200 shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-lg transition-colors ${
                      isSubstitute
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    <Users size={20} />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-800">
                      Cạo thay cho người khác
                    </label>
                    <p className="text-[10px] text-slate-500">
                      Kích hoạt nếu nhân sự cạo hộ
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSubstitute(!isSubstitute)}
                  disabled={!selectedFarm}
                  className={`relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                    !selectedFarm ? "opacity-30" : ""
                  } ${isSubstitute ? "bg-emerald-600" : "bg-slate-300"}`}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition duration-200 ${
                      isSubstitute ? "translate-x-7" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {isSubstitute && (
                <div className="p-4 pt-0 animate-in fade-in duration-300">
                  <SearchableSelect
                    options={workersInFarm.filter((w) => w !== selectedWorker)}
                    value={substituteWorker}
                    onChange={setSubstituteWorker}
                    placeholder="Chọn nhân sự thay thế..."
                    icon={Users}
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !selectedFarm || !selectedWorker}
              className={`w-full text-white font-black py-4 px-4 rounded-2xl shadow-xl flex items-center justify-center transition-all active:scale-95 uppercase tracking-widest text-sm ${
                isSubmitting || !selectedFarm || !selectedWorker
                  ? "bg-slate-300"
                  : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
              }`}
            >
              {isSubmitting ? (
                "ĐANG ĐỒNG BỘ DỮ LIỆU..."
              ) : (
                <div className="flex items-center">
                  <Save className="w-5 h-5 mr-2" /> XÁC NHẬN & LƯU
                </div>
              )}
            </button>
          </form>

          <footer className="mt-8 text-center pb-8 border-t border-slate-100 pt-8">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-1">
              Base.vn Solutions
            </p>
            <p className="text-[9px] text-slate-400 font-medium">
              Bản quyền PoC thuộc về Business Consultant Luân
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
