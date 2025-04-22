var utils = require('../../../../../../api/util.js');


Component({
  properties: {

  },
  data: {
		tabbarRealHeight: 0,
		cards: ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'],
		suits: ['hearts', 'spade', 'block', 'plumblossom'],
		dealerCards: ['', '', '', '', '', ''],
		dealerSuits: ['', '', '', '', '', ''],
		playerCards: ['', '', '', '', '', ''],
		playerSuits: ['', '', '', '', '', ''],
		dealerScore: 0,
		playerScore: 0,
		currentDealerIndex: 0,
		currentPlayerIndex: 0,
		gameOver: false,
		gameResult: '',
		canDraw: true
  },
  methods: {
		onLoad: function() {
			this.startNewGame();
		},
		startNewGame: function() {
			this.setData({
				dealerCards: ['', '', '', '', '', ''],
				dealerSuits: ['', '', '', '', '', ''],
				playerCards: ['', '', '', '', '', ''],
				playerSuits: ['', '', '', '', '', ''],
				dealerScore: 0,
				playerScore: 0,
				currentDealerIndex: 0,
				currentPlayerIndex: 0,
				gameOver: false,
				gameResult: '',
				canDraw: true
			});
			
			this.drawCard('dealer');
			this.drawCard('player');
			this.drawCard('dealer');
			this.drawCard('player');
		},
		drawCard: function(role) {
			const randomCard = this.data.cards[Math.floor(Math.random() * this.data.cards.length)];
			const randomSuit = this.data.suits[Math.floor(Math.random() * this.data.suits.length)];
			const currentIndex = role === 'dealer' ? this.data.currentDealerIndex : this.data.currentPlayerIndex;
			
			if (currentIndex >= 6) return;

			const newCards = role === 'dealer' ? [...this.data.dealerCards] : [...this.data.playerCards];
			const newSuits = role === 'dealer' ? [...this.data.dealerSuits] : [...this.data.playerSuits];
			newCards[currentIndex] = randomCard;
			newSuits[currentIndex] = randomSuit;

			const updateData = {};
			updateData[role === 'dealer' ? 'dealerCards' : 'playerCards'] = newCards;
			updateData[role === 'dealer' ? 'dealerSuits' : 'playerSuits'] = newSuits;
			updateData[role === 'dealer' ? 'currentDealerIndex' : 'currentPlayerIndex'] = currentIndex + 1;
			
			this.setData(updateData);
			this.calculateScore(role);
		},
		calculateScore: function(role) {
			const cards = role === 'dealer' ? this.data.dealerCards : this.data.playerCards;
			let score = 0;
			let hasAce = false;

			cards.forEach(card => {
				if (!card) return;
				
				if (card === 'A') {
					hasAce = true;
					score += 11;
				} else if (['J', 'Q', 'K'].includes(card)) {
					score += 10;
				} else {
					score += parseInt(card);
				}
			});

			if (hasAce && score > 21) {
				score -= 10;
			}

			const updateData = {};
			updateData[role === 'dealer' ? 'dealerScore' : 'playerScore'] = score;
			this.setData(updateData);

			if (role === 'player' && score >= 21) {
				this.endGame();
			}
		},
		onDrawCard: function() {
			if (!this.data.canDraw || this.data.gameOver) return;
			this.drawCard('player');
		},
		onStand: function() {
			if (this.data.gameOver) return;
			this.setData({ canDraw: false });
			this.dealerPlay();
		},
		dealerPlay: function() {
			const dealerScore = this.data.dealerScore;
			const playerScore = this.data.playerScore;

			if (dealerScore < 17 && this.data.currentDealerIndex < 6) {
				this.drawCard('dealer');
				setTimeout(() => this.dealerPlay(), 500);
			} else {
				this.endGame();
			}
		},
		endGame: function() {
			const dealerScore = this.data.dealerScore;
			const playerScore = this.data.playerScore;
			let result = '';

			if (playerScore > 21) {
				result = '玩家爆牌，庄家胜！';
			} else if (dealerScore > 21) {
				result = '庄家爆牌，玩家胜！';
			} else if (playerScore > dealerScore) {
				result = '玩家胜！';
			} else if (dealerScore > playerScore) {
				result = '庄家胜！';
			} else {
				result = '平局！';
			}

			this.setData({
				gameOver: true,
				gameResult: result
			});
		}
  },
  lifetimes: {
		attached: function () {
			var that = this;
			that.setData({
				tabbarRealHeight: wx.getStorageSync('tabbarRealHeight')
			})
			// 在组件加载完成后立即开始游戏
			that.startNewGame();
		}
	}

})