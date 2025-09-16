import React, { useContext } from "react";
import { Link } from "react-router-dom";
import BlogContent from "../../components/BlogContent"; // make sure this exists
import storeContext from "../../../context/storeContext";

const Blog = () => {
  const { store } = useContext(storeContext);

  return (
    <div className="bg-white rounded-md">
      <div className="flex justify-between p-4">
        <h2 className="text-xl font-medium">Blogs</h2>
        {store.userInfo && store.userInfo.role !== "admin" && (
          <Link
            className="px-3 py-[6px] bg-green-700 rounded-sm text-white hover:bg-green-800"
            to="/dashboard/blog/create"
          >
            Create Blog
          </Link>
        )}
      </div>
      <BlogContent />
    </div>
  );
};

export default Blog;
