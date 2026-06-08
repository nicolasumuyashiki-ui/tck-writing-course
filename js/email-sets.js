/* =====================================================================
   TOEFL Writing 添削講座 — Write an Email 問題データ（全12セット）
   フィールド:
     scenario    = 状況説明（左パネルの Scenario ボックス）
     instruction = "Write an email to ___. In your email, do the following:"
     points      = タスクポイント3つ（配列）
     to / subject= メールヘッダー
   ===================================================================== */
const EMAIL_SETS = [
  { set:1,
    scenario:"You live in a university dormitory. For the past two weeks, two of the three washing machines in your building's laundry room have been out of order, and students often have to wait a long time or come back late at night to do their laundry.",
    instruction:"Write an email to the housing office. In your email, do the following:",
    points:["Describe the problem with the laundry machines and how long it has lasted.","Explain how the situation is affecting students in your building.","Ask the office to repair or replace the machines and request a timeline."],
    to:"housing@university.edu", subject:"Broken Washing Machines in Maple Hall" },

  { set:2,
    scenario:"You are applying for a summer research program and need a letter of recommendation. Professor Alvarez taught your statistics course last semester, where you earned a strong grade and completed a final project she praised.",
    instruction:"Write an email to Professor Alvarez. In your email, do the following:",
    points:["Remind her which course you took and mention your final project.","Politely ask whether she would be willing to write a recommendation letter.","Provide the deadline and offer to send any materials she may need."],
    to:"professor.alvarez@university.edu", subject:"Request for a Recommendation Letter — Summer Research Program" },

  { set:3,
    scenario:"A difficult midterm exam for your biology class is coming up in two weeks. You and a few classmates have decided to start a weekly study group, and you would like a classmate named Daniel, who is strong in biology, to join.",
    instruction:"Write an email to Daniel. In your email, do the following:",
    points:["Explain the purpose of the study group and when it will meet.","Describe how joining could benefit both him and the group.","Ask him to let you know whether he is interested."],
    to:"daniel.kim@university.edu", subject:"Invitation to Join Our Biology Study Group" },

  { set:4,
    scenario:"You borrowed a textbook from the university library to use for a major paper due next week. You just received a notice that another student has requested the book, so it must be returned in three days — before you can finish your paper.",
    instruction:"Write an email to the library circulation desk. In your email, do the following:",
    points:["Explain your situation and why you still need the book.","Ask whether the due date can be extended, even for a few days.","Suggest an alternative in case an extension is not possible."],
    to:"circulation@library.university.edu", subject:"Request to Extend Loan — Recalled Textbook" },

  { set:5,
    scenario:"You recently became interested in the university photography club after seeing their exhibition, but the semester has already started. You are not sure whether the club still accepts new members partway through the term.",
    instruction:"Write an email to the club president. In your email, do the following:",
    points:["Explain how you became interested in the club.","Ask whether you can still join now that the semester has started.","Ask about the next meeting time and what new members should bring."],
    to:"photoclub@university.edu", subject:"Joining the Photography Club Mid-Semester" },

  { set:6,
    scenario:"You bought three textbooks at the campus bookstore last week. When checking your receipt later, you noticed that one book was charged at the full price even though there was a clearly marked discount sign on the shelf.",
    instruction:"Write an email to the bookstore manager. In your email, do the following:",
    points:["Describe what you purchased and when.","Explain the pricing error you found on your receipt.","Request a refund of the difference and ask how to proceed."],
    to:"manager@campusbookstore.com", subject:"Incorrect Charge on a Discounted Textbook" },

  { set:7,
    scenario:"You had a writing tutoring appointment scheduled for this morning, but you overslept and missed it without notice. The tutor, Ms. Reyes, had set aside time specifically for you, and you would like to make things right.",
    instruction:"Write an email to Ms. Reyes. In your email, do the following:",
    points:["Apologize for missing the appointment and briefly explain what happened.","Acknowledge that her time is valuable.","Ask to reschedule and propose two specific times you are available."],
    to:"writing.center@university.edu", subject:"Apology and Request to Reschedule — Writing Appointment" },

  { set:8,
    scenario:"Your friend Mei has been looking for a flexible part-time job. You currently work weekends at a small bookstore café that is now hiring, and you think it would suit her well.",
    instruction:"Write an email to Mei. In your email, do the following:",
    points:["Describe the job and what the work involves.","Explain why you think it would be a good fit for her.","Recommend that she apply and tell her how to do so."],
    to:"mei.tanaka@email.com", subject:"A Part-Time Job That Might Be Perfect for You" },

  { set:9,
    scenario:"You are enrolled in a chemistry course with several discussion sections. Your assigned section conflicts with another required class, and you would like to move to a different section that meets on Thursdays.",
    instruction:"Write an email to your teaching assistant. In your email, do the following:",
    points:["Explain the scheduling conflict and which class causes it.","Ask whether you can switch to the Thursday discussion section.","Mention that you are willing to complete any paperwork required."],
    to:"ta.chem101@university.edu", subject:"Request to Switch Discussion Sections" },

  { set:10,
    scenario:"You are part of a four-person group project due at the end of the month. One member has not responded to messages or attended meetings for two weeks, and the remaining members are concerned about finishing on time and dividing the work fairly.",
    instruction:"Write an email to your professor. In your email, do the following:",
    points:["Describe the group's current progress and the problem you are facing.","Explain how the unresponsive member is affecting the group.","Ask for advice on how the situation should be handled."],
    to:"professor.brooks@university.edu", subject:"Concern About Our Group Project" },

  { set:11,
    scenario:"You live in an apartment building with no recycling bins, so most residents throw recyclable items in with the regular trash. You believe adding clearly labeled recycling bins near the entrance would help.",
    instruction:"Write an email to the building manager. In your email, do the following:",
    points:["Explain the current situation and why it is a problem.","Describe how recycling bins would benefit the building and residents.","Propose a specific location for the bins and offer to help organize it."],
    to:"manager@parksideapartments.com", subject:"Proposal to Add Recycling Bins" },

  { set:12,
    scenario:"You are interested in applying for an internship advertised by the university career center, but the posting does not clearly state the application deadline or whether first-year students are eligible.",
    instruction:"Write an email to the career center. In your email, do the following:",
    points:["Mention which internship you are asking about.","Ask about the application deadline and required documents.","Ask whether first-year students are eligible to apply."],
    to:"careers@university.edu", subject:"Question About the Marketing Internship Application" }
];
if(typeof module!=='undefined'){module.exports=EMAIL_SETS;}
