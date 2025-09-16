import React, { useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AiFillDashboard } from "react-icons/ai";
import { FiUsers } from "react-icons/fi";
import { FaPlus, FaBook, FaPen, FaListAlt, FaUser } from "react-icons/fa";
import { RiFileList2Fill } from "react-icons/ri";
import { BiAddToQueue } from "react-icons/bi";
import { MdLibraryBooks } from "react-icons/md";
import { IoMdLogOut } from "react-icons/io";
import storeContext from "../../context/storeContext";

const Sidebar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { store, dispatch } = useContext(storeContext);

  const logout = () => {
    localStorage.removeItem("poetryToken");
    dispatch({ type: "logout", payload: "" });
    navigate("/login");
  };

  const linkClass = (path) =>
    `px-3 py-2 rounded-sm flex gap-x-2 items-center font-medium transition-colors ${
      pathname === path
        ? "bg-green-700 text-white"
        : "bg-white text-[#404040f6]"
    } hover:bg-green-700 hover:text-white`;

  return (
    <div className="w-[250px] h-screen fixed left-0 top-0 bg-white border-r border-gray-200">
      {/* Logo Section */}
      <div className="h-[150px] flex justify-center items-center border-b border-gray-200">
        <Link to="/">
          <img
            src="/assets/mylogo.png"
            alt="logo"
            className="object-contain w-32 h-auto"
          />
        </Link>
      </div>

      {/* Menu Section */}
      <ul className="px-3 py-4 flex flex-col gap-y-2">
        {store.userInfo?.role === "admin" ? (
          <>
            <li>
              <Link
                to="/dashboard/admin"
                className={linkClass("/dashboard/admin")}
              >
                <AiFillDashboard className="text-xl" />
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/writer/add"
                className={linkClass("/dashboard/writer/add")}
              >
                <BiAddToQueue className="text-xl" />
                <span>Add Writer</span>
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/writers"
                className={linkClass("/dashboard/writers")}
              >
                <FiUsers className="text-xl" />
                <span>Writers</span>
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/blog/add"
                className={linkClass("/dashboard/blog/add")}
              >
                <FaPen className="text-xl" />
                <span>Add Blog</span>
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/blog"
                className={linkClass("/dashboard/blog")}
              >
                <MdLibraryBooks className="text-xl" />
                <span>All Blog</span>
              </Link>
            </li>

            <li>
              <Link
                to="/dashboard/poetry/usersubmittedpoetry"
                className={linkClass("/dashboard/poetry/usersubmittedpoetry")}
              >
                <RiFileList2Fill className="text-xl" />
                <span>User's Poetry</span>
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/poetry/createadmin"
                className={linkClass("/dashboard/poetry/createadmin")}
              >
                <FaPlus className="text-xl" />
                <span>Add User's Poetry</span>
              </Link>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link
                to="/dashboard/writer"
                className={linkClass("/dashboard/writer")}
              >
                <AiFillDashboard className="text-xl" />
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/poetry/create"
                className={linkClass("/dashboard/poetry/create")}
              >
                <FaPen className="text-xl" />
                <span>Add Poetry</span>
              </Link>
            </li>
          </>
        )}

        {/* Common Tabs */}
        <li>
          <Link
            to="/dashboard/poetry"
            className={linkClass("/dashboard/poetry")}
          >
            <FaBook className="text-xl" />
            <span>All Poetry</span>
          </Link>
        </li>
        <li>
          <Link
            to="/dashboard/profile"
            className={linkClass("/dashboard/profile")}
          >
            <FaUser className="text-xl" />
            <span>Profile</span>
          </Link>
        </li>
        <li>
          <div
            onClick={logout}
            className="px-3 py-2 rounded-sm flex gap-x-2 items-center font-medium cursor-pointer text-[#404040f6] hover:bg-red-500 hover:text-white transition-colors"
          >
            <IoMdLogOut className="text-xl" />
            <span>Logout</span>
          </div>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
