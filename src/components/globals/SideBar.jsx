import { Link, useLocation, useNavigate } from "react-router-dom";
import { sidebarLinks } from "../../config";
import { FaChevronLeft, FaChevronRight, FaSignOutAlt } from "react-icons/fa";
import firebaseSDK from "../../firebase/firebase.config";

const Sidebar = ({ isOpen, setisOpen }) => {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const toggle = () => setisOpen(prev => !prev);

    const handleLogout = async () => {
        try {
            await firebaseSDK.auth.signOut();
            navigate('/login');
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    return (
        <div className={`
                fixed left-0 top-0 h-screen bg-white shadow-lg transition-all duration-300 ease-in-out z-40
                border-r border-gray-200
                ${isOpen ? "w-64" : "w-20"}
            `}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <button
                    onClick={toggle}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                    {isOpen ? <FaChevronLeft size={20} /> : <FaChevronRight size={20} />}
                </button>
                {isOpen && (
                    <img
                        src="/full-logo.png"
                        alt="Logo"
                        className="w-40 h-50"
                    />
                )}
            </div>

            <div className="flex flex-col space-y-2 p-4">
                {sidebarLinks?.map((item, index) => {
                    let Icon = item?.icon;

                    return (
                        <Link
                            key={index}
                            className={`
                                    flex items-center rounded-lg px-3 py-3 transition-all duration-200
                                    ${pathname === item?.path
                                    ? "bg-blue-50 text-blue-600 border border-blue-200"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                }
                                    ${isOpen ? "justify-start" : "justify-center"}
                                `}
                            to={item?.path}
                        >
                            <div className="flex-shrink-0">
                                <Icon size={22} />
                            </div>
                            {isOpen && (
                                <span className="ml-3 font-medium truncate">
                                    {item?.title}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </div>

            <div className="mt-auto p-4 border-t border-gray-200">
                <button
                    onClick={handleLogout}
                    className={`
                        w-full flex items-center rounded-lg px-3 py-3 transition-all duration-200
                        text-red-600 hover:bg-red-50 hover:text-red-700
                        ${isOpen ? "justify-start" : "justify-center"}
                    `}
                >
                    <div className="flex-shrink-0">
                        <FaSignOutAlt size={22} />
                    </div>
                    {isOpen && (
                        <span className="ml-3 font-medium truncate">
                            Logout
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
};

export default Sidebar;