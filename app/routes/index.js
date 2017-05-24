import Ember from 'ember';
//let hand = [];
export default Ember.Route.extend({
  store: Ember.inject.service(),
  model(){
    //let hand = this.get('store').createHand();
    let game = this.get('store').createGame();

    Ember.set(game,'test','<div class = "playingCards"><div class="card rank-7 spades"><span class="rank">7</span><span class="suit">&spades;</span></div> </div>');


    return game;
  },
  actions:{
    deal(game){
      if(this.get('store').betHasMoney(game)){
        this.get('store').deal(game.Player,1);
        if(game.Player.valueOfHand > 21){ //Recognizes if a hand is bust.
          Ember.set(game.Player,'Bust','Bust!');
          Ember.set(game,'Bet',0);
        }
      }
    },
    newHand(game){
      if(this.get('store').betHasMoney(game)){
        Ember.set(game.Player,'Bust',null);
        Ember.set(game.Cashier,'Bust',null);

        this.get('store').newDeck();

        while(game.Cashier.hand.length != 0){
          game.Cashier.hand.pop();
        }
        this.get('store').deal(game.Cashier,2);

        while(game.Player.hand.length != 0){
          game.Player.hand.pop();
        }
        this.get('store').deal(game.Player,2);

        this.get('store').initGameLogic(game); //Re-run init for New hands.

        //console.log(this.get('store').valueOfHand(hand));
      }
    },
    stand(game){ //The game proceeds to run.
      this.get('store').cashierLogic(game);
    },
    double(game){
      if(this.get('store').betHasMoney(game)){
        Ember.set(game.Player,'money',game.Player.money-game.Bet);
        Ember.set(game,'Bet',game.Bet*2);
        this.get('store').deal(game.Player,1);
        this.get('store').cashierLogic(game);
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
