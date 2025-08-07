const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    googleId: {
        type: String,
        required: true,
    },
    displayName: {
        type: String,
        required: true,
    },
    isAdmin:{
        type:Boolean,
        default:false,
    },
    email: {
        type: String,
        required: true,
    },
    nickname:{
        type:String,
        default:"",
    },
    image: {
        data:Buffer,
        type: String,
    },
    jwt: {
        type: String,
    },
    isAdmin:{
        type:Boolean,
        default:false,
    },
    emojis:{
      type:Array,
      default:[],
    },
    profileimage:{
      type:String,
      default:"",
    },
    year:{
      type:Number
    },
    interests:{
      type:Array,
      default:[],
    },
    bio:{
      type:String,
      default:"",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

UserSchema.methods.generateAuthToken = function() {
    const token = jwt.sign({ _id: this._id, email: this.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
    this.jwt = token;
    return token;
};

const User = mongoose.model('User', UserSchema);

module.exports = User;