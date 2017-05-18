import Ember from 'ember';
//let hand = [];
export default Ember.Route.extend({
  store: Ember.inject.service(),
  model(){
    let hand = this.get('store').createHand();
    this.get('store').deal(hand,2);
    //console.log(this.get('store').valueOfHand(hand));
    return hand;
  },
  actions:{
    deal(hand){
      this.get('store').deal(hand,1);
      //console.log(this.get('store').valueOfHand(hand));

    },
    newHand(hand){
      this.get('store').newDeck();
      while(hand.hand.length != 0){
        hand.hand.pop();
      }
      this.get('store').deal(hand,2);
      //console.log(this.get('store').valueOfHand(hand));
    }
  },
  valueOfHand(hand){
    return 3;
  }
});
