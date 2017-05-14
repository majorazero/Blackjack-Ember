import Ember from 'ember';
import Hand from  'bj-ember/models/hand';
import Card from  'bj-ember/models/card';
//Part of Deck Construction.
let suit = ['Spades','Diamonds','Hearts','Clubs'];
let value = ['A','2','3','4',
            '5','6','7','8',
            '9','10','J','Q','K'];
let deck = [];

function createCard(Value,Suit,Val){
  return Card.create({Value: Value,
                      Suit: Suit,
                      Val: Val})
}

function createDeck(){
  deck = []; //reset pre-existing deck.
  for(let i = 0; i < value.length; i++){ //goes through 1-K
    for(let j = 0; j <suit.length; j++){ //goes through spades through clubs
      let val = parseInt(value[i]); //assuming its not a letter it'll be what the number value is
      if (value[i] === 'J' || value[i] === 'Q' || value[i] === 'K'){ // JQK = 10
        val = 10;
      }
      else if (value[i] === 'A'){ //default for A is 11
        val = 11;
      }
      let card = createCard( //constructs a card object to fit all this stuff into
        value[i],
        suit[j],
        val
      );
      deck.push(card); //hello new deck
    }
  }
  //return deck;
}
createDeck();

export default Ember.Service.extend({

  valueOfHand(handi){ //find the value of a player's Hand based on an array of cards
    let value = 0;
    let aAmount = 0;
    let hand = handi.hand;
    for (let i = 0; i < hand.length; i++){
      value += hand[i][0].Val; //acrue total value of player's hand
      if (hand[i][0].Value === 'A'){ // if the current value is an Ace, we'll increment the ace counter.
        aAmount++;
      }
      //if(value === 21){break;}
      if (hand[i][0].Value === 'A' && aAmount > 1){  //There can technically only be a max of 1 "11" Ace in a hand at any one time
        value -= 10; //Subsequent aces are just "1"
      }
    }
    while (value > 21 && aAmount != 0){ //Final catch for illegal hands i.e. "16 + A = 27" or "18+A+A+A = 31 or 51"
      value -= 10;
      aAmount--;
    }
    return value;
  },

  deal(hand,numCard){ //will deal a random card from the existant deck, no need for shuffle
    for(let i =0; i<numCard; i++){ //deals numCard amount of cards to hand
      let randPos = Math.floor(Math.random()*(deck.length)); // every loop will regenerate a new random position value that takes into account the new deck length
      hand.hand.pushObject(deck.splice(randPos,1)); //removes item at the random position and pushes it to the dealt hand
    }
  },
  newDeck(){
    createDeck();
  },
  createHand(){
    return Hand.create({hand: []});
  }
});
