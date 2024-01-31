const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const router = express.Router();
const Quiz = require("../models/quize");
const authenticate = require("../middleware/authenticate");

router.get("/dashboard/:userId", authenticate, async (req, res) => {
  try {
    const { userId } = req.params;

    const quizzes = await Quiz.find({ userId });

    const totalQuestions = quizzes.reduce(
      (sum, quiz) => sum + quiz.questions.length,
      0
    );

    const totalImpressions = quizzes.reduce(
      (sum, quiz) => sum + quiz.impression,
      0
    );
   
    const quizDetails = quizzes.map((quiz) => ({
      quizName: quiz.quizName,
      quizType: quiz.quizType,
      createdOn: quiz.createdOn,
      impression: quiz.impression,
      quizId: quiz._id,
    }));

    res.status(200).json({
      numberOfQuizzes: quizzes.length,
      totalNumberOfQuestions: totalQuestions,
      totalImpressions,
      quizDetails: quizDetails,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/createQuiz/:userId", authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const { quizName, questions, quizType } = req.body;
    if (!quizName || !quizType) {
      return res.status(400).json({ error: 'Quiz Name and QuizType are required fields.' });
    }
    const newQuiz = new Quiz({
      userId,
      quizName,
      questions,
      quizType,
    });
    await newQuiz.save();

    res
      .status(201)
      .json({ quizId: newQuiz._id, message: "Quiz created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/editQuiz/:userId/:quizId", authenticate, async (req, res) => {
  try {
    const { userId, quizId } = req.params;
    const { questions } = req.body;

    const quiz = await Quiz.findOne({ _id: quizId, userId });

    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    quiz.questions = questions;
    
    await quiz.save();

    res.status(200).json({ message: "Quiz updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:quizId", async (req, res) => {

  try {

    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    res.status(200).json({ quiz });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
router.put("/impression/:quizId", async(req,res)=>{
  try {

    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    quiz.impression +=1;
    await quiz.save();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
})
router.get("/analytics/:userId/:quizId", authenticate, async (req, res) => {
  try {
    const { userId, quizId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(quizId)
    ) {
      return res.status(400).json({ error: "Invalid user or quiz ID" });
    }

    const quiz = await Quiz.findOne({ userId, _id: quizId });

    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    let quizDetails;
    quizDetails = quiz.questions.map((question) => {
      const {
        questionText,
        correctAnswer,
        answerCount,
        correctCount,
        incorrectCount,
        optionVotes,
      } = question;
      return {
        questionText,
        correctAnswer,
        answerCount,
        correctCount,
        incorrectCount,
        optionVotes,
      };
    });

    res.status(200).json({ quizDetails });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/deleteQuiz/:userId/:quizId", authenticate, async (req, res) => {
  try {
    const { userId, quizId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(quizId)
    ) {
      return res.status(400).json({ error: "Invalid user or quiz ID" });
    }

    const quiz = await Quiz.findOne({ userId, _id: quizId });

    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    await Quiz.deleteOne({ _id: quizId });

    res.status(200).json({ message: "Quiz deleted successfully" });
  } catch (error) {
    console.error("Error in deleteQuiz API:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/:quizId", async (req, res) => {
  try {
    const { quizId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ error: "Invalid quiz ID" });
    }

    const quiz = await Quiz.findOne({ _id: quizId });

    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }
    req.body.forEach((response) => {
      const question = quiz.questions.find((q) =>
        q._id.equals(response.questionId)
      );

      if (question) {
        question.answerCount += 1;
        if (response.isCorrect) {
          question.correctCount += 1;
        } else {
          question.incorrectCount += 1;
        }
      }
    });
    await quiz.save();

    const quizDetails = quiz.questions.map((question) => {
      const { answerCount, correctCount, incorrectCount } = question;
      return {
        answerCount,
        correctCount,
        incorrectCount,
      };
    });

    res.status(200).json({ quizDetails });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/poll/:quizId", async (req, res) => {
  try {
    const { quizId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ error: "Invalid quiz ID" });
    }

    const quiz = await Quiz.findOne({ _id: quizId });

    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }
    req.body.forEach((response) => {
      const question = quiz.questions.find((q) =>
        q._id.equals(response.questionId)
      );
      if (question) {
        const selectedOptionIndex = response.selectedOption.toString();
        if (question.optionVotes.has(selectedOptionIndex)) {
          question.optionVotes.set(
            selectedOptionIndex,
            question.optionVotes.get(selectedOptionIndex) + 1
          );
        } else {
          question.optionVotes.set(selectedOptionIndex, 1);
        }
      }
    });
    await quiz.save();
    const quizDetails = quiz.questions.map((question) => {
      const { optionVotes } = question;
      return {
        optionVotes,
      };
    });

    res.status(200).json({ quizDetails });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
