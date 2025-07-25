import React from "react";

// Dashboard Component
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
          <div className="text-2xl font-bold text-blue-600">{state.time}h</div>
          <div className="text-sm text-gray-600">Time Left</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{state.stress}%</div>
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
          <div className="text-2xl font-bold text-blue-600">${state.passiveIncome?.total || 0}</div>
          <div className="text-sm text-gray-600">Passive Income/Week</div>
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
          <span className="font-medium">Job:</span> {state.job}
        </div>
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

// Scenario Card Component
function ScenarioCard({ scenario, onChoice, loading }) {
  if (!scenario) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 flex-1 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-4">🎯</div>
          <div className="text-xl font-semibold">No current scenario</div>
          <div className="text-sm">Click "Continue Day" to get a new challenge!</div>
        </div>
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
        {scenario.choices.map((choice) => (
          <button
            key={choice.id}
            onClick={() => onChoice(choice.id)}
            disabled={loading}
            className="w-full p-4 text-left border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 disabled:opacity-50"
          >
            <div className="flex justify-between items-start mb-1">
              <div className="font-medium text-gray-900">{choice.text}</div>
              <div className="text-sm font-semibold text-gray-800">
                {choice.effects.cash > 0 ? '+' : ''}${Math.abs(choice.effects.cash)}
              </div>
            </div>
            <div className="text-sm text-gray-600 mb-2">{choice.description}</div>
            {choice.skillModifiers && Object.values(choice.skillModifiers).some(mod => mod) && (
              <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                {Object.values(choice.skillModifiers).filter(mod => mod).join(' • ')}
              </div>
            )}
            <div className="text-xs text-gray-500 mt-1">
              Stress: {choice.effects.stress > 0 ? '+' : ''}{choice.effects.stress} • Time: {choice.effects.time > 0 ? '+' : ''}{choice.effects.time}h
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}



// Debt Management Component
function DebtManagement({ sessionId, onClose }) {
  const [debtInfo, setDebtInfo] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [paymentAmount, setPaymentAmount] = React.useState('');
  const [selectedDebt, setSelectedDebt] = React.useState(null);

  React.useEffect(() => {
    async function loadDebtInfo() {
      try {
        const res = await fetch(`/debt-info?sessionId=${sessionId}`);
        const data = await res.json();
        setDebtInfo(data);
      } catch (error) {
        console.error('Failed to load debt info:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadDebtInfo();
  }, [sessionId]);

  async function payDebt(debtId, amount) {
    try {
      const res = await fetch('/pay-debt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, debtId, paymentAmount: amount }),
      });
      const data = await res.json();
      // Reload debt info
      const debtRes = await fetch(`/debt-info?sessionId=${sessionId}`);
      const debtData = await debtRes.json();
      setDebtInfo(debtData);
      setPaymentAmount('');
      setSelectedDebt(null);
    } catch (error) {
      console.error('Failed to pay debt:', error);
    }
  }

  const getDebtTypeName = (type) => {
    const names = {
      creditCards: 'Credit Card',
      studentLoans: 'Student Loan',
      carLoans: 'Car Loan',
      personalLoans: 'Personal Loan',
      medicalDebt: 'Medical Debt',
      paydayLoans: 'Payday Loan'
    };
    return names[type] || type;
  };

  const getInterestRateColor = (rate) => {
    if (rate > 0.15) return 'text-red-600';
    if (rate > 0.10) return 'text-orange-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl font-semibold">Loading Debt Information...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">💳 Debt Management</h2>
        <button
          onClick={onClose}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
        >
          ← Back to Game
        </button>
      </div>

        {/* Debt Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-600 font-medium">Total Debt</div>
            <div className="text-2xl font-bold text-red-600">${debtInfo.totalDebt.toLocaleString()}</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-blue-600 font-medium">Monthly Payments</div>
            <div className="text-2xl font-bold text-blue-600">${debtInfo.monthlyDebtPayments.toLocaleString()}</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-green-600 font-medium">Credit Score</div>
            <div className="text-2xl font-bold text-green-600">{debtInfo.creditScore}</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-yellow-600 font-medium">Debt-to-Income</div>
            <div className="text-2xl font-bold text-yellow-600">{debtInfo.debtToIncomeRatio.toFixed(1)}%</div>
          </div>
        </div>

        {/* Debt List */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4">Your Debts</h3>
          {Object.keys(debtInfo.debts).some(type => debtInfo.debts[type].length > 0) ? (
            <div className="space-y-3">
              {Object.keys(debtInfo.debts).map(debtType => 
                debtInfo.debts[debtType].map(debt => (
                  <div key={debt.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-semibold">{getDebtTypeName(debtType)}</div>
                        <div className="text-sm text-gray-600">Original: ${debt.originalAmount.toLocaleString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-red-600">${debt.amount.toLocaleString()}</div>
                        <div className={`text-sm ${getInterestRateColor(debt.interestRate)}`}>
                          {(debt.interestRate * 100).toFixed(1)}% APR
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
                      <span>Monthly Payment: ${debt.monthlyPayment}</span>
                      <span>Due: Week {debt.dueDate}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedDebt(debt)}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Pay Debt
                      </button>
                      <button
                        onClick={() => payDebt(debt.id, debt.monthlyPayment)}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Pay Minimum
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">🎉</div>
              <div className="text-xl font-semibold">No Active Debts!</div>
              <div className="text-sm">You're debt-free. Great job managing your finances!</div>
            </div>
          )}
        </div>

        {/* Payment Modal */}
        {selectedDebt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold mb-4">Pay {getDebtTypeName(selectedDebt.type)}</h3>
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-2">Current Balance: ${selectedDebt.amount.toLocaleString()}</div>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter payment amount"
                  className="w-full p-2 border border-gray-300 rounded"
                  max={selectedDebt.amount}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    payDebt(selectedDebt.id, parseInt(paymentAmount));
                  }}
                  disabled={!paymentAmount || parseInt(paymentAmount) <= 0}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
                >
                  Pay ${paymentAmount || 0}
                </button>
                <button
                  onClick={() => {
                    setSelectedDebt(null);
                    setPaymentAmount('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}

// Passive Income Management Component
function PassiveIncomeManagement({ state, onClose }) {
  const getInvestmentTypeName = (type) => {
    const names = {
      stocks: 'Stocks',
      bonds: 'Bonds',
      realEstate: 'Real Estate',
      crypto: 'Cryptocurrency',
      dividends: 'Dividend Stocks',
      rental: 'Rental Income',
      business: 'Side Business',
      royalties: 'Royalties'
    };
    return names[type] || type;
  };

  const getReturnRate = (type) => {
    const rates = {
      stocks: 10,
      bonds: 5,
      realEstate: 8,
      crypto: 15,
      dividends: 6,
      rental: 7,
      business: 12,
      royalties: 8
    };
    return rates[type] || 8;
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">💰 Passive Income Portfolio</h2>
        <button
          onClick={onClose}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
        >
          ← Back to Game
        </button>
      </div>

        {/* Passive Income Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-green-600 font-medium">Total Passive Income</div>
            <div className="text-2xl font-bold text-green-600">${state.passiveIncome?.total || 0}/week</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-blue-600 font-medium">Total Investments</div>
            <div className="text-2xl font-bold text-blue-600">${state.investments?.total || 0}</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-purple-600 font-medium">Finance Skill Bonus</div>
            <div className="text-2xl font-bold text-purple-600">+{state.skills?.finance || 0}%</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-yellow-600 font-medium">Annual Return</div>
            <div className="text-2xl font-bold text-yellow-600">${Math.round((state.passiveIncome?.total || 0) * 52)}/year</div>
          </div>
        </div>

        {/* Investment Breakdown */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4">Investment Portfolio</h3>
          {state.investments && Object.keys(state.investments).some(key => key !== 'total' && state.investments[key] > 0) ? (
            <div className="space-y-3">
              {Object.entries(state.investments).map(([type, amount]) => {
                if (type === 'total' || amount === 0) return null;
                const returnRate = getReturnRate(type);
                const weeklyIncome = Math.round(amount * returnRate / 52 / 100);
                return (
                  <div key={type} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold">{getInvestmentTypeName(type)}</div>
                        <div className="text-sm text-gray-600">${amount.toLocaleString()} invested</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">${weeklyIncome}/week</div>
                        <div className="text-sm text-gray-600">{returnRate}% annual return</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">📈</div>
              <div className="text-xl font-semibold">No Investments Yet</div>
              <div className="text-sm">Start investing to build passive income!</div>
            </div>
          )}
        </div>

        {/* Passive Income Sources */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4">Passive Income Sources</h3>
          {state.passiveIncome && Object.keys(state.passiveIncome).some(key => key !== 'total' && state.passiveIncome[key] > 0) ? (
            <div className="space-y-3">
              {Object.entries(state.passiveIncome).map(([type, income]) => {
                if (type === 'total' || income === 0) return null;
                return (
                  <div key={type} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold">{getInvestmentTypeName(type)}</div>
                        <div className="text-sm text-gray-600">Passive income source</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">${income}/week</div>
                        <div className="text-sm text-gray-600">${Math.round(income * 52)}/year</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">💡</div>
              <div className="text-xl font-semibold">No Passive Income Yet</div>
              <div className="text-sm">Look for investment opportunities in scenarios!</div>
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">💡 Investment Tips</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Higher finance skill increases passive income returns</li>
            <li>• Diversify investments across different asset classes</li>
            <li>• Real estate and stocks offer good long-term returns</li>
            <li>• Crypto has higher returns but also higher risk</li>
            <li>• Passive income compounds over time!</li>
          </ul>
        </div>
      </div>
  );
}





// Competition Component
function Competition({ sessionId, onClose }) {
  const [leaderboard, setLeaderboard] = React.useState(null);
  const [playerStats, setPlayerStats] = React.useState(null);
  const [category, setCategory] = React.useState('netWorth');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadCompetitionData() {
      try {
        const [leaderboardRes, playerStatsRes] = await Promise.all([
          fetch(`/leaderboard?category=${category}`),
          fetch(`/player-stats?sessionId=${sessionId}`)
        ]);
        
        if (!leaderboardRes.ok || !playerStatsRes.ok) {
          throw new Error('Failed to fetch competition data');
        }
        
        const leaderboardData = await leaderboardRes.json();
        const playerData = await playerStatsRes.json();
        
        setLeaderboard(leaderboardData);
        setPlayerStats(playerData);
      } catch (error) {
        console.error('Error loading competition data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (sessionId) {
      loadCompetitionData();
    }
  }, [sessionId, category]);

  const getCategoryName = (cat) => {
    switch (cat) {
      case 'netWorth': return 'Net Worth';
      case 'cash': return 'Cash';
      case 'passiveIncome': return 'Passive Income';
      case 'skills': return 'Skills';
      default: return cat;
    }
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'netWorth': return '💰';
      case 'cash': return '💵';
      case 'passiveIncome': return '📈';
      case 'skills': return '🎯';
      default: return '📊';
    }
  };

  const formatValue = (value, category) => {
    if (category === 'skills') {
      return `${Math.round(value)}/100`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">🥇 Competition</h2>
          <button
            onClick={onClose}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            ← Back to Game
          </button>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading competition data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">🥇 Competition</h2>
        <button
          onClick={onClose}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
        >
          ← Back to Game
        </button>
      </div>

      {/* Category Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Compare by:
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {['netWorth', 'cash', 'passiveIncome', 'skills'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`p-3 rounded-lg border transition-colors duration-200 ${
                category === cat
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getCategoryIcon(cat)}</span>
                <span className="text-sm font-medium">{getCategoryName(cat)}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Player Stats Summary */}
      {playerStats && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Your Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatValue(playerStats.netWorth || 0, 'netWorth')}
              </div>
              <div className="text-sm text-gray-600">Net Worth</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatValue(playerStats.cash || 0, 'cash')}
              </div>
              <div className="text-sm text-gray-600">Cash</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatValue(playerStats.passiveIncome || 0, 'passiveIncome')}
              </div>
              <div className="text-sm text-gray-600">Passive Income</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {formatValue(playerStats.skills || 0, 'skills')}
              </div>
              <div className="text-sm text-gray-600">Skills</div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      {leaderboard && leaderboard.length > 0 ? (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Leaderboard - {getCategoryName(category)}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Rank</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Player</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">{getCategoryName(category)}</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {leaderboard.map((player, index) => (
                  <tr key={player.sessionId} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        {index === 0 && <span className="text-2xl mr-2">🥇</span>}
                        {index === 1 && <span className="text-2xl mr-2">🥈</span>}
                        {index === 2 && <span className="text-2xl mr-2">🥉</span>}
                        {index > 2 && <span className="text-lg font-medium text-gray-500 mr-2">#{index + 1}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                          {player.name ? player.name.charAt(0).toUpperCase() : 'P'}
                        </div>
                        <span className="font-medium text-gray-900">
                          {player.name || `Player ${player.sessionId.slice(-4)}`}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      {formatValue(player[category] || 0, category)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        player.sessionId === sessionId 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {player.sessionId === sessionId ? 'You' : 'Other Player'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-500 text-lg">No competition data available yet.</div>
          <div className="text-gray-400 text-sm mt-2">Play more to see the leaderboard!</div>
        </div>
      )}

      {/* Competition Tips */}
      <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <h4 className="font-semibold text-yellow-800 mb-2">💡 Competition Tips</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Focus on building passive income for long-term success!</li>
          <li>• Train your skills regularly to improve your earning potential</li>
          <li>• Manage debt wisely to maximize your net worth</li>
          <li>• Compare your progress with other players to stay motivated</li>
        </ul>
      </div>
    </div>
  );
}

// Skills Training Page Component
function SkillsTrainingPage({ state, onClose, onTrainSkill }) {
  const [selectedSkill, setSelectedSkill] = React.useState(null);
  const [timeSpent, setTimeSpent] = React.useState(2);
  const [showTrainingModal, setShowTrainingModal] = React.useState(false);

  const skillInfo = {
    finance: { 
      name: 'Finance', 
      icon: '💰', 
      description: 'Learn budgeting, investing, and money management',
      benefits: ['Higher passive income returns', 'Better investment opportunities', 'Reduced debt interest rates'],
      color: 'green'
    },
    social: { 
      name: 'Social', 
      icon: '👥', 
      description: 'Build relationships and networking skills',
      benefits: ['More social scenarios', 'Better job opportunities', 'Reduced stress from social interactions'],
      color: 'blue'
    },
    hustling: { 
      name: 'Hustling', 
      icon: '💼', 
      description: 'Develop work ethic and productivity',
      benefits: ['Higher job income', 'More side hustle opportunities', 'Better time management'],
      color: 'purple'
    },
    health: { 
      name: 'Health', 
      icon: '❤️', 
      description: 'Maintain physical and mental well-being',
      benefits: ['Reduced stress levels', 'Better decision making', 'Improved overall performance'],
      color: 'red'
    }
  };

  const handleTrainSkill = (skill) => {
    setSelectedSkill(skill);
    setTimeSpent(2);
    setShowTrainingModal(true);
  };

  const confirmTraining = () => {
    if (selectedSkill && timeSpent > 0) {
      onTrainSkill(selectedSkill, timeSpent);
      setShowTrainingModal(false);
      setSelectedSkill(null);
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">🎯 Skills Training Center</h2>
        <button
          onClick={onClose}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
        >
          ← Back to Game
        </button>
      </div>

      {/* Skills Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Object.entries(state.skills).map(([skill, level]) => {
          const info = skillInfo[skill];
          const colorClasses = {
            green: 'bg-green-50 border-green-200 text-green-600',
            blue: 'bg-blue-50 border-blue-200 text-blue-600',
            purple: 'bg-purple-50 border-purple-200 text-purple-600',
            red: 'bg-red-50 border-red-200 text-red-600'
          };
          
          return (
            <div key={skill} className={`border rounded-lg p-4 ${colorClasses[info.color]}`}>
              <div className="text-center">
                <div className="text-3xl mb-2">{info.icon}</div>
                <div className="font-semibold">{info.name}</div>
                <div className="text-2xl font-bold">{level}/100</div>
                <div className="w-full bg-white bg-opacity-50 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full bg-${info.color}-500 transition-all duration-300`}
                    style={{ width: `${level}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Skills Training Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(state.skills).map(([skill, level]) => {
          const info = skillInfo[skill];
          const colorClasses = {
            green: 'border-green-200 hover:border-green-300',
            blue: 'border-blue-200 hover:border-blue-300',
            purple: 'border-purple-200 hover:border-purple-300',
            red: 'border-red-200 hover:border-red-300'
          };
          
          return (
            <div key={skill} className={`border rounded-lg p-6 ${colorClasses[info.color]} hover:shadow-lg transition-all duration-200`}>
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{info.icon}</div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{level}/100</div>
                  <div className="text-sm text-gray-600">Current Level</div>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold mb-2">{info.name}</h3>
              <p className="text-gray-600 mb-4">{info.description}</p>
              
              <div className="mb-4">
                <h4 className="font-medium mb-2">Benefits:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {info.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
              
              <button
                onClick={() => handleTrainSkill(skill)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
              >
                Train {info.name} Skill
              </button>
            </div>
          );
        })}
      </div>

      {/* Training Tips */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">💡 Training Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
          <div>
            <h4 className="font-medium mb-2">Time Investment:</h4>
            <ul className="space-y-1">
              <li>• 1 hour = 5 skill points + 2 stress</li>
              <li>• 2 hours = 10 skill points + 4 stress</li>
              <li>• 4 hours = 20 skill points + 8 stress</li>
              <li>• 8 hours = 40 skill points + 16 stress</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Strategy:</h4>
            <ul className="space-y-1">
              <li>• Balance skill training with stress management</li>
              <li>• Focus on skills that match your goals</li>
              <li>• Higher skills unlock better opportunities</li>
              <li>• Skills compound over time!</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Training Modal */}
      {showTrainingModal && selectedSkill && (
        <div className="mt-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">{skillInfo[selectedSkill].icon}</div>
            <h2 className="text-2xl font-bold">{skillInfo[selectedSkill].name} Training</h2>
            <p className="text-gray-600">{skillInfo[selectedSkill].description}</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time to spend (hours): {timeSpent}
            </label>
            <input
              type="range"
              min="1"
              max="8"
              value={timeSpent}
              onChange={(e) => setTimeSpent(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-sm text-gray-500 mt-1">
              You'll gain {timeSpent * 5} skill points and {timeSpent * 2} stress
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setShowTrainingModal(false)}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={confirmTraining}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200"
            >
              Start Training
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Statistics Page Component
function StatisticsPage({ state, sessionId, onClose }) {
  const [stats, setStats] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch(`/player-stats?sessionId=${sessionId}`);
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error('Failed to load statistics:', error);
      } finally {
        setLoading(false);
      }
    }
    
    if (sessionId) {
      loadStats();
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="w-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl font-semibold">Loading Statistics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">📊 Game Statistics</h2>
        <button
          onClick={onClose}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
        >
          ← Back to Game
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-green-600 font-medium">Total Decisions</div>
          <div className="text-2xl font-bold text-green-600">{state.totalDecisions || 0}</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-blue-600 font-medium">Weeks Played</div>
          <div className="text-2xl font-bold text-blue-600">{state.week || 1}</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-purple-600 font-medium">Days Survived</div>
          <div className="text-2xl font-bold text-purple-600">{state.day || 1}</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-yellow-600 font-medium">Net Worth</div>
          <div className="text-2xl font-bold text-yellow-600">${(state.cash - state.totalDebt).toLocaleString()}</div>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-green-600">💰 Financial Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Current Cash:</span>
              <span className="font-semibold">${state.cash.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Debt:</span>
              <span className="font-semibold text-red-600">${state.totalDebt.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Weekly Income:</span>
              <span className="font-semibold">${state.income.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Passive Income:</span>
              <span className="font-semibold">${(state.passiveIncome?.total || 0).toLocaleString()}/week</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Credit Score:</span>
              <span className="font-semibold">{state.creditScore}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-blue-600">🎯 Skills Progress</h3>
          <div className="space-y-3">
            {Object.entries(state.skills).map(([skill, level]) => (
              <div key={skill} className="flex justify-between items-center">
                <span className="text-gray-600 capitalize">{skill}:</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${level}%` }}
                    ></div>
                  </div>
                  <span className="font-semibold text-sm">{level}/100</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Game Progress */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4 text-purple-600">🎮 Game Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{state.week || 1}</div>
            <div className="text-sm text-gray-600">Weeks Completed</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{state.day || 1}</div>
            <div className="text-sm text-gray-600">Days in Current Week</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{state.totalDecisions || 0}</div>
            <div className="text-sm text-gray-600">Total Decisions Made</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Settings Page Component
function SettingsPage({ onClose }) {
  const [settings, setSettings] = React.useState({
    notifications: true,
    soundEffects: true,
    autoSave: true,
    difficulty: 'normal'
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">⚙️ Game Settings</h2>
        <button
          onClick={onClose}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
        >
          ← Back to Game
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">General</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Notifications</div>
                <div className="text-sm text-gray-600">Show achievement notifications</div>
              </div>
              <button
                onClick={() => handleSettingChange('notifications', !settings.notifications)}
                className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                  settings.notifications ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                  settings.notifications ? 'transform translate-x-6' : 'transform translate-x-1'
                }`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Sound Effects</div>
                <div className="text-sm text-gray-600">Play game sound effects</div>
              </div>
              <button
                onClick={() => handleSettingChange('soundEffects', !settings.soundEffects)}
                className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                  settings.soundEffects ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                  settings.soundEffects ? 'transform translate-x-6' : 'transform translate-x-1'
                }`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Auto Save</div>
                <div className="text-sm text-gray-600">Automatically save progress</div>
              </div>
              <button
                onClick={() => handleSettingChange('autoSave', !settings.autoSave)}
                className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                  settings.autoSave ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                  settings.autoSave ? 'transform translate-x-6' : 'transform translate-x-1'
                }`}></div>
              </button>
            </div>
          </div>
        </div>

        {/* Game Settings */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Game</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <select
                value={settings.difficulty}
                onChange={(e) => handleSettingChange('difficulty', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="easy">Easy</option>
                <option value="normal">Normal</option>
                <option value="hard">Hard</option>
                <option value="expert">Expert</option>
              </select>
            </div>

            <div className="pt-4">
              <h4 className="font-medium mb-2">About</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Life Simulation Game v1.0</p>
                <p>Make financial decisions and build your wealth!</p>
                <p>Created with React & Node.js</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex space-x-4">
        <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors duration-200">
          Save Settings
        </button>
        <button className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors duration-200">
          Reset to Default
        </button>
      </div>
    </div>
  );
}

// Achievements Component
function Achievements({ sessionId, onClose }) {
  const [achievements, setAchievements] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadAchievements() {
      try {
        const res = await fetch(`/achievements?sessionId=${sessionId}`);
        const data = await res.json();
        setAchievements(data);
      } catch (error) {
        console.error('Failed to load achievements:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadAchievements();
  }, [sessionId]);

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'text-gray-600';
      case 'rare': return 'text-blue-600';
      case 'epic': return 'text-purple-600';
      case 'legendary': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getRarityBg = (rarity) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 border-gray-300';
      case 'rare': return 'bg-blue-100 border-blue-300';
      case 'epic': return 'bg-purple-100 border-purple-300';
      case 'legendary': return 'bg-orange-100 border-orange-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  const getProgressPercentage = (progress) => {
    if (!progress || progress.target === 0) return 0;
    return Math.min(100, (progress.current / progress.target) * 100);
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <div className="text-xl font-semibold">Loading Achievements...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">🏆 Achievements & Trophies</h2>
        <button
          onClick={onClose}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
        >
          ← Back to Game
        </button>
      </div>

        {/* Achievement Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-yellow-600 font-medium">Unlocked</div>
            <div className="text-2xl font-bold text-yellow-600">{achievements.totalUnlocked}</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-blue-600 font-medium">Total</div>
            <div className="text-2xl font-bold text-blue-600">{achievements.totalAchievements}</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-green-600 font-medium">Completion</div>
            <div className="text-2xl font-bold text-green-600">
              {Math.round((achievements.totalUnlocked / achievements.totalAchievements) * 100)}%
            </div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-purple-600 font-medium">Rarest</div>
            <div className="text-2xl font-bold text-purple-600">
              {achievements.unlocked.filter(a => a.rarity === 'legendary').length}
            </div>
          </div>
        </div>

        {/* Achievement Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Financial Achievements */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-green-600">💰 Financial</h3>
            <div className="space-y-3">
              {achievements.all.filter(a => 
                ['debt_free', 'millionaire', 'early_retirement', 'investment_guru', 'speed_runner'].includes(a.id)
              ).map(achievement => (
                <div key={achievement.id} className={`border rounded-lg p-4 ${achievement.unlocked ? getRarityBg(achievement.rarity) : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className={`text-sm font-medium ${achievement.unlocked ? getRarityColor(achievement.rarity) : 'text-gray-400'}`}>
                      {achievement.rarity.toUpperCase()}
                    </div>
                  </div>
                  <div className={`font-semibold ${achievement.unlocked ? 'text-gray-800' : 'text-gray-500'}`}>
                    {achievement.name}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">{achievement.description}</div>
                  {!achievement.unlocked && achievement.progress && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getProgressPercentage(achievement.progress)}%` }}
                      ></div>
                    </div>
                  )}
                  {achievement.unlocked && (
                    <div className="text-sm text-green-600 font-medium">✓ Unlocked!</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Skill Achievements */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-blue-600">🎓 Skills</h3>
            <div className="space-y-3">
              {achievements.all.filter(a => 
                ['skill_master', 'finance_expert', 'social_butterfly', 'hustle_king', 'health_guru'].includes(a.id)
              ).map(achievement => (
                <div key={achievement.id} className={`border rounded-lg p-4 ${achievement.unlocked ? getRarityBg(achievement.rarity) : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className={`text-sm font-medium ${achievement.unlocked ? getRarityColor(achievement.rarity) : 'text-gray-400'}`}>
                      {achievement.rarity.toUpperCase()}
                    </div>
                  </div>
                  <div className={`font-semibold ${achievement.unlocked ? 'text-gray-800' : 'text-gray-500'}`}>
                    {achievement.name}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">{achievement.description}</div>
                  {!achievement.unlocked && achievement.progress && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getProgressPercentage(achievement.progress)}%` }}
                      ></div>
                    </div>
                  )}
                  {achievement.unlocked && (
                    <div className="text-sm text-green-600 font-medium">✓ Unlocked!</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Fun Achievements */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-purple-600">🎮 Fun</h3>
            <div className="space-y-3">
              {achievements.all.filter(a => 
                ['college_dropout', 'crypto_whale', 'real_estate_mogul', 'dividend_king', 'side_hustle_king', 'stress_free', 'decision_master', 'survivor'].includes(a.id)
              ).map(achievement => (
                <div key={achievement.id} className={`border rounded-lg p-4 ${achievement.unlocked ? getRarityBg(achievement.rarity) : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className={`text-sm font-medium ${achievement.unlocked ? getRarityColor(achievement.rarity) : 'text-gray-400'}`}>
                      {achievement.rarity.toUpperCase()}
                    </div>
                  </div>
                  <div className={`font-semibold ${achievement.unlocked ? 'text-gray-800' : 'text-gray-500'}`}>
                    {achievement.name}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">{achievement.description}</div>
                  {!achievement.unlocked && achievement.progress && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getProgressPercentage(achievement.progress)}%` }}
                      ></div>
                    </div>
                  )}
                  {achievement.unlocked && (
                    <div className="text-sm text-green-600 font-medium">✓ Unlocked!</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
  );
}

export default function App() {
  const [sessionId, setSessionId] = React.useState(null);
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

  // Start new game
  React.useEffect(() => {
    async function startGame() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/start", { method: "POST" });
        const data = await res.json();
        setSessionId(data.sessionId);
        setState(data.state);
        setScenario(data.scenario);
      } catch (e) {
        setError("Failed to start game");
      } finally {
        setLoading(false);
      }
    }
    startGame();
  }, []);

  // Continue to next day/scenario
  async function continueDay() {
    if (!sessionId) return;
    
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/next-scenario?sessionId=${sessionId}`);
      const data = await res.json();
      setState(data.state);
      setScenario(data.scenario);
    } catch (e) {
      setError("Failed to continue day");
    } finally {
      setLoading(false);
    }
  }

  // Make a choice
  async function makeChoice(choiceId) {
    if (!sessionId) return;
    
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/choose-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, choiceId }),
      });
      const data = await res.json();
      setState(data.state);
      setScenario(null); // Clear current scenario
      
      // Handle new achievements
      if (data.newAchievements && data.newAchievements.length > 0) {
        setNewAchievements(data.newAchievements);
        setTimeout(() => setNewAchievements([]), 5000); // Clear after 5 seconds
      }
    } catch (e) {
      setError("Failed to make choice");
    } finally {
      setLoading(false);
    }
  }

  // Train skill
  async function trainSkill(skill, timeSpent) {
    if (!sessionId) return;
    
    setLoading(true);
    try {
      const res = await fetch("/train-skill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, skill, timeSpent }),
      });
      const data = await res.json();
      setState(data.state);
      setShowSkillTraining(false);
    } catch (e) {
      setError("Failed to train skill");
    } finally {
      setLoading(false);
    }
  }



  if (loading && !state) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl font-semibold">Loading Life Simulation...</div>
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
          
          {/* Dropdown Navigation Menu */}
          {showMenu && (
            <div className="absolute top-16 left-4 bg-white rounded-lg shadow-xl border border-gray-200 z-50 min-w-48 animate-fadeIn">
              <div className="py-2">
                <button
                  onClick={() => { setCurrentPage('game'); setShowMenu(false); }}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-3 ${currentPage === 'game' ? 'bg-blue-50 text-blue-600' : ''}`}
                >
                  <span className="text-xl">🎮</span>
                  <span className="font-medium">Game</span>
                </button>

                <button
                  onClick={() => { setCurrentPage('debt'); setShowMenu(false); }}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-3 ${currentPage === 'debt' ? 'bg-blue-50 text-blue-600' : ''}`}
                >
                  <span className="text-xl">💳</span>
                  <span className="font-medium">Debt Management</span>
                </button>
                <button
                  onClick={() => { setCurrentPage('passive'); setShowMenu(false); }}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-3 ${currentPage === 'passive' ? 'bg-blue-50 text-blue-600' : ''}`}
                >
                  <span className="text-xl">💰</span>
                  <span className="font-medium">Passive Income</span>
                </button>
                <button
                  onClick={() => { setCurrentPage('competition'); setShowMenu(false); }}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-3 ${currentPage === 'competition' ? 'bg-blue-50 text-blue-600' : ''}`}
                >
                  <span className="text-xl">🥇</span>
                  <span className="font-medium">Competition</span>
                </button>
                <button
                  onClick={() => { setCurrentPage('achievements'); setShowMenu(false); }}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-3 ${currentPage === 'achievements' ? 'bg-blue-50 text-blue-600' : ''}`}
                >
                  <span className="text-xl">🏆</span>
                  <span className="font-medium">Achievements</span>
                </button>
                <button
                  onClick={() => { setCurrentPage('skills'); setShowMenu(false); }}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-3 ${currentPage === 'skills' ? 'bg-blue-50 text-blue-600' : ''}`}
                >
                  <span className="text-xl">🎯</span>
                  <span className="font-medium">Skills Training</span>
                </button>
                <button
                  onClick={() => { setCurrentPage('stats'); setShowMenu(false); }}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-3 ${currentPage === 'stats' ? 'bg-blue-50 text-blue-600' : ''}`}
                >
                  <span className="text-xl">📊</span>
                  <span className="font-medium">Statistics</span>
                </button>
                <button
                  onClick={() => { setCurrentPage('settings'); setShowMenu(false); }}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-3 ${currentPage === 'settings' ? 'bg-blue-50 text-blue-600' : ''}`}
                >
                  <span className="text-xl">⚙️</span>
                  <span className="font-medium">Settings</span>
                </button>

              </div>
            </div>
          )}
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800">🎮 Life Simulation Game</h1>
        
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      <div className="w-full px-4 py-6 flex-1 flex flex-col">
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Page Content */}
        <div className="w-full page-content">
          {currentPage === 'game' && (
            <>
              {state && (
                <div className="w-full">
                  <Dashboard state={state} />
                </div>
              )}

              <div className="flex flex-col lg:flex-row gap-6 w-full">
                {/* Main Game Area */}
                <div className="flex-1">
                  <ScenarioCard 
                    scenario={scenario} 
                    onChoice={makeChoice} 
                    loading={loading}
                  />
                  
                  {!scenario && state && (
                    <div className="mt-6 text-center">
                      <button
                        onClick={continueDay}
                        disabled={loading}
                        className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors duration-200"
                      >
                        {loading ? 'Loading...' : 'Continue Day'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Quick Actions Sidebar */}
                <div className="lg:w-80 flex-shrink-0">
                  <div className="bg-white rounded-lg shadow-lg p-6 h-fit">
                    <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      {/* Skills Training Button */}
                      <button
                        onClick={() => setCurrentPage('skills')}
                        className="w-full p-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:from-green-600 hover:to-blue-700 transition-all duration-200 font-medium"
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <span className="text-xl">🎯</span>
                          <span>Skills Training</span>
                        </div>
                      </button>
                      
                      {/* Competition Button */}
                      <button
                        onClick={() => setCurrentPage('competition')}
                        className="w-full p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium"
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <span className="text-xl">🥇</span>
                          <span>View Leaderboard</span>
                        </div>
                      </button>

                      {/* Statistics Button */}
                      <button
                        onClick={() => setCurrentPage('stats')}
                        className="w-full p-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-200 font-medium"
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <span className="text-xl">📊</span>
                          <span>View Statistics</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}



          {currentPage === 'debt' && sessionId && (
            <DebtManagement
              sessionId={sessionId}
              onClose={() => setCurrentPage('game')}
            />
          )}

          {currentPage === 'passive' && state && (
            <PassiveIncomeManagement
              state={state}
              onClose={() => setCurrentPage('game')}
            />
          )}

          {currentPage === 'achievements' && sessionId && (
            <Achievements
              sessionId={sessionId}
              onClose={() => setCurrentPage('game')}
            />
          )}

          {currentPage === 'competition' && sessionId && (
            <Competition
              sessionId={sessionId}
              onClose={() => setCurrentPage('game')}
            />
          )}

          {currentPage === 'skills' && state && (
            <SkillsTrainingPage
              state={state}
              onClose={() => setCurrentPage('game')}
              onTrainSkill={trainSkill}
            />
          )}

          {currentPage === 'stats' && state && sessionId && (
            <StatisticsPage
              state={state}
              sessionId={sessionId}
              onClose={() => setCurrentPage('game')}
            />
          )}

          {currentPage === 'settings' && (
            <SettingsPage
              onClose={() => setCurrentPage('game')}
            />
          )}

        </div>
      </div>



      {/* Achievement Notifications */}
      {newAchievements.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {newAchievements.map((achievement, index) => (
            <div
              key={achievement.id}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-lg shadow-lg max-w-sm animate-bounce"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{achievement.icon}</div>
                <div>
                  <div className="font-bold">{achievement.name}</div>
                  <div className="text-sm opacity-90">{achievement.description}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
