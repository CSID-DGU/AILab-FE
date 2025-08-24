import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bars3Icon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  CogIcon,
} from "@heroicons/react/24/outline";

const Header = ({ isCollapsed, toggleSidebar, user, onLogout }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAccountSettings = () => {
    navigate("/account");
    setIsProfileOpen(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
      {/* Left Section */}
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
        >
          <Bars3Icon className="w-5 h-5 text-gray-600" />
        </button>

        <div className={`ml-4 ${isCollapsed ? "block" : "hidden"}`}>
          <h1 className="text-lg font-semibold text-gray-800">DGU AI Lab</h1>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4">
        {/* User Profile */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <UserCircleIcon className="w-8 h-8 text-gray-600" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-700">
                {user?.name || "사용자"}
              </p>
              <p className="text-xs text-gray-500">
                {user?.email || "user@dgu.ac.kr"}
              </p>
            </div>
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-700">
                  {user?.name || "사용자"}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.email || "user@dgu.ac.kr"}
                </p>
              </div>

              <button
                onClick={handleAccountSettings}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
              >
                <CogIcon className="w-4 h-4 mr-2" />
                계정 설정
              </button>

              <button
                onClick={onLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                로그아웃
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
