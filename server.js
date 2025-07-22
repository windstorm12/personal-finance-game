const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 3001;

// Allow credentials (cookies) from frontend dev server
const corsOptions = {
  origin: [/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/], // allow localhost or 127.0.0.1 on any port
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// File-based session storage
const SESSIONS_FILE = path.join(__dirname, 'sessions.json');

// Load existing sessions from file
function loadSessions() {
  try {
    let sessions = {};
    if (fs.existsSync(SESSIONS_FILE)) {
      const data = fs.readFileSync(SESSIONS_FILE, 'utf8');
      sessions = JSON.parse(data);
    }
    
    // Always ensure dummy profiles are present
    const dummyProfiles = createDummyProfiles();
    const sessionsWithDummies = { ...dummyProfiles, ...sessions };
    
    return sessionsWithDummies;
  } catch (error) {
    console.error('Error loading sessions:', error);
    // Return dummy profiles even if there's an error
    return createDummyProfiles();
  }
}

// Create dummy profiles that should always exist
function createDummyProfiles() {
  return {
    "dummy_player_1": {
      "cash": 50000,
      "time": 168,
      "stress": 20,
      "day": 1,
      "week": 15,
      "skills": {
        "finance": 85,
        "social": 70,
        "hustling": 90,
        "health": 75
      },
      "assets": [
        "Phone",
        "Laptop",
        "Car",
        "Investment Portfolio"
      ],
      "job": "Senior Developer",
      "jobLevel": 5,
      "jobExperience": 500,
      "income": 8000,
      "passiveIncome": {
        "investments": 2000,
        "rentalIncome": 1500,
        "dividends": 800,
        "sideBusiness": 1200,
        "royalties": 500,
        "total": 6000
      },
      "investments": {
        "stocks": 25000,
        "bonds": 15000,
        "realEstate": 100000,
        "crypto": 5000,
        "total": 145000
      },
      "debts": {
        "creditCards": [],
        "studentLoans": [],
        "carLoans": [],
        "personalLoans": [],
        "medicalDebt": [],
        "paydayLoans": []
      },
      "creditScore": 780,
      "totalDebt": 0,
      "monthlyDebtPayments": 0,
      "completedScenarios": ["scenario_1", "scenario_2", "scenario_3"],
      "totalDecisions": 45,
      "successfulDecisions": 42,
      "currentScenario": null,
      "scenarioHistory": [],
      "achievements": {
        "unlocked": ["debt_free", "millionaire", "skill_master"],
        "progress": {
          "totalEarnings": 150000,
          "debtFreeWeeks": 15,
          "maxSkillLevel": 90,
          "consecutiveGoodDecisions": 15,
          "investmentValue": 145000,
          "stressFreeWeeks": 8,
          "millionaireWeeks": 5,
          "skillMasterWeeks": 3
        }
      }
    },
    "dummy_player_2": {
      "cash": 15000,
      "time": 168,
      "stress": 45,
      "day": 1,
      "week": 8,
      "skills": {
        "finance": 60,
        "social": 80,
        "hustling": 45,
        "health": 55
      },
      "assets": [
        "Phone",
        "Laptop",
        "Small Business"
      ],
      "job": "Marketing Manager",
      "jobLevel": 3,
      "jobExperience": 200,
      "income": 4500,
      "passiveIncome": {
        "investments": 500,
        "rentalIncome": 0,
        "dividends": 200,
        "sideBusiness": 800,
        "royalties": 0,
        "total": 1500
      },
      "investments": {
        "stocks": 8000,
        "bonds": 3000,
        "realEstate": 0,
        "crypto": 1000,
        "total": 12000
      },
      "debts": {
        "creditCards": [
          {
            "id": "cc_1",
            "balance": 2000,
            "interestRate": 0.18,
            "monthlyPayment": 100,
            "type": "creditCard"
          }
        ],
        "studentLoans": [],
        "carLoans": [],
        "personalLoans": [],
        "medicalDebt": [],
        "paydayLoans": []
      },
      "creditScore": 720,
      "totalDebt": 2000,
      "monthlyDebtPayments": 100,
      "completedScenarios": ["scenario_1", "scenario_2"],
      "totalDecisions": 28,
      "successfulDecisions": 25,
      "currentScenario": null,
      "scenarioHistory": [],
      "achievements": {
        "unlocked": ["skill_master"],
        "progress": {
          "totalEarnings": 75000,
          "debtFreeWeeks": 0,
          "maxSkillLevel": 80,
          "consecutiveGoodDecisions": 8,
          "investmentValue": 12000,
          "stressFreeWeeks": 2,
          "millionaireWeeks": 0,
          "skillMasterWeeks": 1
        }
      }
    },
    "dummy_player_3": {
      "cash": 5000,
      "time": 168,
      "stress": 75,
      "day": 1,
      "week": 3,
      "skills": {
        "finance": 25,
        "social": 40,
        "hustling": 30,
        "health": 35
      },
      "assets": [
        "Phone",
        "Laptop"
      ],
      "job": "Junior Developer",
      "jobLevel": 1,
      "jobExperience": 50,
      "income": 2500,
      "passiveIncome": {
        "investments": 0,
        "rentalIncome": 0,
        "dividends": 0,
        "sideBusiness": 200,
        "royalties": 0,
        "total": 200
      },
      "investments": {
        "stocks": 1000,
        "bonds": 0,
        "realEstate": 0,
        "crypto": 500,
        "total": 1500
      },
      "debts": {
        "creditCards": [
          {
            "id": "cc_1",
            "balance": 1500,
            "interestRate": 0.22,
            "monthlyPayment": 75,
            "type": "creditCard"
          }
        ],
        "studentLoans": [
          {
            "id": "sl_1",
            "balance": 25000,
            "interestRate": 0.05,
            "monthlyPayment": 200,
            "type": "studentLoan"
          }
        ],
        "carLoans": [],
        "personalLoans": [],
        "medicalDebt": [],
        "paydayLoans": []
      },
      "creditScore": 650,
      "totalDebt": 26500,
      "monthlyDebtPayments": 275,
      "completedScenarios": ["scenario_1"],
      "totalDecisions": 12,
      "successfulDecisions": 8,
      "currentScenario": null,
      "scenarioHistory": [],
      "achievements": {
        "unlocked": [],
        "progress": {
          "totalEarnings": 15000,
          "debtFreeWeeks": 0,
          "maxSkillLevel": 40,
          "consecutiveGoodDecisions": 3,
          "investmentValue": 1500,
          "stressFreeWeeks": 0,
          "millionaireWeeks": 0,
          "skillMasterWeeks": 0
        }
      }
    }
  };
}

// Save sessions to file (preserving dummy profiles)
function saveSessions(sessions) {
  try {
    // Always ensure dummy profiles are included
    const dummyProfiles = createDummyProfiles();
    const sessionsWithDummies = { ...dummyProfiles, ...sessions };
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessionsWithDummies, null, 2));
  } catch (error) {
    console.error('Error saving sessions:', error);
  }
}

// Initialize sessions
let sessions = loadSessions();

// Game state structure
function getInitialState() {
  return {
    // Resources
    cash: 1000,
    time: 168, // hours per week
    stress: 0,
    day: 1,
    week: 1,
    
    // Skills (0-100)
    skills: {
      finance: 0,
      social: 0,
      hustling: 0,
      health: 0
    },
    
    // Inventory/Assets
    assets: ['Phone', 'Laptop'],
    job: 'Student',
    jobLevel: 1,
    jobExperience: 0,
    income: 0,
    
    // Passive Income System
    passiveIncome: {
      investments: 0,
      rentalIncome: 0,
      dividends: 0,
      sideBusiness: 0,
      royalties: 0,
      total: 0
    },
    investments: {
      stocks: 0,
      bonds: 0,
      realEstate: 0,
      crypto: 0,
      total: 0
    },
    
    // Debt System
    debts: {
      creditCards: [],
      studentLoans: [],
      carLoans: [],
      personalLoans: [],
      medicalDebt: [],
      paydayLoans: []
    },
    creditScore: 700,
    totalDebt: 0,
    monthlyDebtPayments: 0,
    
    // Progress tracking
    completedScenarios: [],
    totalDecisions: 0,
    
    // Achievement System
    achievements: {
      unlocked: [],
      progress: {
        totalEarnings: 0,
        debtFreeWeeks: 0,
        maxSkillLevel: 0,
        consecutiveGoodDecisions: 0,
        investmentValue: 0,
        stressFreeWeeks: 0,
        millionaireWeeks: 0,
        skillMasterWeeks: 0
      }
    },
    
    // Current state
    currentScenario: null,
    scenarioHistory: []
  };
}

// Dynamic Scenario Generator
const scenarioTemplates = {
  finance: {
    events: [
      { name: 'Car breaks down', cost: 500, time: 4, stress: 15 },
      { name: 'Phone screen cracks', cost: 200, time: 2, stress: 10 },
      { name: 'Unexpected medical bill', cost: 300, time: 3, stress: 20 },
      { name: 'Laptop stops working', cost: 800, time: 0, stress: 25 },
      { name: 'Investment opportunity', cost: 400, time: 2, stress: 15 },
      { name: 'Tax deadline approaching', cost: 50, time: 6, stress: 20 },
      { name: 'Insurance premium due', cost: 250, time: 1, stress: 10 },
      { name: 'Credit card payment overdue', cost: 150, time: 1, stress: 25 },
      { name: 'Stock market crash', cost: 300, time: 3, stress: 30 },
      { name: 'Cryptocurrency opportunity', cost: 200, time: 4, stress: 25 },
      { name: 'Real estate investment', cost: 1000, time: 8, stress: 20 },
      { name: 'Emergency fund needed', cost: 600, time: 2, stress: 35 },
      { name: 'Student loan payment', cost: 180, time: 1, stress: 15 },
      { name: 'Retirement planning', cost: 100, time: 5, stress: 10 },
      { name: 'Budget software subscription', cost: 80, time: 1, stress: 5 },
      { name: 'Financial advisor consultation', cost: 120, time: 3, stress: 8 },
      // Debt-related scenarios
      { name: 'Credit card bill due', cost: 200, time: 1, stress: 20, debtType: 'creditCard' },
      { name: 'Medical emergency debt', cost: 800, time: 2, stress: 35, debtType: 'medical' },
      { name: 'Car loan payment', cost: 300, time: 1, stress: 15, debtType: 'carLoan' },
      { name: 'Student loan payment due', cost: 250, time: 1, stress: 18, debtType: 'studentLoan' },
      { name: 'Payday loan emergency', cost: 400, time: 1, stress: 40, debtType: 'paydayLoan' },
      { name: 'Personal loan application', cost: 1000, time: 3, stress: 25, debtType: 'personalLoan' },
      { name: 'Debt consolidation offer', cost: 0, time: 2, stress: 10, debtType: 'consolidation' },
      { name: 'Collection agency call', cost: 0, time: 1, stress: 45, debtType: 'collections' },
      // Passive Income Opportunities
      { name: 'Stock market opportunity', cost: 200, time: 2, stress: 15, passiveType: 'stocks' },
      { name: 'Real estate investment', cost: 5000, time: 8, stress: 25, passiveType: 'realEstate' },
      { name: 'Bond investment offer', cost: 1000, time: 1, stress: 5, passiveType: 'bonds' },
      { name: 'Cryptocurrency opportunity', cost: 300, time: 3, stress: 30, passiveType: 'crypto' },
      { name: 'Dividend stock opportunity', cost: 400, time: 2, stress: 10, passiveType: 'dividends' },
      { name: 'Rental property opportunity', cost: 8000, time: 12, stress: 35, passiveType: 'rental' },
      { name: 'Side business opportunity', cost: 600, time: 6, stress: 20, passiveType: 'business' },
      { name: 'Royalty opportunity', cost: 150, time: 4, stress: 15, passiveType: 'royalties' },
      // Job-related scenarios
      { name: 'Job interview opportunity', cost: 50, time: 3, stress: 25, jobType: 'promotion' },
      { name: 'Career fair invitation', cost: 20, time: 4, stress: 15, jobType: 'networking' },
      { name: 'Freelance project offer', cost: 0, time: 8, stress: 20, jobType: 'freelance' },
      { name: 'Startup opportunity', cost: 1000, time: 12, stress: 35, jobType: 'entrepreneur' },
      { name: 'Remote work offer', cost: 100, time: 2, stress: 10, jobType: 'remote' },
      { name: 'Industry conference', cost: 300, time: 6, stress: 15, jobType: 'skillup' },
      { name: 'Mentorship program', cost: 200, time: 4, stress: 10, jobType: 'mentorship' },
      { name: 'Certification course', cost: 400, time: 10, stress: 20, jobType: 'certification' }
    ],
    choices: [
      {
        type: 'expensive_quick',
        text: 'Pay full price for quick fix',
        effects: { cash: -1, stress: -5, time: 0, skills: { finance: -5 } },
        description: 'Immediate solution but costly'
      },
      {
        type: 'cheap_slow',
        text: 'Find cheaper alternative',
        effects: { cash: -0.3, stress: 10, time: 4, skills: { finance: 15, hustling: 10 } },
        description: 'Save money but takes time'
      },
      {
        type: 'do_nothing',
        text: 'Ignore for now',
        effects: { cash: 0, stress: 15, time: 0, skills: { finance: -10 } },
        description: 'Avoid cost but risk consequences'
      },
      {
        type: 'take_debt',
        text: 'Take on debt',
        effects: { cash: 0, stress: 20, time: 1, skills: { finance: -5 } },
        description: 'Borrow money to cover the cost'
      },
      {
        type: 'pay_minimum',
        text: 'Pay minimum payment',
        effects: { cash: -0.1, stress: 10, time: 0, skills: { finance: 5 } },
        description: 'Pay the minimum to avoid penalties'
      },
      {
        type: 'pay_in_full',
        text: 'Pay in full',
        effects: { cash: -1, stress: -5, time: 1, skills: { finance: 15 } },
        description: 'Pay the full amount immediately'
      },
      {
        type: 'negotiate',
        text: 'Negotiate payment plan',
        effects: { cash: -0.3, stress: 5, time: 2, skills: { finance: 20, social: 10 } },
        description: 'Work out a payment arrangement'
      }
    ]
  },
  social: {
    events: [
      { name: 'Friend\'s birthday party', cost: 50, time: 4, stress: -10 },
      { name: 'Family dinner invitation', cost: 30, time: 3, stress: -5 },
      { name: 'Networking event', cost: 75, time: 5, stress: 5 },
      { name: 'Wedding invitation', cost: 200, time: 8, stress: -15 },
      { name: 'Reunion with old friends', cost: 100, time: 6, stress: -10 },
      { name: 'Charity fundraiser', cost: 150, time: 4, stress: -5 },
      { name: 'Sports game with friends', cost: 80, time: 5, stress: -8 },
      { name: 'Concert invitation', cost: 120, time: 6, stress: -12 },
      { name: 'Professional conference', cost: 250, time: 10, stress: 8 },
      { name: 'Book club meeting', cost: 20, time: 3, stress: -3 },
      { name: 'Cooking class with friends', cost: 90, time: 4, stress: -6 },
      { name: 'Weekend getaway', cost: 300, time: 12, stress: -12 },
      { name: 'Volunteer opportunity', cost: 40, time: 6, stress: -8 },
      { name: 'Language exchange meetup', cost: 15, time: 2, stress: -2 },
      { name: 'Board game night', cost: 25, time: 4, stress: -5 },
      { name: 'Art workshop', cost: 60, time: 5, stress: -4 }
    ],
    choices: [
      {
        type: 'attend_full',
        text: 'Attend and fully participate',
        effects: { cash: -1, stress: -10, time: -1, skills: { social: 25, health: 5 } },
        description: 'Great for relationships but expensive'
      },
      {
        type: 'attend_partial',
        text: 'Attend briefly',
        effects: { cash: -0.5, stress: -5, time: -0.5, skills: { social: 15 } },
        description: 'Show up but don\'t stay long'
      },
      {
        type: 'decline',
        text: 'Politely decline',
        effects: { cash: 0, stress: 5, time: 0, skills: { social: -5 } },
        description: 'Save time and money but miss out'
      }
    ]
  },
  hustling: {
    events: [
      { name: 'Freelance project offer', cost: 25, time: 10, stress: 10 },
      { name: 'Side hustle opportunity', cost: 100, time: 15, stress: 15 },
      { name: 'Overtime at work', cost: 30, time: 8, stress: 20 },
      { name: 'Business idea pitch', cost: 200, time: 12, stress: 25 },
      { name: 'Online course creation', cost: 50, time: 20, stress: 15 },
      { name: 'Tutoring opportunity', cost: 20, time: 6, stress: 5 },
      { name: 'Delivery job offer', cost: 15, time: 8, stress: 10 },
      { name: 'Online survey participation', cost: 5, time: 2, stress: 2 },
      { name: 'Uber driving opportunity', cost: 40, time: 12, stress: 12 },
      { name: 'Food delivery gig', cost: 30, time: 10, stress: 8 },
      { name: 'Virtual assistant work', cost: 60, time: 16, stress: 18 },
      { name: 'Social media management', cost: 80, time: 14, stress: 16 },
      { name: 'Graphic design project', cost: 150, time: 18, stress: 22 },
      { name: 'Content writing gig', cost: 70, time: 12, stress: 14 },
      { name: 'Website development', cost: 300, time: 24, stress: 28 },
      { name: 'App testing opportunity', cost: 25, time: 4, stress: 6 }
    ],
    choices: [
      {
        type: 'accept_full',
        text: 'Take on the challenge',
        effects: { cash: 0.5, stress: 15, time: -1, skills: { hustling: 25, finance: 10 } },
        description: 'Earn money and gain experience'
      },
      {
        type: 'accept_partial',
        text: 'Try a smaller version',
        effects: { cash: 0.2, stress: 8, time: -0.5, skills: { hustling: 15 } },
        description: 'Moderate commitment and reward'
      },
      {
        type: 'decline',
        text: 'Focus on current priorities',
        effects: { cash: 0, stress: -5, time: 0, skills: { hustling: 5 } },
        description: 'Avoid stress but miss opportunity'
      }
    ]
  },
  health: {
    events: [
      { name: 'Feeling under the weather', cost: 25, time: 0, stress: 10 },
      { name: 'Gym membership offer', cost: 80, time: 5, stress: -5 },
      { name: 'Dental checkup needed', cost: 150, time: 2, stress: 5 },
      { name: 'Mental health awareness', cost: 40, time: 3, stress: 15 },
      { name: 'Healthy meal planning', cost: 100, time: 4, stress: -10 },
      { name: 'Sleep schedule issues', cost: 35, time: 0, stress: 20 },
      { name: 'Exercise motivation', cost: 50, time: 6, stress: -8 },
      { name: 'Stress management workshop', cost: 120, time: 3, stress: -15 },
      { name: 'Yoga class invitation', cost: 45, time: 3, stress: -8 },
      { name: 'Meditation retreat', cost: 180, time: 8, stress: -20 },
      { name: 'Nutritionist consultation', cost: 120, time: 2, stress: -5 },
      { name: 'Physical therapy session', cost: 90, time: 2, stress: -3 },
      { name: 'Eye exam needed', cost: 75, time: 1, stress: 3 },
      { name: 'Massage therapy', cost: 85, time: 2, stress: -12 },
      { name: 'Running club membership', cost: 35, time: 4, stress: -6 },
      { name: 'Swimming lessons', cost: 110, time: 6, stress: -4 }
    ],
    choices: [
      {
        type: 'invest_health',
        text: 'Invest in health and wellness',
        effects: { cash: -1, stress: -15, time: -0.5, skills: { health: 25, social: 5 } },
        description: 'Good for long-term well-being'
      },
      {
        type: 'moderate_health',
        text: 'Make small improvements',
        effects: { cash: -0.3, stress: -8, time: -0.3, skills: { health: 15 } },
        description: 'Balanced approach to health'
      },
      {
        type: 'ignore_health',
        text: 'Focus on other priorities',
        effects: { cash: 0, stress: 5, time: 0, skills: { health: -10 } },
        description: 'Save money but neglect health'
      }
    ]
  }
};

// Generate random scenario with skill-based modifications
function generateScenario(state) {
  // Weighted category selection - finance and hustling get more weight
  const categoryWeights = {
    finance: 0.35,    // 35% chance
    hustling: 0.35,   // 35% chance
    social: 0.15,     // 15% chance
    health: 0.15      // 15% chance
  };
  
  // Generate weighted random selection
  const random = Math.random();
  let category;
  if (random < categoryWeights.finance) {
    category = 'finance';
  } else if (random < categoryWeights.finance + categoryWeights.hustling) {
    category = 'hustling';
  } else if (random < categoryWeights.finance + categoryWeights.hustling + categoryWeights.social) {
    category = 'social';
  } else {
    category = 'health';
  }
  
  const template = scenarioTemplates[category];
  
  // Pick random event
  const event = template.events[Math.floor(Math.random() * template.events.length)];
  
  // Generate dynamic choices based on event and player skills
  let choices = [];
  
  // Handle debt-specific scenarios
  if (event.debtType) {
    // Create debt-specific choices
    choices = [
      {
        id: `${category}_pay_in_full_0`,
        text: 'Pay in full',
        effects: {
          cash: -event.cost,
          stress: -5,
          time: 1,
          skills: { finance: 15 }
        },
        description: 'Pay the full amount immediately'
      },
      {
        id: `${category}_pay_minimum_1`,
        text: 'Pay minimum payment',
        effects: {
          cash: -Math.round(event.cost * 0.1),
          stress: 10,
          time: 0,
          skills: { finance: 5 }
        },
        description: 'Pay the minimum to avoid penalties'
      },
      {
        id: `${category}_take_debt_2`,
        text: 'Take on debt',
        effects: {
          cash: 0,
          stress: 20,
          time: 1,
          skills: { finance: -5 }
        },
        description: 'Borrow money to cover the cost'
      },
      {
        id: `${category}_negotiate_3`,
        text: 'Negotiate payment plan',
        effects: {
          cash: -Math.round(event.cost * 0.3),
          stress: 5,
          time: 2,
          skills: { finance: 20, social: 10 }
        },
        description: 'Work out a payment arrangement'
      }
    ];
  } else if (event.passiveType) {
    // Create passive income-specific choices
    const returnRates = {
      stocks: 0.10,      // 10% annual return
      bonds: 0.05,       // 5% annual return
      realEstate: 0.08,  // 8% annual return
      crypto: 0.15,      // 15% annual return (higher risk)
      dividends: 0.06,   // 6% dividend yield
      rental: 0.07,      // 7% rental yield
      business: 0.12,    // 12% business return
      royalties: 0.08    // 8% royalty return
    };
    
    const returnRate = returnRates[event.passiveType] || 0.08;
    const weeklyReturn = Math.round(event.cost * returnRate / 52);
    
    choices = [
      {
        id: `${category}_invest_full_0`,
        text: 'Invest fully',
        effects: {
          cash: -event.cost,
          stress: 5,
          time: event.time,
          skills: { finance: 20 }
        },
        description: `Invest ${event.cost} for ${weeklyReturn} weekly passive income`,
        passiveIncome: { type: event.passiveType, amount: event.cost, weeklyIncome: weeklyReturn }
      },
      {
        id: `${category}_invest_partial_1`,
        text: 'Invest partially',
        effects: {
          cash: -Math.round(event.cost * 0.5),
          stress: 3,
          time: Math.round(event.time * 0.5),
          skills: { finance: 10 }
        },
        description: `Invest ${Math.round(event.cost * 0.5)} for ${Math.round(weeklyReturn * 0.5)} weekly passive income`,
        passiveIncome: { type: event.passiveType, amount: Math.round(event.cost * 0.5), weeklyIncome: Math.round(weeklyReturn * 0.5) }
      },
      {
        id: `${category}_research_first_2`,
        text: 'Research first',
        effects: {
          cash: 0,
          stress: -5,
          time: 2,
          skills: { finance: 15 }
        },
        description: 'Learn more before investing'
      },
      {
        id: `${category}_skip_opportunity_3`,
        text: 'Skip opportunity',
        effects: {
          cash: 0,
          stress: 0,
          time: 0,
          skills: { finance: -5 }
        },
        description: 'Pass on this investment opportunity'
      }
    ];
  } else if (event.jobType) {
    // Create job-specific choices
    const jobEffects = {
      promotion: { income: 100, exp: 30, skills: { hustling: 15, social: 10 } },
      networking: { income: 50, exp: 20, skills: { social: 20 } },
      freelance: { income: 200, exp: 25, skills: { hustling: 20 } },
      entrepreneur: { income: 0, exp: 50, skills: { hustling: 30, finance: 20 } },
      remote: { income: 75, exp: 15, skills: { health: 10 } },
      skillup: { income: 0, exp: 40, skills: { hustling: 25 } },
      mentorship: { income: 0, exp: 35, skills: { social: 25, hustling: 15 } },
      certification: { income: 0, exp: 45, skills: { hustling: 30 } }
    };
    
    const effect = jobEffects[event.jobType];
    
    choices = [
      {
        id: `${category}_pursue_opportunity_0`,
        text: 'Pursue opportunity',
        effects: {
          cash: -event.cost,
          stress: event.stress,
          time: event.time,
          skills: effect.skills
        },
        description: `Gain ${effect.exp} job experience and ${effect.income > 0 ? `$${effect.income} income` : 'career advancement'}`,
        jobEffect: { exp: effect.exp, income: effect.income }
      },
      {
        id: `${category}_part_time_1`,
        text: 'Part-time approach',
        effects: {
          cash: -Math.round(event.cost * 0.5),
          stress: Math.round(event.stress * 0.7),
          time: Math.round(event.time * 0.7),
          skills: Object.fromEntries(Object.entries(effect.skills).map(([k, v]) => [k, Math.round(v * 0.7)]))
        },
        description: `Gain ${Math.round(effect.exp * 0.7)} job experience with less commitment`,
        jobEffect: { exp: Math.round(effect.exp * 0.7), income: Math.round(effect.income * 0.7) }
      },
      {
        id: `${category}_decline_2`,
        text: 'Decline for now',
        effects: {
          cash: 0,
          stress: -5,
          time: 0,
          skills: { hustling: -5 }
        },
        description: 'Focus on current responsibilities'
      }
    ];
  } else {
    // Use regular template choices for non-debt scenarios
    choices = template.choices.map((choice, index) => {
      let cashEffect = Math.round(event.cost * choice.effects.cash);
      let timeEffect = Math.round(event.time * choice.effects.time);
      let stressEffect = choice.effects.stress; // Base stress effect from choice
      // Add event stress impact
      if (event.stress > 0) {
        stressEffect += Math.round(event.stress * 0.5); // Event stress adds to choice stress
      } else if (event.stress < 0) {
        stressEffect += Math.round(event.stress * 0.3); // Event stress reduction is smaller
      }
      let skillEffects = { ...choice.effects.skills };
      
      // Apply skill-based modifications
      if (category === 'finance' && state.skills.finance > 20) {
        // Finance skill reduces costs and increases opportunities
        if (cashEffect < 0) {
          cashEffect = Math.round(cashEffect * (1 - state.skills.finance / 200)); // Up to 50% cost reduction
        } else if (cashEffect > 0) {
          cashEffect = Math.round(cashEffect * (1 + state.skills.finance / 100)); // Up to 100% bonus
        }
      }
      
      if (category === 'social' && state.skills.social > 20) {
        // Social skill provides borrowing options and relationship benefits
        if (cashEffect < 0 && state.cash + cashEffect < 0) {
          // Add borrowing option for social players
          cashEffect = Math.round(cashEffect * 0.8); // 20% reduction
          stressEffect += 5; // But increases stress
        }
      }
      
      if (category === 'hustling' && state.skills.hustling > 20) {
        // Hustling skill provides immediate cash but increases stress
        if (cashEffect > 0) {
          cashEffect = Math.round(cashEffect * (1 + state.skills.hustling / 150)); // Up to 67% bonus
          stressEffect += Math.round(state.skills.hustling / 20); // More stress for higher skill
        }
      }
      
      if (category === 'health' && state.skills.health > 20) {
        // Health skill provides long-term benefits and stress reduction
        if (stressEffect < 0) {
          stressEffect = Math.round(stressEffect * (1 - state.skills.health / 200)); // Better stress reduction
        }
        // Health skill also provides small income over time
        if (state.skills.health > 50) {
          cashEffect += Math.round(state.skills.health / 10); // Small bonus for high health
        }
      }
      
      // Stress level affects all choices
      if (state.stress > 70) {
        // High stress makes everything more expensive and stressful
        cashEffect = Math.round(cashEffect * 1.3);
        stressEffect += 10;
      } else if (state.stress > 40) {
        // Moderate stress has smaller penalties
        cashEffect = Math.round(cashEffect * 1.1);
        stressEffect += 5;
      }
      
      return {
        id: `${category}_${choice.type}_${index}`,
        text: choice.text,
        effects: {
          cash: cashEffect,
          stress: stressEffect,
          time: timeEffect,
          skills: skillEffects
        },
        description: choice.description,
        skillModifiers: {
          finance: state.skills.finance > 20 ? `Finance skill reduces cost by ${Math.round(state.skills.finance / 2)}%` : null,
          social: state.skills.social > 20 ? `Social skill provides borrowing options` : null,
          hustling: state.skills.hustling > 20 ? `Hustling skill increases earnings by ${Math.round(state.skills.hustling / 1.5)}%` : null,
          health: state.skills.health > 20 ? `Health skill reduces stress impact by ${Math.round(state.skills.health / 2)}%` : null
        }
      };
    });
  }
  
  // Apply skill-based modifications to debt choices
  if (event.debtType) {
    choices = choices.map((choice, index) => {
      let cashEffect = choice.effects.cash;
      let stressEffect = choice.effects.stress;
      let timeEffect = choice.effects.time;
      let skillEffects = { ...choice.effects.skills };
      
      // Apply skill-based modifications
      if (category === 'finance' && state.skills.finance > 20) {
        // Finance skill reduces costs and increases opportunities
        if (cashEffect < 0) {
          cashEffect = Math.round(cashEffect * (1 - state.skills.finance / 200)); // Up to 50% cost reduction
        } else if (cashEffect > 0) {
          cashEffect = Math.round(cashEffect * (1 + state.skills.finance / 100)); // Up to 100% bonus
        }
      }
      
      if (category === 'social' && state.skills.social > 20) {
        // Social skill provides borrowing options and relationship benefits
        if (cashEffect < 0 && state.cash + cashEffect < 0) {
          // Add borrowing option for social players
          cashEffect = Math.round(cashEffect * 0.8); // 20% reduction
          stressEffect += 5; // But increases stress
        }
      }
      
      if (category === 'hustling' && state.skills.hustling > 20) {
        // Hustling skill provides immediate cash but increases stress
        if (cashEffect > 0) {
          cashEffect = Math.round(cashEffect * (1 + state.skills.hustling / 150)); // Up to 67% bonus
          stressEffect += Math.round(state.skills.hustling / 20); // More stress for higher skill
        }
      }
      
      if (category === 'health' && state.skills.health > 20) {
        // Health skill provides long-term benefits and stress reduction
        if (stressEffect < 0) {
          stressEffect = Math.round(stressEffect * (1 - state.skills.health / 200)); // Better stress reduction
        }
        // Health skill also provides small income over time
        if (state.skills.health > 50) {
          cashEffect += Math.round(state.skills.health / 10); // Small bonus for high health
        }
      }
      
      // Stress level affects all choices
      if (state.stress > 70) {
        // High stress makes everything more expensive and stressful
        cashEffect = Math.round(cashEffect * 1.3);
        stressEffect += 10;
      } else if (state.stress > 40) {
        // Moderate stress has smaller penalties
        cashEffect = Math.round(cashEffect * 1.1);
        stressEffect += 5;
      }
      
      return {
        ...choice,
        effects: {
          cash: cashEffect,
          stress: stressEffect,
          time: timeEffect,
          skills: skillEffects
        },
        skillModifiers: {
          finance: state.skills.finance > 20 ? `Finance skill reduces cost by ${Math.round(state.skills.finance / 2)}%` : null,
          social: state.skills.social > 20 ? `Social skill provides borrowing options` : null,
          hustling: state.skills.hustling > 20 ? `Hustling skill increases earnings by ${Math.round(state.skills.hustling / 1.5)}%` : null,
          health: state.skills.health > 20 ? `Health skill reduces stress impact by ${Math.round(state.skills.health / 2)}%` : null
        }
      };
    });
  }
  

  
  // Add skill-based special choices
  if (state.skills.finance > 50 && category === 'finance') {
    choices.push({
      id: `${category}_finance_expert_${Date.now()}`,
      text: `Use financial expertise (Finance: ${state.skills.finance})`,
      effects: {
        cash: Math.round(event.cost * -0.3), // 30% cost reduction
        stress: -5,
        time: 2,
        skills: { finance: 5 }
      },
      description: `Your financial knowledge helps you find the best deal`,
      skillModifiers: { finance: `Expert finance skill activated` }
    });
  }
  
  if (state.skills.social > 50 && state.cash < 100) {
    choices.push({
      id: `${category}_social_loan_${Date.now()}`,
      text: `Ask friends for help (Social: ${state.skills.social})`,
      effects: {
        cash: 200,
        stress: 15,
        time: 1,
        skills: { social: -2 }
      },
      description: `Borrow money from your social network`,
      skillModifiers: { social: `Social network loan available` }
    });
  }
  
  if (state.skills.hustling > 50 && category === 'hustling') {
    choices.push({
      id: `${category}_hustle_boost_${Date.now()}`,
      text: `Go all out hustle mode (Hustling: ${state.skills.hustling})`,
      effects: {
        cash: Math.round(event.cost * 2),
        stress: 25,
        time: Math.round(event.time * 1.5),
        skills: { hustling: 10 }
      },
      description: `Maximum effort for maximum reward`,
      skillModifiers: { hustling: `Hustle mode activated` }
    });
  }
  
  if (state.skills.health > 50 && state.stress > 30) {
    choices.push({
      id: `${category}_health_recovery_${Date.now()}`,
      text: `Focus on wellness (Health: ${state.skills.health})`,
      effects: {
        cash: -50,
        stress: -20,
        time: 4,
        skills: { health: 5 }
      },
      description: `Invest in your well-being to reduce stress`,
      skillModifiers: { health: `Wellness recovery mode` }
    });
  }
  
  // Generate dynamic description
  const descriptions = [
    `You encounter a situation involving ${event.name.toLowerCase()}.`,
    `A ${event.name.toLowerCase()} requires your attention.`,
    `You're faced with ${event.name.toLowerCase()}.`,
    `An opportunity arises: ${event.name.toLowerCase()}.`,
    `You need to deal with ${event.name.toLowerCase()}.`
  ];
  
  const description = descriptions[Math.floor(Math.random() * descriptions.length)];
  
  return {
    id: `generated_${category}_${Date.now()}`,
    title: event.name,
    description: description,
    category: category,
    timeCost: event.time,
    baseCost: event.cost,
    choices: choices
  };
}

// Decision engine with stress costs and skill benefits
function applyChoiceEffects(state, choice) {
  const newState = { ...state };
  
  // Apply direct effects
  if (choice.effects.cash) newState.cash += choice.effects.cash;
  if (choice.effects.time) newState.time += choice.effects.time;
  if (choice.effects.stress) newState.stress += choice.effects.stress;
  if (choice.effects.income) newState.income += choice.effects.income;
  
  // --- BEGIN: Healthy choice stress reduction logic ---
  // Determine if the choice is "healthy" based on skill effects
  // Healthy if it increases health OR social skill (positive value)
  // AND it does NOT increase finance or hustling skill
  let healthyChoice = false;
  if (choice.effects && choice.effects.skills) {
    const skillEffects = choice.effects.skills;
    const incHealth = skillEffects.health && skillEffects.health > 0;
    const incSocial = skillEffects.social && skillEffects.social > 0;
    const incFinance = skillEffects.finance && skillEffects.finance > 0;
    const incHustling = skillEffects.hustling && skillEffects.hustling > 0;

    healthyChoice = (incHealth || incSocial) && !(incFinance || incHustling);

    if (healthyChoice) {
      // Randomize stress reduction between 1 and 5 (inclusive)
      const randomReduction = Math.floor(Math.random() * 5) + 1;
      newState.stress -= randomReduction;
    }
  }
  // Health scenario: reduce stress by 2 more (total 3)
  if (
    newState.currentScenario &&
    newState.currentScenario.category === 'health' &&
    (choice.type === 'invest_health' || choice.type === 'moderate_health')
  ) {
    newState.stress -= 2;
  }
  // Ensure stress does not go below zero
  if (newState.stress < 0) newState.stress = 0;
  // --- END: Healthy choice stress reduction logic ---
  
  // Apply skill effects
  if (choice.effects.skills) {
    Object.keys(choice.effects.skills).forEach(skill => {
      newState.skills[skill] = Math.max(0, Math.min(100, newState.skills[skill] + choice.effects.skills[skill]));
    });
  }
  
  // Handle debt-specific choices
  if (choice.id && choice.id.includes('take_debt')) {
    // Extract debt type from choice ID
    const choiceParts = choice.id.split('_');
    const category = choiceParts[0];
    
    // Find the current scenario to get debt information
    const currentScenario = newState.currentScenario;
    if (currentScenario && currentScenario.event && currentScenario.event.debtType) {
      const event = currentScenario.event;
      let interestRate, debtType;
      
      switch (event.debtType) {
        case 'creditCard':
          interestRate = 0.18;
          debtType = 'creditCard';
          break;
        case 'medical':
          interestRate = 0.08;
          debtType = 'medicalDebt';
          break;
        case 'carLoan':
          interestRate = 0.06;
          debtType = 'carLoan';
          break;
        case 'studentLoan':
          interestRate = 0.05;
          debtType = 'studentLoan';
          break;
        case 'paydayLoan':
          interestRate = 0.36;
          debtType = 'paydayLoan';
          break;
        case 'personalLoan':
          interestRate = 0.12;
          debtType = 'personalLoan';
          break;
        default:
          interestRate = 0.15;
          debtType = 'personalLoan';
      }
      
      // Add debt to state
      const debtState = addDebt(newState, debtType, event.cost, interestRate);
      Object.assign(newState, debtState);
    }
  }
  
  // Handle passive income choices
  if (choice.passiveIncome) {
    const { type, amount, weeklyIncome } = choice.passiveIncome;
    
    // Apply finance skill multiplier to passive income
    const multiplier = calculatePassiveIncomeMultiplier(newState);
    const adjustedWeeklyIncome = Math.round(weeklyIncome * multiplier);
    
    // Add investment and passive income
    if (type === 'stocks' || type === 'bonds' || type === 'realEstate' || type === 'crypto') {
      const returnRates = {
        stocks: 0.10,
        bonds: 0.05,
        realEstate: 0.08,
        crypto: 0.15
      };
      const returnRate = returnRates[type] || 0.08;
      const investmentState = addInvestment(newState, type, amount, returnRate);
      Object.assign(newState, investmentState);
    } else {
      // For other passive income sources
      const passiveState = addPassiveIncomeSource(newState, type, amount, adjustedWeeklyIncome);
      Object.assign(newState, passiveState);
    }
  }
  
  // Handle job-related choices
  if (choice.jobEffect) {
    const { exp, income } = choice.jobEffect;
    
    // Add job experience
    const jobState = addJobExperience(newState, exp);
    Object.assign(newState, jobState);
    
    // Add income if any
    if (income > 0) {
      newState.income += income;
    }
  }
  
  // Apply stress costs (early game is more forgiving)
  const isEarlyGame = (newState.week <= 10 || newState.cash < 10000);
  if (newState.stress > 80) {
    // Critical stress: lose money and time
    if (isEarlyGame) {
      newState.cash = Math.max(0, newState.cash - 70);
    } else {
      newState.cash = Math.max(0, newState.cash - 100);
    }
    newState.time = Math.max(0, newState.time - 4);
  } else if (newState.stress > 60) {
    // High stress: lose some money
    if (isEarlyGame) {
      newState.cash = Math.max(0, newState.cash - 50);
    } else {
      newState.cash = Math.max(0, newState.cash - 50);
    }
  } else if (newState.stress > 40) {
    // Moderate stress: small penalty
    newState.cash = Math.max(0, newState.cash - 5);
  }
  
  // Apply skill-based income bonuses
  if (newState.skills.finance > 30) {
    newState.income += Math.round(newState.skills.finance / 10); // Finance skill increases weekly income
  }
  if (newState.skills.hustling > 30) {
    newState.income += Math.round(newState.skills.hustling / 15); // Hustling skill provides side income
  }
  if (newState.skills.health > 50) {
    newState.income += Math.round(newState.skills.health / 20); // Health skill provides small passive income
  }
  
  // Update stats
  newState.totalDecisions++;
  if (choice.effects.cash > 0 || choice.effects.skills) {
    // Track consecutive good decisions for achievements
    newState.achievements.progress.consecutiveGoodDecisions++;
  } else {
    // Reset consecutive good decisions if choice wasn't beneficial
    newState.achievements.progress.consecutiveGoodDecisions = 0;
  }
  
  // Clamp values
  newState.cash = Math.max(0, newState.cash);
  newState.time = Math.max(0, Math.min(168, newState.time));
  newState.stress = Math.max(0, Math.min(100, newState.stress));
  
  return newState;
}

// Get next scenario based on current state
function getNextScenario(state) {
  // Generate a new scenario dynamically
  let scenario = generateScenario(state);
  
  // Ensure the scenario has at least one affordable choice
  let attempts = 0;
  while (attempts < 10) {
    const affordableChoices = scenario.choices.filter(choice => 
      state.cash + (choice.effects.cash || 0) >= 0
    );
    
    if (affordableChoices.length > 0) {
      break;
    }
    
    // Generate a new scenario if current one is too expensive
    scenario = generateScenario(state);
    attempts++;
  }
  
  // If still no affordable choices, adjust the scenario
  if (scenario.choices.every(choice => state.cash + (choice.effects.cash || 0) < 0)) {
    // Make one choice free
    scenario.choices[0].effects.cash = Math.min(0, state.cash);
  }
  
  return scenario;
}

// Progress time with stress impact and debt management
function progressTime(state) {
  const newState = { ...state };
  
  // Add weekly income
  newState.cash += newState.income;
  
  // Add passive income (finance skill increases returns)
  const passiveMultiplier = calculatePassiveIncomeMultiplier(newState);
          const adjustedPassiveIncome = Math.round((newState.passiveIncome && newState.passiveIncome.total ? newState.passiveIncome.total : 0) * passiveMultiplier);
  newState.cash += adjustedPassiveIncome;
  
  // Apply debt interest monthly (every 4 weeks)
  if (newState.week % 4 === 0) {
    newState = applyDebtInterest(newState);
  }
  
  // Stress impact on daily life
  if (newState.stress > 80) {
    // Critical stress: lose money and can't work effectively
    newState.cash = Math.max(0, newState.cash - 30);
    newState.time = Math.max(0, newState.time - 8);
  } else if (newState.stress > 60) {
    // High stress: reduced productivity
    newState.cash = Math.max(0, newState.cash - 15);
    newState.time = Math.max(0, newState.time - 4);
  } else if (newState.stress > 40) {
    // Moderate stress: small impact
    newState.cash = Math.max(0, newState.cash - 5);
    newState.time = Math.max(0, newState.time - 2);
  }
  
  // Debt stress impact
  if (newState.totalDebt > 2000) {
    newState.stress = Math.min(100, newState.stress + 5);
  } else if (newState.totalDebt > 1000) {
    newState.stress = Math.min(100, newState.stress + 2);
  }
  
  // Natural stress decay (health skill affects this)
  const stressDecay = newState.skills.health > 30 ? 8 : 5;
  newState.stress = Math.max(0, newState.stress - stressDecay);
  
  // Progress day/week
  newState.day++;
  if (newState.day > 7) {
    newState.day = 1;
    newState.week++;
    newState.time = 168; // Reset weekly time
    
    // Update achievement progress weekly
    newState = updateAchievementProgress(newState);
  }
  
  return newState;
}

// Debt management functions
function addDebt(state, debtType, amount, interestRate = 0.15, monthlyPayment = null) {
  const newState = { ...state };
  const debt = {
    id: Date.now().toString(),
    amount: amount,
    originalAmount: amount,
    interestRate: interestRate,
    monthlyPayment: monthlyPayment || Math.round(amount * 0.03), // 3% minimum payment
    dueDate: newState.week + 4, // Due in 4 weeks
    type: debtType,
    status: 'active'
  };
  
  newState.debts[debtType + 's'].push(debt);
  newState.totalDebt += amount;
  newState.monthlyDebtPayments += debt.monthlyPayment;
  
  // Impact credit score
  if (newState.totalDebt > 1000) {
    newState.creditScore = Math.max(300, newState.creditScore - 20);
  }
  
  return newState;
}

function payDebt(state, debtId, paymentAmount) {
  const newState = { ...state };
  
  // Find the debt
  let debtFound = false;
  Object.keys(newState.debts).forEach(debtType => {
    const debtIndex = newState.debts[debtType].findIndex(d => d.id === debtId);
    if (debtIndex !== -1) {
      const debt = newState.debts[debtType][debtIndex];
      const actualPayment = Math.min(paymentAmount, debt.amount);
      
      debt.amount -= actualPayment;
      newState.cash -= actualPayment;
      newState.totalDebt -= actualPayment;
      
      // If debt is paid off
      if (debt.amount <= 0) {
        newState.debts[debtType].splice(debtIndex, 1);
        newState.monthlyDebtPayments -= debt.monthlyPayment;
        newState.creditScore = Math.min(850, newState.creditScore + 15);
      }
      
      debtFound = true;
    }
  });
  
  return newState;
}

function applyDebtInterest(state) {
  const newState = { ...state };
  
  Object.keys(newState.debts).forEach(debtType => {
    newState.debts[debtType].forEach(debt => {
      if (debt.status === 'active') {
        const monthlyInterest = debt.amount * (debt.interestRate / 12);
        debt.amount += monthlyInterest;
        newState.totalDebt += monthlyInterest;
      }
    });
  });
  
  return newState;
}

function calculateDebtToIncomeRatio(state) {
  const monthlyIncome = (state.income + (state.passiveIncome && state.passiveIncome.total ? state.passiveIncome.total : 0)) * 4; // Weekly to monthly
  return monthlyIncome > 0 ? (state.monthlyDebtPayments / monthlyIncome) * 100 : 0;
}

// Passive Income Functions
function addInvestment(state, investmentType, amount, returnRate = 0.08) {
  const newState = { ...state };
  
  // Add to investments
  newState.investments[investmentType] += amount;
  newState.investments.total += amount;
  
  // Calculate weekly passive income (annual return / 52 weeks)
  const weeklyIncome = Math.round(amount * returnRate / 52);
  
  // Add to appropriate passive income category
  switch (investmentType) {
    case 'stocks':
      newState.passiveIncome.investments += weeklyIncome;
      break;
    case 'bonds':
      newState.passiveIncome.investments += weeklyIncome;
      break;
    case 'realEstate':
      newState.passiveIncome.rentalIncome += weeklyIncome;
      break;
    case 'crypto':
      newState.passiveIncome.investments += weeklyIncome;
      break;
  }
  
  // Update total passive income
      if (!newState.passiveIncome) {
      newState.passiveIncome = {
        investments: 0,
        rentalIncome: 0,
        dividends: 0,
        sideBusiness: 0,
        royalties: 0,
        total: 0
      };
    }
    newState.passiveIncome.total = Object.values(newState.passiveIncome).reduce((sum, income) => {
    return typeof income === 'number' ? sum + income : sum;
  }, 0);
  
  return newState;
}

function addPassiveIncomeSource(state, sourceType, amount, weeklyIncome) {
  const newState = { ...state };
  
  // Add to passive income
  newState.passiveIncome[sourceType] += weeklyIncome;
      if (!newState.passiveIncome) {
      newState.passiveIncome = {
        investments: 0,
        rentalIncome: 0,
        dividends: 0,
        sideBusiness: 0,
        royalties: 0,
        total: 0
      };
    }
    newState.passiveIncome.total += weeklyIncome;
  
  return newState;
}

function calculatePassiveIncomeMultiplier(state) {
  // Finance skill increases passive income returns
  const baseMultiplier = 1.0;
  const skillBonus = state.skills.finance / 100; // Up to 100% bonus
  return baseMultiplier + skillBonus;
}

// Job progression system
const JOB_PROGRESSION = {
  'Student': { level: 1, baseIncome: 0, nextJob: 'Intern', expRequired: 50 },
  'Intern': { level: 2, baseIncome: 200, nextJob: 'Junior Developer', expRequired: 100 },
  'Junior Developer': { level: 3, baseIncome: 400, nextJob: 'Software Developer', expRequired: 200 },
  'Software Developer': { level: 4, baseIncome: 600, nextJob: 'Senior Developer', expRequired: 400 },
  'Senior Developer': { level: 5, baseIncome: 800, nextJob: 'Tech Lead', expRequired: 600 },
  'Tech Lead': { level: 6, baseIncome: 1000, nextJob: 'Engineering Manager', expRequired: 800 },
  'Engineering Manager': { level: 7, baseIncome: 1200, nextJob: 'Director', expRequired: 1000 },
  'Director': { level: 8, baseIncome: 1500, nextJob: 'VP Engineering', expRequired: 1200 },
  'VP Engineering': { level: 9, baseIncome: 1800, nextJob: 'CTO', expRequired: 1500 },
  'CTO': { level: 10, baseIncome: 2200, nextJob: 'CEO', expRequired: 2000 },
  'CEO': { level: 11, baseIncome: 3000, nextJob: null, expRequired: null }
};

function addJobExperience(state, amount) {
  const newState = { ...state };
  newState.jobExperience += amount;
  
  // Check for job promotion
  const currentJob = JOB_PROGRESSION[newState.job];
  if (currentJob && newState.jobExperience >= currentJob.expRequired) {
    const nextJob = currentJob.nextJob;
    if (nextJob) {
      newState.job = nextJob;
      newState.jobLevel = JOB_PROGRESSION[nextJob].level;
      newState.income = JOB_PROGRESSION[nextJob].baseIncome;
      newState.jobExperience = 0; // Reset experience for next level
    }
  }
  
  return newState;
}

function changeJob(state, newJob, newIncome) {
  const newState = { ...state };
  newState.job = newJob;
  newState.income = newIncome;
  newState.jobLevel = JOB_PROGRESSION[newJob]?.level || 1;
  newState.jobExperience = 0;
  return newState;
}

// Leaderboard helper functions
function calculateNetWorth(state) {
  const cash = state.cash || 0;
  const assets = state.assets || [];
  const totalDebt = state.totalDebt || 0;
  return cash + (assets.length * 100) - totalDebt; // Include debt in net worth
}



function calculateSkillMastery(state) {
  const skills = state.skills || { finance: 0, social: 0, hustling: 0, health: 0 };
  return Object.values(skills).reduce((sum, skill) => sum + skill, 0);
}

function calculateFinancialGrowth(state) {
  const week = state.week || 1;
  const weeksPlayed = week - 1;
  const startingCash = 1000;
  const currentNetWorth = calculateNetWorth(state);
  return weeksPlayed > 0 ? ((currentNetWorth - startingCash) / startingCash) * 100 : 0;
}

function getLeaderboardData() {
  const leaderboardData = [];
  
  Object.entries(sessions).forEach(([sessionId, state]) => {
    // Include all players, including dummy profiles
    if (state.totalDecisions > 0 || sessionId.startsWith('dummy_player_')) {
      leaderboardData.push({
        sessionId,
        netWorth: calculateNetWorth(state),
        skillMastery: calculateSkillMastery(state),
        stressLevel: state.stress || 0,
        totalDecisions: state.totalDecisions || 0,
        weeksPlayed: (state.week || 1) - 1,
        financialGrowth: calculateFinancialGrowth(state),
        cash: state.cash || 0,
        skills: state.skills || { finance: 0, social: 0, hustling: 0, health: 0 },
        passiveIncome: (state.passiveIncome && state.passiveIncome.total) || 0,
        completedScenarios: (state.completedScenarios && state.completedScenarios.length) || 0
      });
    }
  });
  
  return leaderboardData;
}

// Achievement System
const ACHIEVEMENTS = {
  // Financial Achievements
  'debt_free': {
    id: 'debt_free',
    name: '🏆 Debt-Free Champion',
    description: 'Eliminate all debt and stay debt-free for 4 weeks',
    icon: '💳',
    rarity: 'rare',
    condition: (state) => state.totalDebt === 0 && state.achievements.progress.debtFreeWeeks >= 4
  },
  'millionaire': {
    id: 'millionaire',
    name: '💰 Millionaire by 20',
    description: 'Reach $1,000,000 net worth',
    icon: '💎',
    rarity: 'legendary',
    condition: (state) => calculateNetWorth(state) >= 1000000
  },
  'early_retirement': {
    id: 'early_retirement',
    name: '🌅 Early Retirement',
    description: 'Generate $1000+ weekly passive income',
    icon: '🏖️',
    rarity: 'epic',
    condition: (state) => (state.passiveIncome && state.passiveIncome.total ? state.passiveIncome.total : 0) >= 1000
  },
  'investment_guru': {
    id: 'investment_guru',
    name: '📈 Investment Guru',
    description: 'Invest $50,000+ across different asset classes',
    icon: '🎯',
    rarity: 'rare',
            condition: (state) => (state.investments && state.investments.total) >= 50000
  },
  
  // Skill Achievements
  'skill_master': {
    id: 'skill_master',
    name: '🎓 Skill Master',
    description: 'Reach level 80+ in all skills',
    icon: '🧠',
    rarity: 'epic',
    condition: (state) => Object.values(state.skills).every(skill => skill >= 80)
  },
  'finance_expert': {
    id: 'finance_expert',
    name: '💼 Finance Expert',
    description: 'Reach level 90+ in finance skill',
    icon: '📊',
    rarity: 'rare',
    condition: (state) => state.skills.finance >= 90
  },
  'social_butterfly': {
    id: 'social_butterfly',
    name: '🦋 Social Butterfly',
    description: 'Reach level 90+ in social skill',
    icon: '👥',
    rarity: 'rare',
    condition: (state) => state.skills.social >= 90
  },
  'hustle_king': {
    id: 'hustle_king',
    name: '👑 Hustle King',
    description: 'Reach level 90+ in hustling skill',
    icon: '💪',
    rarity: 'rare',
    condition: (state) => state.skills.hustling >= 90
  },
  'health_guru': {
    id: 'health_guru',
    name: '🧘 Health Guru',
    description: 'Reach level 90+ in health skill',
    icon: '❤️',
    rarity: 'rare',
    condition: (state) => state.skills.health >= 90
  },
  
  // Lifestyle Achievements
  'stress_free': {
    id: 'stress_free',
    name: '😌 Zen Master',
    description: 'Maintain stress below 20 for 8 weeks',
    icon: '🧘‍♀️',
    rarity: 'rare',
    condition: (state) => state.achievements.progress.stressFreeWeeks >= 8
  },
  'decision_master': {
    id: 'decision_master',
    name: '🎯 Decision Master',
    description: 'Make 20 consecutive good decisions',
    icon: '🎯',
    rarity: 'epic',
    condition: (state) => state.achievements.progress.consecutiveGoodDecisions >= 20
  },
  'speed_runner': {
    id: 'speed_runner',
    name: '⚡ Speed Runner',
    description: 'Reach $100,000 net worth by week 10',
    icon: '🏃',
    rarity: 'legendary',
    condition: (state) => state.week <= 10 && calculateNetWorth(state) >= 100000
  },
  'survivor': {
    id: 'survivor',
    name: '🏆 Survivor',
    description: 'Play for 50+ weeks',
    icon: '🛡️',
    rarity: 'common',
    condition: (state) => state.week >= 50
  },
  
  // Fun Achievements
  'college_dropout': {
    id: 'college_dropout',
    name: '🎓 College Dropout Tycoon',
    description: 'Reach $500,000 net worth while keeping education costs low',
    icon: '🎓',
    rarity: 'epic',
    condition: (state) => calculateNetWorth(state) >= 500000 && state.week <= 30
  },
  'crypto_whale': {
    id: 'crypto_whale',
    name: '🐋 Crypto Whale',
    description: 'Invest $10,000+ in cryptocurrency',
    icon: '₿',
    rarity: 'rare',
    condition: (state) => state.investments.crypto >= 10000
  },
  'real_estate_mogul': {
    id: 'real_estate_mogul',
    name: '🏢 Real Estate Mogul',
    description: 'Invest $25,000+ in real estate',
    icon: '🏢',
    rarity: 'epic',
    condition: (state) => state.investments.realEstate >= 25000
  },
  'dividend_king': {
    id: 'dividend_king',
    name: '👑 Dividend King',
    description: 'Generate $500+ weekly from dividends',
    icon: '💰',
    rarity: 'rare',
    condition: (state) => state.passiveIncome.dividends >= 500
  },
  'side_hustle_king': {
    id: 'side_hustle_king',
    name: '💼 Side Hustle King',
    description: 'Generate $300+ weekly from side business',
    icon: '🚀',
    rarity: 'rare',
    condition: (state) => state.passiveIncome.business >= 300
  },
  
  // Job-related achievements
  'career_starter': {
    id: 'career_starter',
    name: '🎯 Career Starter',
    description: 'Get your first job promotion',
    icon: '💼',
    rarity: 'common',
    condition: (state) => state.jobLevel > 1
  },
  'mid_level_manager': {
    id: 'mid_level_manager',
    name: '👔 Mid-Level Manager',
    description: 'Reach Senior Developer or higher',
    icon: '🎯',
    rarity: 'rare',
    condition: (state) => state.jobLevel >= 5
  },
  'executive_level': {
    id: 'executive_level',
    name: '🏢 Executive Level',
    description: 'Reach Director or higher position',
    icon: '👑',
    rarity: 'epic',
    condition: (state) => state.jobLevel >= 8
  },
  'ceo_achievement': {
    id: 'ceo_achievement',
    name: '👑 CEO Achievement',
    description: 'Reach CEO position',
    icon: '🏆',
    rarity: 'legendary',
    condition: (state) => state.job === 'CEO'
  },
  'job_hopper': {
    id: 'job_hopper',
    name: '🦘 Job Hopper',
    description: 'Gain 500+ total job experience',
    icon: '📈',
    rarity: 'rare',
    condition: (state) => state.achievements.progress.totalJobExp >= 500
  }
};

function checkAchievements(state) {
  const newAchievements = [];
  const updatedState = { ...state };
  
  Object.values(ACHIEVEMENTS).forEach(achievement => {
    if (!state.achievements.unlocked.includes(achievement.id) && achievement.condition(state)) {
      newAchievements.push(achievement);
      updatedState.achievements.unlocked.push(achievement.id);
    }
  });
  
  return { newAchievements, updatedState };
}

function updateAchievementProgress(state) {
  const newState = { ...state };
  const progress = newState.achievements.progress;
  
  // Update total earnings
          progress.totalEarnings = Math.max(progress.totalEarnings, state.cash + (state.investments && state.investments.total ? state.investments.total : 0));
  
  // Update debt-free weeks
  if (state.totalDebt === 0) {
    progress.debtFreeWeeks++;
  } else {
    progress.debtFreeWeeks = 0;
  }
  
  // Update max skill level
  const maxSkill = Math.max(...Object.values(state.skills));
  progress.maxSkillLevel = Math.max(progress.maxSkillLevel, maxSkill);
  
  // Update investment value
          progress.investmentValue = Math.max(progress.investmentValue, (state.investments && state.investments.total) || 0);
  
  // Update stress-free weeks
  if (state.stress <= 20) {
    progress.stressFreeWeeks++;
  } else {
    progress.stressFreeWeeks = 0;
  }
  
  // Update millionaire weeks
  if (calculateNetWorth(state) >= 1000000) {
    progress.millionaireWeeks++;
  }
  
      // Update skill master weeks
    if (Object.values(state.skills).every(skill => skill >= 80)) {
      progress.skillMasterWeeks++;
    }
    
    // Update total job experience
    progress.totalJobExp = Math.max(progress.totalJobExp || 0, state.jobExperience);
  
  return newState;
}



// API Endpoints

// Rate limiting for game restarts
const restartAttempts = new Map();
const RESTART_LIMIT = 1; // Number of restarts allowed
const RESTART_WINDOW = 2000; // Time window in milliseconds (2 seconds)

function isRestartAllowed(ip) {
  const now = Date.now();
  const userAttempts = restartAttempts.get(ip) || [];
  
  // Clean up old attempts
  const recentAttempts = userAttempts.filter(time => now - time < RESTART_WINDOW);
  
  if (recentAttempts.length >= RESTART_LIMIT) {
    return false;
  }
  
  // Record this attempt
  recentAttempts.push(now);
  restartAttempts.set(ip, recentAttempts);
  return true;
}

// Start new game
app.post('/start', (req, res) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  console.log('Start game request - IP:', clientIP);
  console.log('Existing cookie session:', req.cookies.sessionId);
  
  if (!isRestartAllowed(clientIP)) {
    console.log('Rate limit hit for IP:', clientIP);
    return res.status(429).send('Please wait before restarting again');
  }

  // Always generate a new session ID for /start
  const sessionId = Math.random().toString(36).substr(2, 9);
  console.log('Generated new session ID:', sessionId);

  // Set session cookie
  res.cookie('sessionId', sessionId, { 
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax',
    path: '/'
  });

  // Initialize new game state
  sessions[sessionId] = getInitialState();
  const nextScenario = getNextScenario(sessions[sessionId]);
  sessions[sessionId].currentScenario = nextScenario;
  
  // Save to file
  saveSessions(sessions);
  console.log('Game started with session ID:', sessionId);
  console.log('Active sessions:', Object.keys(sessions));
  
  res.json({
    state: sessions[sessionId],
    scenario: nextScenario
  });
});

// Get next scenario
app.get('/next-scenario', (req, res) => {
  const sessionId = req.cookies.sessionId;
  console.log('Next scenario request - Session ID:', sessionId);
  
  if (!sessionId) {
    console.log('No session ID in cookie');
    return res.status(400).json({ error: 'No session ID found' });
  }

  const state = sessions[sessionId];
  console.log('Session exists:', !!state);
  
  if (!state) {
    console.log('Invalid session - no state found for session ID:', sessionId);
    return res.status(400).json({ error: 'Invalid session' });
  }
  
  // Progress time
  const updatedState = progressTime(state);
  sessions[sessionId] = updatedState;
  
  // Get next scenario
  const nextScenario = getNextScenario(updatedState);
  sessions[sessionId].currentScenario = nextScenario;
  
  // Save to file
  saveSessions(sessions);
  
  res.json({
    state: updatedState,
    scenario: nextScenario
  });
});

// Choose action
app.post('/choose-action', (req, res) => {
  const sessionId = req.cookies.sessionId;
  const { choiceId } = req.body;
  
  console.log('Choose action request:', {
    sessionId,
    choiceId,
    body: req.body,
    cookies: req.cookies
  });

  if (!sessionId) {
    console.log('No session ID in cookie');
    return res.status(400).json({ error: 'No session ID found' });
  }

  const state = sessions[sessionId];
  console.log('Session state:', {
    exists: !!state,
    hasScenario: state?.currentScenario ? true : false,
    scenarioChoices: state?.currentScenario?.choices?.map(c => c.id)
  });
  
  if (!state || !state.currentScenario) {
    console.log('Invalid session or no scenario - Session ID:', sessionId);
    console.log('State exists:', !!state);
    console.log('Current scenario exists:', state?.currentScenario);
    return res.status(400).json({ error: 'Invalid session or no current scenario' });
  }
  
  // Find the chosen action
  const choice = state.currentScenario.choices.find(c => c.id === choiceId);
  if (!choice) {
    console.log('Invalid choice ID:', choiceId);
    console.log('Available choices:', state.currentScenario.choices.map(c => ({
      id: c.id,
      text: c.text
    })));
    return res.status(400).json({ error: 'Invalid choice' });
  }
  
  // Apply choice effects
  const updatedState = applyChoiceEffects(state, choice);
  
  // Mark scenario as completed
  updatedState.completedScenarios.push(state.currentScenario.id);
  updatedState.scenarioHistory.push({
    scenario: state.currentScenario.title,
    choice: choice.text,
    day: state.day,
    week: state.week
  });
  
  // Clear current scenario
  updatedState.currentScenario = null;
  
  // Check for new achievements
  const { newAchievements, updatedState: achievementState } = checkAchievements(updatedState);
  
  // Save updated state
  sessions[sessionId] = achievementState;
  saveSessions(sessions);
  
  console.log('Choice applied successfully:', {
    sessionId,
    choiceId,
    choiceText: choice.text
  });

  res.json({
    state: achievementState,
    choice: choice,
    message: `You chose: ${choice.text}`,
    newAchievements
  });
});

// Get current stats
app.get('/stats', (req, res) => {
  const { sessionId } = req.query;
  const state = sessions[sessionId];
  
  if (!state) {
    return res.status(400).json({ error: 'Invalid session' });
  }
  
  res.json({ state });
});

// Skill training mini-game (placeholder)
app.post('/train-skill', (req, res) => {
  const { sessionId, skill, timeSpent } = req.body;
  const state = sessions[sessionId];
  
  if (!state) {
    return res.status(400).json({ error: 'Invalid session' });
  }
  
  const updatedState = { ...state };
  updatedState.skills[skill] = Math.min(100, updatedState.skills[skill] + (timeSpent * 5));
  updatedState.time = Math.max(0, updatedState.time - timeSpent);
  updatedState.stress = Math.min(100, updatedState.stress + (timeSpent * 2));
  
  sessions[sessionId] = updatedState;
  
  res.json({
    state: updatedState,
    skillGained: timeSpent * 5
  });
});

// Get leaderboard
app.get('/leaderboard', (req, res) => {
  const { category = 'netWorth' } = req.query;
  const leaderboardData = getLeaderboardData();
  
  // Sort by category
  let sortedData;
  switch (category) {
    case 'netWorth':
      sortedData = leaderboardData.sort((a, b) => b.netWorth - a.netWorth);
      break;
    case 'cash':
      sortedData = leaderboardData.sort((a, b) => b.cash - a.cash);
      break;
    case 'passiveIncome':
      sortedData = leaderboardData.sort((a, b) => b.passiveIncome - a.passiveIncome);
      break;
    case 'skills':
      sortedData = leaderboardData.sort((a, b) => {
        const aSkills = Object.values(a.skills).reduce((sum, skill) => sum + skill, 0);
        const bSkills = Object.values(b.skills).reduce((sum, skill) => sum + skill, 0);
        return bSkills - aSkills;
      });
      break;
    default:
      sortedData = leaderboardData.sort((a, b) => b.netWorth - a.netWorth);
  }
  
  // Add rankings
  const rankedData = sortedData.map((entry, index) => ({
    ...entry,
    rank: index + 1,
    sessionId: entry.sessionId.substring(0, 8) // Truncate for privacy
  }));
  
  res.json(rankedData.slice(0, 20)); // Top 20
});

// Get player stats for leaderboard
app.get('/player-stats', (req, res) => {
  const { sessionId } = req.query;
  const state = sessions[sessionId];
  
  if (!state) {
    return res.status(400).json({ error: 'Invalid session' });
  }
  
  const playerStats = {
    netWorth: calculateNetWorth(state),
    skillMastery: calculateSkillMastery(state),
    stressLevel: state.stress,
    totalDecisions: state.totalDecisions,
    weeksPlayed: state.week - 1,
    financialGrowth: calculateFinancialGrowth(state),
    cash: state.cash,
    skills: Object.values(state.skills).reduce((sum, skill) => sum + skill, 0),
            passiveIncome: (state.passiveIncome && state.passiveIncome.total) || 0,
    completedScenarios: state.completedScenarios.length,
    totalDebt: state.totalDebt,
    creditScore: state.creditScore,
    debtToIncomeRatio: calculateDebtToIncomeRatio(state),
    rank: null
  };
  
  // Calculate rank
  const leaderboardData = getLeaderboardData();
  const sortedByNetWorth = leaderboardData.sort((a, b) => b.netWorth - a.netWorth);
  const rank = sortedByNetWorth.findIndex(entry => entry.sessionId === sessionId) + 1;
  playerStats.rank = rank;
  
  res.json(playerStats);
});

// Get debt information
app.get('/debt-info', (req, res) => {
  const { sessionId } = req.query;
  const state = sessions[sessionId];
  
  if (!state) {
    return res.status(400).json({ error: 'Invalid session' });
  }
  
  const debtInfo = {
    totalDebt: state.totalDebt,
    monthlyDebtPayments: state.monthlyDebtPayments,
    creditScore: state.creditScore,
    debtToIncomeRatio: calculateDebtToIncomeRatio(state),
    debts: state.debts
  };
  
  res.json(debtInfo);
});

// Pay debt
app.post('/pay-debt', (req, res) => {
  const { sessionId, debtId, paymentAmount } = req.body;
  const state = sessions[sessionId];
  
  if (!state) {
    return res.status(400).json({ error: 'Invalid session' });
  }
  
  if (state.cash < paymentAmount) {
    return res.status(400).json({ error: 'Insufficient funds' });
  }
  
  const updatedState = payDebt(state, debtId, paymentAmount);
  sessions[sessionId] = updatedState;
  saveSessions(sessions);
  
  res.json({
    state: updatedState,
    message: `Paid $${paymentAmount} toward debt`
  });
});

// Get achievements
app.get('/achievements', (req, res) => {
  const { sessionId } = req.query;
  const state = sessions[sessionId];
  
  if (!state) {
    return res.status(400).json({ error: 'Invalid session' });
  }
  
  const unlockedAchievements = state.achievements.unlocked.map(id => ACHIEVEMENTS[id]);
  const allAchievements = Object.values(ACHIEVEMENTS).map(achievement => ({
    ...achievement,
    unlocked: state.achievements.unlocked.includes(achievement.id),
    progress: getAchievementProgress(achievement, state)
  }));
  
  res.json({
    unlocked: unlockedAchievements,
    all: allAchievements,
    progress: state.achievements.progress,
    totalUnlocked: state.achievements.unlocked.length,
    totalAchievements: Object.keys(ACHIEVEMENTS).length
  });
});

function getAchievementProgress(achievement, state) {
  switch (achievement.id) {
    case 'debt_free':
      return { current: state.achievements.progress.debtFreeWeeks, target: 4 };
    case 'stress_free':
      return { current: state.achievements.progress.stressFreeWeeks, target: 8 };
    case 'decision_master':
      return { current: state.achievements.progress.consecutiveGoodDecisions, target: 20 };
    case 'millionaire':
      return { current: calculateNetWorth(state), target: 1000000 };
    case 'early_retirement':
      return { current: (state.passiveIncome && state.passiveIncome.total) || 0, target: 1000 };
    case 'investment_guru':
              return { current: (state.investments && state.investments.total) || 0, target: 50000 };
    case 'crypto_whale':
      return { current: state.investments.crypto, target: 10000 };
    case 'real_estate_mogul':
      return { current: state.investments.realEstate, target: 25000 };
    case 'dividend_king':
      return { current: state.passiveIncome.dividends, target: 500 };
    case 'side_hustle_king':
      return { current: state.passiveIncome.business, target: 300 };
    case 'finance_expert':
      return { current: state.skills.finance, target: 90 };
    case 'social_butterfly':
      return { current: state.skills.social, target: 90 };
    case 'hustle_king':
      return { current: state.skills.hustling, target: 90 };
    case 'health_guru':
      return { current: state.skills.health, target: 90 };
    case 'speed_runner':
      return { current: calculateNetWorth(state), target: 100000 };
    case 'survivor':
      return { current: state.week, target: 50 };
    default:
      return { current: 0, target: 1 };
  }
}

app.listen(PORT, () => {
  console.log(`Life Simulation Game Server running on http://localhost:${PORT}`);
}); 