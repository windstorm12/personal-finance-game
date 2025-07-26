import React, { useState } from "react";

// Dashboard Component (same as original)
function Dashboard({ state }) {
  const skillColors = {
    finance: 'bg-green-500',
    social: 'bg-blue-500',
    hustling: 'bg-purple-500',
    health: 'bg-red-500'
  };

  const skillIcons = {
    finance: '💰',
    social: '👥',
    hustling: '💼',
    health: '❤️'
  };

  // Investment summary
  const investmentTypes = ['stocks', 'bonds', 'realEstate', 'crypto', 'business'];
  const investments = state.investments || {};
  const passiveIncome = state.passiveIncome?.total || 0;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      {/* Top Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">${state.cash}</div>
          <div className="text-sm text-gray-600">Cash</div>
        </div>
        <div className="text-center">
          <div className={`text-2xl font-bold ${state.totalDebt > 0 ? 'text-red-600' : 'text-gray-600'}`}>
            ${state.totalDebt}
          </div>
          <div className="text-sm text-gray-600">Total Debt</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{state.stress}%</div>
          <div className="text-sm text-gray-600">Stress</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">W{state.week}D{state.day}</div>
          <div className="text-sm text-gray-600">Timeline</div>
        </div>
        <div className="text-center">
          <div className={`text-2xl font-bold ${state.creditScore >= 700 ? 'text-green-600' : state.creditScore >= 600 ? 'text-yellow-600' : 'text-red-600'}`}>
            {state.creditScore}
          </div>
          <div className="text-sm text-gray-600">Credit Score</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">${passiveIncome}/day</div>
          <div className="text-sm text-gray-600">Daily Passive Income</div>
        </div>
      </div>

      {/* Passive Income & Investments */}
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <span className="text-lg font-bold text-green-700 mr-2">💸 Passive Income:</span>
          <span className="text-green-700 font-semibold">${passiveIncome}/day</span>
        </div>
        <div className="flex flex-wrap gap-4">
          {investmentTypes.map(type => (
            investments[type] > 0 && (
              <div key={type} className="bg-gray-100 rounded px-3 py-1 text-sm text-gray-700 flex items-center gap-1">
                <span className="font-bold capitalize">{type}:</span> ${investments[type]}
              </div>
            )
          ))}
        </div>
      </div>

      {/* Stress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Stress Level</span>
          <span>{state.stress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-300 ${
              state.stress < 30 ? 'bg-green-500' : 
              state.stress < 70 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${state.stress}%` }}
          ></div>
        </div>
        {state.cash < 10000 && state.stress > 80 && (
          <div className="text-xs text-red-600 mt-1 font-semibold">
            ⚠️ Critical stress! Losing $8/day (early game protection)
          </div>
        )}
        {state.cash < 10000 && state.stress > 60 && state.stress <= 80 && (
          <div className="text-xs text-orange-600 mt-1">
            ⚠️ High stress! Losing $4/day (early game protection)
          </div>
        )}
        {state.cash < 10000 && state.stress > 40 && state.stress <= 60 && (
          <div className="text-xs text-yellow-600 mt-1">
            ⚠️ Moderate stress! Losing $2/day (early game protection)
          </div>
        )}
        {state.cash >= 10000 && state.stress > 80 && (
          <div className="text-xs text-red-600 mt-1 font-semibold">
            ⚠️ Critical stress! Losing $30/day
          </div>
        )}
        {state.cash >= 10000 && state.stress > 60 && state.stress <= 80 && (
          <div className="text-xs text-orange-600 mt-1">
            ⚠️ High stress! Losing $15/day
          </div>
        )}
        {state.cash >= 10000 && state.stress > 40 && state.stress <= 60 && (
          <div className="text-xs text-yellow-600 mt-1">
            ⚠️ Moderate stress! Losing $5/day
          </div>
        )}
        {state.stress > 70 && (
          <div className="text-xs text-red-600 mt-1 font-semibold">
            ⚠️ Warning: Short-term high stress is manageable, but if your stress stays above 70 for more than 2 weeks, you will lose 20% of your cash and your debt will increase by 5% each week until you recover.
          </div>
        )}
      </div>

      {/* Skills Section */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-3">Skills</h3>
        <div className="space-y-3">
          {Object.entries(state.skills).map(([skill, level]) => (
            <div key={skill} className="flex items-center">
              <div className="w-8 text-center mr-3">{skillIcons[skill]}</div>
              <div className="flex-1">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span className="capitalize">{skill}</span>
                  <span>{level}/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${skillColors[skill]}`}
                    style={{ width: `${level}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium">Income:</span> ${state.income}/week
          {state.skills.finance > 30 && (
            <div className="text-xs text-green-600">+${Math.round(state.skills.finance / 10)} from Finance</div>
          )}
          {state.skills.hustling > 30 && (
            <div className="text-xs text-green-600">+${Math.round(state.skills.hustling / 15)} from Hustling</div>
          )}
          {state.skills.health > 50 && (
            <div className="text-xs text-green-600">+${Math.round(state.skills.health / 20)} from Health</div>
          )}
        </div>
        <div>
          <span className="font-medium">Decisions:</span> {state.totalDecisions}
        </div>
      </div>
    </div>
  );
}

// Scenario Card Component (updated for investment choices)
function ScenarioCard({ scenario, onChoice, loading, onContinueDay }) {
  if (!scenario) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 flex-1 flex flex-col items-center justify-center">
        <div className="text-center text-gray-500 mb-6">
          <div className="text-4xl mb-4">🎯</div>
          <div className="text-xl font-semibold">No current scenario</div>
          <div className="text-sm">Click "Continue Day" to get a new challenge!</div>
        </div>
        <button
          onClick={onContinueDay}
          disabled={loading}
          className={`bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Loading...' : 'Continue Day'}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <div className="text-3xl mr-3">
            {scenario.category === 'finance' ? '💰' : 
             scenario.category === 'social' ? '👥' : 
             scenario.category === 'hustling' ? '💼' : '❤️'}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800">{scenario.title}</h2>
            <div className="text-sm text-gray-500 capitalize">{scenario.category}</div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-800">
              Base Cost: ${scenario.baseCost}
            </div>
            <div className="text-xs text-gray-500">Time: {scenario.timeCost}h</div>
          </div>
        </div>
        <p className="text-gray-700 text-lg leading-relaxed">{scenario.description}</p>
      </div>

      <div className="space-y-3">
        {scenario.choices.map((choice) => {
          const isInvestment = !!choice.investment;
          const isSell = !!choice.sellInvestment;
          // Skill change badges
          const skillBadges = choice.effects?.skills
            ? Object.entries(choice.effects.skills).map(([skill, value]) => (
                <span
                  key={skill}
                  className={`inline-block px-2 py-1 rounded text-xs font-semibold mr-2 mb-1 ${value > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                >
                  {value > 0 ? '+' : ''}{value} {skill.charAt(0).toUpperCase() + skill.slice(1)}
                </span>
              ))
            : null;
          return (
            <button
              key={choice.id}
              onClick={() => onChoice(choice.id)}
              disabled={loading}
              className={`w-full p-4 text-left border-2 border-gray-200 rounded-lg transition-all duration-200 
                  ${loading ? 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-300' : 'hover:border-blue-300 hover:bg-blue-50'} 
                  ${isInvestment ? 'border-green-400 bg-green-50' : ''} 
                  ${isSell ? 'border-yellow-400 bg-yellow-50' : ''}`}
            >
              <div className="flex justify-between items-start mb-1">
                <div className="font-medium text-gray-900">
                  {choice.text} {isInvestment && <span className="ml-2 text-green-600">(Investment)</span>}
                  {isSell && <span className="ml-2 text-yellow-600">(Sell)</span>}
                </div>
                {choice.investment && (
                  <div className="text-sm font-semibold text-green-700">
                    +${Math.round((choice.investment.amount * (0.10/365)))} /day
                  </div>
                )}
                {choice.sellInvestment && (
                  <div className="text-sm font-semibold text-yellow-700">
                    +${choice.sellInvestment.amount}
                  </div>
                )}
                {!choice.investment && !choice.sellInvestment && (
                  <div className="text-sm font-semibold text-gray-800">
                    {typeof choice.effects.income === 'number' && choice.effects.income !== 0
                      ? `+${choice.effects.income}/week`
                      : (typeof choice.effects.cash === 'number' && !isNaN(choice.effects.cash) && choice.effects.cash !== 0)
                        ? `${choice.effects.cash > 0 ? '+' : ''}$${Math.abs(choice.effects.cash)}`
                        : ''}
                  </div>
                )}
              </div>
              <div className="text-sm text-gray-600 mb-2">{choice.description}</div>
              {/* Skill change badges */}
              {skillBadges && <div className="mb-2">{skillBadges}</div>}
              {choice.skillModifiers && Object.values(choice.skillModifiers).some(mod => mod) && (
                <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                  {Object.values(choice.skillModifiers).filter(mod => mod).join(' • ')}
                </div>
              )}
              <div className="text-xs text-gray-500 mt-1">
                Stress: {choice.effects.stress > 0 ? '+' : ''}{choice.effects.stress} • Time: {choice.effects.time > 0 ? '+' : ''}{choice.effects.time}h
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Google Sign-in Component
function GoogleSignIn({ onSignIn }) {
  const handleGoogleSignIn = async () => {
    try {
      // Load Google Sign-in script
      if (!window.google) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
        
        script.onload = () => {
          initializeGoogleSignIn();
        };
      } else {
        initializeGoogleSignIn();
      }
    } catch (error) {
      console.error('Google Sign-in error:', error);
    }
  };

  const initializeGoogleSignIn = () => {
    window.google.accounts.id.initialize({
      client_id: '417955646685-k18098c9jlh9kgmptdrnsg5tlm89md06.apps.googleusercontent.com',
      callback: handleCredentialResponse,
      auto_select: false,
      cancel_on_tap_outside: true,
      prompt_parent_id: 'google-signin-button'
    });
    
    window.google.accounts.id.renderButton(
      document.getElementById('google-signin-button'),
      { 
        theme: 'outline', 
        size: 'large', 
        width: 300,
        type: 'standard',
        text: 'signin_with'
      }
    );
  };

  const handleCredentialResponse = async (response) => {
    try {
      console.log('Google authentication response received');
      console.log('Response type:', response.credential ? 'credential' : 'error');
      
      if (!response.credential) {
        console.error('No credential received from Google');
        return;
      }
      
      const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
      const res = await fetch(`${backendUrl}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token: response.credential })
      });
      
      const data = await res.json();
      console.log('Authentication response:', data);
      if (data.success) {
        console.log('Authentication successful, setting user:', data.user);
        
        // Store user data and mobile token for mobile fallback
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isAndroid = /Android/.test(navigator.userAgent);
        const isMobile = isIOS || isAndroid;
        
        if (isMobile) {
          console.log('Storing user data and mobile token for mobile fallback');
          localStorage.setItem('mobile_user_data', JSON.stringify(data.user));
          if (data.mobileToken) {
            localStorage.setItem('mobile_token', data.mobileToken);
            console.log('Mobile token stored:', data.mobileToken);
          }
        }
        
        onSignIn(data.user);
      } else {
        console.error('Authentication failed:', data);
      }
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎮</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Life Simulation Game</h1>
          <p className="text-gray-600">Sign in to start your financial journey!</p>
        </div>
        
        <div className="space-y-4">
          <div id="google-signin-button" className="flex justify-center">
            {/* Google Sign-in button will be rendered here */}
          </div>
          
          <button
            onClick={handleGoogleSignIn}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
            Sign in with Google
          </button>
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Your progress will be automatically saved</p>
          <p>Access your game from any device</p>
        </div>
      </div>
    </div>
  );
}

function DebtManagement({ state }) {
  const [paymentAmount, setPaymentAmount] = React.useState({});

  // Debt type icons and colors
  const debtTypeInfo = {
    'Credit Card': { icon: '💳', color: 'red' },
    'Student Loan': { icon: '🎓', color: 'blue' },
    'Car Loan': { icon: '🚗', color: 'yellow' },
    'Personal Loan': { icon: '🤝', color: 'purple' },
    'Medical Debt': { icon: '🏥', color: 'green' },
    'Payday Loan': { icon: '💸', color: 'orange' },
  };

  // Calculate total debt from debts array if needed
  let totalDebt = state?.totalDebt;
  if ((!totalDebt || totalDebt === 0) && state?.debts && Array.isArray(state.debts)) {
    totalDebt = state.debts.reduce((sum, d) => sum + (d.amount || 0), 0);
  }

  // Calculate debt-to-income ratio if possible
  const debtToIncome = state?.income ? ((totalDebt / (state.income * 52)) * 100).toFixed(1) : null;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-4xl font-extrabold mb-8 flex items-center gap-3 text-red-700">
        <span>💳</span> Debt Management
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-6 shadow flex flex-col items-center">
          <div className="text-2xl font-bold text-red-700 mb-1">${totalDebt?.toLocaleString() || 0}</div>
          <div className="text-sm text-gray-600">Total Debt</div>
        </div>
        <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-6 shadow flex flex-col items-center">
          <div className="text-2xl font-bold text-blue-700 mb-1">{state?.creditScore || 650}</div>
          <div className="text-sm text-gray-600">Credit Score</div>
        </div>
        <div className="bg-green-50 border-l-4 border-green-400 rounded-lg p-6 shadow flex flex-col items-center">
          <div className="text-2xl font-bold text-green-700 mb-1">{debtToIncome || '--'}%</div>
          <div className="text-sm text-gray-600">Debt-to-Income</div>
        </div>
      </div>
      {state?.debts && state.debts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {state.debts.map(debt => {
            const info = debtTypeInfo[debt.type] || { icon: '💰', color: 'gray' };
            const paidPercent = debt.originalAmount ? 100 - Math.round((debt.balance / debt.originalAmount) * 100) : 0;
            return (
              <div key={debt.id} className={`rounded-xl shadow-lg p-6 border-t-4 border-${info.color}-400 bg-white flex flex-col gap-3`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{info.icon}</span>
                  <span className={`font-bold text-${info.color}-700 text-lg`}>{debt.type}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Balance:</span>
                  <span className="font-semibold">${debt.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Interest:</span>
                  <span>{(debt.interestRate * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Monthly Payment:</span>
                  <span>${debt.monthlyPayment}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gray-500">Paid off:</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className={`h-2 rounded-full bg-${info.color}-400`} style={{ width: `${paidPercent}%` }}></div>
                  </div>
                  <span className="text-xs text-gray-700">{paidPercent}%</span>
                </div>
                <div className="flex gap-2 mt-2">
                  <input
                    type="number"
                    placeholder="Amount"
                    value={paymentAmount[debt.id] || ''}
                    onChange={e => setPaymentAmount({...paymentAmount, [debt.id]: e.target.value})}
                    className="flex-1 border rounded px-2 py-1 focus:ring-2 focus:ring-blue-400"
                  />
                  <button 
                    onClick={() => {/* TODO: hook up payment logic */}}
                    className={`bg-${info.color}-600 text-white px-4 py-1 rounded hover:bg-${info.color}-700 transition`}
                  >
                    Pay
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        totalDebt > 0 ? null : (
          <div className="text-center text-gray-500 py-12">
            <div className="text-6xl mb-4">🎉</div>
            <p className="text-lg font-semibold">No debt! You're debt-free!</p>
          </div>
        )
      )}
    </div>
  );
}

// Passive Income Component (show breakdown)
function PassiveIncome({ state }) {
  const investmentIcons = {
    'stocks': '📈',
    'bonds': '💵',
    'realEstate': '🏠',
    'crypto': '🪙',
    'business': '🏢',
    'other': '💼',
  };
  const investments = state?.investments || {};
  const total = state?.passiveIncome?.total || 0;
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-4xl font-extrabold mb-8 flex items-center gap-3 text-green-700">
        <span>💰</span> Passive Income
      </h2>
      <div className="mb-6">
        <span className="text-lg font-bold text-green-700 mr-2">Total Passive Income:</span>
        <span className="text-green-700 font-semibold">${total}/day</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(investments).map(([type, amount]) => (
          amount > 0 && (
            <div key={type} className="rounded-xl shadow-lg p-6 border-t-4 border-green-400 bg-white flex flex-col gap-3">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{investmentIcons[type] || '💼'}</span>
                <span className="font-bold text-green-700 text-lg capitalize">{type}</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span>Investment:</span>
                <span className="font-semibold">${amount}</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span>Daily Return:</span>
                <span className="font-semibold">${Math.round(amount * (({
                  stocks: 0.10, bonds: 0.05, realEstate: 0.08, crypto: 0.15, business: 0.12
                }[type] || 0) / 365))}</span>
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}

// Achievements Component
function Achievements({ state }) {
  // Use all achievements from backend, fallback to a default list if needed
  const achievements = [
    // Financial
    { id: 'rich', title: 'Getting Rich', description: 'Reach $10,000 in cash', rarity: 'common' },
    { id: 'first_investment', title: 'First Investment', description: 'Make your first investment', rarity: 'common' },
    { id: 'diverse_portfolio', title: 'Diverse Portfolio', description: 'Invest in at least 3 different asset types', rarity: 'uncommon' },
    { id: 'debt_destroyer', title: 'Debt Destroyer', description: 'Pay off $10,000 in total debt', rarity: 'rare' },
    { id: 'passive_pro', title: 'Passive Pro', description: 'Earn $500/day in passive income', rarity: 'epic' },
    { id: 'millionaire', title: 'Millionaire', description: 'Reach $1,000,000 in cash', rarity: 'epic' },
    // Skill
    { id: 'finance_expert', title: 'Finance Expert', description: 'Reach 50 in Finance skill', rarity: 'uncommon' },
    { id: 'finance_guru', title: 'Finance Guru', description: 'Reach 100 Finance skill', rarity: 'epic' },
    { id: 'social_butterfly', title: 'Social Butterfly', description: 'Reach 100 Social skill', rarity: 'epic' },
    { id: 'hustle_king', title: 'Hustle King', description: 'Reach 100 Hustling skill', rarity: 'epic' },
    { id: 'health_nut', title: 'Health Nut', description: 'Reach 100 Health skill', rarity: 'epic' },
    { id: 'balanced_life', title: 'Balanced Life', description: 'All skills above 80', rarity: 'legendary' },
    { id: 'jack_of_all_trades', title: 'Jack of All Trades', description: 'Reach at least 50 in every skill', rarity: 'legendary' },
    // Life
    { id: 'stress_free', title: 'Stress-Free', description: 'Keep stress below 20 for 10 consecutive days', rarity: 'rare' },
    { id: 'comeback_kid', title: 'Comeback Kid', description: 'Recover from bankruptcy to positive net worth', rarity: 'epic' },
    { id: 'investor', title: 'Investor', description: 'Make 10 separate investments', rarity: 'uncommon' },
    // Removed secret tier achievements
  ];
  const unlocked = state?.achievements?.unlocked || [];
  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'bg-gray-200 text-gray-700';
      case 'uncommon': return 'bg-green-200 text-green-700';
      case 'rare': return 'bg-blue-200 text-blue-700';
      case 'epic': return 'bg-purple-200 text-purple-700';
      case 'legendary': return 'bg-orange-200 text-orange-700';
      case 'secret': return 'bg-black text-yellow-300';
      default: return 'bg-gray-200 text-gray-700';
    }
  };
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-4xl font-extrabold mb-8 flex items-center gap-3 text-yellow-700">
        <span>🏆</span> Achievements
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {achievements.map(achievement => {
          const isUnlocked = unlocked.includes(achievement.id);
          return (
            <div
              key={achievement.id}
              className={`rounded-xl shadow-lg p-6 border-t-4 flex flex-col gap-2 transition ${isUnlocked ? getRarityColor(achievement.rarity) : 'bg-gray-100 border-gray-200 text-gray-400'}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className={`text-3xl ${isUnlocked ? 'text-yellow-500' : 'text-gray-400'}`}>{isUnlocked ? '🏆' : '🔒'}</span>
                <span className={`font-bold text-lg ${isUnlocked ? 'text-yellow-700' : 'text-gray-700'}`}>{achievement.title}</span>
                <span className={`ml-auto px-2 py-1 rounded text-xs font-semibold ${getRarityColor(achievement.rarity)}`}>{achievement.rarity.toUpperCase()}</span>
              </div>
              <div className={`text-sm ${isUnlocked ? 'text-gray-800' : 'text-gray-400'}`}>{achievement.description}</div>
              {isUnlocked && <div className="text-green-600 text-xs font-bold mt-2">Unlocked!</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Leaderboard() {
  const [leaderboard, setLeaderboard] = React.useState([]);
  const [category, setCategory] = React.useState('netWorth');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
    fetch(`${backendUrl}/leaderboard?category=${category}`)
      .then(res => res.json())
      .then(data => {
        // Deduplicate by userId, keep the highest net worth per user
        const bestByUser = {};
        data.forEach(entry => {
          if (!bestByUser[entry.userId] || entry.netWorth > bestByUser[entry.userId].netWorth) {
            bestByUser[entry.userId] = entry;
          }
        });
        const deduped = Object.values(bestByUser);
        deduped.sort((a, b) => {
          switch (category) {
            case 'netWorth': return b.netWorth - a.netWorth;
            case 'cash': return b.cash - a.cash;
            case 'week': return b.week - a.week;
            case 'decisions': return b.totalDecisions - a.totalDecisions;
            default: return b.netWorth - a.netWorth;
          }
        });
        setLeaderboard(deduped);
        setLoading(false);
      })
      .catch(() => {
        setLeaderboard([]);
        setLoading(false);
      });
  }, [category]);

  const getCategoryValue = (entry) => {
    switch (category) {
      case 'netWorth': return `$${entry.netWorth?.toLocaleString() || 0}`;
      case 'cash': return `$${entry.cash?.toLocaleString() || 0}`;
      case 'week': return `W${entry.week || 1}`;
      case 'decisions': return entry.totalDecisions || 0;
      default: return `$${entry.netWorth?.toLocaleString() || 0}`;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-4xl font-extrabold mb-8 flex items-center gap-3 text-purple-700">
        <span>🏅</span> Competition Leaderboard
      </h2>
      <div className="flex space-x-2 mb-6">
        <button 
          onClick={() => setCategory('netWorth')}
          className={`px-4 py-2 rounded-lg font-semibold shadow-sm transition ${category === 'netWorth' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-blue-100'}`}
        >
          Net Worth
        </button>
        <button 
          onClick={() => setCategory('cash')}
          className={`px-4 py-2 rounded-lg font-semibold shadow-sm transition ${category === 'cash' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-blue-100'}`}
        >
          Cash
        </button>
        <button 
          onClick={() => setCategory('week')}
          className={`px-4 py-2 rounded-lg font-semibold shadow-sm transition ${category === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-blue-100'}`}
        >
          Week
        </button>
        <button 
          onClick={() => setCategory('decisions')}
          className={`px-4 py-2 rounded-lg font-semibold shadow-sm transition ${category === 'decisions' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-blue-100'}`}
        >
          Decisions
        </button>
      </div>
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg font-semibold">Loading leaderboard...</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl shadow-lg bg-white">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="py-4 px-2 text-lg">#</th>
                <th className="py-4 px-2 text-lg">Player</th>
                <th className="py-4 px-2 text-lg">Net Worth</th>
                <th className="py-4 px-2 text-lg">Cash</th>
                <th className="py-4 px-2 text-lg">Week</th>
                <th className="py-4 px-2 text-lg">Decisions</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, idx) => (
                <tr key={entry.userId} className={`border-t transition ${idx === 0 ? 'bg-yellow-100' : idx === 1 ? 'bg-gray-100' : idx === 2 ? 'bg-orange-100' : 'hover:bg-purple-50'}`}>
                  <td className="py-3 px-2 font-semibold text-xl">
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center space-x-3">
                      {entry.picture ? (
                        <img src={entry.picture} alt="avatar" className="w-10 h-10 rounded-full border-2 border-purple-400" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center text-lg font-bold text-purple-700 border-2 border-purple-400">
                          {entry.name.charAt(0)}
                        </div>
                      )}
                      <span className="font-semibold text-gray-900">{entry.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-lg">${entry.netWorth?.toLocaleString() || 0}</td>
                  <td className="py-3 px-2 text-lg">${entry.cash?.toLocaleString() || 0}</td>
                  <td className="py-3 px-2 text-lg">W{entry.week || 1}</td>
                  <td className="py-3 px-2 text-lg">{entry.totalDecisions || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Main App Component with OAuth
export default function AppOAuth() {
  const [user, setUser] = React.useState(null);
  const [state, setState] = React.useState(null);
  const [scenario, setScenario] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [showDebtManagement, setShowDebtManagement] = React.useState(false);
  const [showPassiveIncome, setShowPassiveIncome] = React.useState(false);
  const [showAchievements, setShowAchievements] = React.useState(false);
  const [newAchievements, setNewAchievements] = React.useState([]);
  const [showMenu, setShowMenu] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState('game');
  const loadingRef = React.useRef(false);
  // Debounce flag for restart
  const [isRestarting, setIsRestarting] = React.useState(false);
  // Display name modal state
  const [showDisplayNameModal, setShowDisplayNameModal] = useState(false);
  const [displayNameInput, setDisplayNameInput] = useState("");
  const [displayNameError, setDisplayNameError] = useState("");

  // Check if user is already authenticated
  React.useEffect(() => {
    checkAuthStatus();
  }, []);

  // Show display name modal if user is logged in and display_name is missing
  React.useEffect(() => {
    console.log('Display name modal effect:', { 
      user: user ? { ...user, picture: user.picture ? 'present' : 'missing' } : null,
      hasDisplayName: user?.display_name,
      displayNameLength: user?.display_name?.length
    });
    
    if (user && (!user.display_name || user.display_name.trim() === "")) {
      console.log('Showing display name modal for user:', user.email);
      setShowDisplayNameModal(true);
      setDisplayNameInput("");
    } else {
      console.log('Hiding display name modal');
      setShowDisplayNameModal(false);
    }
  }, [user]);

  // Load game when user is authenticated
  React.useEffect(() => {
    console.log('User effect triggered:', user);
    if (user && !state) {
      console.log('Loading game for user:', user);
      loadGame();
    }
  }, [user]);

  async function checkAuthStatus() {
    // Detect mobile browsers
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    const isMobile = isIOS || isAndroid;
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    const isChrome = /Chrome/.test(navigator.userAgent);
    const isIOSSafari = isIOS && isSafari;
    const isIOSChrome = isIOS && isChrome;
    
    console.log('Checking auth status:', { 
      isIOS, 
      isAndroid, 
      isMobile, 
      isSafari, 
      isChrome, 
      isIOSSafari, 
      isIOSChrome 
    });
    
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
      console.log('Checking auth status from:', backendUrl);
      
      // For mobile devices, try token-based authentication first
      if (isMobile) {
        const mobileToken = localStorage.getItem('mobile_token');
        if (mobileToken) {
          console.log('Found mobile token, trying token-based auth');
          
          const tokenRes = await fetch(`${backendUrl}/auth/me`, { 
            credentials: 'include',
            headers: {
              "Cache-Control": "no-cache",
              "x-mobile-token": mobileToken
            }
          });
          
          if (tokenRes.ok) {
            const userData = await tokenRes.json();
            console.log('Token-based authentication successful:', userData);
            setUser(userData);
            loadGame();
            return;
          } else {
            console.log('Token-based auth failed, clearing token');
            localStorage.removeItem('mobile_token');
          }
        }
      }
      
      // Fallback to regular session-based authentication
      let retries = isMobile ? 2 : 1;
      let lastError = null;
      
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          console.log(`Auth check attempt ${attempt}/${retries}`);
          
          const res = await fetch(`${backendUrl}/auth/me`, { 
            credentials: 'include',
            headers: {
              "Cache-Control": "no-cache"
            }
          });
          console.log('Auth status response:', { status: res.status, ok: res.ok });
          
          if (res.ok) {
            const userData = await res.json();
            console.log('User authenticated:', userData);
            setUser(userData);
            loadGame();
            return; // Success, exit retry loop
          } else {
            console.log('User not authenticated, status:', res.status);
            
            // For mobile browsers, try fallback authentication if we have stored user data
            if (isMobile && attempt === retries) {
              const storedUser = localStorage.getItem('mobile_user_data');
              if (storedUser) {
                try {
                  const userData = JSON.parse(storedUser);
                  console.log('Trying mobile fallback auth with stored data:', userData);
                  
                  const fallbackRes = await fetch(`${backendUrl}/auth/mobile-fallback`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Cache-Control': 'no-cache'
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                      email: userData.email,
                      userId: userData.id
                    })
                  });
                  
                  if (fallbackRes.ok) {
                    const fallbackData = await fallbackRes.json();
                    console.log('Mobile fallback auth successful:', fallbackData);
                    setUser(fallbackData.user);
                    loadGame();
                    return;
                  } else {
                    console.log('Mobile fallback auth failed, clearing stored data');
                    localStorage.removeItem('mobile_user_data');
                  }
                } catch (fallbackError) {
                  console.error('Mobile fallback auth error:', fallbackError);
                  localStorage.removeItem('mobile_user_data');
                }
              }
            }
            
            setUser(null);
            return; // Not authenticated, no need to retry
          }
          
        } catch (error) {
          console.error(`Auth check attempt ${attempt} failed:`, error);
          lastError = error;
          
          if (attempt < retries) {
            console.log(`Retrying auth check in 1 second...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
        }
      }
      
      // If we get here, all retries failed
      console.error('Auth check failed after all retries:', lastError);
      setUser(null);
      
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    }
  }

  async function loadGame() {
    console.log('loadGame function called');
    setLoading(true);
    setError(null);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
      console.log('Fetching game data from /start');
      const res = await fetch(`${backendUrl}/start`, { 
        method: "POST",
        credentials: 'include'
      });
      console.log('Game data response status:', res.status);
      const data = await res.json();
      console.log('Game data received:', data);
      setState(data.state);
      setScenario(data.scenario);
    } catch (e) {
      console.error('Load game error:', e);
      setError("Failed to load game");
    } finally {
      setLoading(false);
    }
  }

  async function continueDay() {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
      const res = await fetch(`${backendUrl}/next-scenario`, {
        credentials: 'include'
      });
      const data = await res.json();
      setState(data.state);
      setScenario(data.scenario);
    } catch (e) {
      setError("Failed to continue day");
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }

  async function makeChoice(choiceId) {
    // Prevent multiple simultaneous calls
    if (loadingRef.current || loading) return;
    
    // Set loading states immediately
    loadingRef.current = true;
    setLoading(true);
    setError(null);

    // Add a small delay to ensure loading state is reflected in UI
    await new Promise(resolve => setTimeout(resolve, 50));
    
    console.log('Making choice:', {
      choiceId,
      currentScenario: scenario?.id,
      hasState: !!state
    });
    
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
      const res = await fetch(`${backendUrl}/choose-action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ choiceId }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Choice error:', {
          status: res.status,
          error: errorText
        });
        
        // If it's an invalid choice error, try to reload the scenario
        if (errorText.includes('Invalid choice') || errorText.includes('No current scenario')) {
          console.log('Detected invalid choice error, reloading scenario...');
          const reloadRes = await fetch(`${backendUrl}/next-scenario`, {
            credentials: 'include'
          });
          if (reloadRes.ok) {
            const reloadData = await reloadRes.json();
            setState(reloadData.state);
            setScenario(reloadData.scenario);
            setError("Choice failed - loaded new scenario");
            return;
          }
        }
        
        throw new Error(`Failed to make choice: ${errorText}`);
      }
      const data = await res.json();
      setState(data.state);
      setScenario(null);
      
      if (data.newAchievements && data.newAchievements.length > 0) {
        setNewAchievements(data.newAchievements);
        setTimeout(() => setNewAchievements([]), 5000);
      }
    } catch (e) {
      console.error('Choice error:', e);
      setError(e.message || "Failed to make choice");
    } finally {
      // Add a small delay before allowing new choices
      setTimeout(() => {
        setLoading(false);
        loadingRef.current = false;
      }, 500);
    }
  }

  async function handleSignOut() {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
      await fetch(`${backendUrl}/auth/logout`, { 
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
      setState(null);
      setScenario(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }

  // Restart game handler
  async function handleRestart() {
    if (isRestarting) return; // Prevent multiple simultaneous restarts
    setIsRestarting(true);
    setLoading(true);
    setError(null);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
      const res = await fetch(`${backendUrl}/start`, {
        method: "POST",
        credentials: 'include'
      });
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}: ${await res.text()}`);
      }
      const data = await res.json();
      setState(data.state);
      setScenario(data.scenario);
      setCurrentPage('game');
    } catch (e) {
      console.error('Restart error:', e);
      setError(`Failed to restart game: ${e.message}`);
    } finally {
      setLoading(false);
      // Add slight delay before allowing another restart
      setTimeout(() => setIsRestarting(false), 2000);
    }
  }

  async function submitDisplayName() {
    setDisplayNameError("");
    const name = displayNameInput.trim();
    if (name.length < 2 || name.length > 32) {
      setDisplayNameError("Display name must be 2-32 characters.");
      return;
    }
    
    // Detect mobile browsers
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    const isMobile = isIOS || isAndroid;
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    const isChrome = /Chrome/.test(navigator.userAgent);
    const isIOSSafari = isIOS && isSafari;
    const isIOSChrome = isIOS && isChrome;
    
    console.log('Submitting display name:', { 
      name, 
      isIOS, 
      isAndroid, 
      isMobile, 
      isSafari, 
      isChrome, 
      isIOSSafari, 
      isIOSChrome,
      userAgent: navigator.userAgent 
    });
    
    try {
      setLoading(true);
      const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
      
      // Prepare headers for mobile token authentication
      const headers = { 
        "Content-Type": "application/json",
        "Cache-Control": "no-cache"
      };
      
      // Add mobile token if available
      if (isMobile) {
        const mobileToken = localStorage.getItem('mobile_token');
        if (mobileToken) {
          headers['x-mobile-token'] = mobileToken;
          console.log('Using mobile token for display name submission');
        }
      }
      
      // Add retry logic for mobile browsers
      let retries = isMobile ? 3 : 1;
      let lastError = null;
      
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          console.log(`Display name attempt ${attempt}/${retries}`);
          
          const res = await fetch(`${backendUrl}/user/display-name`, {
            method: "POST",
            headers: headers,
            credentials: 'include',
            body: JSON.stringify({ display_name: name })
          });
          
          console.log('Display name response status:', res.status);
          
          if (!res.ok) {
            const data = await res.json();
            console.error('Display name error:', data);
            
            if (res.status === 401) {
              setDisplayNameError("Authentication required. Please sign in again.");
              // Optionally redirect to sign in
              setUser(null);
              return;
            }
            
            lastError = data.error || "Failed to set display name.";
            if (attempt < retries) {
              console.log(`Retrying in 1 second...`);
              await new Promise(resolve => setTimeout(resolve, 1000));
              continue;
            }
            
            setDisplayNameError(lastError);
            setLoading(false);
            return;
          }
          
          const data = await res.json();
          console.log('Display name success:', data);
          
          // Update user state with new display name
          setUser(prev => ({ ...prev, name, display_name: name }));
          setShowDisplayNameModal(false);
          return; // Success, exit retry loop
          
        } catch (err) {
          console.error(`Display name attempt ${attempt} failed:`, err);
          lastError = err.message;
          
          if (attempt < retries) {
            console.log(`Retrying in 1 second...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
        }
      }
      
      // If we get here, all retries failed
      setDisplayNameError(lastError || "Network error. Please try again.");
      
    } catch (err) {
      console.error('Display name submission error:', err);
      setDisplayNameError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Show sign-in screen if not authenticated
  if (!user) {
    return <GoogleSignIn onSignIn={setUser} />;
  }

  // Display name modal
  if (showDisplayNameModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4 text-purple-700">Choose Your Display Name</h2>
          <p className="mb-4 text-gray-600">This name will be shown on the leaderboard and in the game.</p>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-lg mb-2 text-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            placeholder="Enter display name"
            value={displayNameInput}
            onChange={e => setDisplayNameInput(e.target.value)}
            maxLength={32}
            disabled={loading}
            autoFocus
          />
          {displayNameError && <div className="text-red-600 mb-2 text-sm">{displayNameError}</div>}
          <button
            className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold text-lg mt-2 hover:bg-purple-700 transition disabled:opacity-50"
            onClick={submitDisplayName}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Name"}
          </button>
        </div>
      </div>
    );
  }

  if (loading && !state) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl font-semibold">Loading your game...</div>
        </div>
      </div>
    );
  }

  if (!loading && state == null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
        <div className="bg-white rounded-xl shadow-xl p-10 max-w-lg w-full text-center">
          <div className="text-6xl mb-4">❓</div>
          <h1 className="text-2xl font-bold text-gray-700 mb-2">No game data found</h1>
          <p className="text-lg text-gray-700 mb-6">Something went wrong. Please reload or restart the game.</p>
          {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
          <button
            onClick={handleRestart}
            className={`bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold transition ${(loading || isRestarting) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
            disabled={loading || isRestarting}
          >
            {loading || isRestarting ? 'Restarting...' : 'Restart Game'}
          </button>
        </div>
      </div>
    );
  }

  // Game Over Screen
  if (state && state.gameOver) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-100 to-purple-100">
        <div className="bg-white rounded-xl shadow-xl p-10 max-w-lg w-full text-center">
          <div className="text-6xl mb-4">💀</div>
          <h1 className="text-3xl font-bold text-red-700 mb-2">Game Over</h1>
          <p className="text-lg text-gray-700 mb-6">{state.gameOverReason || 'You have lost the game.'}</p>
          <button
            onClick={handleRestart}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? 'Restarting...' : 'Restart Game'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex flex-col">
      {/* Navigation Header */}
      <div className="bg-white shadow-lg px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <div className="space-y-1">
              <div className={`w-6 h-0.5 bg-gray-600 transition-all duration-200 ${showMenu ? 'rotate-45 translate-y-1.5' : ''}`}></div>
              <div className={`w-6 h-0.5 bg-gray-600 transition-all duration-200 ${showMenu ? 'opacity-0' : ''}`}></div>
              <div className={`w-6 h-0.5 bg-gray-600 transition-all duration-200 ${showMenu ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
            </div>
          </button>
          
          {/* User Info */}
          <div className="flex items-center space-x-3">
            {user.picture && (
              <img src={user.picture} alt={user.display_name || user.name} className="w-8 h-8 rounded-full" />
            )}
            <span className="font-medium text-gray-700">{user.display_name || user.name}</span>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800">🎮 Life Simulation Game</h1>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={handleSignOut}
            className="text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="w-full px-4 py-6 flex-1 flex flex-col">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {newAchievements.length > 0 && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <div className="font-semibold">🏆 New Achievements Unlocked!</div>
            {newAchievements.map(achievement => (
              <div key={achievement.id} className="text-sm">
                {achievement.title} - {achievement.description}
              </div>
            ))}
          </div>
        )}

        {/* Main Game Page */}
        {currentPage === 'game' && state && (
          <>
            <div className="w-full">
              <Dashboard state={state} />
            </div>
            <div className="flex flex-col lg:flex-row gap-6 w-full">
              {/* Main Game Area */}
              <div className="flex-1">
                <ScenarioCard 
                  scenario={scenario} 
                  onChoice={makeChoice} 
                  loading={loading}
                  onContinueDay={continueDay}
                />
              </div>
              {/* Sidebar */}
              <div className="lg:w-80 space-y-4">
                {/* Skill Levels Bar */}
                <div className="bg-white rounded-lg shadow-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">Your Skills</h3>
                  <div className="space-y-2">
                    {Object.entries(state?.skills || {}).map(([skill, level]) => (
                      <div key={skill} className="flex items-center gap-2">
                        <span className="text-xl">
                          {skill === 'finance' && '💰'}
                          {skill === 'social' && '👥'}
                          {skill === 'hustling' && '💼'}
                          {skill === 'health' && '❤️'}
                        </span>
                        <span className="capitalize w-20">{skill}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              skill === 'finance' ? 'bg-green-500' :
                              skill === 'social' ? 'bg-blue-500' :
                              skill === 'hustling' ? 'bg-purple-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${level}%` }}
                          ></div>
                        </div>
                        <span className="w-10 text-right font-semibold">{level}/100</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Competition Button */}
                <button
                  onClick={() => setCurrentPage('competition')}
                  className={`w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-200 font-medium flex items-center justify-center space-x-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={loading}
                >
                  <span className="text-xl">🏆</span>
                  <span>Competition</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Other Pages */}
        {currentPage === 'debt' && <DebtManagement state={state} />}
        {currentPage === 'passive' && <PassiveIncome state={state} />}
        {currentPage === 'achievements' && <Achievements state={state} />}
        {currentPage === 'competition' && <Leaderboard />}
      </div>
      {showMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-40 flex">
          <div className="bg-white w-64 h-full shadow-lg p-6 flex flex-col space-y-4">
            <button onClick={() => { setCurrentPage('game'); setShowMenu(false); }} className="text-left px-4 py-2 rounded hover:bg-blue-100">Game</button>
            <button onClick={() => { setCurrentPage('debt'); setShowMenu(false); }} className="text-left px-4 py-2 rounded hover:bg-blue-100">Debt</button>
            <button onClick={() => { setCurrentPage('passive'); setShowMenu(false); }} className="text-left px-4 py-2 rounded hover:bg-blue-100">Passive Income</button>
            <button onClick={() => { setCurrentPage('achievements'); setShowMenu(false); }} className="text-left px-4 py-2 rounded hover:bg-blue-100">Achievements</button>
            <button onClick={() => { setCurrentPage('competition'); setShowMenu(false); }} className="text-left px-4 py-2 rounded hover:bg-purple-100">Competition</button>
            <button onClick={handleSignOut} className="text-left px-4 py-2 rounded hover:bg-red-100 text-red-600">Sign Out</button>
          </div>
          <div className="flex-1" onClick={() => setShowMenu(false)} />
        </div>
      )}
    </div>
  );
} 