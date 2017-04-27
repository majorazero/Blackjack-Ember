import Ember from 'ember';
let hand = [];
export default Ember.Route.extend({
  store: Ember.inject.service(),
  model(){
    //let hand = [];
    this.get('store').deal(hand,2);
    console.log(this.get('store').valueOfHand(hand));
    return hand;
  },
  actions:{
    deal(hand){
      this.get('store').deal(hand,1);
      console.log(this.get('store').valueOfHand(hand));
    }
  }
});
