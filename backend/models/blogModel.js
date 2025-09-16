const { model, Schema } = require('mongoose');

const blogSchema = new Schema({
    writerId: {
        type: Schema.Types.ObjectId,
        ref: 'users', // or 'authors' if you have a separate author model
        required: false
    },
    writerName: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String,
        required: true
    },
    audio: {
        type: String,
        default: null
    },
    category: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    publishedAt: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        default: 'pending' // pending, active, etc.
    },
    likes: [
        {
            userId: {
                type: Schema.Types.ObjectId,
                ref: 'users'
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    likesCount: {
        type: Number,
        default: 0
    },
    count: {
        type: Number,
        default: 0 // view count
    },
    comments: [
        {
            userId: { type: Schema.Types.ObjectId, ref: 'users' },
            name: String,
            text: String,
            date: { type: Date, default: Date.now }
        }
    ],
    isFeatured: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Text index for search
blogSchema.index({
    title: 'text',
    category: 'text',
    description: 'text'
}, {
    title: 5,
    description: 4,
    category: 2
});

module.exports = model('blog', blogSchema);
