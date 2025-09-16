import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";
import { base_url } from "../../../config/config";
import storeContext from "../../../context/storeContext";
import toast from "react-hot-toast";

const Blogs = () => {
  const { store } = useContext(storeContext);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch blogs
  const fetchBlogs = async () => {
    try {
      const { data } = await axios.get(`${base_url}/api/blog`, {
        headers: {
          Authorization: `Bearer ${store.token}`,
        },
      });
      setBlogs(data.blogs || []);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      toast.error(error.response?.data?.message || "Error fetching blogs");
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [store.token]);

  // Handle blog deletion
  const handleDelete = async (blogId) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;

    try {
      setLoading(true);
      const { data } = await axios.delete(`${base_url}/api/blog/${blogId}`, {
        headers: {
          Authorization: `Bearer ${store.token}`,
        },
      });
      toast.success(data.message || "Blog deleted successfully");
      // Remove the blog from the state immediately
      setBlogs((prevBlogs) => prevBlogs.filter((blog) => blog._id !== blogId));
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast.error(error.response?.data?.message || "Error deleting blog");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="px-2 lg:px-7 pt-5">
        <div className="w-full p-4 bg-[#283046] rounded-md text-[#d0d2d6]">
          Loading blogs...
        </div>
      </div>
    );
  }

  return (
    <div className="px-2 lg:px-7 pt-5">
      <div className="w-full p-4 bg-[#283046] rounded-md">
        <div className="flex justify-between items-center pb-4">
          <h1 className="text-[#d0d2d6] text-xl font-semibold">Blogs</h1>
          <Link
            to="/dashboard/blog/create"
            className="bg-blue-500 hover:shadow-blue-500/50 hover:shadow-lg text-white rounded-sm px-7 py-2 my-2"
          >
            Add Blog
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-[#d0d2d6]">
            <thead className="text-xs border-b border-slate-700">
              <tr>
                <th scope="col" className="py-3 px-4">
                  No
                </th>
                <th scope="col" className="py-3 px-4">
                  Title
                </th>
                <th scope="col" className="py-3 px-4">
                  Category
                </th>
                <th scope="col" className="py-3 px-4">
                  Status
                </th>
                <th scope="col" className="py-3 px-4">
                  Date
                </th>
                <th scope="col" className="py-3 px-4">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((blog, index) => (
                <tr key={blog._id} className="border-b border-slate-700">
                  <td className="py-3 px-4">{index + 1}</td>
                  <td className="py-3 px-4 truncate max-w-[200px]">
                    {blog.title}
                  </td>
                  <td className="py-3 px-4">{blog.category}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-md ${
                        blog.status === "active"
                          ? "bg-green-500/50 text-green-500"
                          : "bg-red-500/50 text-red-500"
                      }`}
                    >
                      {blog.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">{blog.date}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-4">
                      <Link
                        to={`/dashboard/blog/edit/${blog._id}`}
                        className="p-2 bg-yellow-500 rounded-sm hover:shadow-lg hover:shadow-yellow-500/50"
                      >
                        <FaEdit />
                      </Link>
                      <button
                        onClick={() => handleDelete(blog._id)}
                        className="p-2 bg-red-500 rounded-sm hover:shadow-lg hover:shadow-red-500/50"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Blogs;
