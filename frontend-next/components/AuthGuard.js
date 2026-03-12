'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext({ authenticated: false, logout: () => {} });

export function useAuth() {
  return useContext(AuthContext);
}

// 인증 없이 접근 가능한 경로
const PUBLIC_PATHS = ['/login', '/privacy', '/submit', '/guide-student'];

function isPublicPath(pathname) {
  return PUBLIC_PATHS.some(p => pathname === p || pathname?.startsWith(p + '/'));
}

export default function AuthGuard({ children }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const stored = localStorage.getItem('teacherAuth');
    setAuthenticated(stored === 'true');
    setChecking(false);
  }, []);

  useEffect(() => {
    if (checking) return;

    if (!authenticated && !isPublicPath(pathname)) {
      router.push('/login');
    }
  }, [authenticated, pathname, checking, router]);

  const logout = () => {
    localStorage.removeItem('teacherAuth');
    setAuthenticated(false);
    router.push('/login');
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-400 text-sm">로딩 중...</p>
      </div>
    );
  }

  // 공개 경로는 인증 없이 접근 가능
  if (isPublicPath(pathname)) {
    return (
      <AuthContext.Provider value={{ authenticated, logout }}>
        {children}
      </AuthContext.Provider>
    );
  }

  // 비인증 상태에서 비공개 경로 -> 리다이렉트 중이므로 로딩 표시
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-400 text-sm">로그인 페이지로 이동 중...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ authenticated, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
