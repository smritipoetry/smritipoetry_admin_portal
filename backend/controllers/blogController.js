const { formidable } = require('formidable');
const cloudinary = require('cloudinary').v2;
const blogModel = require('../models/blogModel');
const userAuthModel = require('../models/userAuthModel');
const { mongo: { ObjectId } } = require('mongoose');
const moment = require('moment');

cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret,
    secure: true
});

class blogController {

    // Add Blog
    add_blog = async (req, res) => {
        const form = formidable({});
        try {
            const [fields, files] = await form.parse(req);

            // Upload image
            const { secure_url: imageUrl } = await cloudinary.uploader.upload(files.image[0].filepath, {
                folder: 'blog_images',
                secure: true
            });

            // Optional audio
            let audioUrl = null;
            if (files.audio && files.audio.length > 0) {
                const audioResult = await cloudinary.uploader.upload(files.audio[0].filepath, {
                    folder: 'blog_audio',
                    resource_type: 'video',
                    secure: true
                });
                audioUrl = audioResult.secure_url;
            }

            const { title, description, category } = fields;

            // Determine writer
            let writerId = null;
            let writerName = "Anonymous";
            if (req.userInfo) {
                writerId = req.userInfo.id;
                writerName = req.userInfo.name;
            } else if (fields.username) {
                writerName = fields.username[0] || "Anonymous";
            }

            const blog = await blogModel.create({
                writerId,
                writerName,
                title: title[0].trim(),
                slug: title[0].trim().split(' ').join('-'),
                description: description[0],
                category: category ? category[0] : "General",
                date: moment().format('LL'),
                image: imageUrl,
                audio: audioUrl,
                status: 'pending'
            });

            return res.status(201).json({ message: 'Blog added successfully', blog });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };
    //Update Blog
    update_blog = async (req, res) => {
        const { blog_id } = req.params;

        if (!blog_id || blog_id.length !== 24) {
            return res.status(400).json({ message: "Invalid blog ID" });
        }

        try {
            const form = formidable({});
            const [fields, files] = await form.parse(req);

            // Get the values from fields, handling array format from formidable
            const title = fields.title ? fields.title[0] : '';
            const description = fields.description ? fields.description[0] : '';
            const category = fields.category ? fields.category[0] : '';
            const old_image = fields.old_image ? fields.old_image[0] : null;
            const old_audio = fields.old_audio ? fields.old_audio[0] : null;

            let imageUrl = old_image;
            let audioUrl = old_audio;

            // Handle new image upload
            if (files.new_image && files.new_image.length > 0) {
                if (old_image) {
                    try {
                        const splitImage = old_image.split('/');
                        const imageFile = splitImage[splitImage.length - 1].split('.')[0];
                        await cloudinary.uploader.destroy(`blog_images/${imageFile}`);
                    } catch (error) {
                        console.log('Error deleting old image:', error);
                    }
                }

                const imageData = await cloudinary.uploader.upload(files.new_image[0].filepath, {
                    folder: 'blog_images',
                    secure: true
                });
                imageUrl = imageData.secure_url;
            }

            // Handle new audio upload
            if (files.new_audio && files.new_audio.length > 0) {
                if (old_audio) {
                    try {
                        const splitAudio = old_audio.split('/');
                        const audioFile = splitAudio[splitAudio.length - 1].split('.')[0];
                        await cloudinary.uploader.destroy(`blog_audio/${audioFile}`, { resource_type: 'video' });
                    } catch (error) {
                        console.log('Error deleting old audio:', error);
                    }
                }

                const audioData = await cloudinary.uploader.upload(files.new_audio[0].filepath, {
                    resource_type: 'video',
                    folder: 'blog_audio',
                    secure: true
                });
                audioUrl = audioData.secure_url;
            }

            // Update the blog
            const blog = await blogModel.findByIdAndUpdate(blog_id, {
                title: title.trim(),
                slug: title.trim().split(' ').join('-'),
                description,
                category,
                image: imageUrl,
                audio: audioUrl,
                updatedAt: new Date()
            }, { new: true });

            if (!blog) {
                return res.status(404).json({ message: "Blog not found" });
            }

            return res.status(200).json({ message: 'Blog updated successfully', blog });

        } catch (error) {
            console.error('Error updating blog:', error);
            return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    };

    //fetch single blog by id (for editing)
    get_blog_by_id = async (req, res) => {
        const { blog_id } = req.params;

        if (!blog_id || blog_id.length !== 24) {
            return res.status(400).json({ message: 'Invalid blog ID' });
        }

        try {
            const blog = await blogModel.findById(blog_id);
            if (!blog) return res.status(404).json({ message: 'Blog not found' });

            return res.status(200).json({ blog });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };

    //update blog status
    update_blog_status = async (req, res) => {
        const { role } = req.userInfo;
        const { blog_id } = req.params;
        const { status } = req.body;

        if (role === 'admin') {
            try {
                const blog = await blogModel.findByIdAndUpdate(blog_id, { status }, { new: true });

                if (!blog) {
                    return res.status(404).json({ message: 'Blog not found' });
                }

                // Send email notifications to subscribers only when status is changed to 'active'
                if (status === 'active') {
                    try {
                        await sendNewContentToSubscribers({
                            title: blog.title,
                            description: blog.description,
                            image: blog.image,
                            slug: blog.slug
                        });
                        console.log('Subscriber notifications sent successfully for newly activated blog');
                    } catch (emailError) {
                        console.error('Error sending subscriber notifications:', emailError);
                        // Don't block status update if email fails
                    }
                }

                return res.status(200).json({ message: 'Blog status updated successfully', blog });

            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'An error occurred while updating the blog status' });
            }
        } else {
            return res.status(401).json({ message: 'You are not authorized to update the blog status' });
        }
    };

    // Get All Blogs (for admin or public view)
    get_all_blogs = async (req, res) => {
        try {
            let query = {};

            // If user is not admin, only show active blogs
            if (!req.userInfo || req.userInfo.role !== 'admin') {
                query.status = 'active';
            }

            // Fetch blogs based on query
            const blogs = await blogModel.find(query)
                .sort({ createdAt: -1 })
                .select('title slug description category date image writerName status'); // Select specific fields

            if (!blogs || blogs.length === 0) {
                return res.status(200).json({ blogs: [], message: 'No blogs found' });
            }

            return res.status(200).json({ blogs, message: 'Blogs fetched successfully' });
        } catch (error) {
            console.error('Error fetching blogs:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };






    // Add Comment
    add_comment = async (req, res) => {
        const { blog_id } = req.params;
        const { comment } = req.body;
        const userId = req.userId;

        try {
            if (!ObjectId.isValid(blog_id)) return res.status(400).json({ message: 'Invalid blog ID' });

            const blog = await blogModel.findById(blog_id);
            if (!blog) return res.status(404).json({ message: 'Blog not found' });

            const user = await userAuthModel.findById(userId);
            if (!user) return res.status(404).json({ message: 'User not found' });

            const newComment = {
                userId,
                name: user.fullName,
                text: comment,
                date: new Date()
            };

            blog.comments.push(newComment);
            await blog.save();

            return res.status(200).json({ message: 'Comment added', comments: blog.comments });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };


    // Get Single Blog + Increment View Count
    get_blog = async (req, res) => {
        const { slug } = req.params;
        try {
            const blog = await blogModel.findOneAndUpdate(
                { slug, status: 'active' },
                { $inc: { count: 1 } },
                { new: true }
            );

            if (!blog) return res.status(404).json({ message: 'Blog not found' });

            // Related blogs (same category)
            const relatedBlogs = await blogModel.find({
                _id: { $ne: blog._id },
                category: blog.category,
                status: 'active'
            }).limit(4).sort({ createdAt: -1 });

            return res.status(200).json({ blog, relatedBlogs });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };



    // Search Blogs
    search_blogs = async (req, res) => {
        const { value } = req.query;
        try {
            const blogs = await blogModel.find({ status: 'active', $text: { $search: value } });
            return res.status(200).json({ blogs });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };

    // Delete Blog
    delete_blog = async (req, res) => {
        const { blog_id } = req.params;
        const { role } = req.userInfo;

        try {
            // Validate blog_id
            if (!blog_id || blog_id.length !== 24) {
                return res.status(400).json({ message: "Invalid blog ID" });
            }

            // Find the blog first to get image/audio URLs
            const blog = await blogModel.findById(blog_id);
            if (!blog) {
                return res.status(404).json({ message: "Blog not found" });
            }

            // Check authorization
            if (role !== 'admin' && blog.writerId.toString() !== req.userInfo.id) {
                return res.status(403).json({ message: "Not authorized to delete this blog" });
            }

            // Delete images from Cloudinary
            if (blog.image) {
                const splitImage = blog.image.split('/');
                const imageFile = splitImage[splitImage.length - 1].split('.')[0];
                await cloudinary.uploader.destroy(imageFile);
            }

            // Delete audio from Cloudinary if exists
            if (blog.audio) {
                const splitAudio = blog.audio.split('/');
                const audioFile = splitAudio[splitAudio.length - 1].split('.')[0];
                await cloudinary.uploader.destroy(audioFile, { resource_type: 'video' });
            }

            // Delete the blog from database
            await blogModel.findByIdAndDelete(blog_id);

            return res.status(200).json({ message: "Blog deleted successfully" });
        } catch (error) {
            console.error('Error deleting blog:', error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };
}

module.exports = new blogController();
