import Ember from 'ember';
export default Ember.Route.extend({
  store: Ember.inject.service(),
  model(){
    let game = this.get('store').createGame();
    return game;
  },
  actions:{
    deal(game){
      if(this.get('store').betHasMoney(game)){ //you can only deal if you have money.
        this.get('store').deal(game.Player,1);
        if(game.Player.valueOfHand > 21){ //Recognizes if a hand is bust.
          Ember.set(game.Player,'Bust','Bust!');
          Ember.set(game,'Bet',0);
          Ember.set(game,'gameOver',true); //game ends if you bust.
        }
      }
    },
    newHand(game){ //action for dealing with a new hand
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
    stand(game){ //The game proceeds to run.
      this.get('store').cashierLogic(game);
    },
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
    clear(game){
      Ember.set(game.Player,'Bust',null);
      Ember.set(game.Player,'money',game.Player.money + game.Bet);
      Ember.set(game,'Bet',0);
    },
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
    split(game){
      
    }
  }
});
