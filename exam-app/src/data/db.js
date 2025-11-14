// src/data/db.js
export const faculties = [
  { id: 1, name: "Computer Science" },
  { id: 2, name: "Engineering" }
];

export const courses = [
  { id: 1, name: "Cloud Computing", facultyId: 1, date: "", time: "", registered: 0, price: 750 },
  { id: 2, name: "Cryptography & Network Security", facultyId: 1, date: "09/12/2023", time: "14:00", registered: 0, price: 800 },
  { id: 3, name: "Discrete Sets, Proves & Functions", facultyId: 1, date: "09/16/2023", time: "09:00", registered: 0, price: 650 },
  { id: 4, name: "Programming Loops, Arrays & Functions", facultyId: 1, date: "09/18/2023", time: "10:00", registered: 0, price: 700 }
];

export let registrations = [];
export let messages = [
  { id: 1, from: "Admin", text: "Your registration is approved!", time: "Just now", read: false }
];