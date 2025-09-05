import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AuctionPage from './pages/AuctionPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import FindPassword from './pages/FindPassword';
import ItemDetailPage from './pages/ItemDetailPage';
import UserMypage from './pages/UserMypage';
import AdminMypage from './pages/AdminMypage';
import PurchasePage from './pages/PurchasePage';
import PaymentPage from './pages/PaymentPage';
import NafalMypage from './pages/NafalMypage';
import NotificationService from './components/NotificationService';
import KakaoCallback from './pages/KakaoCallback';
import './styles/tokens.css';
import './styles/components.css';
import './App.css';

/**
 * NAFAL App - 폐기물 경매 플랫폼
 * 스타일 가이드 기반 + 카카오 소셜로그인
 */
function App() {
  return (
    <div className="App">
      <Router>
        {/* 전역 알림 서비스 */}
        <NotificationService />
        
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auction" element={<AuctionPage />} />
          <Route path="/item/:id" element={<ItemDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/find-password" element={<FindPassword />} />
          <Route path="/mypage" element={<UserMypage />} />
          <Route path="/user-mypage" element={<UserMypage />} />
          <Route path="/admin" element={<AdminMypage />} />
          <Route path="/admin-mypage" element={<AdminMypage />} />
          <Route path="/nafal" element={<NafalMypage />} />
          <Route path="/nafal-mypage" element={<NafalMypage />} />
          <Route path="/purchase" element={<PurchasePage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/kakao/callback" element={<KakaoCallback />} />
          <Route path="*" element={
            <div style={{
              minHeight: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              fontFamily: 'var(--font-family)'
            }}>
              <h1 style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-4)' }}>
                🔍 404
              </h1>
              <p style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)' }}>
                페이지를 찾을 수 없습니다
              </p>
              <Link 
                to="/" 
                style={{
                  marginTop: 'var(--space-6)',
                  color: '#8A38F5',
                  textDecoration: 'none',
                  fontWeight: 'var(--weight-medium)'
                }}
              >
                홈으로 돌아가기
              </Link>
            </div>
          } />
        </Routes>
      </Router>
    </div>
  );
}

export default App;