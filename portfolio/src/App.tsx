import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth'; // 타입 전용 임포트 준수 (TS1484 에러 해결)
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

/**
 * 🚀 Firebase 설정
 */
const myFirebaseConfig = {
  apiKey: "AIzaSyDN5mBfnVniX8wf0c2oYJ8U6rE5h2g_S9o",
  authDomain: "asdf-bd632.firebaseapp.com",
  projectId: "asdf-bd632",
  storageBucket: "asdf-bd632.firebasestorage.app",
  messagingSenderId: "666662281772",
  appId: "1:666662281772:web:b7765869a6b2d3ab4aa789",
  measurementId: "G-VQ18KZN2KV"
};

declare const __firebase_config: string | undefined;
declare const __app_id: string | undefined;
declare const __initial_auth_token: string | undefined;

const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : myFirebaseConfig;
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const rawAppId = typeof __app_id !== 'undefined' ? __app_id : 'elisa-portfolio';
const appId = rawAppId.replace(/\//g, '_'); 

const GlobalStyles = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@300;700;800;900&family=Gaegu&family=Pretendard:wght@300;400;600;800&display=swap');
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
    ::-webkit-scrollbar-thumb { background: #a4be7b; border-radius: 10px; }
  ` }} />
);

const defaultData = {
  texts: {
    headerTitle: "Elisa's Portfolio",
    headerSubtitle: "“달을 향해 쏘아라. 그러면 별에 닿을 것이다.”",
    aboutMbti: "INFP",
    aboutHobby: "드라마 시청과 여행을 좋아합니다.",
    aboutFlow: "가고 싶은 나라들의 여행 계획을 세우고 직접 실천하는 일입니다.",
    valuesRank: "1. 보수 | 2. 안정성 | 3. 사회적 인정",
    valuesDesc: "경제적으로 안정된 삶을 살고 싶고, 내가 하는 일에 대해 사회적으로 인정받고 싶기 때문입니다.",
    dreamTitle: "국제개발협력 전문가",
    dreamPro: "사회에 긍정적인 변화를 만들어낼 수 있다는 점이 매력적입니다.",
    dreamCon: "긴 준비 과정이 필요하다는 점은 현실적인 부담으로 느껴집니다.",
    bucket1Title: "겨울의 동유럽 크리스마스 마켓",
    bucket1Habit: "여행 경비 모으기",
    bucket2Title: "한강 뷰 보금자리",
    bucket2Habit: "경제적 계획 세우기",
    bucket3Title: "친구들과 크루즈 여행",
    bucket3Habit: "인간관계 꾸준히 이어가기"
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

type ViewType = 'ABOUT' | 'VALUES' | 'DREAM' | 'BUCKET';

// 엄격한 타입 지정을 위한 Key 타입 추출 (TS 인덱싱 에러 방어)
export type TextKeys = keyof typeof defaultData.texts;
export type ImageKeys = keyof typeof defaultData.images;

interface SectionProps {
  data: typeof defaultData;
  isEditing: boolean;
  updateText: (key: TextKeys, value: string) => void;
  updateImage: (key: ImageKeys, url: string) => void;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState(defaultData);
  const [view, setView] = useState<ViewType>('ABOUT');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) { console.error("Firebase Auth Error:", err); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'portfolio', 'mainData');
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const fetchedData = snapshot.data();
        setData(prev => ({
          texts: { ...prev.texts, ...(fetchedData.texts || {}) },
          images: { ...prev.images, ...(fetchedData.images || {}) }
        }));
      }
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const updateText = (key: TextKeys, value: string) => {
    setData(prev => ({ ...prev, texts: { ...prev.texts, [key]: value } }));
  };

  const updateImage = (key: ImageKeys, url: string) => {
    setData(prev => ({ ...prev, images: { ...prev.images, [key]: url } }));
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'portfolio', 'mainData');
      await setDoc(docRef, data);
      setIsEditing(false);
    } catch (err) { alert("저장에 실패했습니다. Firebase 설정을 확인해주세요."); }
  };

  return (
    <div className="min-h-screen relative">
      <GlobalStyles />
      <header className={`fixed top-0 w-full z-40 transition-all duration-500 overflow-hidden ${isScrolled ? 'h-[70px] bg-white shadow-md' : 'h-[400px] bg-[#333]'}`}>
        <div className={`absolute inset-0 transition-opacity duration-500 ${isScrolled ? 'opacity-0' : 'opacity-100'}`} style={{ backgroundImage: `url('${data.images.header || ''}')`, backgroundPosition: 'center', backgroundSize: 'cover' }}>
          <div className="absolute inset-0 bg-black/30 z-10" />
        </div>
        <div className={`relative z-20 w-full h-full flex transition-all duration-500 ${isScrolled ? 'flex-row items-center justify-between px-10' : 'flex-col items-center justify-center'}`}>
          <h1 className={`serif font-bold ${isScrolled ? 'text-xl text-[#8d7b68]' : 'text-5xl text-white text-center'}`}>
            <EditableText value={data.texts.headerTitle} onChange={(v: string) => updateText('headerTitle', v)} isEditing={isEditing} />
          </h1>
          <nav className={`flex gap-4 ${isScrolled ? 'mt-0' : 'mt-8'}`}>
            {(['ABOUT', 'VALUES', 'DREAM', 'BUCKET'] as ViewType[]).map((v) => (
              <TabButton key={v} label={v} active={view === v} onClick={() => setView(v)} scrolled={isScrolled} />
            ))}
          </nav>
        </div>
      </header>

      <main className="pt-[450px] pb-20 max-w-[900px] mx-auto px-5">
        <div className="bg-white rounded-[25px] p-10 shadow-sm animate-fade-in border border-black/5 min-h-[400px]">
          {view === 'ABOUT' && <AboutSection data={data} isEditing={isEditing} updateText={updateText} updateImage={updateImage} />}
          {view === 'VALUES' && <ValuesSection data={data} isEditing={isEditing} updateText={updateText} updateImage={updateImage} />}
          {view === 'DREAM' && <DreamSection data={data} isEditing={isEditing} updateText={updateText} updateImage={updateImage} />}
          {view === 'BUCKET' && <BucketSection data={data} isEditing={isEditing} updateText={updateText} updateImage={updateImage} />}
        </div>
      </main>

      <div className="fixed bottom-6 right-6 z-50 flex gap-2">
        {isEditing ? (
          <button onClick={handleSave} className="bg-[#a4be7b] text-white px-8 py-3 rounded-full shadow-lg font-bold hover:scale-105 transition-all">💾 저장하기</button>
        ) : (
          <button onClick={() => setIsEditing(true)} className="bg-white text-[#8d7b68] px-8 py-3 rounded-full shadow-lg font-bold border border-gray-100 hover:scale-105 transition-all">✏️ 편집 모드</button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// UI Components
// ---------------------------------------------------------

function TabButton({ label, active, onClick, scrolled }: { label: string, active: boolean, onClick: () => void, scrolled: boolean }) {
  return (
    <button onClick={onClick} className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
      active ? 'bg-[#a4be7b] text-white' : scrolled ? 'text-gray-500 hover:bg-gray-100' : 'text-white border border-white/30 hover:bg-white/10'
    }`}>{label}</button>
  );
}

function EditableText({ value, onChange, isEditing }: { value: string, onChange: (v: string) => void, isEditing: boolean }) {
  if (!isEditing) return <span>{value || ''}</span>;
  return <input className="bg-yellow-50 border-b border-yellow-300 px-1 outline-none w-full" value={value || ''} onChange={e => onChange(e.target.value)} />;
}

// 명확한 ReactNode 타입 선언
function QABox({ q, a }: { q: React.ReactNode, a: React.ReactNode }) {
  return (
    <div className="border-b border-dashed border-gray-200 pb-4 mb-4 last:border-0">
      <span className="text-[#a4be7b] font-bold block mb-1 flex items-center gap-1">Q. {q}</span>
      <div className="text-lg text-[#4e443f]">{a}</div>
    </div>
  );
}

// 암시적 any 방지 및 className 타입 명확화
function PhotoUploadButton({ onUpload, className }: { onUpload: (url: string) => void, className?: string }) {
  return (
    <label className={`absolute ${className || ''} bg-white p-2 rounded-full shadow-md cursor-pointer hover:scale-110 transition-all z-20`}>
      <span>📷</span>
      <input type="file" className="hidden" onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            if (ev.target?.result) onUpload(ev.target.result as string);
          };
          reader.readAsDataURL(file);
        }
      }} />
    </label>
  );
}

// ---------------------------------------------------------
// Section Components
// ---------------------------------------------------------

function AboutSection({ data, isEditing, updateText, updateImage }: SectionProps) {
  return (
    <div>
      <h2 className="serif text-3xl mb-10">About Me</h2>
      <div className="flex flex-col md:flex-row gap-10">
        <div className="flex-1 space-y-6">
          <QABox q="MBTI" a={<EditableText value={data.texts.aboutMbti} onChange={(v: string) => updateText('aboutMbti', v)} isEditing={isEditing} />} />
          <QABox q="취미" a={<EditableText value={data.texts.aboutHobby} onChange={(v: string) => updateText('aboutHobby', v)} isEditing={isEditing} />} />
          <QABox q="몰입하는 활동" a={<EditableText value={data.texts.aboutFlow} onChange={(v: string) => updateText('aboutFlow', v)} isEditing={isEditing} />} />
        </div>
        <div className="w-full md:w-64">
          <div className="bg-white p-2 pb-10 shadow-lg rotate-1 relative group">
            <img src={data.images.about || ''} className="w-full h-72 object-cover" alt="About" />
            {isEditing && <PhotoUploadButton onUpload={(url: string) => updateImage('about', url)} className="bottom-4 right-4" />}
          </div>
        </div>
      </div>
    </div>
  );
}

function ValuesSection({ data, isEditing, updateText }: SectionProps) {
  return (
    <div>
      <h2 className="serif text-3xl mb-10">My Values</h2>
      <div className="bg-[#fdfcf7] p-8 rounded-2xl border border-[#f0eee0] space-y-6">
        <div className="font-bold text-[#8d7b68] text-lg">
          <EditableText value={data.texts.valuesRank} onChange={(v: string) => updateText('valuesRank', v)} isEditing={isEditing} />
        </div>
        <div className="text-lg leading-relaxed text-[#4e443f]">
          <EditableText value={data.texts.valuesDesc} onChange={(v: string) => updateText('valuesDesc', v)} isEditing={isEditing} />
        </div>
      </div>
    </div>
  );
}

function DreamSection({ data, isEditing, updateText, updateImage }: SectionProps) {
  return (
    <div className="space-y-10">
      <h2 className="serif text-3xl">My Dream</h2>
      <div className="text-xl font-bold text-[#a4be7b]">
        <EditableText value={data.texts.dreamTitle} onChange={(v: string) => updateText('dreamTitle', v)} isEditing={isEditing} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map(i => {
          const dreamKey = `dream${i}` as ImageKeys; // 타입 캐스팅으로 인덱싱 오류 원천 차단
          return (
            <div key={i} className="aspect-square bg-gray-100 rounded-xl overflow-hidden relative group">
              <img src={data.images[dreamKey] || ''} className="w-full h-full object-cover" alt={`Dream ${i}`} />
              {isEditing && <PhotoUploadButton onUpload={(url: string) => updateImage(dreamKey, url)} className="bottom-2 right-2" />}
            </div>
          );
        })}
      </div>
      <div className="space-y-6">
        <QABox q="이 직업의 매력" a={<EditableText value={data.texts.dreamPro} onChange={(v: string) => updateText('dreamPro', v)} isEditing={isEditing} />} />
        <QABox q="현실적인 고충" a={<EditableText value={data.texts.dreamCon} onChange={(v: string) => updateText('dreamCon', v)} isEditing={isEditing} />} />
      </div>
    </div>
  );
}

function BucketSection({ data, isEditing, updateText, updateImage }: SectionProps) {
  return (
    <div>
      <h2 className="serif text-3xl mb-10">Bucket List</h2>
      <div className="space-y-8">
        <div className="relative group mb-10">
            <img src={data.images.bucket1 || ''} className="w-full h-64 object-cover rounded-2xl shadow-sm" alt="Bucket" />
            {isEditing && <PhotoUploadButton onUpload={(url: string) => updateImage('bucket1', url)} className="bottom-4 right-4" />}
        </div>
        <QABox 
          q={<EditableText value={data.texts.bucket1Title} onChange={(v: string) => updateText('bucket1Title', v)} isEditing={isEditing} />} 
          a={<EditableText value={data.texts.bucket1Habit} onChange={(v: string) => updateText('bucket1Habit', v)} isEditing={isEditing} />} 
        />
        <div className="mt-12 text-center py-20 bg-[#fffef0] rounded-3xl border border-[#f5f4e6]">
          <p className="serif text-lg text-gray-400 mb-4">Future Question: 10년 후의 나에게</p>
          <p className="handwriting text-5xl">“지금, 행복한가요?”</p>
        </div>
      </div>
    </div>
  );
}