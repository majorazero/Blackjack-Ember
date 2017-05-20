import Ember from 'ember';
//let hand = [];
export default Ember.Route.extend({
  store: Ember.inject.service(),
  model(){
    //let hand = this.get('store').createHand();
    let game = this.get('store').createGame();
    this.get('store').deal(game.Player,2);
    this.get('store').deal(game.Cashier,2);
    //console.log(this.get('store').valueOfHand(hand));
    //return hand;
    if(game.Cashier.valueOfHand === 21){
      Ember.set(game.Cashier,'Bust','Blackjack!');
    }
    if(game.Player.valueOfHand === 21){
      Ember.set(game.Player,'Bust','Blackjack!');
    }
    return game;
  },
  actions:{
    deal(hand){
      this.get('store').deal(hand,1);
      //console.log(this.get('store').valueOfHand(hand));

    },
    newHand(game){
      Ember.set(game.Player,'Bust',null);
      Ember.set(game.Cashier,'Bust',null);

      this.get('store').newDeck();

      while(game.Cashier.hand.length != 0){
        game.Cashier.hand.pop();
      }
      this.get('store').deal(game.Cashier,2);
      if(game.Cashier.valueOfHand === 21){
        Ember.set(game.Cashier,'Bust','Blackjack!');
        Ember.set(game.Player,'Bust','You Lose!');
      }

      while(game.Player.hand.length != 0){
        game.Player.hand.pop();
      }
      this.get('store').deal(game.Player,2);
      if(game.Player.valueOfHand === 21){
        Ember.set(game.Player,'Bust','Blackjack!');
      }
      //console.log(this.get('store').valueOfHand(hand));

    },
    stand(game){ //The game proceeds to run.

      while(game.Cashier.valueOfHand < 17){ //if the value of Hand is 16 or less MUST HIT
        this.get('store').deal(game.Cashier,1);
      }
      if((game.Cashier.valueOfHand === 17) && game.Cashier.hasAce){ //Hit on Soft 17 Scenario
        this.get('store').deal(game.Cashier,1);
      }
      if(game.Cashier.Bust != 'Bust!'){ //Determines Win Conditions
        if(game.Cashier.valueOfHand > game.Player.valueOfHand){ //Cashier Wins.
          Ember.set(game.Player,'Bust','You Lose!');
        }
        else if(game.Cashier.valueOfHand < game.Player.valueOfHand){ //Cashier didn't bust but player's value greater.
          Ember.set(game.Player,'Bust','You Win!');
        }
        else{ //Value Matches.
          Ember.set(game.Cashier,'Bust','Push.');
        }
      }
      else{//Player wins if Cashier Busts.
        Ember.set(game.Player,'Bust','You Win!');
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
    }
  }
});
