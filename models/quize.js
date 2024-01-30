const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
    optionText: { type: String},
    optionImgURL :{type:String},
    
});

const questionSchema = new mongoose.Schema({
    questionText: { type: String, required: true },
    options: [optionSchema],
    correctAnswer: { type: String},
    timer: { type: Number, default: 10 },
    optionType: { type: String, enum: ['text', 'image', 'text-and-image'], default: 'text' },
    optionVotes: Map,
    answerCount: { type: Number, default: 0 },
    correctCount: { type: Number, default: 0 },
    incorrectCount: { type: Number, default: 0 },
});

const quizSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quizName: { type: String, required: true },
    createdOn: { type: Date, default: Date.now },
    impression: { type: Number, default: 0 },
    questions: [questionSchema],
    quizType: { type: String, enum: ['q&a', 'poll']},
    
});

const Quiz = mongoose.model('Quizzes', quizSchema);

module.exports = Quiz;



