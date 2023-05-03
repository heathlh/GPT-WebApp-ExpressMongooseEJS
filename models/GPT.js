'use strict';
const mongoose = require( 'mongoose' );
const { Schema, Types } = mongoose;


var gptSchema = Schema({
    prompt: String,
    input:String,
    output: String,
    userId: {type: Types.ObjectId, ref:'user' }
});

module.exports = mongoose.model( 'GPTModel', gptSchema );
