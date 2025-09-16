const router = require('express').Router();
const middleware = require('../middlewares/middleware');
const blogController = require('../controllers/blogController');
const usermiddleware = require('../middlewares/userAuthMiddleware');

// ------------------ Dashboard / Admin ------------------

// Add new blog
router.post('/api/blog/add', middleware.auth, blogController.add_blog);

// // // // Update blog
router.put('/api/blog/update/:blog_id', middleware.auth, blogController.update_blog);

// Get single blog by ID (for editing)
router.get('/api/blog/id/:blog_id', middleware.auth, blogController.get_blog_by_id);


// // // Update blog status (admin only)
router.put('/api/blog/status-update/:blog_id', middleware.auth, blogController.update_blog_status);

router.get('/api/blog', middleware.auth, blogController.get_all_blogs);

// Delete blog
router.delete('/api/blog/:blog_id', middleware.auth, blogController.delete_blog);

// // // Upload images for blog gallery
// router.post('/api/blog/images/add', middleware.auth, blogController.add_images);

// // Dashboard blogs (all or per author)
// router.get('/api/blog', middleware.auth, blogController.get_dashboard_blogs);
// router.get('/api/blog/:blog_id', middleware.auth, blogController.get_dashboard_single_blog);

// // ------------------ User Engagement ------------------

// // Like / Unlike blog
// router.post('/api/blog/like/:blog_id', usermiddleware.auth, blogController.toggle_like_blog);

// // Add rating to blog
// router.post('/api/blog/add-rating/:blog_id', usermiddleware.auth, blogController.add_rating);

// // Add comment to blog
// router.post('/api/blog/add-comment/:blog_id', usermiddleware.auth, blogController.add_comment);

// // Get top testimonials (blogs with highest rating & comments)
// router.get('/api/blog/top-testimonials', blogController.top_testimonials);

// // ------------------ Website / Public ------------------

// // // Get all blogs grouped by category
// router.get('/api/all/blog', blogController.get_all_blogs);

// // // Get popular blogs (by views)
// router.get('/api/popular/blog', blogController.get_popular_blogs);

// // // Get latest blogs
// router.get('/api/latest/blog', blogController.get_latest_blogs);

// // // Get featured blogs
// router.get('/api/featured/blog', blogController.get_featured_blogs);

// // // Get random blog images
// router.get('/api/images/blog', blogController.get_images);

// // // Get recent blogs
// router.get('/api/recent/blog', blogController.get_recent_blogs);

// // // Get single blog details by slug
// router.get('/api/blog/details/:slug', blogController.get_blog);

// // // Get all categories
// router.get('/api/category/all-blog', blogController.get_categories);

// // // Get blogs by category
// router.get('/api/category/blog/:category', blogController.get_category_blogs);

// // // Search blogs
// router.get('/api/search/blog', blogController.blog_search);

module.exports = router;
