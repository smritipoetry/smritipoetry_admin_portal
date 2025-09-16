import React, { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MdCloudUpload } from "react-icons/md";
import JoditEditor from "jodit-react";
import Gallery from "../../components/Gallery";
import { base_url } from "../../../config/config";
import axios from "axios";
import storeContext from "../../../context/storeContext";
import toast from "react-hot-toast";

const CreateBlog = () => {
  const { store } = useContext(storeContext);
  const [show, setShow] = useState(false);
  const editor = useRef(null);

  const [title, setTitle] = useState("");
  const [image, setImage] = useState("");
  const [img, setImg] = useState("");
  const [description, setDescription] = useState("");
  const [audio, setAudio] = useState(null);
  const [audioPreview, setAudioPreview] = useState("");
  const [category, setCategory] = useState("General");

  const [loader, setLoader] = useState(false);
  const [images, setImages] = useState([]);
  const [imagesLoader, setImagesLoader] = useState(false);

  // Image preview & file
  const imageHandle = (e) => {
    const { files } = e.target;
    if (files.length > 0) {
      setImg(URL.createObjectURL(files[0]));
      setImage(files[0]);
    }
  };

  // Audio preview & file
  const audioHandle = (e) => {
    const { files } = e.target;
    if (files.length > 0) {
      setAudio(files[0]);
      setAudioPreview(URL.createObjectURL(files[0]));
    }
  };

  // Submit handler
  const added = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("image", image);
    formData.append("category", category);
    if (audio) {
      formData.append("audio", audio);
    }

    try {
      setLoader(true);
      const { data } = await axios.post(`${base_url}/api/blog/add`, formData, {
        headers: {
          Authorization: `Bearer ${store.token}`,
        },
      });
      setLoader(false);
      toast.success(data.message);

      // Reset all fields after successful submission
      setTitle("");
      setDescription("");
      setImage("");
      setImg("");
      setAudio(null);
      setAudioPreview("");
      setCategory("General");
    } catch (error) {
      setLoader(false);
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  // Fetch gallery images
  const get_images = async () => {
    try {
      const { data } = await axios.get(`${base_url}/api/blog/images`, {
        headers: {
          Authorization: `Bearer ${store.token}`,
        },
      });
      setImages(data.images);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    get_images();
  }, []);

  // Upload multiple gallery images
  const imageHandler = async (e) => {
    const files = e.target.files;
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("images", files[i]);
      }

      setImagesLoader(true);
      const { data } = await axios.post(
        `${base_url}/api/blog/images/add`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${store.token}`,
          },
        }
      );
      setImagesLoader(false);
      setImages([...images, ...data.images]);
      toast.success(data.message);
    } catch (error) {
      setImagesLoader(false);
      toast.error(error.response?.data?.message || "Image upload failed");
    }
  };

  return (
    <div className="bg-white rounded-md">
      <div className="flex justify-between p-4">
        <h2 className="text-xl font-medium">Add Blog</h2>
        <Link
          className="px-3 py-[6px] bg-green-700 rounded-sm text-white hover:bg-green-800"
          to="/dashboard/blog"
        >
          Blogs
        </Link>
      </div>

      <div className="p-4">
        <form onSubmit={added}>
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
              placeholder="Blog title"
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
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              type="text"
              placeholder="Category (e.g. Lifestyle, Tech)"
              name="category"
              className="px-3 py-2 rounded-md outline-0 border border-gray-300 focus:border-green-500 h-10"
              id="category"
            />
          </div>

          {/* Image Upload */}
          <div className="mb-6">
            <label
              htmlFor="img"
              className="w-full h-[240px] flex rounded text-[#404040] gap-2 justify-center items-center cursor-pointer border-2 border-dashed"
            >
              {img ? (
                <img
                  src={img}
                  className="w-full h-full object-cover"
                  alt="preview"
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
              required
              onChange={imageHandle}
              className="hidden"
              type="file"
              id="img"
              accept="image/*"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-y-2 mb-6">
            <div className="flex justify-start items-center gap-x-2">
              <h2>Description</h2>
              <div onClick={() => setShow(true)}>
                <span className="text-2xl cursor-pointer">
                  <MdCloudUpload />
                </span>
              </div>
            </div>
            <div>
              <JoditEditor
                ref={editor}
                value={description}
                tabIndex={1}
                onBlur={(value) => setDescription(value)}
                onChange={() => {}}
              />
            </div>
          </div>

          {/* Audio Upload */}
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
              type="file"
              id="audio"
              onChange={audioHandle}
              className="hidden"
              accept="audio/*"
            />
          </div>

          <div className="mt-4">
            <button
              disabled={loader}
              className="px-3 py-[6px] bg-green-700 rounded-sm text-white hover:bg-green-800"
            >
              {loader ? "loading..." : "Add Blog"}
            </button>
          </div>
        </form>
      </div>

      {/* Hidden input for gallery images */}
      <input
        onChange={imageHandler}
        type="file"
        multiple
        id="images"
        className="hidden"
      />
      {show && <Gallery setShow={setShow} images={images} />}
    </div>
  );
};

export default CreateBlog;
