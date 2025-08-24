import { useEffect } from "react";
import Button from "./Button";

const SessionExpiredModal = ({ isOpen, onConfirm }) => {
  // ESC 키 처리
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) {
        onConfirm();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onConfirm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div className="fixed inset-0 bg-black bg-opacity-50" />

      {/* 모달 컨텐츠 */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="text-center">
          {/* 아이콘 */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
            <svg
              className="h-6 w-6 text-yellow-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          {/* 제목 */}
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            세션이 만료되었습니다
          </h3>

          {/* 메시지 */}
          <p className="text-sm text-gray-500 mb-6">
            보안을 위해 자동으로 로그아웃됩니다. 다시 로그인해주세요.
          </p>

          {/* 버튼 */}
          <div className="flex justify-center">
            <Button onClick={onConfirm} variant="primary" className="w-full">
              확인
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionExpiredModal;
