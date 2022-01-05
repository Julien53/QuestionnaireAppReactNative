import React, { useState } from 'react';
import { TextInput, TouchableOpacity, View, StyleSheet, Text, Image, ImageBackground, Alert } from 'react-native';
import { Formik } from 'formik';
import * as yup from 'yup'

const loginValidationSchema = yup.object().shape({
    name: yup
        .string()
        .min(3, ({ min }) => `Name must be at least ${min} characters`)
        .max(13, ({max}) => `Name must not exceed ${max} characters`)
        .required('Name is Required'),
    password: yup
        .string()
        .min(3, ({ min }) => `Password must be at least ${min} characters`)
        .max(40, ({max}) => `Password must not exceed ${max} characters`)
        .required('Password is required')
})

const FormComponent = ({ navigation }) => {
    const [isLoading, setIsLoading] = useState(false);
    return (
        <ImageBackground source={require('../assets/image/backgroundImageGreen.jpg')} resizeMode="cover" style={formStyle.container}>
            
            { //Affichage conditionnel du loading
                isLoading &&
                < Image style={formStyle.loading} source={require('../assets/image/loading.gif')} />
            }
            <Text style={formStyle.title}>Quizzo</Text>

            <Formik validationSchema={loginValidationSchema} initialValues={{ name: "sandrino", password: "123", }}>

                {({ handleChange, values, errors, touched, isValid, handleBlur, }) => (
                    <View style={formStyle.form}>

                        {errors.name && touched.name ?
                            (<Text style={formStyle.errorText}>{errors.name}</Text>) : null}
                        <TextInput
                            onChangeText={handleChange('name')}
                            onBlur={handleBlur('name')}
                            placeholder="Entrez votre nom"
                            style={formStyle.input}
                            value={values.name}
                            name="name"
                        />
                        {errors.password && touched.password ?
                            (<Text style={formStyle.errorText}>{errors.password}</Text>) : null}
                        <TextInput
                            secureTextEntry={true}
                            onChangeText={handleChange('password')}
                            onBlur={handleBlur('password')}
                            placeholder="Entrez votre mot de passe"
                            style={formStyle.input}
                            value={values.password}
                        />
                        <TouchableOpacity onPress={() => { Connecter(values.name, values.password, navigation) }}
                            style={formStyle.button}
                            disabled={!isValid || values.name === ''}>
                            <Text style={formStyle.text}>SE CONNECTER</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { Inscrire(values.name, values.password) }} style={formStyle.button}
                            disabled={!isValid || values.name === ''}>
                            <Text style={formStyle.text}>S'INSCRIRE</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </Formik>
        </ImageBackground>
    )
    async function Connecter(name, password, navigation) {
        setIsLoading(true);
        var resultat = await fetch('http://10.2.0.193:8080/connecter', {
            method: 'POST',
            body: JSON.stringify({
                name: name,
                password: password
            })
        });

        if (resultat.ok) {
            var questionnaireJson = await resultat.json();
            var questions = await GetQuestions();
            var message = (questionnaireJson["score"] == -1) ?
                `Bienvenue ${name}.` :
                `Rebienvenu ${name} votre dernier score était de ${questionnaireJson["score"]}`;
            
            Alert.alert("Bienvenue", message, [{
                text: "Commencer", onPress: () => {
                    navigation.navigate('Questionnaire',
                        {
                            id: questionnaireJson["id"],
                            name: name,
                            questions: questions
                        }
                    )
                }
            }]);
        }
        else { alert(await resultat.text()); }
        setIsLoading(false);
    }

    async function Inscrire(name, password) {
        setIsLoading(true);
        var res = await fetch('http://10.2.0.193:8080/inscrire', {
            method: 'POST',
            body: JSON.stringify({
                name: name,
                password: password
            })
        });
        setIsLoading(false);
        alert((await res.text()));
    }
};

//Get the questions from the server
async function GetQuestions() {
    var res = await fetch('http://10.2.0.37/questionnaire.json');
    var json = await res.json();

    var keys = json.columns;
    var questions = json.rows;

    questions = renameAllKeys(questions, keys);
    return shuffleQuestion(questions);
}

function shuffleQuestion(questions) {
    var randomId = [];
    var shuffleArray = [];
    let i = 0;
    while (randomId.length < 5) {
        var rand = Math.floor(Math.random() * questions.length);
        if (randomId.indexOf(rand) == -1) {
            randomId.push(rand);
            shuffleArray[i] = questions[randomId[i]];
            i++;
        }
    }
    return shuffleArray;
}

//Rename keys of json object
function renameAllKeys(json, keys) {
    for (let i = 0; i < keys.length; i++) {
        for (let i2 = 0; i2 < json.length; i2++) {
            json[i2][`${keys[i].name}`] = json[i2][i];
            delete json[i2][i];
        }
    }
    return json;
}



export default FormComponent;

const formStyle = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
    },
    form: {
        width: '100%',
        height:'70%',
        alignItems: "center",
        justifyContent: 'center'
    },
    button: {
        width: 200,
        borderRadius: 40,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 10,
        backgroundColor: "#718355",
    },
    text: {
        color: 'white'
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        fontWeight: "bold"
    },
    input: {
        textAlign: "center",
        padding: 10,
        height: 40,
        borderRadius: 40,
        borderWidth: 1,
        borderColor: '#6c757d',
        width: 200,
        marginBottom: 10,
        fontWeight: 'bold',
    },
    title: {
        fontFamily: 'Binjay',
        marginTop: 60,
        fontSize: 80,       
    },
    loading: {
        position: "absolute",
        flex: 1
    }
});