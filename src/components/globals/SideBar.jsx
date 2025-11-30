import { Link, useLocation } from "react-router-dom"
import { sidebarLinks } from "../../config";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";

const Sidebar = ({ isOpen, setisOpen }) => {
    const { pathname } = useLocation();
    const toggle = () => setisOpen(prev => !prev);

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
        </div>

    );
};

export default Sidebar;