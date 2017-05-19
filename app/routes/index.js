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
    return game;
  },
  actions:{
    deal(hand){
      this.get('store').deal(hand,1);
      //console.log(this.get('store').valueOfHand(hand));

    },
    newHand(game){
      this.get('store').newDeck();

      while(game.Cashier.hand.length != 0){
        game.Cashier.hand.pop();
      }
      this.get('store').deal(game.Cashier,2);

      while(game.Player.hand.length != 0){
        game.Player.hand.pop();
      }
      this.get('store').deal(game.Player,2);
      //console.log(this.get('store').valueOfHand(hand));
    }
  },
  valueOfHand(hand){
    return 3;
  }
});
