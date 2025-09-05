import { useEffect, useRef } from "react";
import axios from "axios";

export default function KakaoCallback() {
    const called = useRef(false); // StrictMode/중복호출 방지

    useEffect(() => {
        if (called.current) return; // 🚧 이미 호출했다면 막기
        called.current = true;

        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        // TODO: NAFAL.STORE 배포 시 변경 필요
        // 개발환경: http://localhost:3000/kakao/callback
        // 운영환경: https://nafal.store/kakao/callback
        const redirectUri = process.env.REACT_APP_KAKAO_REDIRECT_URI || "http://localhost:3000/kakao/callback";

        if (!code) {
            alert("카카오 인가 코드를 받지 못했습니다.");
            window.location.replace("/login");
            return;
        }

        // 새로고침 대비: 같은 code 두 번 쓰는 것 차단
        if (sessionStorage.getItem(`kakao_code_${code}`)) return;
        sessionStorage.setItem(`kakao_code_${code}`, "used");

        // TODO: NAFAL.STORE 배포 시 변경 필요
        // 개발환경: http://localhost:8080/NAFAL/api/kakao/auth-code
        // 운영환경: https://api.nafal.store/api/kakao/auth-code 또는 백엔드 서버 도메인
        const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/NAFAL";
        axios
            .post(
                `${apiBaseUrl}/api/kakao/auth-code`,
                { code, redirectUri },
                { withCredentials: true }
            )
            .then((res) => {
                if (res.data?.success) {
                    const user = res.data.user;
                    localStorage.setItem("user", JSON.stringify(user));
                    const type = String(user?.userType || user?.role || "USER").toUpperCase();
                    window.location.replace(type === "NAFAL" ? "/nafal-mypage" : "/");
                } else {
                    alert(res.data?.message || "카카오 로그인 실패");
                    window.location.replace("/login");
                }
            })
            .catch((err) => {
                console.error(err);
                alert("카카오 로그인 처리 중 오류");
                window.location.replace("/login");
            })
            .finally(() => {
                // ✅ 주소창에서 code 제거 (재로그인/새로고침시 에러 방지)
                window.history.replaceState({}, "", window.location.pathname);
            });
    }, []);

    return <div>카카오 로그인 처리중...</div>;
}
