import React, { useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, ImageBackground, Image } from 'react-native';

const QuestionnaireComponent = ({ navigation, route }) => {
  //prend les params de la page précédante
  const { name, id, questions } = route.params;

  //Initialisation des hook
  const [idQuest, setIdQuestion] = useState(0);
  const [score, setScore] = useState(0)
  const [isGood, setIsGood] = useState(false);
  const [gameState, setGameState] = useState(0);

  var question = questions[idQuest].question;
  var idRep = questions[idQuest].idReponse;
  const reponses =
    [
      questions[idQuest].rep1,
      questions[idQuest].rep2,
      questions[idQuest].rep3,
      questions[idQuest].rep4
    ];
  const path = '../assets/image/';

  //Switch case pour alterner l'affichage du questionnaire, des réponses et de la fin de jeu sur la même page
  switch (gameState) {
    case 0: //Questionnaire
      return (
        <ImageBackground source={require('../assets/image/backgroundImageGreen.jpg')} resizeMode="cover" style={questionnaireStyle.container}>
          <Text style={questionnaireStyle.name}>{name}</Text>
          <Text style={questionnaireStyle.score}>score: {score}</Text>
          <View>
            <Text style={questionnaireStyle.textQuestion}>{question}</Text>
            { //Boucle pour afficher les réponses
              reponses.map((reponse, index) => {
                return (
                  <TouchableOpacity key={index} onPress={() => { VerifyAnswer(++index) }} style={questionnaireStyle.button}>
                    <Text style={questionnaireStyle.text}>{reponse}</Text>
                  </TouchableOpacity>
                )
              })
            }
          </View>
        </ImageBackground>
      );
    case 1: //Réponse
      return (
        <ImageBackground source={require('../assets/image/backgroundImageGreen.jpg')} resizeMode="cover" style={questionnaireStyle.container}>
          <Text style={questionnaireStyle.name}>{name}</Text>
          <Text style={questionnaireStyle.score}>score: {score}</Text>
          <Image
            style={questionnaireStyle.image}
            source={isGood
              ? require(path + 'tUp.png')
              : require(path + 'tDown.png')
            }
          />
          <TouchableOpacity onPress={() => { NextQuestion(); }} style={questionnaireStyle.buttonContinuer}>
            <Text style={questionnaireStyle.text}>Continuer</Text>
          </TouchableOpacity>
        </ImageBackground>

      );

    case 2: //Fin de jeu
      let msg = (score == questions.length)
        ? "Bravo!! Tu as fait un score parfait!"
        : (score / questions.length >= 0.6) 
          ? "Bravo!! Tu as eu un bon score"
          : (score / questions.length >= 0.2) 
            ? "Pas très bon eh..."
            : "Okay... tu n'es vraiment pas très bon";

      return (
        <ImageBackground source={require('../assets/image/backgroundImageGreen.jpg')} resizeMode="cover" style={questionnaireStyle.container}>
          <Text style={questionnaireStyle.name}>{name}</Text>
          <Text style={questionnaireStyle.score}>score: {score}</Text>

          <Text style={questionnaireStyle.textMessage}>{msg}</Text>
          <Text style={questionnaireStyle.textMessage}>Score: {score}</Text>

          <TouchableOpacity onPress={() => { navigation.navigate('Login'); }} style={questionnaireStyle.buttonContinuer}>
            <Text style={questionnaireStyle.text}>Continuer</Text>
          </TouchableOpacity>
        </ImageBackground>
      );
  }

  function VerifyAnswer(id) {
    let isGood = id == idRep;
    setIsGood(isGood);
    setScore(isGood ? score + 1 : score);
    setGameState(1);
  }

  async function NextQuestion() {
    //Vérifie si le joueur est à la dernière question
    if (idQuest == (questions.length - 1)) {
      setGameState(2);
      var res = await fetch('http://10.2.0.193:8080/update', {
        method: 'POST',
        body: JSON.stringify({
          id: id,
          score: score
        })
      });
      alert(await res.text());
    }
    else {
      setIdQuestion(idQuest + 1);
      setGameState(0);
    }
  }
}

export default QuestionnaireComponent;

const questionnaireStyle = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  image: {
    width: 250,
    height: 250,
    resizeMode: 'stretch',
    overflow: 'hidden',
    borderColor: 'black',
  },
  button: {
    width: 230,
    borderRadius: 40,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    backgroundColor: "#718355",
    marginLeft: 50
  },
  buttonContinuer: {
    width: 140,
    borderRadius: 40,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    backgroundColor: "#718355",
  },
  text: {
    color: 'white',
    fontSize: 19
  },
  textMessage: {
    color: 'white',
    fontSize: 19,
    backgroundColor: 'rgba(51, 78, 46, 0.3)',
    width: 280,
    padding: 10,
    textAlign: "center",
  },
  fadingContainer: {
    padding: 20,
    backgroundColor: 'powderblue',
  },
  score: {
    color: '#414833',
    fontSize: 30,
    fontWeight: "bold",
    position: 'absolute',
    top: 80,
    left: 30
  },
  name: {
    color: '#414833',
    fontSize: 30,
    fontWeight: "bold",
    position: 'absolute',
    top: 50,
    left: 30
  },
  textQuestion: {
    color: "white",
    fontSize: 22,
    textAlign: "center",
    backgroundColor: 'rgba(51, 78, 46, 0.3)',
    borderRadius: 4,
    width: 310,
    padding: 20
  }
})