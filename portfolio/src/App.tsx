import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, collection } from 'firebase/firestore';

// ---------------------------------------------------------
// 🚀 Firebase 설정 (Vercel 배포 시 이곳을 본인의 Firebase 설정으로 채우세요)
// ---------------------------------------------------------
// App.tsx 파일 상단
const myFirebaseConfig = {
  apiKey: "AIzaSyDN5mBfnVniX8wf0c2oYJ8U6rE5h2g_S9o",
  authDomain: "asdf-bd632.firebaseapp.com",
  projectId: "asdf-bd632",
  storageBucket: "asdf-bd632.firebasestorage.app",
  messagingSenderId: "666662281772",
  appId: "1:666662281772:web:b7765869a6b2d3ab4aa789",
  measurementId: "G-VQ18KZN2KV"
};

// Canvas 환경과 Vercel 배포 환경 호환 처리
declare const __firebase_config: string | undefined;
declare const __app_id: string | undefined;
declare const __initial_auth_token: string | undefined;

const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : myFirebaseConfig;
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'elisa-portfolio';

// ---------------------------------------------------------
// 1. Global Styles
// ---------------------------------------------------------
const GlobalStyles = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@300;700;800;900&family=Gaegu:wght@400&family=Pretendard:wght@300;400;600;800&display=swap');

    body {
      background-color: #f9f9f4;
      background-image: 
        linear-gradient(rgba(164, 190, 123, 0.08) 1px, transparent 1px), 
        linear-gradient(90deg, rgba(164, 190, 123, 0.08) 1px, transparent 1px);
      background-size: 30px 30px;
      color: #4e443f;
      font-family: 'Pretendard', sans-serif;
      line-height: 1.6;
    }

    .serif { font-family: 'Noto Serif KR', serif; }
    .handwriting { font-family: 'Gaegu', cursive; }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in { animation: fadeIn 0.6s ease forwards; }

    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #a4be7b; border-radius: 10px; }
  ` }} />
);

// ---------------------------------------------------------
// 기본 데이터 구조 정의 (Firebase에 저장될 형식)
// ---------------------------------------------------------
const defaultData = {
  texts: {
    headerTitle: "Elisa's Portfolio",
    headerSubtitle: "“달을 향해 쏘아라. 그러면 별에 닿을 것이다.”",
    aboutMbti: "INFP",
    aboutHobby: "드라마 시청과 여행을 좋아합니다.",
    aboutRecent: "혼자 혹은 가족, 지인들과 여행을 다녀오거나 여행 계획을 세우는 데 가장 많은 시간을 보냈습니다.",
    aboutFlow: "가고 싶은 나라들의 여행 계획을 세우고 직접 실천하는 일입니다. 여행 일정을 짜다 보면 시간 가는 줄 모를 정도로 몰입하게 됩니다.",
    aboutTough: "국내외를 여행하며 새로운 장소와 사람들을 경험하는 것입니다.",
    valuesRank: "중요 가치 순위: 1. 보수 | 2. 안정성 | 3. 사회적 인정",
    valuesDesc: "경제적으로 안정된 삶을 살고 싶고, 내가 하는 일에 대해 사회적으로 인정받고 싶기 때문입니다. 또한 오래도록 꾸준히 일할 수 있는 안정적인 환경 역시 중요하게 생각합니다.",
    dreamTitle: "국제개발협력 전문가",
    dreamPro: "다양한 국가와 사람들을 직접 만나며 사회에 긍정적인 변화를 만들어낼 수 있다는 점이 매력적입니다.",
    dreamCon: "많은 인턴 경험과 석사 과정 등 긴 준비 과정이 필요하다는 점은 현실적인 부담으로 느껴집니다.",
    bucket1Title: "겨울의 동유럽에서 크리스마스 마켓 구경하기",
    bucket1Habit: "→ 습관: 여행 정보를 꾸준히 찾아보고 여행 경비 모으기",
    bucket2Title: "서울에서 한강이 보이는 집 마련하기",
    bucket2Habit: "→ 습관: 소비 습관을 기록하며 경제적 계획 세우기",
    bucket3Title: "친구들과 함께 크루즈 여행 떠나기",
    bucket3Habit: "→ 습관: 오래 연락할 수 있도록 인간관계 꾸준히 이어가기"
  },
  images: {
    header: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1600",
    about: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500",
    dream1: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=600",
    dream2: "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=600",
    dream3: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=600",
    bucket1: "https://images.unsplash.com/photo-1544413647-ad348003f5ec?auto=format&fit=crop&w=1000",
    bucket2: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000",
    bucket3: "https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=1000",
  }
};

type PortfolioData = typeof defaultData;
type ViewType = 'ABOUT' | 'VALUES' | 'DREAM' | 'BUCKET';

// ---------------------------------------------------------
// 메인 App 컴포넌트
// ---------------------------------------------------------
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<PortfolioData>(defaultData);
  const [view, setView] = useState<ViewType>('ABOUT');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Firebase Auth 초기화
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth error", err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // Firebase 실시간 데이터 구독
  useEffect(() => {
    if (!user) return;
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'portfolio', 'mainData');
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        setData(snapshot.data() as PortfolioData);
      }
    }, (error) => console.error("Snapshot error:", error));
    
    return () => unsubscribe();
  }, [user]);

  // 스크롤 이벤트
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 데이터 변경 핸들러
  const updateText = (key: keyof typeof defaultData.texts, value: string) => {
    setData(prev => ({ ...prev, texts: { ...prev.texts, [key]: value } }));
  };

  const updateImage = (key: keyof typeof defaultData.images, url: string) => {
    setData(prev => ({ ...prev, images: { ...prev.images, [key]: url } }));
  };

  // Firebase에 저장
  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'portfolio', 'mainData');
      await setDoc(docRef, data);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("저장에 실패했습니다."); // 로컬/Vercel 용 에러 표시
    }
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen relative">
      <GlobalStyles />

      {/* Dynamic Header */}
      <header 
        className={`fixed top-0 w-full z-40 transition-all duration-500 overflow-hidden ${
          isScrolled ? 'h-[70px] bg-white/98 shadow-sm' : 'h-[400px] bg-[#333]'
        }`}
      >
        <div 
          className={`absolute inset-0 transition-opacity duration-500 pointer-events-none ${isScrolled ? 'opacity-0' : 'opacity-100'}`}
          style={{ backgroundImage: `url('${data.images.header}')`, backgroundPosition: 'center', backgroundSize: 'cover' }}
        >
          <div className="absolute inset-0 bg-black/30 z-10" />
        </div>

        <div className={`relative z-20 w-full h-full flex transition-all duration-500 ${
          isScrolled ? 'flex-row items-center justify-between px-5 md:px-[50px]' : 'flex-col items-center justify-center'
        }`}>
          <div className={`transition-all duration-500 ${isScrolled ? 'text-[1.2rem] text-[#8d7b68]' : 'text-[2.8rem] text-white drop-shadow-md'} font-bold serif text-center`}>
            <EditableText value={data.texts.headerTitle} onChange={v => updateText('headerTitle', v)} isEditing={isEditing} />
          </div>

          <nav className={`flex flex-wrap justify-center gap-[10px] md:gap-[15px] transition-all duration-500 ${isScrolled ? 'mt-0' : 'mt-[30px]'}`}>
            <TabButton label="About Me" active={view === 'ABOUT'} onClick={() => setView('ABOUT')} scrolled={isScrolled} />
            <TabButton label="My Values" active={view === 'VALUES'} onClick={() => setView('VALUES')} scrolled={isScrolled} />
            <TabButton label="My Dream" active={view === 'DREAM'} onClick={() => setView('DREAM')} scrolled={isScrolled} />
            <TabButton label="Bucket List" active={view === 'BUCKET'} onClick={() => setView('BUCKET')} scrolled={isScrolled} />
          </nav>

          {!isScrolled && isEditing && (
            <PhotoUploadButton onUpload={(url) => updateImage('header', url)} className="bottom-[20px] right-[20px] w-[45px] h-[45px]" />
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-[450px] pb-[50px] max-w-[900px] mx-auto px-5">
        {view === 'ABOUT' && <AboutView texts={data.texts} img={data.images.about} isEditing={isEditing} updateText={updateText} onUpload={url => updateImage('about', url)} />}
        {view === 'VALUES' && <ValuesView texts={data.texts} isEditing={isEditing} updateText={updateText} />}
        {view === 'DREAM' && <DreamView texts={data.texts} imgs={[data.images.dream1, data.images.dream2, data.images.dream3]} isEditing={isEditing} updateText={updateText} onUpload={(k, url) => updateImage(k as any, url)} />}
        {view === 'BUCKET' && <BucketView texts={data.texts} imgs={[data.images.bucket1, data.images.bucket2, data.images.bucket3]} isEditing={isEditing} updateText={updateText} onUpload={(k, url) => updateImage(k as any, url)} />}
      </main>

      {/* Footer */}
      <footer className="bg-[#333] text-[#eee] text-center py-[100px] mt-[50px]">
        <p className="serif text-[1.5rem]">“이 영화의 모든 순간은 진심이었다.”</p>
        <div className="mt-[15px] text-yellow-400 opacity-70 flex justify-center gap-1 text-sm">
          <span>★</span><span>★</span><span>★</span>
        </div>
      </footer>

      {/* 편집 모드 플로팅 버튼 */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {isEditing ? (
          <>
            <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full shadow-lg font-bold transition-all">
              {isSaving ? "저장 중..." : "💾 저장하기"}
            </button>
            <button onClick={() => setIsEditing(false)} className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-full shadow-lg font-bold transition-all">
              취소
            </button>
          </>
        ) : (
          <button onClick={() => setIsEditing(true)} className="bg-white/90 backdrop-blur border border-gray-200 hover:bg-white text-[#8d7b68] px-6 py-3 rounded-full shadow-[0_5px_15px_rgba(0,0,0,0.1)] font-bold transition-all flex items-center gap-2">
            <span>✏️</span> 편집 모드
          </button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// 공통 컴포넌트
// ---------------------------------------------------------

function TabButton({ label, active, onClick, scrolled }: { label: string, active: boolean, onClick: () => void, scrolled: boolean }) {
  return (
    <button onClick={onClick} className={`text-[0.9rem] px-[16px] py-[6px] rounded-[20px] transition-all duration-300 ${
      active ? 'bg-[#a4be7b] text-white shadow-sm' : scrolled ? 'text-[#666] bg-[#eee] hover:bg-gray-200' : 'bg-white/20 border border-white/30 text-white hover:bg-white/30'
    }`}>
      {label}
    </button>
  );
}

function EditableText({ value, onChange, isEditing, isTextarea = false }: { value: string, onChange: (v: string) => void, isEditing: boolean, isTextarea?: boolean }) {
  if (!isEditing) return <>{value.split('\n').map((line, i) => <React.Fragment key={i}>{line}<br/></React.Fragment>)}</>;
  
  if (isTextarea) {
    return <textarea className="w-full bg-yellow-50/50 border border-yellow-200 rounded p-2 text-inherit" rows={3} value={value} onChange={e => onChange(e.target.value)} />;
  }
  return <input className="w-full bg-yellow-50/50 border border-yellow-200 rounded p-1 text-inherit" value={value} onChange={e => onChange(e.target.value)} />;
}

// 이미지 용량 축소를 위한 함수 (Base64로 변환 시 크기 조절)
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        const scale = img.width > MAX_WIDTH ? MAX_WIDTH / img.width : 1;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.6)); // 60% 퀄리티 압축
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

function PhotoUploadButton({ onUpload, className = "bottom-[8px] right-[8px] w-[30px] h-[30px]" }: { onUpload: (url: string) => void, className?: string }) {
  return (
    <label className={`absolute ${className} bg-white rounded-full flex items-center justify-center cursor-pointer shadow-[0_2px_5px_rgba(0,0,0,0.2)] hover:scale-105 z-10 transition-all border border-gray-100`}>
      <span className="text-lg">📷</span>
      <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
        const file = e.target.files?.[0];
        if (file) {
          const compressedDataUrl = await compressImage(file);
          onUpload(compressedDataUrl);
        }
      }} />
    </label>
  );
}

function QABox({ q, a }: { q: string, a: React.ReactNode }) {
  return (
    <div className="mb-[30px] border-b border-dashed border-[#ddd] pb-[15px] last:border-0 last:mb-0 last:pb-0">
      <span className="text-[#a4be7b] font-bold text-[1.1rem] mb-[8px] block">Q. {q}</span>
      <div className="text-[1.2rem] text-[#4e443f] leading-[1.4]">{a}</div>
    </div>
  );
}

// ---------------------------------------------------------
// View Components
// ---------------------------------------------------------

function AboutView({ texts, img, isEditing, updateText, onUpload }: any) {
  return (
    <div className="bg-white rounded-[25px] p-[40px] shadow-sm mb-[30px] border border-black/5 animate-fade-in">
      <h2 className="serif text-[2rem] mb-[10px]">About Me</h2>
      <p className="handwriting text-[1.3rem] text-[#8d7b68] mb-[40px]">
        <EditableText value={texts.headerSubtitle} onChange={v => updateText('headerSubtitle', v)} isEditing={isEditing} />
      </p>
      
      <div className="flex flex-col-reverse md:flex-row gap-[30px] items-start">
        <div className="flex-[2] w-full">
          <QABox q="당신의 MBTI는 무엇인가요?" a={<EditableText value={texts.aboutMbti} onChange={v => updateText('aboutMbti', v)} isEditing={isEditing} />} />
          <QABox q="좋아하는 활동은 무엇인가요?" a={<EditableText value={texts.aboutHobby} onChange={v => updateText('aboutHobby', v)} isEditing={isEditing} isTextarea />} />
          <QABox q="최근 일주일 동안 가장 많은 시간을 쓴 활동은?" a={<EditableText value={texts.aboutRecent} onChange={v => updateText('aboutRecent', v)} isEditing={isEditing} isTextarea />} />
          <QABox q="시간 가는 줄 모르고 몰입하는 활동은?" a={<EditableText value={texts.aboutFlow} onChange={v => updateText('aboutFlow', v)} isEditing={isEditing} isTextarea />} />
          <QABox q="힘들어도 계속할 수 있을 것만 같은 활동은?" a={<EditableText value={texts.aboutTough} onChange={v => updateText('aboutTough', v)} isEditing={isEditing} isTextarea />} />
        </div>

        <div className="flex-[0.8] w-full flex justify-center md:justify-end">
          <div className="bg-white p-[10px] pb-[30px] shadow-md transform rotate-1 relative max-w-[280px] w-full">
            <div className="relative w-full h-[250px] bg-[#eee] overflow-hidden">
              <img src={img} alt="Me" className="w-full h-full object-cover" />
              {isEditing && <PhotoUploadButton onUpload={onUpload} />}
            </div>
            <p className="handwriting text-center mt-[10px] text-[#888] text-[1.1rem]">Me, Elisa</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ValuesView({ texts, isEditing, updateText }: any) {
  const values = [ ["안정성", "보수", "일과 삶의 균형"], ["즐거움", "소속감", "자기계발"], ["도전성", "영향력", "사회적 기여"], ["성취", "사회적 인정", "자율성"] ];

  return (
    <div className="bg-white rounded-[25px] p-[40px] shadow-sm mb-[30px] border border-black/5 animate-fade-in">
      <h2 className="serif text-[2rem] mb-[25px]">My Values</h2>
      <div className="text-[#8d7b68] font-bold text-[1.1rem] mb-[15px]">
        <EditableText value={texts.valuesRank} onChange={v => updateText('valuesRank', v)} isEditing={isEditing} />
      </div>
      <p className="text-[1.2rem] text-[#4e443f] leading-[1.4] mb-[30px]">
        <EditableText value={texts.valuesDesc} onChange={v => updateText('valuesDesc', v)} isEditing={isEditing} isTextarea />
      </p>
      
      <span className="text-[#a4be7b] font-bold text-[1.1rem] block mb-[10px]">가치 목록 탐색</span>
      <table className="w-full border-collapse mt-[10px] text-[0.9rem]">
        <tbody>
          {values.map((row, i) => (
            <tr key={i}>
              {row.map(val => (
                <td key={val} className="border border-[#eee] p-[10px] text-center text-[#888] hover:bg-gray-50 transition-colors">{val}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DreamView({ texts, imgs, isEditing, updateText, onUpload }: any) {
  const keys = ['dream1', 'dream2', 'dream3'];

  return (
    <div className="animate-fade-in">
      <div className="bg-white rounded-[25px] p-[40px] shadow-sm mb-[30px] border border-black/5">
        <h2 className="serif text-[2rem] mb-[20px]">My Dream</h2>
        <p className="font-bold text-[1.3rem] mb-[20px] text-[#4e443f]">
          <EditableText value={texts.dreamTitle} onChange={v => updateText('dreamTitle', v)} isEditing={isEditing} />
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[15px] my-[20px]">
          {[0, 1, 2].map((i) => (
            <div key={i} className="relative h-[200px] rounded-[15px] overflow-hidden bg-[#eee]">
              <img src={imgs[i]} className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.03]" />
              {isEditing && <PhotoUploadButton onUpload={(url) => onUpload(keys[i], url)} />}
            </div>
          ))}
        </div>

        <div className="mt-[30px]">
          <QABox q="이 직업의 멋진 점" a={<EditableText value={texts.dreamPro} onChange={v => updateText('dreamPro', v)} isEditing={isEditing} isTextarea />} />
          <QABox q="현실적인 어려움" a={<EditableText value={texts.dreamCon} onChange={v => updateText('dreamCon', v)} isEditing={isEditing} isTextarea />} />
        </div>
        
        <div className="mt-[20px] bg-[#fdfcf7] p-[25px] rounded-[15px] border border-[#f9f9f9]">
          <h3 className="serif text-[1.2rem] mb-[15px]">Dream Fit Analysis</h3>
          <ul className="list-none p-0 m-0 space-y-2">
            <li className="flex justify-between border-b border-[#f9f9f9] pb-2"><span className="font-medium">여행과 해외 경험에 대한 관심</span><span className="font-semibold text-[#a4be7b]">잘 맞음</span></li>
            <li className="flex justify-between border-b border-[#f9f9f9] pb-2"><span className="font-medium">사람과 사회에 대한 관심</span><span className="font-semibold text-[#a4be7b]">잘 맞음</span></li>
            <li className="flex justify-between border-b border-[#f9f9f9] pb-2"><span className="font-medium">안정성과 보수를 중시하는 가치관</span><span className="font-semibold text-[#e67e22]">현실적 고민 필요</span></li>
            <li className="flex justify-between border-b border-[#f9f9f9] pb-2"><span className="font-medium">긴 준비 과정과 학업 부담</span><span className="font-semibold text-[#e67e22]">노력과 계획 필요</span></li>
          </ul>
          <p className="mt-[35px] text-center font-['Noto_Serif_KR'] font-black text-[1.35rem] text-[#2c3e50] leading-[1.7] break-keep tracking-[-0.5px]">
            “이 꿈은 나의 관심사와 잘 맞는 부분이 많지만,<br/>현실적인 준비 과정과 가치관의 균형을 고민해볼 필요가 있다.”
          </p>
        </div>
      </div>

      {/* SWOT Analysis */}
      <div className="mt-[50px]">
        <h3 className="serif text-center mb-[20px] text-[1.4rem]">나의 성장 로드맵 (SWOT)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
          <div className="bg-[#fff9e6] border border-[#f9ebc8] p-[25px] rounded-[20px] shadow-sm">
            <div className="text-[1.8rem] mb-[10px] opacity-80">✨</div>
            <h4 className="serif font-extrabold text-[1.15rem] text-[#d4a017] mb-[12px]">Strengths</h4>
            <ul className="space-y-[8px] text-[0.9rem] text-[#4e443f]"><li>• 영어를 잘한다.</li><li>• 새로운 환경에 잘 적응한다.</li><li>• 무엇이든 일단 시도하는 태도</li></ul>
          </div>
          <div className="bg-[#fcf0f0] border border-[#f5e1e1] p-[25px] rounded-[20px] shadow-sm">
            <div className="text-[1.8rem] mb-[10px] opacity-80">🌿</div>
            <h4 className="serif font-extrabold text-[1.15rem] text-[#d68a8a] mb-[12px]">Weaknesses</h4>
            <ul className="space-y-[8px] text-[0.9rem] text-[#4e443f]"><li>• 일을 미루면 나태해지는 경향</li><li>• 중요한 순간에 부족한 의지</li><li>• 타인과 비교하며 느끼는 조급함</li></ul>
          </div>
          <div className="bg-[#f0f7f4] border border-[#e1ede6] p-[25px] rounded-[20px] shadow-sm">
            <div className="text-[1.8rem] mb-[10px] opacity-80">🌈</div>
            <h4 className="serif font-extrabold text-[1.15rem] text-[#7ba48d] mb-[12px]">Opportunities</h4>
            <ul className="space-y-[8px] text-[0.9rem] text-[#4e443f]"><li>• 새로운 환경의 배움</li><li>• 꿈과 연결된 대외활동</li><li>• 나를 지지해주는 든든한 조력자들</li></ul>
          </div>
          <div className="bg-[#f5f2f0] border border-[#e8e3df] p-[25px] rounded-[20px] shadow-sm">
            <div className="text-[1.8rem] mb-[10px] opacity-80">🌊</div>
            <h4 className="serif font-extrabold text-[1.15rem] text-[#8d7b68] mb-[12px]">Threats</h4>
            <ul className="space-y-[8px] text-[0.9rem] text-[#4e443f]"><li>• 치열해지는 ODA 경쟁 시장</li><li>• 풍부한 경험을 가진 준비된 경쟁자들</li></ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function BucketView({ texts, imgs, isEditing, updateText, onUpload }: any) {
  const slides = [
    { key: 'bucket1', img: imgs[0], title: texts.bucket1Title, habit: texts.bucket1Habit, textKey: 'bucket1Title', habitKey: 'bucket1Habit' },
    { key: 'bucket2', img: imgs[1], title: texts.bucket2Title, habit: texts.bucket2Habit, textKey: 'bucket2Title', habitKey: 'bucket2Habit' },
    { key: 'bucket3', img: imgs[2], title: texts.bucket3Title, habit: texts.bucket3Habit, textKey: 'bucket3Title', habitKey: 'bucket3Habit' }
  ];
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  return (
    <div className="bg-white rounded-[25px] p-[40px] shadow-sm mb-[30px] border border-black/5 animate-fade-in">
      <h2 className="serif text-[2rem] mb-[30px]">Bucket List</h2>
      
      {/* Carousel */}
      <div className="relative w-full h-[350px] rounded-[20px] overflow-hidden shadow-sm mb-[25px] bg-[#eee]">
        <img src={slides[currentSlide].img} alt="bucket slide" className="w-full h-full object-cover" />
        <div className="absolute bottom-0 w-full bg-black/40 text-white p-[15px] handwriting text-[1.4rem] text-center">
          {slides[currentSlide].title}
        </div>
        
        {isEditing && <PhotoUploadButton onUpload={(url) => onUpload(slides[currentSlide].key, url)} className="bottom-[70px] right-[15px]" />}

        <button onClick={prevSlide} className="absolute left-[10px] top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-800 w-[40px] h-[40px] rounded-full flex items-center justify-center shadow-sm">❮</button>
        <button onClick={nextSlide} className="absolute right-[10px] top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-800 w-[40px] h-[40px] rounded-full flex items-center justify-center shadow-sm">❯</button>
      </div>

      <div>
        {slides.map((s) => (
          <QABox 
            key={s.key} 
            q={<EditableText value={s.title} onChange={v => updateText(s.textKey, v)} isEditing={isEditing} />} 
            a={<span className="text-[1rem] italic text-[#888]"><EditableText value={s.habit} onChange={v => updateText(s.habitKey, v)} isEditing={isEditing} /></span>} 
          />
        ))}
      </div>

      <div className="mt-[40px] bg-[#fffef0] p-[25px] rounded-[20px] text-center border border-[#f5f4e6]">
        <span className="text-[#a4be7b] font-bold text-[1.1rem] block mb-[8px]">Future Question: 10년 후의 나에게</span>
        <p className="handwriting text-[2.2rem] text-[#4e443f]">“지금, 행복한가요?”</p>
      </div>
    </div>
  );
}