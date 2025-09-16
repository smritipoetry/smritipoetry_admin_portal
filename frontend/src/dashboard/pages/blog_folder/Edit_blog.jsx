import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { MdCloudUpload } from "react-icons/md";
import JoditEditor from "jodit-react";
import Gallery from "../../components/Gallery";
import { base_url } from "../../../config/config";
import axios from "axios";
import storeContext from "../../../context/storeContext";
import toast from "react-hot-toast";

const Edit_blog = () => {
  const navigate = useNavigate();
  const { blog_id } = useParams();
  const { store } = useContext(storeContext);
  const [show, setShow] = useState(false);
  const editor = useRef(null);

  const [old_image, setOldImage] = useState("");
  const [old_audio, setOldAudio] = useState("");
  const [title, setTitle] = useState("");
  const [image, setImage] = useState(null);
  const [audio, setAudio] = useState(null);
  const [img, setImg] = useState("");
  const [audioPreview, setAudioPreview] = useState("");
  const [description, setDescription] = useState("");
  const [loader, setLoader] = useState(false);
  const [category, setCategory] = useState("");

  const [images, setImages] = useState([]);
  const [imagesLoader, setImagesLoader] = useState(false);

  // Handle image selection
  const imageHandle = (e) => {
    const { files } = e.target;
    if (files.length > 0) {
      setImg(URL.createObjectURL(files[0]));
      setImage(files[0]);
    }
  };

  // Handle audio selection
  const audioHandle = (e) => {
    const { files } = e.target;
    if (files.length > 0) {
      setAudio(files[0]);
      setAudioPreview(URL.createObjectURL(files[0]));
    }
  };

  // Submit updated blog
  const updateBlog = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    if (image) formData.append("new_image", image);
    formData.append("old_image", old_image);

    if (audio) formData.append("new_audio", audio);
    formData.append("old_audio", old_audio);

    try {
      setLoader(true);
      const { data } = await axios.put(
        `${base_url}/api/blog/update/${blog_id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${store.token}`,
          },
        }
      );
      setLoader(false);
      toast.success(data.message);
      navigate("/dashboard/blog"); // Redirect after successful update
    } catch (error) {
      setLoader(false);
      const errorMsg = error.response?.data?.message || "An error occurred";
      toast.error(errorMsg);
    }
  };

  // Fetch available gallery images
  const get_images = async () => {
    setImagesLoader(true);
    try {
      const { data } = await axios.get(`${base_url}/api/blog/images`, {
        headers: {
          Authorization: `Bearer ${store.token}`,
        },
      });
      setImages(data.images);
    } catch (error) {
      console.log(error);
    } finally {
      setImagesLoader(false);
    }
  };

  const get_blog = async () => {
    try {
      const { data } = await axios.get(`${base_url}/api/blog/id/${blog_id}`, {
        headers: { Authorization: `Bearer ${store.token}` },
      });
      const blog = data.blog;
      setTitle(blog.title);
      setDescription(blog.description);
      setCategory(blog.category);
      setImg(blog.image);
      setOldImage(blog.image);
      setOldAudio(blog.audio);
      setAudioPreview(blog.audio);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    get_images();
    get_blog();
  }, [blog_id]);

  return (
    <div className="bg-white rounded-md">
      <div className="flex justify-between p-4">
        <h2 className="text-xl font-medium">Edit Blog</h2>
        <Link
          className="px-3 py-[6px] bg-purple-500 rounded-sm text-white hover:bg-purple-600"
          to="/dashboard/blog"
        >
          Blogs
        </Link>
      </div>

      <div className="p-4">
        <form onSubmit={updateBlog}>
          {/* Title */}
          <div className="flex flex-col gap-y-2 mb-6">
            <label
              className="text-md font-medium text-gray-600"
              htmlFor="title"
            >
              Title
            </label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              type="text"
              placeholder="Title"
              name="title"
              className="px-3 py-2 rounded-md outline-0 border border-gray-300 focus:border-green-500 h-10"
              id="title"
            />
          </div>

          {/* Category */}
          <div className="flex flex-col gap-y-2 mb-6">
            <label
              className="text-md font-medium text-gray-600"
              htmlFor="category"
            >
              Category
            </label>
            <input
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              type="text"
              placeholder="Category"
              name="category"
              className="px-3 py-2 rounded-md outline-0 border border-gray-300 focus:border-green-500 h-10"
              id="category"
            />
          </div>

          {/* Image */}
          <div className="mb-6">
            <label
              htmlFor="img"
              className="w-full h-[240px] flex rounded text-[#404040] gap-2 justify-center items-center cursor-pointer border-2 border-dashed"
            >
              {img ? (
                <img
                  src={img}
                  className="w-full h-full object-cover"
                  alt="Selected"
                />
              ) : (
                <div className="flex justify-center items-center flex-col gap-y-2">
                  <span className="text-2xl">
                    <MdCloudUpload />
                  </span>
                  <span>Select Image</span>
                </div>
              )}
            </label>
            <input
              onChange={imageHandle}
              className="hidden"
              type="file"
              id="img"
            />
          </div>

          {/* Audio */}
          <div className="mb-6">
            <label
              htmlFor="audio"
              className="w-full h-[150px] flex rounded text-[#404040] gap-2 justify-center items-center cursor-pointer border-2 border-dashed"
            >
              {audioPreview ? (
                <audio controls src={audioPreview} className="w-full px-2">
                  Your browser does not support the audio element.
                </audio>
              ) : (
                <div className="flex justify-center items-center flex-col gap-y-2">
                  <span className="text-2xl">
                    <MdCloudUpload />
                  </span>
                  <span>Select Audio</span>
                </div>
              )}
            </label>
            <input
              onChange={audioHandle}
              className="hidden"
              type="file"
              id="audio"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-y-2 mb-6">
            <h2>Description</h2>
            <div>
              <JoditEditor
                ref={editor}
                value={description}
                tabIndex={1}
                onBlur={(value) => setDescription(value)}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="mt-4">
            <button
              disabled={loader}
              className="px-3 py-[6px] bg-purple-500 rounded-sm text-white hover:bg-purple-600"
            >
              {loader ? "Loading..." : "Update Blog"}
            </button>
          </div>
        </form>
      </div>

      {/* Hidden input for gallery images */}
      <input
        onChange={imageHandle}
        type="file"
        multiple
        id="images"
        className="hidden"
      />
      {show && <Gallery setShow={setShow} images={images} />}
    </div>
  );
};

export default Edit_blog;
