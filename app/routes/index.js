import Ember from 'ember';
export default Ember.Route.extend({
  store: Ember.inject.service(),
  /**
  * model is the object that index.html can access
  * because of that we basically are binding the model to the game wrapper
  * That way we can access all game properties through html 
  */
  model(){
    let game = this.get('store').createGame();
    //game.PlayerSplit.hand[0].pushObject({hand: 3});
    game.PlayerSplit.hand.pushObject({hand:[]});
    this.get('store').deal2(game.PlayerSplit.hand[0].hand,2);
    game.PlayerSplit.hand.pushObject({hand:[]});
    this.get('store').deal2(game.PlayerSplit.hand[1].hand,2);
    console.log(game.PlayerSplit.hand[0]); //FIX valueOfHand to be more encompassing.
    return game;
  },
  actions:{
    /**
    * Deals a card to player (if they have money) and determines if player busts.
    * @param {Object} game Accepts the game wrapper object.
    */
    deal(game){
      if(this.get('store').betHasMoney(game)){
        this.get('store').deal(game.Player,1);
        if(game.Player.valueOfHand > 21){
          Ember.set(game.Player,'Bust','Bust!');
          Ember.set(game,'Bet',0);
          Ember.set(game,'gameOver',true);
        }
      }
    },
    /**
    * Deals with rerolling a hand after you win/lose
    * Resets a new play instance but not things including money or current progress
    * @param {Object} game Accepts the game wrapper object.
    */
    newHand(game){
      if(this.get('store').betHasMoney(game)){ //everything only initiates if player puts down a bet
        Ember.set(game,'gameOver',false); //game start.
        Ember.set(game.Player,'Bust',null); //resets the game messages to null
        Ember.set(game.Cashier,'Bust',null);
        Ember.set(game,'noInsurance',true); //resets a game condition to "true"
        Ember.set(game,'isSplit',false); //resets split condition to 'false' again.
        this.get('store').newDeck(); //resets the deck (can't count cards?)

        while(game.Cashier.hand.length != 0){ //removes hand of Cashier.
          game.Cashier.hand.pop();
        }
        game.Cashier.hand.pushObject([{view: '<div class="playingCards"><div class="card back"></div></div>'}]); //creates a temporary image representing a "face down card"
        this.get('store').deal(game.Cashier,1); //re-deals the cashier's hand.
        Ember.set(game.Cashier,'valueOfHand','?'); //Just so it doesn't display NaN since the placeholder card doesn't actually have a value.
        while(game.Player.hand.length != 0){ //removes hand of Player.
          game.Player.hand.pop();
        }
        this.get('store').deal(game.Player,2);//re-deals the player's hand.

        this.get('store').initGameLogic(game); //Re-run init for New hands.
      }
    },
    /**
    * Once the player chooses to stand, the game runs Cashier's game logic
    * and determines result of the game.
    * @param {Object} game Accepts the game wrapper object
    */
    stand(game){ //The game proceeds to run.
      this.get('store').cashierLogic(game);
    },
    /**
    * Lets the player double their bet. and immediatley runs Cashier Logic.
    * @param {Object} game Accepts the game wrapper object
    */
    double(game){
      if(this.get('store').betHasMoney(game)){
        if(game.Player.money < game.Bet){
          Ember.set(game.Player,'Bust','Not Enough Money!');
        }
        else{
          Ember.set(game.Player,'money',game.Player.money-game.Bet);
          Ember.set(game,'Bet',game.Bet*2);
          this.get('store').deal(game.Player,1);
          this.get('store').cashierLogic(game);
        }
      }
    },
    /**
    * Deducts money from the player's money amount to be placed on a the game's bet counter
    * @param {Object} game Accepts the game wrapper object
    * @param {Integer} amount Integer representing money you'd want to bet
    */
    bet(game,amount){
      Ember.set(game.Player,'Bust',null);
      if(amount <= game.Player.money){
        Ember.set(game.Player,'money',game.Player.money - amount);
        Ember.set(game,'Bet',game.Bet + amount);
      }
      else{
        Ember.set(game.Player,'Bust','Not Enough Money!');
      }
    },
    /**
    * Let's player clear their bet amount if they made a mistake.
    * @param {Object} game Accepts a game wrapper object
    */
    clear(game){
      Ember.set(game.Player,'Bust',null);
      Ember.set(game.Player,'money',game.Player.money + game.Bet);
      Ember.set(game,'Bet',0);
    },
    /**
    * Determines how insurance logic works.
    * @param {Object} game Accepts a game wrapper object
    */
    insurance(game){
      if(game.noInsurance === false){ //if insurance pre-requisites are met
        game.Cashier.hand.removeAt(0); //removes placeholder card
        this.get('store').deal(game.Cashier,1); //deals one card to basically "reveal" what the card is
        if(game.Cashier.valueOfHand != 21){ //if cashier does not equal to 21, insurance is lost.
          Ember.set(game.Player,'money',game.Player.money - game.Bet);
          this.get('store').cashierLogic(game); //game proceeds afterwards.
        }
        else{ //if it does equal to 21
          if(game.Player.valueOfHand === 21){
            Ember.set(game.Player,'money',game.Player.money + 2*game.Bet); //insurance pays 2:1, in the case of a push, you just get the 2:1 pay out from the insurance and don't lose your initial bet
              Ember.set(game,'gameOver',true);
          }
          else{
            Ember.set(game.Player,'money',game.Player.money +game.Bet); //You lose your Bet, but get the 2:1 pay out, which is basically a 1:1 Payout, so you just get a 1:1 payout.
              Ember.set(game,'gameOver',true);
          }
        }
      }
      else{
        Ember.set(game.Player,'Bust','Now is not the time!');
      }
    },
    /**
    * TBD function dealing with how splitting works.
    * @param {Object} game Accepts a game wrapper object
    */
    split(game){

    }
  }
});
