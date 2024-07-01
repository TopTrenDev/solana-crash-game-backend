export const site = {
  // Site configurations on server startup
  enableMaintenanceOnStart: false,
  manualWithdrawsEnabled: true,
  enableLoginOnStart: true,
  // Site endpoints
  backend: {
    productionUrl: '', //kujiracasino.com is virtual domain
    developmentUrl: 'http://localhost:8080',
  },
  frontend: {
    productionUrl: '', //localhost do http://localhost:3000 // else if you deploy it put "https://kujiracasino.com"
    developmentUrl: 'http://localhost:3000',
  },
  adminFrontend: {
    productionUrl: '',
    developmentUrl: '',
  },
};

// Each specific game configuration
export const database = {
  developmentMongoURI: 'mongodb://127.0.0.1:27017/solcrash', // MongoURI to use in development
  productionMongoURI: 'mongodb+srv://oliverb25f:FujiOka8-1225@cluster0.ughyjc0.mongodb.net/crash', // MongoURI to use in production
};

export const games = {
  exampleGame: {
    minBetAmount: 1, // Min bet amount (in coins)
    maxBetAmount: 100000, // Max bet amount (in coins)
    feePercentage: 0.1, // House fee percentage
  },
  race: {
    prizeDistribution: [40, 20, 14.5, 7, 5.5, 4.5, 3.5, 2.5, 1.5, 1], // How is the prize distributed (place = index + 1)
  },
  vip: {
    minDepositForWithdraw: 5, // You must have deposited atleast this amount before withdrawing
    minWithdrawAmount: 5, // Minimum Withdraw Amount
    levelToChat: 2, // The level amount you need to chat
    levelToTip: 15, // The level to use the tip feature in chat
    levelToRain: 10, // The level amount to start a rain
    wagerToJoinRain: 5, // The wager amount to join the rain in chat
    minRakebackClaim: 2, // The min rakeback amount you need to claim rakeback
    numLevels: 500, // Number of total levels
    minWager: 0, // minWager
    maxWager: 502007, // maxWager
    rakeback: 21.66, // Max rakeback
    vipLevelNAME: ['Beginner', 'Professional', 'Expert', 'Crown'],
    vipLevelCOLORS: ['rgb(215, 117, 88)', 'rgb(71, 190, 219)', 'rgb(96, 183, 100)', 'rgb(152, 38, 38)'],
  },
  affiliates: {
    earningPercentage: 10, // How many percentage of house edge the affiliator will get
  },
  coinflip: {
    minBetAmount: 0.1, // Min bet amount (in coins)
    maxBetAmount: 100000, // Max bet amount (in coins)
    feePercentage: 0.05, // House fee percentage
  },
  crash: {
    minBetAmount: 0.1, // Min bet amount (in coins)
    maxBetAmount: 100, // Max bet amount (in coins)
    maxProfit: 500, // Max profit on crash, forces auto cashout
    houseEdge: 0.05, // House edge percentage
  },
};

export const blochain = {
  // EOS Blockchain provider API root url
  // without following slashes
  httpProviderApi: 'http://eos.greymass.com',
};

export const authentication = {
  jwtSecret: 'vf4Boy2WT1bVgphxFqjEY2GjciChkXvf4Boy2WT1hkXv2', // Secret used to sign JWT's. KEEP THIS AS A SECRET 45 length
  jwtExpirationTime: 360000, // JWT-token expiration time (in seconds)
  revenueId: '66826fa43270000000000a52',
};
