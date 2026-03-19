const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                "Please enter a valid email address",
            ],
        },
        targetRole: {
            type: String,
            required: true,
            trim: true
        },
        experienceLevel: {
            type: String,
            required: true,
            trim: true
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
            select: false,            
        },
    },
    { timestamps: true }
);

// Pre-save hook to hash password
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    } else {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;