'use client';
import './globals.css';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, createContext, useContext } from 'react';
import { NAV_ITEMS } from '@/lib/constants';
import { setDemoMode } from '@/lib/api';
import { ToastProvider } from '@/components/Toast';
import ErrorBoundary from '@/components/ErrorBoundary';

const DemoContext = createContext({ demo: true, toggle: () => {} });
export function useDemoContext() { return useContext(DemoContext); }

const STUDENT_PATHS = ['/submit', '/guide-student'];

function Sidebar({ demo, onToggle }) {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-slate-900 text-white min-h-screen fixed left-0 top-0 flex flex-col z-10">
      <div className="p-4 border-b border-slate-700">
        <h1 className="text-lg font-bold">AI 실천 평가</h1>
        <p className="text-xs text-slate-400 mt-1">v2.0</p>
      </div>
      <nav className="flex-1 py-2">
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                active
                  ? 'bg-slate-700 text-white font-medium'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* 데모 토글 */}
      <div className="p-3 border-t border-slate-700">
        <button
          onClick={onToggle}
          className={`w-full rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
            demo
              ? 'bg-amber-500 text-white hover:bg-amber-600'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          {demo ? '데모 ON (샘플 데이터)' : '데모 OFF (백엔드 연동)'}
        </button>
      </div>

      <div className="px-4 pb-3 text-xs text-slate-600">
        AI 교실 실천 평가 시스템
      </div>
    </aside>
  );
}

export default function RootLayout({ children }) {
  const [demo, setDemo] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const isStudentPage = STUDENT_PATHS.some(p => pathname?.startsWith(p));

  // localStorage에서 초기값 복원
  useEffect(() => {
    const stored = localStorage.getItem('demoMode');
    const initial = stored === null ? true : stored === 'true';
    setDemo(initial);
    setDemoMode(initial);
  }, []);

  const toggle = () => {
    const next = !demo;
    setDemo(next);
    setDemoMode(next);
    router.refresh();
  };

  return (
    <html lang="ko">
      <head>
        <title>{isStudentPage ? 'AI 실천 평가 - 학생' : 'AI 실천 평가 시스템'}</title>
      </head>
      <body className="bg-slate-50">
        <ToastProvider>
          <ErrorBoundary>
            <DemoContext.Provider value={{ demo, toggle }}>
              {isStudentPage ? (
                <main className="min-h-screen">
                  {children}
                </main>
              ) : (
                <>
                  <Sidebar demo={demo} onToggle={toggle} />
                  <main className="ml-56 min-h-screen p-6">
                    {demo && (
                      <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-sm text-amber-800">
                        데모 모드 — 샘플 데이터로 전체 기능을 미리 체험할 수 있습니다. 실제 사용 시 사이드바에서 데모 OFF로 전환하세요.
                      </div>
                    )}
                    {children}
                  </main>
                </>
              )}
            </DemoContext.Provider>
          </ErrorBoundary>
        </ToastProvider>
      </body>
    </html>
  );
}
