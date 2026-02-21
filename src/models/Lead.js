// backend/src/models/Lead.js
const mongoose = require("mongoose");

const LeadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 120,
    },
    company: {
      type: String,
      default: "",
      trim: true,
      maxlength: 120,
    },
    requirement: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },
    source: {
      type: String,
      default: "website-lead",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lead", LeadSchema);
