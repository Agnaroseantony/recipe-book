const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      "Breakfast",
      "Lunch",
      "Dinner",
      "Snack",
      "Dessert",
      "Other"
    ]
  },
  ingredients: {
    type: String,
    required: true,
    trim: true
  },
  steps: {
    type: String,
    required: true,
    trim: true
  },
  cookingTime: {
    type: Number,
    required: true,
    min: 1
  }
}, { timestamps: true });

module.exports = mongoose.model("Recipe", recipeSchema);