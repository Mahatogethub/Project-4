const mongoose = require('mongoose');
//defined schema//
const urlSchema = new mongoose.Schema({

    urlCode: {
        type: String,
        required: true,
        unique: true,
        lowerCase: true,
        trim:true,

    },
    longUrl: {
        type: String,
        required: true,

    },
    shortUrl: {
        type: String,
        require: true,
        unique: true
    }

}, { timestamps: true });
module.exports = mongoose.model("Url", urlSchema)//==urls
