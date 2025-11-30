import { BiCart } from "react-icons/bi";
import { FaChartLine, FaHistory } from "react-icons/fa";
import { GiPayMoney } from "react-icons/gi";
import { GrUserWorker } from "react-icons/gr";
import { MdDashboard, MdOutlineInventory } from "react-icons/md";
import { PiBriefcaseDuotone, PiNotepadFill } from "react-icons/pi";

export const sidebarLinks = [
    { title: "Dashboard", path: "/",icon:MdDashboard },
    { title: "MetaData", path: "/metadata",icon:BiCart },
    { title: "Work Orders", path: "/workorders",icon:PiNotepadFill },
    { title: "Work Order's History", path: "/workorderhistory",icon:FaHistory },
    { title: "Workers", path: "/workers",icon:GrUserWorker },
    { title: "Inventory", path: "/inventory",icon:MdOutlineInventory },
    { title: "Services", path: "/services",icon:PiBriefcaseDuotone },
    { title: "Spendings", path: "/spendings",icon:GiPayMoney },
    { title: "Insights", path: "/insights",icon:FaChartLine },
]