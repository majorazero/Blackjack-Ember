import Ember from 'ember';
import Hand from  'bj-ember/models/hand';
import Card from  'bj-ember/models/card';
import Game from  'bj-ember/models/game';
//Part of Deck Construction.
let suit = ['spades','diams','hearts','clubs'];
let value = ['a','2','3','4',
            '5','6','7','8',
            '9','10','j','q','k'];
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
      if (value[i] === 'j' || value[i] === 'q' || value[i] === 'k'){ // JQK = 10
        val = 10;
      }
      else if (value[i] === 'a'){ //default for A is 11
        val = 11;
      }
      let card = createCard( //constructs a card object to fit all this stuff into
        value[i],
        suit[j],
        val
      );
      Ember.set(card,'view',cardHtml(card));
      deck.push(card); //hello new deck
    }
  }
}
createDeck();

function cardHtml(card){ //makes the html element to display cards.
  let htmlElement = '<div class="playingCards"><div class="card rank-';
  htmlElement += card.Value.toString() + ' '+card.Suit+'">';
  htmlElement += '<span class ="rank">'+card.Value.toString().toUpperCase()+'</span>';
  htmlElement += '<span class="suit">&'+card.Suit+';</span></div></div>';
  return htmlElement;
}

function valueOfHand(handi){ //find the value of a player's Hand based on an array of cards
  let value = 0;
  let aAmount = 0;
  let hand = handi.hand;
  for (let i = 0; i < hand.length; i++){
    value += hand[i][0].Val; //acrue total value of player's hand
    if (hand[i][0].Value === 'a'){ // if the current value is an Ace, we'll increment the ace counter.
      aAmount++;
      Ember.set(handi,'hasAce',true);//sets an internal value in the end called hasAce?
    }
    //if(value === 21){break;}
    if (hand[i][0].Value === 'a' && aAmount > 1){  //There can technically only be a max of 1 "11" Ace in a hand at any one time
      value -= 10; //Subsequent aces are just "1"
    }
  }
  while (value > 21 && aAmount != 0){ //Final catch for illegal hands i.e. "16 + A = 27" or "18+A+A+A = 31 or 51"
    value -= 10;
    aAmount--;
  }
  return value;

}

function deal(hand,numCard){ //will deal a random card from the existant deck, no need for shuffle
  for(let i =0; i<numCard; i++){ //deals numCard amount of cards to hand
    let randPos = Math.floor(Math.random()*(deck.length)); // every loop will regenerate a new random position value that takes into account the new deck length
    hand.hand.pushObject(deck.splice(randPos,1)); //removes item at the random position and pushes it to the dealt hand
  }
  Ember.set(hand,'valueOfHand',valueOfHand(hand)); //Lets the template access the value of hand
}

export default Ember.Service.extend({

  deal(hand,numCard){ //will deal a random card from the existant deck, no need for shuffle
    deal(hand,numCard);
  },
  newDeck(){ //Creates a new deck for the New Hand Function.
    createDeck();
  },
  createHand(){
    return Hand.create({hand: []});
  },
  createGame(){ //creates the game wrapper
    createDeck(); //creates a new Deck for every New Game That's made.
    return Game.create({
      Cashier: {
        hand: [] //cashier has a hand
      },
      Player: {
        hand: [], //player has a hand
        money: 500 //Actial chips object unneccesary, we'll just deduct through functions.
      },
      Bet: 0
    });
  },
  initGameLogic(game){
    if(game.Cashier.hand[1][0].Val === 11){ //Checks if insurance is applicable.
      Ember.set(game,'noInsurance',false);
    }
    if(game.Player.valueOfHand === 21){
      game.Cashier.hand.removeAt(0); //removes placeholder card
      deal(game.Cashier,1);
      if(game.Cashier.valueOfHand === 21){
        Ember.set(game.Player,'Bust','Push.');
        Ember.set(game,'gameOver',true);
      }
      else{
        Ember.set(game.Player,'Bust','Blackjack!');
        Ember.set(game.Player,'money',game.Player.money + (game.Bet*1.5));
        Ember.set(game,'gameOver',true);
      }
    }
  },
  cashierLogic(game){
    game.Cashier.hand.removeAt(0); //removes placeholder card
    Ember.set(game.Cashier,'valueOfHand',valueOfHand(game.Cashier)); //rereads valueOfHand so everything will work.
    while(game.Cashier.valueOfHand < 17){ //if the value of Hand is 16 or less MUST HIT
      deal(game.Cashier,1);
    }
    if((game.Cashier.valueOfHand === 17) && game.Cashier.hasAce){ //Hit on Soft 17 Scenario
      deal(game.Cashier,1);
    }
    if(game.Cashier.valueOfHand === 21 && (game.Cashier.hand.length === 2)){ //if Cashier hits blackjack, player instantly loses.
      Ember.set(game.Cashier,'Bust','Blackjack!');
      Ember.set(game.Player,'Bust','You Lose!');
      Ember.set(game,'Bet',0); //Player Loses Money.
      Ember.set(game,'gameOver',true);
    }
    if(game.Cashier.valueOfHand <= 21){ //Determines Win Conditions
      if(game.Cashier.valueOfHand > game.Player.valueOfHand){ //Cashier Wins.
        Ember.set(game.Player,'Bust','You Lose!');
        Ember.set(game,'Bet',0); //You lose your bet if you lose duh.
        Ember.set(game,'gameOver',true);
      }
      else if(game.Cashier.valueOfHand < game.Player.valueOfHand){ //Cashier didn't bust but player's value greater.
        Ember.set(game.Player,'Bust','You Win!');
        Ember.set(game.Player,'money',game.Player.money + game.Bet);
        Ember.set(game,'gameOver',true);
      }
      else{ //Value Matches.
        Ember.set(game.Cashier,'Bust','Push.');
        Ember.set(game,'gameOver',true);
      }
    }
    else{//Player wins if Cashier Busts.
      Ember.set(game.Cashier,'Bust','Bust!');
      Ember.set(game.Player,'Bust','You Win!');
      Ember.set(game.Player,'money',game.Player.money + game.Bet);
      Ember.set(game,'gameOver',true);
    }
  },
  betHasMoney(game){ //can only play the game if player places a bet.
    Ember.set(game.Player,'Bust',null);
    if(game.Bet === 0){
      Ember.set(game.Player,'Bust','Needs to place bet to play.');
      return false;
    }
    else{
      return true;
    }
  },
  isSplit(game){ //detects if a split occurs.
    if (game.Player.hand[0][0].Value === game.Player.hand[1][0].Value){ //split happens when opening hand has same value
      return true;
    }
    else{
      return false;
    }
  }
});
