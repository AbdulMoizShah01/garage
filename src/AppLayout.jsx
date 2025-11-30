import { Outlet } from "react-router-dom";
import Sidebar from "./components/globals/Sidebar";
import { useState, useEffect } from "react";

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Sidebar isOpen={sidebarOpen} setisOpen={setSidebarOpen} />
      
 
      <div className={`
        min-h-screen transition-all duration-500 ease-out
        ${sidebarOpen && !isMobile ? "md:ml-72" : "md:ml-24"}
        ml-0
      `}>
      
        <div className="h-4 md:h-6"></div>
        
     
        <div className="px-4 md:px-8 pb-6">
          <div className="
            bg-white/90 backdrop-blur-xl
            rounded-3xl md:rounded-4xl
            shadow-xl border border-white/70
            min-h-[calc(100vh-3rem)]
            transform transition-all duration-300
            hover:shadow-2xl
          ">
            <div className="p-6 md:p-8">
              <Outlet />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default AppLayout;